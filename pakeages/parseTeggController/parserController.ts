
import * as ts from 'typescript'
import { ParserTypeInfo, getDocType, getCommentTags } from '../parser/parserTypeNode'
import {  HttpContent, HttpMethod, PathInfo, SwaggerParameter, SwaggerTypes, TypeNodeInfo, TypeNodeObject, TypeNodePrimitive, convertTypeNodeInfoToSwaggerRequestBody, convertTypeNodeInfoToSwaggerResponse, convertTypeNodeToSwggerParameters, createDoc } from '../generateDoc/createDoc'
import { getSymbolComment } from '../parser/utils/node'



function getHttpMethodModifyArg(modifiers:ts.NodeArray<ts.ModifierLike>){
  for (let modifier of modifiers) {
    if (ts.isDecorator(modifier)) {
      let { expression } = modifier
      if (!ts.isCallExpression(expression)) {
        continue
      }
      if (!ts.isIdentifier(expression.expression)) {
        continue
      }
      if (expression.expression.escapedText == 'HTTPMethod') {
        let arg = expression.arguments[0]
        if (ts.isObjectLiteralExpression(arg)) {
          return arg
        }
      }
    }
  }
}


function getPathMethod(modifiers:ts.NodeArray<ts.ModifierLike>){
  let http: HttpMethod = HttpMethod.GET
  let path = ''
  let arg = getHttpMethodModifyArg(modifiers)
  if(!arg){
    return
  }
  let { properties } = arg
  properties.forEach(propertie => {
    if (!ts.isPropertyAssignment(propertie)) {
      return
    }
    let { name, initializer } = propertie
    if (name.getText() == 'method') {
      if (ts.isPropertyAccessExpression(initializer)) {
        http = initializer.name.getText().toLowerCase() as HttpMethod
      }
    }
    if (name.getText() == 'path') {
      if (ts.isStringLiteral(initializer)) {
        // path = basePath + initializer.getText().slice(1, -1)
        path =  initializer.getText().slice(1, -1)
      }
    }
  })
  return {
    http, path
  }

}



function getControllerBasePath(modifiers){
  for(let modifier of modifiers){
    if (ts.isDecorator(modifier)) {
      let { expression, } = modifier
      if (ts.isCallExpression(expression)) {
        let name = expression.expression.getText()
        let arg = expression.arguments[0]
        if (name == 'HTTPController') {
          let basePath = ''
          if (ts.isObjectLiteralExpression(arg)) {
            for(let property of arg.properties){
              if (ts.isPropertyAssignment(property)) {
                let { name, initializer } = property
                if (name.getText() == 'path') {
                  if (ts.isStringLiteral(initializer)) {
                    basePath = initializer.getText().slice(1, -1)
                    return basePath
                  }
                }
              }
            }
          }

        }
      }
    }
  }
}





function getParameterDecoratorModifers (modifiers?:ts.NodeArray<ts.ModifierLike>){
  if(!modifiers){
    return []
  }
  return modifiers.filter(modifier => modifier.kind == ts.SyntaxKind.Decorator)
}


function isHttpQuery(modifiers:ts.ModifierLike[]){
  return modifiers.find(modifier => {
    return modifier.getText() == '@HTTPQuery()'
  })
}
function isHttpBody(modifiers:ts.ModifierLike[]){
  return modifiers.find(modifier => {
    return modifier.getText() == '@HTTPBody()'
  })
}




