function onMessage(e: MessageEvent) {
  // ping back
  postMessage(e.data);
}

self.onmessage = onMessage;
