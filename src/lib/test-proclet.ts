import type { MessageHub } from './message-hub';

const NODE_COUNT = 4;
const DELAY_INITIAL = 100;
const DELAY_TIMEOUT = 10;
const N_INITIAL = 5;

function toName(nodeId: number) {
  return String.fromCharCode((nodeId % NODE_COUNT) + 65);
}

class TestProclet {
  hub: MessageHub;
  id: string;
  targetId: string;
  n: number = N_INITIAL;
  done = false;
  unsub: (() => void) | undefined = undefined;

  constructor(hub: MessageHub, nodeId: number) {
    this.hub = hub;
    this.id = toName(nodeId);
    this.targetId = toName(nodeId + 1);
  }

  onTimeout() {
    this.n -= 1;

    const { hub, id, targetId, n } = this;
    const more = n > 0;
    const epilog = more ? ` ${n} more times` : '';
    hub.send(targetId, `${id} says hi!${ epilog }`);

    if (more) this.hub.sendAfter(id, null, DELAY_TIMEOUT);
    console.log(`${id} time out ${n} expired sent to ${targetId}`);
    this.afterMessage();
  }

  onGreeting(greeting: string) {
    const { id } = this;
    console.log(`${id} received: ${greeting}`);

    if(greeting.indexOf('more times') === -1) this.done = true;
    this.afterMessage();
 }

  onUnknown(data: unknown) {
    console.log(`${this.id} unknown: ${data}`);
  }

  // Note: NOT method but AFE
  receive = (data: unknown) => {
    if (data === null) {
      this.onTimeout();
      return;
    }

    if (typeof data === 'string') {
      this.onGreeting(data);
      return;
    }

    this.onUnknown(data);
  };

  start() {
    const { hub, id , receive } = this;
    this.unsub = hub.subscribe(id, receive);
    hub.sendAfter(id, null, DELAY_INITIAL);
    return this.unsub;
  }

  afterMessage() {
    if (!(this.done && (this.n < 1) && this.unsub)) return;

    this.unsub();
    this.unsub = undefined;
    console.log(`${this.id} all done. Bye!`);
  }
}

function makeProclet(hub: MessageHub, nodeId: number) {
  const proclet = new TestProclet(hub, nodeId);
  return proclet.start();
}

export {
  makeProclet
}
