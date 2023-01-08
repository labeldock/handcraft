export function defer() {
  let resolve, reject
  const promise = new Promise((...args)=>{
    resolve = args[0]
    reject = args[1]
  })
  return {
    resolve,
    reject,
    promise,
  }
}

export function timeoutAsync (wait = 0) {
  const time = Date.now()
  if (typeof wait !== 'number') {
    throw new Error('timeoutPromise::wait time must be number')
  }
  return new Promise((resolve) => setTimeout(() => resolve({ wait, time, now: Date.now() }), wait))
}

export function digestPromise (digestFn, afterResolve, afterReject){
  const state = {
    digest:null,
    fullfill:false,
  }

  const promise = new Promise((resolve, reject)=>{
    function handleResolve (resolveValue){
      state.fullfill = true
      if(typeof afterResolve === "function"){
        afterResolve(resolveValue)
      }
      resolve(resolveValue)
    }
    function handleReject (rejectValue){
      state.fullfill = true
      if(typeof afterReject === "function"){
        afterReject(rejectValue)
      }
      reject(rejectValue)
    }
    
    state.digest = function handleDigest (value){
      return state.fullfill ? null : digestFn(handleResolve, handleReject, value)
    }
  })
  const currentTarget = Object.defineProperties({}, {
    digest:{
      enumerable: true,
      configurable: false,
      writable: false,
      value: state.digest,
    },
    fullfill:{
      enumerable: true,
      configurable: false,
      get (){
        return fullfill
      }
    },
    promise:{
      enumerable: true,
      configurable: false,
      writable: false,
      value: promise,
    }
  })
  return currentTarget
}

export function disclosedPromise (beforeFn, afterResolve, afterReject){
  const state = {
    resolved:false, 
    rejected:false,
    fullfill:false,
  }
  const { digest, promise } = digestPromise(
    function handleDigest(resolve, reject){
      if(typeof beforeFn === "function"){
        beforeFn(resolve, reject)
      } else {
        resolve()
      }
    },
    function handleResolve (resolveValue){
      state.resolved = true
      state.fullfill = true
      if(typeof afterResolve === "function"){
        afterResolve(resolveValue)
      }
    },
    function handleReject (rejectValue){
      state.rejected = true
      state.fullfill = true
      if(typeof afterReject === "function"){
        afterReject(rejectValue)
      }
    }
  )
  digest()
  const currentTarget = Object.defineProperties({}, {
    resolved:{
      enumerable: true,
      configurable: false,
      get(){
        return state.resolved
      },
    },
    rejected:{
      enumerable: true,
      configurable: false,
      get(){
        return state.rejected
      },
    },
    fullfill:{
      enumerable: true,
      configurable: false,
      get(){
        return state.fullfill
      },
    },
    promise:{
      enumerable: true,
      configurable: false,
      writable: false,
      value: promise,
    }
  })
  return currentTarget
}