#!/usr/bin/env node
import { spawn } from 'cross-spawn';
import { exsistDirectoryAsync, toAbsolutePath } from "../shared/node-fs.mjs";
import { commonDirname, createJoinPath } from '../shared/node-path.mjs';
import minimist from 'minimist';
import { doit } from '../shared/node-functions.mjs';

const __dirname = commonDirname(import.meta.url)
const { _:argvModifires, ...argvProps } = minimist(process.argv.slice(2))
const [lastArg, ...tags] = argvModifires.reverse()
tags.reverse()

const targetPath = await doit(async ()=>{
  const testPath = toAbsolutePath(lastArg)
  const isExsist = await exsistDirectoryAsync(testPath)
  if(!isExsist){
    return process.cwd()
  } else {
    return testPath
  }
})

const entryScript = createJoinPath(__dirname, "..", "scripts", "entry.mjs")
const entryProcess =  spawn('node', [entryScript, ...tags ,`--cwd=${targetPath}`], { cwd:targetPath })

entryProcess.stdout.on('data', (data) => {
  console.log(String(data));
});

entryProcess.stderr.on('data', (data) => {
  console.log(String(data));
});

entryProcess.on('close', (code) => {
  console.log(`Handcraft exited with code ${code}`);
});