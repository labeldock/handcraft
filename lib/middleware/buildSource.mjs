import Router from "express"
import glob from "glob";
import { doit, promisify } from "../shared/node-functions.mjs";
import { cpFileAsync, rmFileAsync, exsistFileAsync } from "../shared/node-fs.mjs";
import { createGlobPath, createJoinPath, createRelativePath, fileExtentions,  } from "../shared/node-path.mjs";
import { getRenderManifest, writeArtifactsWithRenderManifest } from "../plugins/renders/index.mjs";
const globAsync = promisify(glob);

//
export default async serverState => {
  const router = Router();
 
  const selectSrcAllPath = createGlobPath(serverState.srcPath, "**", "*")
  // legacy source delete
  const selectLegacyFiles = createGlobPath(serverState.cachePath, "*")
  
  console.log("serverState.cachePath", serverState.cachePath)
  router.use(Router.static(serverState.cachePath))

  // initial build
  serverState.pipe.task("buildSource.init", async (resolve)=>{
    console.log("Starting.. Build source middleware..");

    // remove legacy file targets
    const allLegacyFiles = await globAsync(selectLegacyFiles)
    const queryRmFiles = allLegacyFiles.map(async (filepath)=>{
      await rmFileAsync(filepath)
    })
  
    await Promise.all(queryRmFiles)

    // destination
    const destinationPath = serverState.tags.includes("dev") ? serverState.cachePath : serverState.distPath;
    
    // new source copy
    const sourceFiles = await doit(async ()=>{
      const allStats = await globAsync(selectSrcAllPath)
      const queryFilesAsync = allStats.map((fullpath)=>{ return exsistFileAsync(fullpath).then((result)=>(result?fullpath:null)) })
      const realFiles = (await Promise.all(queryFilesAsync)).filter(Boolean)
      return realFiles
    })
    
    console.log('sourceFiles', sourceFiles, { src:serverState.srcPath, dest:destinationPath, files:sourceFiles })
    await requestBuildSourceFiles({ 
      sourceRoot:serverState.srcPath, 
      destinationRoot:destinationPath, 
      requestFiles:sourceFiles 
    })
  
    // external
    serverState.event.on("requestBuildSourceFiles", async ({ files })=>{
      const result = await requestBuildSourceFiles({ src:serverState.srcPath, dest:destinationPath, files })
      return result
    })
    
    resolve()
  }, ["middlewares.onload"])

  return router;
}

async function requestBuildSourceFiles ({ sourceRoot, destinationRoot, requestFiles }) {
  const expectPathInfos = requestFiles.map((sourcePath) => {
    const relativePath = createRelativePath(sourceRoot, sourcePath)
    const destinationDir = createJoinPath(destinationRoot, relativePath, '..')
    return {
      sourcePath,
      destinationDir,
    }
  }).filter(Boolean)

  const extendedRenderManifests = expectPathInfos.map(async ({
    sourcePath,
    destinationDir,
  }) => {
    const payload = {
      sourcePath,
      destinationDir,
    }
    return {
      payload,
      renderManifest: getRenderManifest(payload)
    }
  })

  const executeGenerateArtifects = extendedRenderManifests.map(async ({ payload, renderManifest })=>{
    const artifects = writeArtifactsWithRenderManifest(renderManifest)
    return {
      ...payload,
      artifects,
    }
  })  
  
  return Promise.all(executeGenerateArtifects)
}
