import { NodeListener, Send } from './message-types';

export type MessageNode = {
 send: Send;
 setListener: (listener: NodeListener) => void;
 setErrorListener: (listener: NodeListener) => void;
}

function makeWorkerScopeNode(scope: DedicatedWorkerGlobalScope): MessageNode {
  function send(data: unknown) {
    scope.postMessage(data);
  }

  function setListener(onMessage: NodeListener) {
    scope.onmessage = onMessage
  }

  function setErrorListener(onMessageError: NodeListener) {
    scope.onmessageerror = onMessageError
  }

  return {
    send,
    setListener,
    setErrorListener
  }
}

function makeWorkerNode(worker: Worker): MessageNode {

  function send(data: unknown) {
    worker.postMessage(data);
  }

  function setListener(onMessage: NodeListener) {
    worker.onmessage = onMessage
  }

  function setErrorListener(onMessageError: NodeListener) {
    worker.onmessageerror = onMessageError
  }

  return {
    send,
    setListener,
    setErrorListener
  }
}

export {
  makeWorkerNode,
  makeWorkerScopeNode,
};
