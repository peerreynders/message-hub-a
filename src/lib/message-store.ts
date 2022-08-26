function makeMessageStore<T>() {  
  const store: [T[], T[]] = [[], []];
  let outbound = 0;
  let inbound = 1;
  let nextOut = 0;

  function outLeft() {
    const outDiff = store[outbound].length - nextOut;
    return outDiff > 0 ? outDiff : 0;
  }

  function plusInSize(outSize: number) {
    return outSize + store[inbound].length;
  }

  function sizeMore(){
    const outSize = outLeft();  
    const size = plusInSize(outSize);
    if (size === 0 || outSize > 0) return size;

    // swap buffers
    store[outbound].length = 0;
    nextOut = 0;
    outbound = inbound;
    inbound = 1 - inbound;
    return size;
  }

  return {
    get size() {
     return plusInSize(outLeft());
    },
    queue (item: T) {
      store[inbound].push(item);
    },
    dequeue(): [T,number] | undefined {
      const size = sizeMore(); 
      if (size < 1) return undefined;

      const item = store[outbound][nextOut];
      nextOut += 1;
      return [item, size - 1];
    }
  }
}

export { makeMessageStore };
