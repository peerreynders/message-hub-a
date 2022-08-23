export {}

const worker = new Worker('./worker.js');

function onMessage(e: MessageEvent) {
  console.log('Received from worker:', e.data);
}

worker.onmessage = onMessage;

worker.postMessage('Hello');
