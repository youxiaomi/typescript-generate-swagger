import * as fs from 'fs'
import { convertSchema, generateSchemas } from './schemaGenerate'
import { SwaggerDoc, getConfig } from '../../share'
import { generatePath } from './pathGenerate'
import { writeSwagger } from './swaggerWriter'
import { PathInfo, TypeNodeInfo } from "../../share"



export function createDoc(pathInfos:PathInfo,schemas:Map<string,TypeNodeInfo>){
  let config = getConfig()
  let swaggerDocs: SwaggerDoc = {
    ...config.swaggerConfig,
    paths: { }
  }
  swaggerDocs = generateSchemas(swaggerDocs,schemas)
  swaggerDocs = generatePath(swaggerDocs,pathInfos)
  writeSwagger(config,swaggerDocs)
}




export function getSchemaName(name:string){
  return `#/components/schemas/${name}`
}
export { SwaggerDoc }

