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
  projectDir?: string,  //项目目录
  outPut?: string   //文件输出目录
  outFile?: string,  //文件名字
  swaggerConfig?: Omit<SwaggerDoc,"paths">  // swagger config
}


const defaultSwaggerGenerateConfig: SwaggerGenerateConfig= {
  // basePath: '',
  // outFile:'docs',
  projectDir:'./', 
  outPut:'./',  
  outFile: 'swagger.json',
  swaggerConfig: defaultSwaggerConfig
}


function isAbsolutePath(path:string){
  return path[0] == '/'
}


export function setConfig(config:SwaggerGenerateConfig){
  try{
    // let userConfigStr = fs.readFileSync(path.join(process.cwd(),configName),'utf-8')
    // let userConfig =  JSON.parse(userConfigStr)
    let depConfig =  deepMergeObjects(defaultSwaggerGenerateConfig, config)
    if(!isAbsolutePath(depConfig.projectDir)){
      depConfig.projectDir = path.join(process.cwd(),depConfig.projectDir)
    }
    if(!isAbsolutePath(depConfig.outPut)){
      depConfig.outPut = path.join(process.cwd(),depConfig.outPut)
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