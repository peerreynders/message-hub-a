import { makeMessageStore } from './message-store';

import type { DriverRegister, Send } from './message-types';
import type { MessageNode } from './message-node';

const KIND_MESSAGE = 0;
const KIND_CONFIGURATION = 1;
const KIND_RECEIVER_REQUEST = 2;
const KIND_RECEIVER_UPDATE = 3;

type Message = {
  kind: 0;
  id: string;
  data: unknown;
};

function isMessage(data: unknown): data is Message {
  return (
    data !== null &&
    typeof data === 'object' &&
    (data as Message).kind === KIND_MESSAGE
  );
}

type ReceiverRequest = {
  kind: 2;
  nodeId: number;
};

function isReceiverRequest(data: unknown): data is ReceiverRequest {
  return (
    data !== null &&
    typeof data === 'object' &&
    (data as ReceiverRequest).kind === KIND_RECEIVER_REQUEST
  );
}

type ReceiverUpdate = {
  kind: 3;
  nodeId: number;
  id: string;
  remove: boolean;
};

function isReceiverUpdate(data: unknown): data is ReceiverUpdate {
  return (
    data !== null &&
    typeof data === 'object' &&
    (data as ReceiverUpdate).kind === KIND_RECEIVER_UPDATE
  );
}

type Route = {
  nodeId: number;
  send: Send;
};

type RouteLookup = Map<string, Route>;

export type Config = {
  kind: 1;
  nodeId: number;
  above?: MessageNode;
  below?: MessageNode[];
  register?: DriverRegister;
};

export type Timer = ReturnType<typeof setTimeout>;

function isConfig(data: unknown): data is Config {
  return (
    data !== null &&
    typeof data === 'object' &&
    (data as Config).kind === KIND_CONFIGURATION
  );
}

function dispatchUpdate(
  send: Send,
  nodeId: number,
  id: string,
  remove: boolean = false
) {
  send({ id, nodeId, remove, kind: KIND_RECEIVER_UPDATE });
}

function dispatchReceivers(send:Send, nodeId: number, map: RouteLookup) {
  for (const id of map.keys()) {
    dispatchUpdate(send, nodeId, id, false);
  }
}

function dispatchRequest(send: Send, nodeId: number) {
  send({ nodeId, kind: KIND_RECEIVER_REQUEST });
}

function makeMessageHub({ nodeId, above, below, register }: Config) {
  const routes: RouteLookup = new Map();
  const nodes = new Map<number, Route>();
  const local = makeMessageStore<Message>();

  function dequeue() {
    const result = local.dequeue();
    if (!result) return 0;

    const [message, size] = result;
    const route = routes.get(message.id);
    if (route) {
      route.send(message.data);
    }

    return size;
  }

  const queued = register ? register(dequeue) : () => {};

 function queue(message: Message) {
    local.queue(message);
    queued();
  }
 
  function cacheNodeRoute(nodeId: number, nodeSend: Send): void {
    if (nodes.has(nodeId)) return;

    nodes.set(nodeId, { nodeId, send: nodeSend });
  }

  function addRoute(nodeId: number, id: string, send: Send) {
    routes.set(id, { nodeId, send });
  }

  function removeRoute(homeNodeId: number, id: string, send?: Send) {
    const current = routes.get(id);
    if (nodeId === homeNodeId && current?.send !== send) return;

    routes.delete(id);

    if (above) dispatchUpdate(above.send, nodeId, id, true);
  }

  function subscribe(id: string, send: Send) {
    addRoute(nodeId, id, send);
    return () => removeRoute(nodeId, id, send);
  }

  function routeMessage(message: Message) {
    const route = routes.get(message.id);
    if (!route) {
      // push message up
      if (above) above.send(message);
      return;
    }

    if (route.nodeId !== nodeId) {
      // forward immediately
      route.send(message);
      return;
    }

    // queue local message
    queue(message);
  }

  function send(id: string, data: unknown) {
    routeMessage({ id, data, kind: KIND_MESSAGE });
  }

  function sendAfter(id: string, data: unknown, timeMs: number): Timer {
    const message: Message = { id, data, kind: KIND_MESSAGE };

    return setTimeout(() => routeMessage(message), timeMs);
  }

  function cancelTimer(timer: Timer) {
    clearTimeout(timer);
  }

  if (above) {
    // connect to "above"
    const nodeSend = above.send;

    function inboundMessage(event: MessageEvent) {
      const data = event.data;
      if (isMessage(data)) {
        routeMessage(data);

      } else if (isReceiverRequest(data)) {
	if (!nodes.has(data.nodeId)) 
	  cacheNodeRoute(data.nodeId, nodeSend);

        dispatchReceivers(nodeSend, nodeId, routes);
      }
    }
    above.setListener(inboundMessage);

  } else if (below && below.length > 0) {
    // connect to "below"
    function makeNodeHandler(nodeSend: Send) {
      return function onWorkerMessage(event: MessageEvent) {
        if (isMessage(event.data)) {
	  routeMessage(event.data);

        } else if (isReceiverUpdate(event.data)) {
          const update = event.data;
          cacheNodeRoute(update.nodeId, nodeSend);

          if (update.remove) removeRoute(update.nodeId, update.id);
          else addRoute(update.nodeId, update.id, nodeSend);
        }
      };
    }

    for (const node of below) {
      node.setListener(makeNodeHandler(node.send));
      dispatchRequest(node.send, nodeId);
    }
  } // end "below" nodes

  return {
    send,
    sendAfter,
    cancelTimer,
    subscribe,
    dequeue,
  };
}

export type MessageHub = ReturnType<typeof makeMessageHub>;

export { makeMessageHub, isConfig };
