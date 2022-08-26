import { makeRegister } from './lib/message-driver';
import { makeWorkerNode } from './lib/message-node';
import { makeMessageHub } from './lib/message-hub';
import { makeProclet } from './lib/test-proclet';

import type { Config } from './lib/message-hub';

// send hub configuration to worker(s)
const worker1 = new Worker('./worker.js');
worker1.postMessage({ kind: 1, nodeId: 1 });
const node1 = makeWorkerNode(worker1);

const worker2 = new Worker('./worker.js');
worker2.postMessage({ kind: 1, nodeId: 2 });
const node2 = makeWorkerNode(worker2);

const worker3 = new Worker('./worker.js');
worker3.postMessage({ kind: 1, nodeId: 3 });
const node3 = makeWorkerNode(worker3);

// local hub configuration
const config: Config = {
  kind: 1,
  nodeId: 0,
  register: makeRegister(),
  below: [node1, node2, node3],
};

const hub = makeMessageHub(config);

// setup Proclets
makeProclet(hub, config.nodeId);

/*
function makeReceive(name: string) {
  return function receive(data: unknown) {
    if (typeof data !== 'string') {
      console.log(`${name}: unknown`, data);
      return;
    }

    console.log(`${name} just received: ${data}`);
  };
}

// const _redUn = 
subscribe('red', makeReceive('red'));
// const _greenUn = i
subscribe('green', makeReceive('green'));
// const _blueUn = i
subscribe('blue', makeReceive('blue'));

send('green', 'hello from red');
send('blue', 'hello from green');
send('red', 'hello from blue');

//redUn();
//greenUn();
//blueUn();
*/
/*
const listeners: Callback[] = [];
const unsubs: (() => void)[] = [];
let lastListener = -1;

type Callback = () => void;

function subscribe(cb: Callback) {
  const key = listeners.indexOf(cb);
  if (key > -1) return unsubs[key];

  function unsubscribe () {
    const index = listeners.indexOf(cb);
    if (index < 0) return;

    const other = listeners.pop();
    const unsub = unsubs.pop();
    lastListener = lastListener > -1 ? lastListener - 1 : lastListener;
    if (index >= listeners.length) return

    if (other && unsub) {
      listeners[index] = other;
      unsubs[index] = unsub;
    }
  }

  listeners.push(cb);
  unsubs.push(unsubscribe);

  return unsubscribe;
}

function notify() {
  const list = listeners.slice();
  for (let i = 0; i < list.length; i += 1) {
    const cb = list[i];
    // Has recently unsubscribed
    if (cb !== listeners[i]) continue;

    cb();
  }
}

const unsub0 = subscribe(() => console.log('subscriber 0'));
const unsub1 = subscribe(() => console.log('subscriber 1'));
const unsub2 = subscribe(() => console.log('subscriber 2'));

notify();
unsub0();
notify();
unsub2();
notify();
unsub1();
notify();
*/