function processClassMemberQueryParameters(parameters:ts.NodeArray<ts.ParameterDeclaration>){
  let typeNodeInfoQuery: TypeNodeObject = {
    type: SwaggerTypes.object,
    properties: {},
  }
  parameters.forEach(parameter => {
    let { type, questionToken, name, modifiers } = parameter
    console.log(name.getText())
    let modiferDecorators = getParameterDecoratorModifers(modifiers)
    if (isHttpQuery(modiferDecorators)) {
      let {name,typeNodeInfo} = processQuery(parameter)
      typeNodeInfoQuery.properties[name] = typeNodeInfo
    }
  })
  function processQuery(parameter:ts.ParameterDeclaration) {
    let { type, questionToken, name, modifiers } = parameter
    let typeText = getDocType(type)
    let description = getSymbolComment(parameter)
    let nameText = name.getText()
    let required = !questionToken
    let typeNodeInfo: TypeNodePrimitive = {
      type: typeText,
      description: description,
    }
    if (required) {
      typeNodeInfo.required = required
    }
    return {
      name: nameText, typeNodeInfo,
    }
  }
  return typeNodeInfoQuery
}


function findCtxQueryType(BodyBlock: ts.Block){
  let statements = BodyBlock.statements
  for(let statement of statements){
    if (!ts.isVariableStatement(statement)) {
      continue 
    }
    let declarations = statement.declarationList.declarations
    for(let declaration of declarations){
       let { initializer, name } = declaration
      if (!initializer) {
        continue
      }
      function getCtxQueryPropertyAccessExpression(initExpression:ts.Expression){
        if(ts.isAsExpression(initExpression)){
          let { expression } = initExpression
          return getCtxQueryPropertyAccessExpression(expression)
        }
        if(ts.isPropertyAccessExpression(initExpression)){
          let { name } = initExpression
          let nameText = name.getText()
          if (nameText == 'query') {
            let nextExpress = initExpression.expression
            if (ts.isIdentifier(nextExpress)) {
              let nextName = nextExpress.getText()
              if (nextName == 'ctx') {
                return initExpression
              }
            }
          }
        }
      }
      let hasCtxQuery = getCtxQueryPropertyAccessExpression(initializer)
      if(hasCtxQuery){
        return initializer
      }
      // if (ts.isAsExpression(initializer)) {
      //   let { expression } = initializer
      //   if (ts.isPropertyAccessExpression(expression)) {
      //     let { name } = expression
      //     let nameText = name.getText()
      //     if (nameText == 'query') {
      //       let nextExpress = expression.expression
      //       if (ts.isIdentifier(nextExpress)) {
      //         let nextName = nextExpress.getText()
      //         if (nextName == 'ctx') {
      //           return initializer
      //         }
      //       }
      //     }
      //   }
      // }
    }
  }
 

}





export function getControllerFiles (programe:ts.Program){
  let files = programe.getSourceFiles();
  return files.filter(file=>{
    return file.fileName.match(new RegExp(`/app/module/.*controller`))
  })
}



export const parserController = (parserTypeInfo:ParserTypeInfo)=>{
  let programe = parserTypeInfo.programe
  let checker = parserTypeInfo.checker
  let controllers = getControllerFiles(programe)
  let pathInfo:PathInfo = {}
  controllers.forEach(controller => {
    let controllerInfo = new ParserControllerInfo(checker,parserTypeInfo,programe)
    let currentPathInfo  = controllerInfo.getControllerInfo(controller)

    // let currentPathInfo = processController(checker, controller)
    pathInfo = {
      ...pathInfo,
      ...currentPathInfo,
    }
    // datas = {
    //   ...datas,
    //   ...data
    // }
    console.log(controller.fileName)
  })
  let schemas = parserTypeInfo.getSchemaTypeInfo()
  createDoc(pathInfo,schemas)
}


