import { SwaggerResponse, TypeNodeInfo } from "./generateSwagger"

export function convertTypeNodeInfoToSwaggerResponse(typeNodeInfo:TypeNodeInfo|undefined,options?:{httpCode:number,description?:string}){
  let {httpCode = 200,description = ''} = options || {}
  if(!typeNodeInfo){  
    return
  }
  let response:SwaggerResponse = {
    [httpCode.toString()]:{
      description: description,
      content:{
        'application/json':{
          schema: typeNodeInfo
        }
      }
    }
  }
  return response
}