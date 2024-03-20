import path from "path"
import { SwaggerDoc } from "../generateSwagger/createSwagger"
import fs  from 'fs'
import { deepMergeObjects } from "./object"
const defaultSwaggerConfig:Omit<SwaggerDoc,"paths"> = {
  "openapi": "3.0.0",
  "info": {
    "title": 'swagger doc',
    "description": "swagger doc",
    version:'1.0.0'
  }
}

export interface GenerateSwaggerConfig{
  basePath?: string,   // root dir
  outPut?: string,  // out put dir
  swaggerName?: string,  // swagger file name
  swaggerConfig: Omit<SwaggerDoc,"paths">  // swagger config
}


const defaultGenerateSwaggerConfig: GenerateSwaggerConfig= {
  basePath: '',
  outPut:'docs',
  swaggerName: 'swagger.json',
  swaggerConfig: defaultSwaggerConfig
}
const configName = 'gswagger.json'

export function getConfig(){

  try{
    let userConfigStr = fs.readFileSync(path.join(process.cwd(),configName),'utf-8')
    let userConfig =  JSON.parse(userConfigStr)
    return deepMergeObjects(defaultGenerateSwaggerConfig, userConfig)
  }catch(e){

  }
  return  defaultGenerateSwaggerConfig
}
