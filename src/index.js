/**
 * Make web worker job to be a Promise
 * Created by allen on 2019/4/25
 */

(function(){
  
  function genSeq () {
    return Math.random().toString('36').slice(2, 10)
  }
 
  // The code template of the worker, get the data from main thread and run func and post the result back.
  const template = `self.addEventListener('message', function (e) {
      let message = e.data
      // The function doTask will be spelled onto template in the run function.
      if (this.doTask && typeof doTask === 'function') {
        let results = this.doTask(...message.args)
        if (Object.prototype.toString.call(results) !== '[object Array]') {
          results = [results]
        }
        // return transferable datas after run func.(If there are transferable datas need to return)
        message.result = results[0]
        let transferList = results[1]
        self.postMessage(message, transferList)
      }
    }, false)\n`
  
  // Record the seq and the promise in main thread.
  const taskMap = new Map()
  
  /**
    * create worker and run func in it.
    * @param  {Function} func - The func to run in worker, need to return [returnData, [transferList]].
    * @param  {Array} args - The args pass to func.
    * @param  {Array} transferList - optional, transferable list.
    */
  function run (func, args, transferList) {
    // Concat the template and the func code, create worker.
    let blob = new Blob([`${template}var doTask = ${func.toString()}`])
    let url = window.URL.createObjectURL(blob)
    let worker = new Worker(url)
    worker.onmessage = (event) => {
      // Get the reaults from worker, resolve promise.
      let data = event.data
      let promise = taskMap.get(data.seq)
      if (promise) {
        promise.resolve(data.result)
        taskMap.delete(data.seq)
      }
      worker.terminate()
    }
    return new Promise((resolve, reject) => {
      // Pass the args to worker, run func in worker.
      let seq = genSeq()
      worker.postMessage({
        seq: seq,
        args: args
      }, transferList)
      taskMap.set(seq, { resolve, reject })
    })
  }

  var harmonyWorker = {
    run
  }

  // Make available for import by `require()`
  if (typeof module == "object") { module.exports = harmonyWorker }
  else { self.harmonyWorker = harmonyWorker }
 })()
