#!/usr/bin/env node
import { spawn } from 'cross-spawn';
import { toAbsolutePath } from "../shared/node-fs.mjs";
import { commonDirname, createJoinPath } from '../shared/node-path.mjs';
import minimist from 'minimist';

const { _:argvModifires, ...argvProps } = minimist(process.argv.slice(2))
const lastArg = argvModifires[argvModifires.length - 1]
const __dirname = commonDirname(import.meta.url)


if(argvModifires.includes("dev")){
  const absolutePath = toAbsolutePath(lastArg)
  
  if(absolutePath){
    const entryScript = createJoinPath(__dirname, "..", "scripts", "entry.mjs")
    const entryProcess =  spawn('node', [`--cwd=${absolutePath}`], { cwd:absolutePath })
    
    entryProcess.stdout.on('data', (data) => {
      console.log(String(data));
    });
    
    entryProcess.stderr.on('data', (data) => {
      console.log(String(data));
    });
    
    entryProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
  //console.log("absolutePath", absolutePath)


  //


}
