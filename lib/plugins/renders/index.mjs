import { fileExtentions } from '../../shared/node-path.mjs'
import * as renderCp from './renderCp.mjs'
import * as renderEjs from './renderEjs.mjs'

const RENDER_TYPE_HIGHORDER = "HIGH_ORDER_RENDERER"

const renderers = [
  renderEjs,
  renderCp
]

export function getRenderManifest({
  sourcePath,
  destinationDir,
}) {
  
}

export function writeArtifactsWithRenderManifest (renderManifest){
  if(typeof renderManifest.render === "function"){
    //return renderManifest.render()
  }
}