import path from "node:path";

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

