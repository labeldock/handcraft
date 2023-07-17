import minimist from 'minimist';
import { createDefaultEnvWithCWD } from '../manifest/defaultPath.mjs';
import { createServer } from '../index.mjs'
const { _:argvModifires, ...argvProps } = minimist(process.argv.slice(2))
const cwd = argvProps.cwd || process.cwd()
const env = createDefaultEnvWithCWD(cwd)
const serverOptions = { ...env, tags:argvModifires }
await createServer(serverOptions)