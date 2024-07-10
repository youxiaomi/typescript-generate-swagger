import path from "path"
import fs  from 'fs'
import { deepMergeObjects } from "./object"
import { SwaggerDoc } from "./swagger"
const defaultSwaggerConfig:Omit<SwaggerDoc,"paths"> = {
  "openapi": "3.0.0",
  "info": {
    "title": 'swagger doc',
    "description": "swagger doc",
    version:'1.0.0'
  }
}

export interface SwaggerGenerateConfig{
  projectDir?: string
  outFile?: string,  // out put dir
  swaggerConfig?: Omit<SwaggerDoc,"paths">  // swagger config
}


const defaultSwaggerGenerateConfig: SwaggerGenerateConfig= {
  // basePath: '',
  // outFile:'docs',
  projectDir:'./',
  outFile: 'swagger.json',
  swaggerConfig: defaultSwaggerConfig
}
const configName = 'swagger.json'


export function setConfig(config:SwaggerGenerateConfig){
  try{
    // let userConfigStr = fs.readFileSync(path.join(process.cwd(),configName),'utf-8')
    // let userConfig =  JSON.parse(userConfigStr)
    let depConfig =  deepMergeObjects(defaultSwaggerGenerateConfig, config)
    let isAbsoluteProjectDir = depConfig.projectDir[0] == '/'
    if(!isAbsoluteProjectDir){
      depConfig.projectDir = path.join(process.cwd(),depConfig.projectDir)
    }
    return depConfig
  }catch(e){

  }
  return  defaultSwaggerGenerateConfig
}
export function getConfig(){
  return defaultSwaggerGenerateConfig
}
// read config ,write swagger, bin file,