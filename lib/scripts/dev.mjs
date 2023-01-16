import { createServer } from '../index.mjs'
import path from 'node:path'
import { commonDirname } from '../shared/node-path.mjs'
import { createDefaultEnvWithCWD } from '../manifest/defaultPath.mjs'
const __dirname = commonDirname(import.meta.url)

const devCwd = path.join(__dirname, "..", "..", "test", "basic")
const devEnv = createDefaultEnvWithCWD(devCwd)


await createServer({ ...devEnv, tags:["dev"] })
