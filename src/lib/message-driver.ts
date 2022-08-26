import type { DriverRegister, DequeueFn, QueuedCallback } from './message-types'; 

function makeRegister(): DriverRegister {
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

  return function register(dequeue: DequeueFn): QueuedCallback {
    function fullFlush() {
      for (let size = dequeue(); size > 0; size = dequeue());

      timeout = undefined;
    }

    return function queued() {
      if (timeout) return;

      timeout = setTimeout(fullFlush);
    };
  }
}

export {
  makeRegister
};
