import { createTsPrograme } from './parser/createTsPrograme'
import { createTsChecker } from './parser/createTsCheker';
import { parserController } from './parseTeggController/parserController';
import { ParserTypeInfo } from './parser/parserTypeNode';



function run(options:{
  basePath: string,
}){
  let programe = createTsPrograme({basePath: options.basePath});
  if(!programe){
    throw new Error('createTsPrograme error')
  }
  let checker = createTsChecker(programe);
  const parserTypeNode = new ParserTypeInfo(checker,programe)
  parserController(parserTypeNode)
}


run({basePath: '/Users/squid/study/bff-payment'})
