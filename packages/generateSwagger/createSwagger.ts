import * as fs from 'fs'
import { convertSchema, generateSchemas } from './generateSchemas'
import { getConfig } from '../utils/config'
import { generatePath } from './generatePath'
import { writeSwagger } from './writeSwagger'





interface SwaggerPaths {
  [path: string]: {
    [x in keyof HttpMethod]?: {
      "tags"?: string[],
      "summary"?: string,
      "description"?: string,
      "operationId"?: string,
      "security"?: {
        "petstore_auth": string[] // "write:pets"
      }[]
      "parameters"?: SwaggerParameter[],
      "requestBody"?: SwggerRequestBody,
      "responses"?: SwaggerResponse
    }
  }
}
export interface SwaggerDoc {
  "openapi"?:  string  // "3.0.3",
  "info"?: {
    "title"?: string  //  "Swagger Petstore - OpenAPI 3.0",
    "description"?: string  ,
    "termsOfService"?: string //  "http://swagger.io/terms/",
    "contact"?: {
      "email": string //  "apiteam@swagger.io"
    },
    "version"?:  string  // "1.0.11"
    "license"?: {
      "name":  string //  "Apache 2.0",
      "url":  string // "http://www.apache.org/licenses/LICENSE-2.0.html"
    },
  },
  "externalDocs"?: {
    "description"?:  string //  "Find out more about Swagger",
    "url":  string //  "http://swagger.io"
  },
  "tags"?: {
    "name": string // "pet",
    "description"?: string // "Everything about your Pets",
    "externalDocs"?: {
      "description"?: string // "Find out more",
      "url"?: string //  "http://swagger.io"
    }
  }[]
  "servers"?: {
    "url": string  // "https://petstore3.swagger.io/api/v3"
  }[],
  paths: SwaggerPaths,
  components?: {
    schemas: {
      [x: string]: TypeNodeInfo
    }
  }

}
export enum HttpMethod {
  "GET" = 'get',
  "POST" = 'post',
  "PUT" = 'put',
  "DELETE" = 'delete',
  "PATCH" = 'patch',
  "OPTIONS" = 'options',
  "HEAD" = 'head',
}
export enum SwaggerTypes {
  "string" = 'string',
  "number" = 'number',
  "boolean" = 'boolean',
  "object" = 'object',
  "array" = 'array',
  "enum" = 'enum',
}
export enum SwaggerParamsPostion {
  path = 'path',
  query = 'query',
  body = 'body',
}



interface TypeNodeBase {
  description?: string
  required?: boolean
}


export interface TypeNodeObject extends Omit<TypeNodeBase,'required'>{
  type: SwaggerTypes.object
  properties: {
    [name: string]: TypeNodeInfo 
  },
  required?: string[]
}
export interface TypeNodeArray extends TypeNodeBase{
  type: SwaggerTypes.array
  items: TypeNodeInfo
}

export interface TypeNodePrimitive extends TypeNodeBase{
  type: SwaggerTypes.number | SwaggerTypes.string | SwaggerTypes.boolean 
  enum?: (string | number)[]
}
type TypeNodeUnion = TypeNodeObject | TypeNodeArray  | TypeNodePrimitive
export type TypeNodeInfo = TypeNodeUnion | {
  oneOf?: TypeNodeInfo[],
  allOf?:TypeNodeInfo[],
  description?:string,
  $ref?: string  // $ref: '#/components/schemas/Error'
  required?:boolean
}


export interface SwaggerParameter {
  name: string,
  in: SwaggerParamsPostion
  required?: boolean
  description?:string,
  schema?:{
    type?: SwaggerTypes
    enum?: (string | number)[]
    items?:{
      type?:SwaggerTypes
    }
    default?: string // "available"
  }
}
export interface SwggerRequestBody {
  required?: boolean,
  content:{
    'application/json':{
      schema: TypeNodeInfo
    }
  }
}
export interface SwaggerResponse {
  [httpCode: string]: {
    description:string
    content:{
      'application/json':{
        schema: TypeNodeInfo
      }
    }
  }
}

export interface HttpContent {
  parameters?: SwaggerParameter[],
  requestBody?: SwggerRequestBody,
  responses?: SwaggerResponse,
  summary?: string,
  description?: string
}
export interface PathInfo {
  [path: string]: {
    [httpMethod: string]: HttpContent
  }
}

export function createDoc(pathInfos:PathInfo,schemas:Map<string,TypeNodeInfo>){
  let config = getConfig()
  let swaggerDocs: SwaggerDoc = {
    ...config.swaggerConfig,
    paths: { }
  }
  swaggerDocs = generateSchemas(swaggerDocs,schemas)
  // Array.from(schemas.keys()).forEach(name => {
  //   let currentTypeInfo = schemas.get(name)
  //   swagerDocs.components = swagerDocs.components || { schemas:{}}
  //   if(currentTypeInfo){
  //     swagerDocs.components.schemas[name] = convertSchema(currentTypeInfo) //  
  //   }
  // })
  swaggerDocs = generatePath(swaggerDocs,pathInfos)
  writeSwagger(config,swaggerDocs)
}




export function getSchemaName(name:string){
  return `#/components/schemas/${name}`
}

function writeFile(file,content){
  
}