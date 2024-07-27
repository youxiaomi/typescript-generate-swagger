import { createTsPrograme } from '../ast-parser/src/createTsPrograme'
import { createTsChecker } from '../ast-parser/src/createTsCheker'
import { ParserTypeInfo } from '../ast-parser/src/parserTypeNode'
import path from 'path'
import ts1 from 'typescript'
const ts = ts1

let programe = createTsPrograme({
  basePath: path.join(__dirname,'testProject')
})
let checker = createTsChecker(programe);
const parserTypeNode = new ParserTypeInfo(checker,programe);
let testFile = programe.getSourceFiles().filter(item => item.fileName.match('testProject/type.ts'))[0]
console.log(testFile)
testFile.statements.forEach((statement,index) => {
  ts
  console.log(index,'index')
  console.log(statement.getFullText())
  let typeObject = checker.getTypeAtLocation(statement)
  let typeNode = checker.typeToTypeNode(typeObject,undefined,undefined)
  let tsSymbol = typeObject.getSymbol()
  let resString = checker.typeToString(typeObject)
  let res = parserTypeNode.getAllTypeNode(typeObject,tsSymbol)
  typeObject.getProperties()
  
  console.log(JSON.stringify(res,null,2))
})
