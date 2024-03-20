import path from "path";
import { GenerateSwaggerConfig } from "../utils/config";
import { SwaggerDoc } from "./createSwagger";
import fs from 'fs'



export function writeSwagger(config:GenerateSwaggerConfig,swagerDocs:SwaggerDoc){
  fs.mkdirSync(path.join(process.cwd(),config.outPut),{recursive:true})
  fs.writeFileSync(path.join(process.cwd(),config.outPut,config.swaggerName), JSON.stringify(swagerDocs,null,2))
}