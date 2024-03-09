import { createTsPrograme } from './parser/createTsPrograme'
import { createTsChecker } from './parser/createTsCheker';
import { parserController } from './parseController/parserController';
import { ParserTypeInfo } from './parser/parserTypeNode';



function run(options:{
  basePath: string,

}){
  let programe = createTsPrograme({basePath: options.basePath});
  if(!programe){
    console.error('createTsPrograme error')
    return
  }
  // let files = programe.getRootFileNames()
  let checker = createTsChecker(programe);
  const parserTypeNode = new ParserTypeInfo(checker,programe)
  parserController(parserTypeNode)
  
}


run({basePath: '/Users/squid/study/bff-payment'})