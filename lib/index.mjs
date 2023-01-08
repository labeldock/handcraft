import Router from 'express'
import { standardEvent, pipeEvent } from './shared/eventHelper.mjs'
// middleware
import browserSyncMiddleware from './middleware/browserSync.mjs'
import httpServeMiddleware from './middleware/httpServe.mjs'
import buildSourceMiddleware from './middleware/buildSource.mjs'
import { DEFAULT_CACHE_PATH, DEFAULT_CONFIG_NAME, DEFAULT_CWD_PATH, DEFAULT_DIST_PATH, DEFAULT_SRC_PATH } from './manifest/defaultPath.mjs'
// renderer
import render

export async function createServer(createOptions = {}) {
  const root = Router()
  const serverState = createServeState(Object.assign(createOptions, { root }))
  await serverState.pipe.task("middlewares.onload", async (resolve)=>{
    root.use(await buildSourceMiddleware(serverState))
    root.use(await httpServeMiddleware(serverState))
    root.use(await browserSyncMiddleware(serverState))
    resolve()
  })
  return { root }
}

function createServeState(createOptions) {
  const serverState = {}
  const protectedValue = { 
    rootRouter: createOptions.root,
    rootEvent: standardEvent(),
    rootPipe: pipeEvent(),
  }
  Object.defineProperties(serverState, {
    root: {
      enumerable: true,
      configurable: false,
      get() {
        return protectedValue.rootRouter
      }
    },
    tags: {
      enumerable: true,
      configurable: false,
      get() {
        return ["dev"]
      }
    },
    event: {
      enumerable: true,
      configurable: false,
      get() {
        return protectedValue.rootEvent
      }
    },
    pipe: {
      enumerable: true,
      configurable: false,
      get() {
        return protectedValue.rootPipe
      }
    },
    cwd: {
      enumerable: true,
      configurable: false,
      get() {
        
        return createOptions?.cwd || DEFAULT_CWD_PATH
      }
    },
    srcPath: {
      enumerable: true,
      configurable: false,
      get() {
        return createOptions?.srcPath || DEFAULT_SRC_PATH
      }
    },
    cachePath: {
      enumerable: true,
      configurable: false,
      get() {
        return createOptions?.distPath || DEFAULT_CACHE_PATH
      }
    },
    distPath: {
      enumerable: true,
      configurable: false,
      get() {
        return createOptions?.distPath || DEFAULT_DIST_PATH
      }
    },
    configName: {
      enumerable: true,
      configurable: false,
      get() {
        return createOptions?.configPath || DEFAULT_CONFIG_NAME
      }
    },
    renderer: {
      enumerable: true,
      configurable: false,
      get() {
        return [
          
        ]
      }
    }
  })
  
  for(const key of Object.keys(createOptions)){
    if(!serverState.hasOwnProperty(key)){
      Object.defineProperty(serverState, key, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: createOptions[key]
      })
    }
  }

  return serverState
}