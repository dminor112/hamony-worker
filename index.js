/**
 * 一个简单的web worker封装，支持run一个function并返回promise，方便线程创建
 * Created by allen on 2019/4/25
 */

 (function(){
  
  function genSeq () {
    return Math.random().toString('36').slice(2, 10)
  }
 
  // 子线程worker里面的代码模板，用来接收主线程传过来的message并调用函数执行及返回结果
  const template = `self.addEventListener('message', function (e) {
      let message = e.data
      // doTask函数会在run里面接收到函数后将函数体动态拼接到子线程里面
      if (this.doTask && typeof doTask === 'function') {
        let results = this.doTask(...message.args)
        if (Object.prototype.toString.call(results) !== '[object Array]') {
          results = [results]
        }
        //函数执行结果和transferable列表（如果有的话）
        message.result = results[0]
        let transferList = results[1]
        self.postMessage(message, transferList)
      }
    }, false)\n`
  
  // 主线程用来记录放到子线程里执行的seq及对应的promise，拿到子线程的执行结果后resolve这个promise
  const taskMap = new Map()
  
  /**
    * 启动子线程，并在里面执行func，然后等待拿到结果
    * @param  {Function} func - 要执行的函数，要求该函数如果有内存引用传递的话要return [returnData, [transferList]]的形式
    * @param  {Array} args - 传给函数的参数列表
    * @param  {Array} transferList - 可选项，transferable列表
    */
  function run (func, args, transferList) {
    // 拼接子线程模板以及func函数体，创建线程
    let blob = new Blob([`${template}var doTask = ${func.toString()}`])
    let url = window.URL.createObjectURL(blob)
    let worker = new Worker(url)
    worker.onmessage = (event) => {
      // 获取子线程的执行结果，resolve promise
      let data = event.data
      let promise = taskMap.get(data.seq)
      if (promise) {
        promise.resolve(data.result)
        taskMap.delete(data.seq)
      }
      worker.terminate()
    }
    return new Promise((resolve, reject) => {
      // 给子线程发送参数，让子线程执行func的代码
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
