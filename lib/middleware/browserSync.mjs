import Router from "express"
import BrowserSyncModule from "browser-sync"
import { EXPRESS_PORT, BROWERSYNC_PORT, BROWERSYNC_UI_PORT } from "../manifest/env.mjs"
import { createJoinPath } from "../shared/pathHelper.mjs"

export default async serverState => {
  const router = Router();
  const bs = BrowserSyncModule.create()
  serverState.pipe.task("browserSync.init",()=>{
    bs.init({
      port: BROWERSYNC_PORT,
      open: "local",
      reloadOnRestart: true,
      minify: false,
      ui: {
        port: BROWERSYNC_UI_PORT,
      },
      proxy: {
        target: `http://localhost:${EXPRESS_PORT}`,
        ws: true
      },
      ghostMode: {
        clicks: true,
        forms: true,
        scroll: false
      }
    })
    bs.watch(createJoinPath(serverState.srcPath, "**/*.{scss,css}"), (event, file) => {
      if (event === "change") {
        bs.reload("*.css");
      }
    })
    bs.watch(createJoinPath(serverState.srcPath, "**/*.{js,cjs,mjs,html}"), (event, file) => {
      if (event === "change") {
        const queryRequestBuild = serverState.event.emit("requestBuildSourceFiles", { files:[file] })
        Promise.all(queryRequestBuild).then(()=>{
          bs.reload(file);
        })
      }
    })
    bs.watch(createJoinPath(serverState.srcPath, "**/*.{ejs}"), (event, file) => {
      if (event === "change") {
        const queryRequestBuild = serverState.event.emit("requestBuildSourceFiles", { files:[file] })
        Promise.all(queryRequestBuild).then(()=>{
          bs.reload("*.html");
        })
      }
    })
    bs.emitter.on("init", function () {
      console.log("Browsersync is running!");
    });
  }, ["httpServe.init"])
  return router;
}
