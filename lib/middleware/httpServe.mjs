import Router from "express"
import http from 'http'

import { EXPRESS_PORT } from "../manifest/env.mjs";
//
export default async serverState => {
  const router = Router();
  if(serverState.tags.includes("dev")){
    serverState.pipe.task("httpServe.init",(resolve)=>{
      http.createServer(serverState.root).listen(EXPRESS_PORT, () => {
        console.log(`[HTTPServe] PORT http://localhost:${EXPRESS_PORT}`)
        resolve()
      })
    }, ["buildSource.init"])
    router.use(Router.static(serverState.distPath))
  }
  return router;
}
