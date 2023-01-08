import * as url from 'node:url';
import * as fs from 'node:fs';
import { 
  cp as nodeCpAsync,
  rm as nodeRmAsync,
  rmdir as nodeRmdirAsync,
} from 'node:fs/promises'

export function commonFilename (importMetaUrl){
  return url.fileURLToPath(importMetaUrl);
}

export function commonDirname (importMetaUrl){
  return url.fileURLToPath(new URL('.', importMetaUrl));
}

export function cpFileAsync(source, destination){
  const copyOption = { recursive:true }
  return nodeCpAsync(source, destination, copyOption)
}

export function rmFileAsync(path){
  const copyOption = { recursive:true }
  return fileStatAsync(path)
  .then((stat)=>{
    if(stat.isDirectory()){
      return nodeRmdirAsync(path, copyOption)
    } else {
      return nodeRmAsync(path, copyOption)
    }
  })
  .catch((error)=>{
    console.log("devel::rmFileAsync::stat::message", error.message)
  })
}

export function readFileAsync(path, encode = 'utf-8') {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, encode, function(error, data) {
      error ? reject(error) : resolve(data)
    })
  })
}

export function mkdirAsync(path){
  return new Promise(function(resolve, reject) {
    fs.stat(path, function(error) {
      if (error.code === 'ENOENT' || error.code === 'EEXSIST') {
        fs.mkdir(path, { recursive: true }, (error)=>{
          error ? reject(error) : resolve(path)
        })
      } else {
        resolve(path)
      }
    })
  })
}

export function writeFileAsync(path, data) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(path, data, function(error) {
      error ? reject(error) : resolve({ path, data })
    })
  })
}

// nodejs 코드, fs 모듈을 이용함 , 프로미스로 리턴함, 리턴 타입은 Boolean
export function fileStatAsync(path) {
  return new Promise(function(resolve, reject) {
    fs.stat(path, function(error, stat) {
      if(error){
        reject(error)
      } else {
        resolve(stat)
      }
    })
  })
}


export function exsistDirectoryAsync(path){
  return fileStatAsync(path)
  .then((stat)=>{
    return stat.isDirectory()
  })
  .catch((error)=>{
    if (error.code === 'ENOENT' || error.code === 'EEXSIST') {
      return false
    } else {
      return Promise.reject(error)
    }
  })
}

export function exsistFileAsync(path){
  return fileStatAsync(path)
  .then((stat)=>{
    return !stat.isDirectory()
  })
  .catch((error)=>{
    if (error.code === 'ENOENT' || error.code === 'EEXSIST') {
      return false
    } else {
      return Promise.reject(error)
    }
  })
}

export function unlinkFileAsync(path) {
  return fileStatAsync(path)
  .catch((error)=>{
    if (error.code === 'ENOENT' || error.code === 'EEXSIST') {
      return Promise.resolve({ 
        type:"unlinkFallback", 
        path, 
        code:error.code 
      })
    } else {
      return Promise.reject(error)
    }
  })
  .then((stats)=>{
    if(stats.type === "unlinkFallback"){
      return {
        path:stats.path,
        code:stats.code,
      }
    } else {
      return new Promise((resolve, reject)=>{
        fs.unlink(path, function(error) {
          error ? reject(error) : resolve({ path, code:"UNLINK" })
        })
      })
    }
  })
}

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
