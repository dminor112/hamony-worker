# harmony-worker
Make web worker more easy to use.

## Installation
Download and include the 'index.js' in your code. If you are in nodejs or otherwise using npm, run:
```sh
npm install harmony-worker
```

## Example
```javascript
import harmonyWorker from 'harmony-worker'

// If there are transferable data.
async function doSomething1(){
  let data = new Uint8Array(100)
  let result = await harmonyWorker.run((bufferData, arg1) => {
    bufferData.fill(arg1, 0, bufferData.length)
    return [bufferData, [bufferData.buffer]]
  }, [data, 4], [data.buffer])
  // the result will get the modified bufferData.
  console.log(result)
}
// If there are not transferable data.
async function doSomething2(){
  let result = await harmonyWorker.run((arg1, arg2) => {
    return arg1 + arg2
  }, [2, 4])
  // the result will get 6.
  console.log(result)
}
```
## Dependencies
None.
