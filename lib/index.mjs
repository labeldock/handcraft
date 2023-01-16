import Router from 'express'
import { standardEvent, pipeEvent } from './shared/eventHelper.mjs'
// middleware
import browserSyncMiddleware from './middleware/browserSync.mjs'
import httpServeMiddleware from './middleware/httpServe.mjs'
import buildSourceMiddleware from './middleware/buildSource.mjs'
import { AUTO_GENERATE_ENV } from './manifest/defaultPath.mjs'
// renderer

export async function createServer(createOptions = {}) {
  const rootRouter = Router()
  const serverState = createServeState(Object.assign(createOptions, { rootRouter }))
  await serverState.pipe.task("middlewares.onload", async (resolve)=>{
    rootRouter.use(await buildSourceMiddleware(serverState))
    rootRouter.use(await httpServeMiddleware(serverState))
    rootRouter.use(await browserSyncMiddleware(serverState))
    resolve()
  })
  return { rootRouter }
}

function createServeState(createOptions) {
  const serverState = {}
  const protectedValue = { 
    rootRouter: createOptions.rootRouter,
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
        return createOptions?.tags || ["dev"]
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
        return createOptions?.root || AUTO_GENERATE_ENV.root
      }
    },
    srcPath: {
      enumerable: true,
      configurable: false,
      get() {
        return createOptions?.srcPath || AUTO_GENERATE_ENV.src
      }
    },
    cachePath: {
      enumerable: true,
      configurable: false,
      get() {
        return createOptions?.distPath || AUTO_GENERATE_ENV.cache
      }
    },
    distPath: {
      enumerable: true,
      configurable: false,
      get() {
        return createOptions?.distPath || AUTO_GENERATE_ENV.dist
      }
    },
    configName: {
      enumerable: true,
      configurable: false,
      get() {
        return createOptions?.configPath || AUTO_GENERATE_ENV.configName
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