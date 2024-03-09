import * as fs from 'fs'
interface SwaggerPaths {
  [path: string]: {
    [x in string]?: {
      "tags"?: string[],
      "summary"?: string,
      "description"?: string,
      "operationId"?: string,
      "parameters"?: SwaggerParameter[],
      // "parameters"?: {
      //   "name": string,
      //   "in"?: "query",
      //   "description"?: string // "Status values that need to be considered for filter",
      //   "required"?: boolean,
      //   // "explode": true,
      //   "schema": {
      //     "type": "string",
      //     "default"?: string // "available",
      //     "enum"?: (string | number)[]
      //   }
      // }[],
      "requestBody"?: SwggerRequestBody,
      // "requestBody"?: {
      //   "description"?: string
      //   "content": {
      //     "application/json": {
      //       "schema": {
      //         "$ref": string // "#/components/schemas/Pet"
      //       } | SwaggerSchema
      //     },
      //   }
      //   "required": boolean
      // },
      // "responses"?: {
      //   [httpCode: string]: {
      //     "description"?: "Successful operation",
      //     "content"?: {
      //       "application/json": {
      //         "schema": {
      //           "$ref": string // "#/components/schemas/Pet"
      //         } | SwaggerSchema
      //       }
      //     }
      //   }
      // }
      "responses"?: SwaggerResponse
    }
  }
}
interface SwaggerDoc {
  "openapi": "3.0.3",
  "info": {
    "title": string //  "Swagger Petstore - OpenAPI 3.0",
    "description": string,
    "termsOfService": "http://swagger.io/terms/",
    "contact": {
      "email": "apiteam@swagger.io"
    },
    "version": "1.0.11"
  },

