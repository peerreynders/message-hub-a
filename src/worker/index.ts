import { isConfig, makeMessageHub } from '../lib/message-hub';
import { makeWorkerScopeNode } from '../lib/message-node';
import { makeRegister } from '../lib/message-driver';
import { makeProclet } from '../lib/test-proclet';

function onMessage(e: MessageEvent) {
  if (!isConfig(e.data)) return;

  const config = e.data;
  config.above = makeWorkerScopeNode(self);
  config.register = makeRegister();

  const hub = makeMessageHub(config);

  makeProclet(hub, config.nodeId);
}

self.onmessage = onMessage;
