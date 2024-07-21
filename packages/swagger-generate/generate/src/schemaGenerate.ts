import { SwaggerDoc, SwaggerTypes, TypeNodeInfo } from "../../share"



export function convertSchema(responses:TypeNodeInfo){
  if ('type' in responses) {
    if(responses.type == SwaggerTypes.object){
      let properties = responses.properties
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
    let allOf = responses.allOf?.map(item => {
      return convertSchema(item)
    })
    responses.allOf = allOf
  }
  return responses
}


export function generateSchemas(swagerDoc: SwaggerDoc,schemas:Map<string,TypeNodeInfo>) {
  Array.from(schemas.keys()).forEach(name => {
    let currentTypeInfo = schemas.get(name)
    swagerDoc.components = swagerDoc.components || { schemas:{}}
    if(currentTypeInfo){
      swagerDoc.components.schemas[name] = convertSchema(currentTypeInfo) //  
    }
  })
  return swagerDoc
}