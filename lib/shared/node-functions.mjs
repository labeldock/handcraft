export function isNone (data){
  return (data === undefined) || (data === null) || (data !== data)
}

export function asArray (data){
  if(Array.isArray(data)){
    return data
  }
  if(isNone(data)){
    return []
  }
  return [data]
}

// 순수 Object를 확인하기 위한 함수
export function isPlainObject (data) {
  return typeof data === 'object' && Boolean(data) && data.constructor === Object;
}

export const isInfinity = function (it) {
  return it === Number.POSITIVE_INFINITY || it === Number.NEGATIVE_INFINITY
}

export const isNumber = function (it) {
  return typeof it === 'number' && !isInfinity(it) && !isAbsoluteNaN(it)
}

export const isText = function (it) {
  return typeof it === 'string' || isNumber(it)
}

export function doit(fn, args){
  return typeof fn === 'function' ? fn(...asArray(args)) : undefined
}

export function hooks(fn, ...hooks){
  return function generatedFunction(...args){
    hooks.forEach(({ doit, doBefore, before })=>{
      if((doBefore === true || (doit !== false && doBefore !== false)) && typeof before === 'function'){
        before(args)
      }
    })

    const result = fn(...args)
    
    const finalResult = hooks.reduce((dest, { doit, doFinal, final })=>{
      if((doFinal === true || (doit !== false && doFinal !== false)) && typeof final === 'function'){
        return final(dest)
      } else {
        return dest
      }
    }, result)
    
    hooks.forEach(({ doit, doAfter, after })=>{
      if((doAfter === true || (doit !== false && doAfter !== false)) && typeof after === 'function'){
        after(finalResult)
      }
    })

    return finalResult
  }
}

export function promisify (caller){
  if(typeof caller !== 'function') {
    throw new Error(`First argument is not a function ${caller}`)
  }
  return function(...args){
    const promise = new Promise((resolve, reject)=>{
      caller(...args, (...callbackArgs)=>{
        const [error, result] = callbackArgs
        if(error){
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
    return promise
  }
}