class ParserControllerInfo{
  constructor(readonly checker:ts.TypeChecker, readonly parserTypeInfo:ParserTypeInfo,  readonly programe:ts.Program){

  }
  getControllerInfo(controller:ts.SourceFile){
    let checker =  this.checker 
    let pathInfo:PathInfo = {
  
    }
    for(let statement of controller.statements){
      if (ts.isClassDeclaration(statement)) {
        let { members, modifiers = [] } = statement
        let basePath = getControllerBasePath(modifiers)
        if(basePath === undefined){
          continue
        }
        let currentPathInfo = this.getControllerPath(members,basePath)
        pathInfo = {
          ...pathInfo,
          ...currentPathInfo
        }
      }
    }
    return pathInfo
  }
  getControllerPath( members:ts.NodeArray<ts.ClassElement>,basePath?:string){
    let checker =  this.checker 
    let pathInfo: PathInfo = {
  
    }
    for(let member of members){
      if (ts.isMethodDeclaration(member)) {
        // if(member.name.getText() != 'splitBillList'){
        //   continue
        // }
        let response = this.parserTypeInfo.getReturnType(checker, member) 
        let currentPathInfo = this.processPathInfo(checker, member, response, basePath)
        if(currentPathInfo){
          let fullPath = basePath + currentPathInfo.path
          let { path,http,httpContent} = currentPathInfo
          let currentPath = pathInfo[fullPath] = pathInfo[fullPath] || {}
          currentPath[http] = httpContent;
        }
      }
    }
  
    return pathInfo
  }
  processPathInfo(checker: ts.TypeChecker, member: ts.MethodDeclaration, response?: TypeNodeInfo, basePath: string = '') {
    let { modifiers  } = member
    let pathInfo: PathInfo = {
  
    }
    console.log(HttpMethod)
    if(!modifiers){
      return
    }
    let pathMethod = getPathMethod(modifiers)
    if(!pathMethod){
      return
    }
    let { http,path } = pathMethod
    let {parameters,requestBody} = this.processClassMemberParameters(checker, member)
  
    let currentPathInfo: HttpContent = {}
    if (parameters.length) {
      currentPathInfo.parameters = parameters
    }
    if (http != HttpMethod.GET && requestBody) {
      currentPathInfo.requestBody = requestBody
    }
    if (response) {
      currentPathInfo.responses = convertTypeNodeInfoToSwaggerResponse(response)
    }
    // let file = getFile(member.getSourceFile().fileName)
    
    let { summary, description } = getCommentTags(member)
    // fs.writeFileSync(`${__dirname}/teggController.ts`, file.text)
    return {
      path,
      http: http,
      httpContent:{
        summary,
        description,
        ...currentPathInfo,
      }
    }
  }
  processClassMemberParameters(checker: ts.TypeChecker, member: ts.MethodDeclaration) {
    let { parameters, body } = member
    let swaggerParameters: SwaggerParameter[] = []
    let queryParamentersTypeNodeInfo = processClassMemberQueryParameters(parameters)
    swaggerParameters = convertTypeNodeToSwggerParameters(queryParamentersTypeNodeInfo)
    if(body){
      let queryInFunctionBody = this.processClassMemberQueryInFunctionBody(checker,body)
      if(queryInFunctionBody){
        swaggerParameters = swaggerParameters.concat(convertTypeNodeToSwggerParameters(queryInFunctionBody))
      }
    }
    let  requestBody = this.processClassMemberBodyParameters(checker, member)
  
    let  swaggerRequestBody = convertTypeNodeInfoToSwaggerRequestBody(requestBody)
  
    return {
      parameters: swaggerParameters,
      requestBody: swaggerRequestBody
    }
  } 
  processClassMemberQueryInFunctionBody(checker:ts.TypeChecker,BodyBlock: ts.Block){
    let expression = findCtxQueryType(BodyBlock)
    if(!expression){
      return
    }
    let type = checker.getTypeAtLocation(expression)
    let symbolNode = type.getSymbol()
    if (symbolNode) {
      return this.parserTypeInfo.getTypeNode( type,{cacheSchema:false})
    }
  
  
  }
  processClassMemberBodyParameters(checker: ts.TypeChecker, member: ts.MethodDeclaration){
    let { parameters, body } = member
    for(let parameter of parameters){
      let { type, questionToken, name, modifiers } = parameter
      let modiferDecorators = getParameterDecoratorModifers(modifiers)
      let isBody = isHttpBody(modiferDecorators)
      if (isBody && type) {
        let typeObject = checker.getTypeAtLocation(type)
        let response = this.parserTypeInfo.getTypeNode( typeObject)
        return response
      }
    }
  }
}