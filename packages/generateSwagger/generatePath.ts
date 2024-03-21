import { PathInfo, SwaggerDoc, SwaggerResponse } from "./generateSwagger"
import { convertSchema } from "./generateSchemas"

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
}

export function generatePath(swagerDocs:SwaggerDoc,pathInfos:PathInfo){
  Object.keys(pathInfos).forEach(path => {
    let pathInfo = pathInfos[path]
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

  return swagerDocs
}