  "servers"?: [
    {
      "url": string  // "https://petstore3.swagger.io/api/v3"
    }
  ],
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
// export interface TypeNodeUnion extends TypeNodeBase{
//   type: SwaggerTypes.enum,
// }
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
  in: 'path'|'body'|'query'
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

export function createDoc(datas:PathInfo,schemas:Map<string,TypeNodeInfo>){
  const swagerDocs: SwaggerDoc = {
    "openapi": "3.0.3",
    "info": {
      "title": '接口', //  "Swagger Petstore - OpenAPI 3.0",
      "description": "结算接口",
      "termsOfService": "http://swagger.io/terms/",
      "contact": {
        "email": "apiteam@swagger.io"
      },
      "version": "1.0.11"
    },
    paths: {

    }
  }
  Array.from(schemas.keys()).forEach(name => {
    let currentTypeInfo = schemas.get(name)
    swagerDocs.components = swagerDocs.components || { schemas:{}}
    if(currentTypeInfo){
      swagerDocs.components.schemas[name] = convertSchema(currentTypeInfo) //  
    }
  })
  Object.keys(datas).forEach(path => {
    let pathInfo = datas[path]
    Object.keys(pathInfo).forEach((http) => {
      let httpInfo = pathInfo[http]
      if (!httpInfo) {
        return
      }
      let { parameters = [], requestBody, responses, summary, description } = httpInfo
      let pathData = swagerDocs.paths[path] = swagerDocs.paths[path] || {}
      let httpData = pathData[http] = pathData[http] || {}
      httpData.summary = summary
      httpData.description = description
      if (parameters) {
        httpData.parameters = parameters
      }
      if (requestBody) {
        httpData.requestBody = requestBody
      }
      if (responses) {
        httpData.responses = convertResponse(responses)
      }
    })
  })

  function convertSchema(responses:TypeNodeInfo){
    if ('type' in responses) {
      if(responses.type == SwaggerTypes.object){
        let properties = responses.properties
        // let propertiesRequired = convertSchema(properties!)
        let requiredFileds = Object.keys(properties!).filter(name => {
          let currentRequiredVal = properties![name].required
          delete properties![name].required
          convertSchema(properties![name])
          return currentRequiredVal === undefined || currentRequiredVal
        })
        if(requiredFileds.length){
          responses.required = requiredFileds
        }
      }
      if(responses.type == SwaggerTypes.array){
        convertSchema(responses.items)
      }     
    }

    if ('oneOf' in responses) {
      let oneOf = responses.oneOf?.map(item => {
        return convertSchema(item)
      })
      responses.oneOf = oneOf
    }
    if ('allOf' in responses) {
      let oneOf = responses.allOf?.map(item => {
        return convertSchema(item)
      })
      responses.oneOf = oneOf
    }
    return responses
  }
  function convertResponse(responses: SwaggerResponse) {
    for(let httpCode in  responses){
      let currentResponse = responses[httpCode]
      let schema = currentResponse.content['application/json'].schema
      let convertedSchema = convertSchema(schema)
      if(convertedSchema){
        currentResponse.content['application/json'].schema = convertedSchema
      }
    }
    return responses

    // if ('type' in responses &&  responses.type == 'object') {
    //   let properties = responses.properties

    //   let propertiesRequired = convertResponse(properties!)
    //   let requiredFileds = Object.keys(properties!).filter(name => {
    //     let currentRequiredVal = properties![name].required
    //     delete properties![name].required
    //     return currentRequiredVal === undefined || currentRequiredVal
    //   })

    //   if (propertiesRequired) {
    //     let swaggerResponse: SwaggerSchema = {
    //       type: responses.type,
    //       properties: propertiesRequired,
    //     }
    //     if (required.length) {
    //       swaggerResponse.required = required
    //     }
    //     return swaggerResponse
    //   }
    // }
    // if (responses.oneOf) {
    //   let oneOf = responses.oneOf.map(item => {
    //     return convertResponse(item)
    //   })
    //   return {
    //     ...responses,
    //     oneOf: oneOf
    //   }
    // }

    // return responses
  }
  fs.writeFileSync(`${__dirname}/swagger222.json`, JSON.stringify(swagerDocs))
}

function isTypeNodeObject(typeNodeInfo:TypeNodeInfo):typeNodeInfo is TypeNodeObject{
  return 'type' in typeNodeInfo && typeNodeInfo.type == SwaggerTypes.object
}
function isTypeNodeArray(typeNodeInfo:TypeNodeInfo):typeNodeInfo is TypeNodeArray{
  return 'type' in typeNodeInfo && typeNodeInfo.type == SwaggerTypes.array
}
function isTypeNodePrimitive(typeNodeInfo:TypeNodeInfo):typeNodeInfo is TypeNodePrimitive{
  return 'type' in typeNodeInfo &&  [SwaggerTypes.boolean,SwaggerTypes.number,SwaggerTypes.string].includes(typeNodeInfo.type)
}


export function convertTypeNodeToSwggerParameters(typeNodeInfo:TypeNodeInfo){
  let  parameters:SwaggerParameter[] = []
  if(isTypeNodeObject(typeNodeInfo)){
    if(typeNodeInfo.type == SwaggerTypes.object){
      let properties = typeNodeInfo.properties
      Object.keys(properties).forEach(name => {
        let info = properties[name]
        let required = false
        if(isTypeNodePrimitive(info) || isTypeNodeArray(info)){
          required = info.required === undefined ? true : info.required
          let schema:SwaggerParameter['schema']  = isTypeNodeArray(info)? {items:{ type: info.type }} : {type: info.type}
          parameters.push({
            name: name,
            required: required,
            in: 'query',
            description: info.description,
            schema:schema
          })
        }
        // if(isTypeNodeObject(info)){
        //   if(!Array.isArray(typeNodeInfo.required)){
        //     required = true
        //   }
          
        // }
      })
    }
  }

  return parameters
}
export function convertTypeNodeInfoToSwaggerRequestBody(typeNodeInfo?:TypeNodeInfo){
  if(!typeNodeInfo){
    return
  }
  let requestBody:SwggerRequestBody = {
    required: true,
    content:{
      'application/json':{
        schema: typeNodeInfo
      }
    }
  }
  return requestBody
}
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
export function getSchemaName(name:string){
  return `#/components/schemas/${name}`
}