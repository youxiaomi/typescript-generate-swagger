import { SwaggerParameter, SwaggerParamsPostion, SwaggerTypes, SwggerRequestBody, TypeNodeArray, TypeNodeInfo, TypeNodeObject, TypeNodePrimitive } from "./createSwagger"


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
            in: SwaggerParamsPostion.query,
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