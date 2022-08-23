# message-hub-a
Web Worker experiment

[Notes are reverse (i.e. Stack/FIFO) order]
- Absolute minimal setup with working web worker ([Structuring a TypeScript project with workers](https://stackoverflow.com/questions/56356655/structuring-a-typescript-project-with-workers); [typescript-worker-example](https://github.com/jakearchibald/typescript-worker-example))
---

```shell
$ npm run build:worker

  > msg-hub@0.0.0 build:worker
  > ./node_modules/.bin/tsc --project ./src/worker ; ./node_modules/.bin/rollup -c

  ./worker/worker/index.js → ./public/worker.js...
  created ./public/worker.js in 17ms

$ npm run dev

  > msg-hub@0.0.0 dev
  > vite

    VITE v3.0.9  ready in 141 ms

    ➜  Local:   http://localhost:5173/
    ➜  Network: use --host to expose
```
