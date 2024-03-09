// Ts swagger
import * as ts from "typescript";
import * as fs from "fs";

interface DocEntry {
  name?: string;
  fileName?: string;
  documentation?: string;
  type?: string;
  constructors?: DocEntry[];
  parameters?: DocEntry[];
  returnType?: string;
}

/** Generate documentation for all classes in a set of .ts files */
function generateDocumentation(
  fileNames: string[],
  options: ts.CompilerOptions
): void {
  // Build a program using the set of root file names in fileNames
  let program = ts.createProgram(fileNames, options);

  // Get the checker, we will use it to find more about classes
  let checker = program.getTypeChecker();
  let output: DocEntry[] = [];
  const docs = {}
  const convertTypeToDoc = (symbol:ts.Symbol)=>{
    let recursivePorps = (symbol: ts.Symbol,docDataProps) => {
      let escapedName = symbol.escapedName.toString()
      docDataProps[escapedName] = docDataProps[escapedName] || {}
      let currentDoc = docDataProps[escapedName]
      let currentType = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
      // if(currentType.intrinsicName as any){

      // }
      let props = currentType.getProperties()
      let typeNode = checker.typeToTypeNode(currentType,undefined,undefined);
      console.log(ts);
      
      let typeString = checker.typeToString(currentType)
      console.log(typeString);
      // let isKeyWord = ts.isKeword(typeNode?.kind)
      let isKeyWord = true
      if (isKeyWord) {
        currentDoc.type = typeString
        return
      }
      if(typeNode && ts.isLiteralTypeNode(typeNode)){
        if(ts.isBigIntLiteral(typeNode.literal)){
          currentDoc.type = typeNode.literal.text
        }
      }
      for (let m in props) {
        recursivePorps(props[m],currentDoc)
      }
      // docs[escapedName] = currentDoc
    }
    recursivePorps(symbol,docs)
    console.log(docs,'------');
    
  }

  const extractArguments = (args:ts.CallExpression['arguments'])=>{
    console.log(checker);
    
    console.log(args);
    if(ts.isStringLiteral(args[0]) && args.length == 2){
      let path = args[0].getText()
      let symbol = checker.getSymbolAtLocation(args[1]);
      let declartions = symbol?.getDeclarations() || []
      declartions.forEach((declartion:any) => {
        console.log(declartion);
        let locals = declartion.locals
        let query = locals.get("query");
        let ctx = locals.get('ctx')
        let types = checker.getTypeOfSymbolAtLocation(declartion.locals.get('ctx'),declartion.locals.get('ctx').valueDeclaration)
        let bodyType = types.getProperty('body')
        if(bodyType){
          convertTypeToDoc(bodyType)
        }

        console.log(types);
        // let body = types.mermbers.get('body')
        
      })
    }
  }

  // console.log(program.getSourceFiles().map(item => item.fileName));
  // return/
  // Visit every sourceFile in the program
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      // Walk the tree to search for classes
      if(sourceFile.fileName == 'app/router.ts'){
        ts.forEachChild(sourceFile, visit);
      }
    }
  }

  // print out the doc
  // fs.writeFileSync("classes.json", JSON.stringify(output, undefined, 4));


  

  /** visit nodes finding exported classes */
  function visit(node:ts.Node) {
    // Only consider exported nodes
    console.log(ts.SyntaxKind[node.kind],node.getFullText());
    const each = (node:ts.Node)=>{
      console.log(ts.SyntaxKind[node.kind],node.getFullText());
      let children = node.getChildren();
      children.forEach(child=>{
        console.log(ts.SyntaxKind[child.kind],child.getFullText());
        if(ts.isArrowFunction(child)){
          each(child.body)
        }
        // if(ts.isSyntaxList(child) as any){
        //   each(child)
        // }
        if(ts.isExpressionStatement(child)){
          each(child)
        }
        if(ts.isCallExpression(child)){
          if(child.getChildren()[0] &&child.getChildren()[0].getText() == 'router.get' ){
            // child.arguments.forEach(each)
            extractArguments(child.arguments)
            return 
          }
          each(child)
        }
      })
    }
    each(node)
    

    return
  }
  //   if(ts.isImportDeclaration(node)){
  //     return
  //   }
  //   if (ts.isClassDeclaration(node) && node.name) {
  //     // This is a top level class, get its symbol
  //     let symbol = checker.getSymbolAtLocation(node.name);
  //     if (symbol) {
  //       output.push(serializeClass(symbol));
  //     }
  //     // No need to walk any further, class expressions/inner declarations
  //     // cannot be exported
  //   } else if (ts.isModuleDeclaration(node)) {
  //     // This is a namespace, visit its children
  //     ts.forEachChild(node, visit);
  //   }
  // }

  /** Serialize a symbol into a json object */
  // function serializeSymbol(symbol: ts.Symbol): DocEntry {
  //   return {
  //     name: symbol.getName(),
  //     documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
  //     type: checker.typeToString(
  //       checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
  //     )
  //   };
  // }

  // /** Serialize a class symbol information */
  // function serializeClass(symbol: ts.Symbol) {
  //   let details = serializeSymbol(symbol);

  //   // Get the construct signatures
  //   let constructorType = checker.getTypeOfSymbolAtLocation(
  //     symbol,
  //     symbol.valueDeclaration!
  //   );
  //   details.constructors = constructorType
  //     .getConstructSignatures()
  //     .map(serializeSignature);
  //   return details;
  // }

  // /** Serialize a signature (call or construct) */
  // function serializeSignature(signature: ts.Signature) {
  //   return {
  //     parameters: signature.parameters.map(serializeSymbol),
  //     returnType: checker.typeToString(signature.getReturnType()),
  //     documentation: ts.displayPartsToString(signature.getDocumentationComment(checker))
  //   };
  // }

  // /** True if this is visible outside this file, false otherwise */
  // function isNodeExported(node: ts.Node): boolean {
  //   return (
  //     (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
  //     (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  //   );
  // }
}

generateDocumentation([
  './app/router.ts',
  './typings/app/controller/index.d.ts',
  './typings/app/service/index.d.ts',
], 
{
  // target: ts.ScriptTarget.ES5,
  // module: ts.ModuleKind.CommonJS,
  typeRoots:[
    './typings',
    // './typings/app/controller'
  ],
  
  noEmitOnError: false,
});
