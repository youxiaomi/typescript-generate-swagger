import { createTsPrograme } from '@swagger-generate/ast-parser'
import { createTsChecker } from '@swagger-generate/ast-parser';
import { parserController } from './parserController';
import { ParserTypeInfo } from '@swagger-generate/ast-parser';
import { SwaggerGenerateConfig, getConfig, setConfig  } from '@swagger-generate/share'



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