import { createTsPrograme } from '@typescript-generate-swagger/swagger-generate'
import { createTsChecker } from '@typescript-generate-swagger/swagger-generate';
import { parserController } from './parserController';
import { ParserTypeInfo } from '@typescript-generate-swagger/swagger-generate';
import { SwaggerGenerateConfig, getConfig, setConfig  } from '@typescript-generate-swagger/swagger-generate'



export function swaggerTegg(userConfig:SwaggerGenerateConfig){
  let config = setConfig(userConfig)
  let programe = createTsPrograme({basePath: config.projectDir});
  if(!programe){
    throw new Error('createTsPrograme error')
  }
  let checker = createTsChecker(programe);
  const parserTypeNode = new ParserTypeInfo(checker,programe)
  parserController(parserTypeNode)
}