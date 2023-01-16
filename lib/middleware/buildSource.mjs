import Router from "express"
import glob from "glob";
import { promisify } from "../shared/node-functions.mjs";
import { cpFileAsync, rmFileAsync, exsistFileAsync } from "../shared/node-fs.mjs";
import { createGlobPath, createJoinPath, createRelativePath,  } from "../shared/node-path.mjs";
const globAsync = promisify(glob);

//
export default async serverState => {
  const router = Router();
  console.log("Starting.. Build source middleware..");
  console.log("serverState.srcPath", serverState.srcPath)

  const selectSrcAllPath = createGlobPath(serverState.srcPath, "**", "*")
  // legacy source delete
  const selectLegacyFiles = createGlobPath(serverState.cachePath, "*")
  
  // remove legacy file targets
  const allLegacyFiles = await globAsync(selectLegacyFiles)
  const queryRmFiles = allLegacyFiles.map(async (filepath)=>{
    await rmFileAsync(filepath)
  })
  await Promise.all(queryRmFiles).then(()=>{
    console.log("clean cache")
  })
  
  // initial build
  serverState.pipe.task("buildSource.init", async (resolve)=>{
    
    // destination
    const destinationPath = serverState.tags.includes("dev") ? serverState.cachePath : serverState.distPath;
    
    // new source copy
    const allStats = await globAsync(selectSrcAllPath)
    const queryFilesAsync = allStats.map((fullpath)=>{ return exsistFileAsync(fullpath).then((result)=>(result?fullpath:null)) })
    const allFiles = (await Promise.all(queryFilesAsync)).filter(Boolean)
    await buildSourceFiles({ src:serverState.srcPath, dest:destinationPath, files:allFiles })  
  
    // external
    serverState.event.on("requestBuildSourceFiles", async ({ files })=>{
      const result = await buildSourceFiles({ src:serverState.srcPath, dest:destinationPath, files })
      return result
    })

    resolve()
  }, ["middlewares.onload"])

  return router;
}

async function buildSourceFiles ({ src, dest, files }){
  const relativePaths = files.map((filepath)=>{
    const relativePath = createRelativePath(src, filepath)
    if(relativePath.indexOf("..") === 0){
      console.log("error not source file", { src, filepath })
      return null
    } else {
      return relativePath
    }
  }).filter(Boolean)
  
  const queryCopyFiles = relativePaths.map(async (relativePath)=>{
    const from = createJoinPath(src, relativePath)
    const to = createJoinPath(dest, relativePath)

    

    await cpFileAsync(from, to)
  })

  return Promise.all(queryCopyFiles)
}
