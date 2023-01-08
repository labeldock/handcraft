import { createJoinPath } from "../shared/pathHelper.mjs"



const autoDefaultPath = createDefaultPathWithCWD(process.cwd()) 

export const DEFAULT_CWD_PATH = autoDefaultPath.cwd
export const DEFAULT_SRC_PATH = autoDefaultPath.src
export const DEFAULT_CACHE_PATH = autoDefaultPath.cache
export const DEFAULT_DIST_PATH = autoDefaultPath.dist
export const DEFAULT_CONFIG_NAME =  configName

export function createDefaultPathWithCWD (cwd){
  return {
    cwd,
    src: createJoinPath(cwd, 'src'),
    cache: createJoinPath(cwd, 'node_modules/.cache-handcraft'),
    dist: createJoinPath(cwd, 'dist'),
    configName: createJoinPath(cwd, '.handcraftrc')
  }
}