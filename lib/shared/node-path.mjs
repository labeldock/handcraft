import path from "node:path";
import { fileURLToPath } from 'node:url';

export function commonFilename (importMetaUrl){
  return fileURLToPath(importMetaUrl);
}

export function commonDirname (importMetaUrl){
  return fileURLToPath(new URL('.', importMetaUrl));
}

export function likeAbsolutePath(value){
  if(typeof value === "string"){
    return path.isAbsolute(value)
  } else {
    return false
  }
}

export function likeRelativePath(value){
  if(typeof value === "string"){
    return /^(\.(\/|\\)|\.\.(\/|\\))/.test(value) || /^(\.|\.\.)$/.test(value)
  } else {
    return false
  }
}

export function likePath(value){
  return likeAbsolutePath(value) || likeRelativePath(value)
}

export function fileExtentions(path, extentions){
  const result = path.split(".").reverse().filter((ext)=>{
    if(/(\/|\\)/.test(ext)){
      return false
    } else {
      return true
    }
  })
  return result
}

export function createJoinPath(...pathParams){
  return path.join(...pathParams) 
}

export function createGlobPath(...pathParams){
  const baseResult = createJoinPath(...pathParams)
  if(process.platform === "win32"){
    return baseResult.replace(/\\/g,"/")
  } else {
    return baseResult
  }
}

export function createRelativePath(from, to){
  return path.relative(from, to)
}

