import harmonyWorker from '../../src/index'

describe('harmonyWorker', function () {
	describe('run', function(){
    it('no transferable', function(done){
      harmonyWorker.run((arg1, arg2) => {
        return arg1 + arg2
      }, [2, 4]).then((result) => {
        done(assert.equal(result, 6))
      })
    })
  })
});

describe('harmonyWorker', function () {
	describe('run', function(){
    it('with transferable', function(done){
      let dataView = new Uint8Array(100)
      harmonyWorker.run((data, arg2) => {
        data.fill(arg2, 0, data.length)
        return [data, [data.buffer]]
      }, [dataView, 4], [dataView.buffer]).then((result) => {
        done(assert.equal(result[0], 4))
      })
    })
  })
});
