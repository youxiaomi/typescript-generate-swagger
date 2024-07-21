import path from "path";
import { SwaggerDoc, SwaggerGenerateConfig } from "../../share";
import fs from 'fs'


export function writeSwagger(config:SwaggerGenerateConfig,swagerDocs:SwaggerDoc){
  let swaggerDocPath = path.join(config.outPut,config.outFile)
  // let swaggerDocPath = path.join(docPath, config.outFile )
  // fs.mkdirSync(swaggerDocPath,{recursive:true})
  fs.writeFileSync(swaggerDocPath, JSON.stringify(swagerDocs,null,2))
}
