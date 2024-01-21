import * as ts from 'typescript'
import * as fs from 'fs'
import { createTsPrograme } from './parser/createTsPrograme'
import { createTsChecker } from './parser/createTsCheker';
import { parserController } from './parseController/parserController';
import { ParserTypeInfo } from './parser/parserTypeNode';


//  doc  tspr  extractType

function run(options:{
  basePath: string,

}){
  // // /Users/squid/study/bff-payment
  // const configPath = ts.findConfigFile('Users/squid/study/bff-payment', ts.sys.fileExists, 'tsconfig.json');
  // // const readConfigFile = ts.readConfigFile('Users/squid/study/bff-payment/tsconfig.json', ts.sys.readFile);
  // const readConfigFile = ts.readConfigFile('/Users/squid/study/bff-payment/tsconfig.json', ts.sys.readFile);
  // const parsedConfig = ts.parseJsonConfigFileContent(readConfigFile.config, ts.sys, './');
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