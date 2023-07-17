import * as fs from 'node:fs';
import { 
  cp as nodeCpAsync,
  rm as nodeRmAsync,
  rmdir as nodeRmdirAsync,
} from 'node:fs/promises'
import { createJoinPath, likeAbsolutePath, likeRelativePath } from './node-path.mjs';


export function cpFileAsync(source, destination){
  const copyOption = { recursive:true }
  return nodeCpAsync(source, destination, copyOption)
}

export function rmFileAsync(path){
  const copyOption = { recursive:true }
  return fileStatAsync(path)
  .then((stat)=>{
    if(stat.isDirectory()){
      return nodeRmAsync(path, copyOption)
      //return nodeRmdirAsync(path, copyOption)
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

export function toAbsolutePath(path, options) {
  if(typeof path !== "string"){
    return null
  }
  const cwd = options?.cwd || process.cwd()
  let result = null
  if(likeAbsolutePath(path)){
    result = path
  } else if(likeRelativePath(path)){
    result = createJoinPath(cwd, path)
  } else {
    return result
  }
  //
  if(/\/[a-z]{1}\//.test(result)){
    if(process.env.MSYS){
      return createJoinPath(`${result.charAt(1).toUpperCase()}:\\`, result.substring(3, result.length))
    }
  }
  return result
}

// nodejs 코드, fs 모듈을 이용함 , 프로미스로 리턴함, 리턴 타입은 Boolean
export function fileStatAsync(path, options) {
  const absPath = toAbsolutePath(path, options)
  return new Promise(function(resolve, reject) {
    fs.stat(absPath, function(error, stat) {
      if(error){
        reject(error)
      } else {
        resolve(stat)
      }
    })
  })
}


export function exsistDirectoryAsync(path, options){
  const absPath = toAbsolutePath(path, options)
  return fileStatAsync(absPath)
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

export function exsistFileAsync(path, options){
  const absPath = toAbsolutePath(path, options)
  return fileStatAsync(absPath)
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