import { createJoinPath } from "../shared/node-path.mjs"
export const AUTO_GENERATE_ENV = createDefaultEnvWithCWD(process.cwd()) 
export function createDefaultEnvWithCWD (cwd){
  return {
    root:cwd,
    src: createJoinPath(cwd, 'src'),
    cache: createJoinPath(cwd, 'node_modules/.cache-handcraft'),
    dist: createJoinPath(cwd, 'dist'),
    configName: createJoinPath(cwd, '.handcraftrc')
  }
}