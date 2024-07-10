




export interface SwaggerPaths {
  [path: string]: {
    [x in keyof HttpMethod]?: {
      "tags"?: string[],
      "summary"?: string,
      "description"?: string,
      "operationId"?: string,
      "security"?: {
        "petstore_auth": string[]
      }[]
      "parameters"?: SwaggerParameter[],
      "requestBody"?: SwggerRequestBody,
      "responses"?: SwaggerResponse
    }
  }
}
export interface SwaggerDoc {
  "openapi"?:  string 
  "info"?: {
    "title"?: string 
    "description"?: string  ,
    "termsOfService"?: string
    "contact"?: {
      "email": string 
    },
    "version"?:  string 
    "license"?: {
      "name":  string 
      "url":  string 
    },
  },
  "externalDocs"?: {
    "description"?:  string 
    "url":  string
  },
  "tags"?: {
    "name": string 
    "description"?: string ,
    "externalDocs"?: {
      "description"?: string 
      "url"?: string 
    }
  }[]
  "servers"?: {
    "url": string  
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