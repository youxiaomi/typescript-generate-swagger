import path from "path";
import { GenerateSwaggerConfig } from "../shared/config";
import { SwaggerDoc } from "./generateSwagger";
import fs from 'fs'



export function writeSwagger(config:GenerateSwaggerConfig,swagerDocs:SwaggerDoc){
  fs.mkdirSync(path.join(process.cwd(),config.outPut),{recursive:true})
  fs.writeFileSync(path.join(process.cwd(),config.outPut,config.swaggerName), JSON.stringify(swagerDocs,null,2))
}