// import * as ts from '/Users/squid/study/TypeScript-main/built/local/typescript'
import * as ts from 'typescript'
import * as fs from 'fs'

const files: { [fileName: string]: VirtualFile } = {

}
function setFile(controller) {
  let fileName = controller.fileName
  let virtualfile = new VirtualFile(controller.getFullText(), fileName)
  files[fileName] = virtualfile
}
function getFile(name) {
  return files[name]
}

class VirtualFile {
  constructor(public text: string, public fileName: string) {

  }
  offset = 0
  replace(start: number, end: number, text: string) {
    this.text = this.text.slice(0, start + this.offset) + text + this.text.slice(end + this.offset)
    this.offset += text.length - (end - start)
  }


}
interface SwaggerDoc {
  "openapi": "3.0.3",
  "info": {
    "title": string //  "Swagger Petstore - OpenAPI 3.0",
    "description": string,
    "termsOfService": "http://swagger.io/terms/",
    "contact": {
      "email": "apiteam@swagger.io"
    },
    "version": "1.0.11"
  },

  "servers"?: [
    {
      "url": string  // "https://petstore3.swagger.io/api/v3"
    }
  ],
  paths: SwaggerPaths,
  components?: {
    schemas: {
      [x: string]: SwaggerSchema
    }
  }

}


enum HttpMethod {
  "GET" = 'get',
  "POST" = 'post',
  "PUT" = 'put',
  "DELETE" = 'delete',
  "PATCH" = 'patch',
  "OPTIONS" = 'options',
  "HEAD" = 'head',
}
enum SwaggerTypes {
  "string" = 'string',
  "number" = 'number',
  "boolean" = 'boolean',
  "object" = 'object',
  "array" = 'array',
  "enum" = 'enum',
}
enum SwaggerParamsPostion {
  path = 'path',
  query = 'query',
}
interface SwaggerSchemaObject {
  "type": SwaggerTypes.object,
  required?: string[]
  "properties": {
    [key: string]: Omit<ExtractTypeNode, 'required'>
  }
}
interface SwaggerSchemaArray {
  "type": SwaggerTypes.array,
  items: SwaggerSchema
}

type SwaggerSchema = SwaggerSchemaObject | SwaggerSchemaArray

interface SwaggerPaths {
  [path: string]: {
    [http in HttpMethod]?: {
      "tags"?: string[],
      "summary"?: string,
      "description"?: string,
      "operationId"?: string,
      "parameters": {
        "name": string,
        "in"?: "query",
        "description"?: string // "Status values that need to be considered for filter",
        "required"?: boolean,
        // "explode": true,
        "schema": {
          "type": "string",
          "default"?: string // "available",
          "enum"?: (string | number)[]
        }
      }[],
      "requestBody"?: {
        "description"?: string
        "content": {
          "application/json": {
            "schema": {
              "$ref": string // "#/components/schemas/Pet"
            } | SwaggerSchema
          },
        }
        "required": boolean
      },
      "responses"?: {
        [httpCode: string]: {
          "description"?: "Successful operation",
          "content"?: {
            "application/json": {
              "schema": {
                "$ref": string // "#/components/schemas/Pet"
              } | SwaggerSchema
            }
          }
        }
      }
    }
  }
}
interface HttpContent {
  parameters?: ExtractTypeNode,
  requestBody?: ExtractTypeNode,
  responses?: ExtractTypeNode,
  summary?: string,
  description?: string
}
interface PathInfo {
  [path: string]: {
    [http: string]: HttpContent
  }


}


//不需要深度递归的类型，替换成原始类型
const repalceTypes = {
  BigNumber: 'string',
  String: 'string',
  Number: 'number',
}


let allFiles: string[] = []
export function readFiles(root: string, parent?: string) {
  let files = fs.readdirSync(root);
  files.forEach(file => {
    let filePath = `${root}/${file}`
    // console.log(filePath);
    let stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      return readFiles(filePath, file)
    } else {
      if (parent == 'controller') {
        allFiles.push(filePath)
      }
    }
  })
  return allFiles
}


function run() {
  let base = '/Users/squid/study/bff-payment'
  // let base = '/Volumes/data/code/work_sync/bff-payment'
  let controllers = readFiles(`${base}/app/module`)
  // console.log(controllers)
  const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
  const readConfigFile = ts.readConfigFile(configPath!, ts.sys.readFile);

  let types: string[] = []

  function readTypes(root: string) {
    let files = fs.readdirSync(root);
    files.forEach(file => {
      let filePath = `${root}/${file}`
      // console.log(filePath);
      let stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        return readTypes(filePath)
      } else {
        types.push(filePath)
      }
    })
    // return allFiles
  }
  readTypes(`${base}/typings`)


  const parsedConfig = ts.parseJsonConfigFileContent(readConfigFile.config, ts.sys, './');
  let program = ts.createProgram([
    // `${base}/${}`
    ...controllers,

  ], {
    types: [
      // `${base}/typings/global.d.ts`,
      ...types,
    ],
    typeRoots: [
      `${base}/typings`,
      `${base}/typings/global.d.ts`,
      // './typings/app/controller'
    ],
    // noEmitOnError: true,
    // target: ts.ScriptTarget.ESNext,
    rootDir: base,
    baseUrl: base,
    "declaration": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/module/*": [base + "/app/module/*"]
    },
    "target": ts.ScriptTarget.ES2020,
    "module": ts.ModuleKind.CommonJS,
    "strict": true,
    // Warn on expressions and declarations with an implied 'any' type.
    // Many npm pack do not has own definition, so not enable
    "noImplicitAny": false,
    // Emit '__importStar' and '__importDefault' helpers for runtime babel ecosystem compatibility
    // and enable '--allowSyntheticDefaultImports' for typesystem compatibility.
    // Convenient for import assert from 'assert'
    "esModuleInterop": true,
    // Allow javascript files to be compiled.
    // Egg compile to in place, will throw can not overwrite js file
    "allowJs": false,
    "pretty": true,
    "noEmitOnError": false,
    // "noUnusedLocals": true,
    // "noUnusedParameters": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    // Ensure non-undefined class properties are initialized in the constructor.
    // When use DI, properties will be implicitly init
    "strictPropertyInitialization": false,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "inlineSourceMap": true,
    // "declaration": true,
    "resolveJsonModule": true,
    // Enables experimental support for ES7 decorators.
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useUnknownInCatchVariables": true,
    "incremental": false
    // ...parsedConfig.options
  });
  // console.log(program)
  // program.emit()
  let checker = program.getTypeChecker();
  let semanticDiagnostics = program.getSemanticDiagnostics()
  if (semanticDiagnostics.length) {
    semanticDiagnostics.forEach(diagnostic => {
      console.error(diagnostic.messageText)
    })
    return
  }
  let bb = program.getSyntacticDiagnostics()
  let dd = program.getDeclarationDiagnostics()
  let _controllers = program.getSourceFiles().filter(item => item.fileName.match(new RegExp(`${base}/app/module/.*controller`)))
  // let _controllers = program.getSourceFiles().filter(item=>item.fileName.match('controller/settlement'))
  let datas: PathInfo = {}
  _controllers.forEach(controller => {
    let data = processController(checker, controller)
    datas = {
      ...datas,
      ...data
    }
    console.log(controller.fileName)
  })
  fs.writeFileSync(`${__dirname}/swagger.json`, JSON.stringify(datas))
  const swagerDocs: SwaggerDoc = {
    "openapi": "3.0.3",
    "info": {
      "title": '接口', //  "Swagger Petstore - OpenAPI 3.0",
      "description": "结算接口",
      "termsOfService": "http://swagger.io/terms/",
      "contact": {
        "email": "apiteam@swagger.io"
      },
      "version": "1.0.11"
    },
    paths: {

    }
  }
  Object.keys(datas).forEach(path => {
    let pathInfo = datas[path]
    Object.keys(pathInfo).forEach((http) => {
      let httpInfo = pathInfo[http]
      if (!httpInfo) {
        return
      }
      let { parameters = {}, requestBody, responses, summary, description } = httpInfo
      let pathData = swagerDocs.paths[path] = swagerDocs.paths[path] || {}
      let httpData = pathData[http] = pathData[http] || {}
      httpData.summary = summary
      httpData.description = description
      if (parameters) {
        httpData.parameters = Object.keys(parameters.properties! || {}).map(name => {
          let { type, description, required } = parameters.properties![name]
          return {
            name,
            in: SwaggerParamsPostion.query,
            description,
            required,
            schema: {
              type,
            }
          }
        })
      }
      if (requestBody && Object.keys(requestBody).length) {
        httpData.requestBody = {
          content: {
            "application/json": {
              schema: convertResponse(requestBody)
            }
          },
          description: requestBody.description || '请求体'
        }
      }
      if (responses) {
        httpData.responses = {
          200: {
            content: {
              "application/json": {
                schema: convertResponse(responses),
              },
            },
            description: responses.description || '响应体'
          }
        }
      }
    })
  })
  function convertResponse(responses: ExtractTypeNode) {
    if (responses.type == 'object') {
      let properties = responses.properties

      let propertiesRequired = convertResponse(properties!)
      let required = Object.keys(properties!).filter(name => {
        let currentRequiredVal = properties![name].required
        delete properties![name].required
        return currentRequiredVal === undefined || currentRequiredVal
      })
      if (propertiesRequired) {
        let swaggerResponse: SwaggerSchema = {
          type: responses.type,
          properties: propertiesRequired,
        }
        if (required.length) {
          swaggerResponse.required = required
        }
        return swaggerResponse
      }
    }
    if (responses.oneOf) {
      let oneOf = responses.oneOf.map(item => {
        return convertResponse(item)
      })
      return {
        ...responses,
        oneOf: oneOf
      }
    }

    return responses
  }
  fs.writeFileSync(`${__dirname}/swagger222.json`, JSON.stringify(swagerDocs))
}

run()



function processController(checker: ts.TypeChecker, controller) {
  let data: PathInfo = {}
  let basePath = ''
  setFile(controller)
  controller.statements.forEach(statement => {
    if (ts.isClassDeclaration(statement)) {
      let { members, modifiers = [] } = statement
      modifiers.forEach(modifier => {
        if (ts.isDecorator(modifier)) {
          let { expression, } = modifier
          if (ts.isCallExpression(expression)) {
            let name = expression.expression.getText()
            let args = expression.arguments[0]
            if (name == 'HTTPController') {
              if (ts.isObjectLiteralExpression(args)) {
                args.properties.forEach(property => {
                  if (ts.isPropertyAssignment(property)) {
                    let { name, initializer } = property
                    if (name.getText() == 'path') {
                      if (ts.isStringLiteral(initializer)) {
                        basePath = initializer.getText().slice(1, -1)
                      }
                    }
                  }
                })
              }
            }
          }
        }
      })

      members.forEach(member => {
        if (ts.isMethodDeclaration(member)) {


          let response = getReturnType(checker, member)
          let pathInfo = processPathInfo(checker, member, response, basePath)

          data = {
            ...data,
            ...pathInfo,
          }
          // data[pathInfo.path] = pathInfo
          // console.log(pathInfo)
        }
      })
    }
  })
  return data
}


function findNodeAtPosition(node: ts.Node, position: number): ts.Node | undefined {
  if (position >= node.pos && position < node.end) {
    let result: ts.Node | undefined;
    let children = node.getChildren()

    children.forEach(child => {
      const foundChild = findNodeAtPosition(child, position);
      if (foundChild) {
        result = foundChild;
      }
    });

    return result || node;
  }

  return undefined;
}


type ExtractTypeNode = {
  type?: SwaggerTypes,
  properties?: ExtractTypeObj,
  items?: ExtractTypeNode,
  description?: string
  required?: boolean
  oneOf?: ExtractTypeNode[],
  enum?: (string | number)[]
}
type ExtractTypeObj = {
  [x: string]: ExtractTypeNode
}


function getReturnType(checker: ts.TypeChecker, node: ts.MethodDeclaration) {
  let signature = checker.getSignatureFromDeclaration(node)
  if (!signature) {
    return
  }
  let returnType = signature.getReturnType()
  const isAsync = (node.modifiers || []).some(modifier => modifier.kind === ts.SyntaxKind.AsyncKeyword);
  returnType = isAsync ? checker.getTypeArguments(returnType! as ts.TypeReference)[0] : returnType;
  let returnTypeNode = checker.typeToTypeNode(returnType, undefined, undefined)
  if (!returnTypeNode) {
    return
  }
  let res = getTypeNode(checker, returnType, returnType.getSymbol()!)
  console.log(JSON.stringify(res))
  return res
}

function getTypeNode(checker, typeObject: ts.Type, symbolObject: ts.Symbol) {
  let visiteObjs = new Set()
  return getAllTypeNode(typeObject, symbolObject)
  function getAllTypeNode(currentType: ts.Type, currentSymbol?: ts.Symbol): ExtractTypeNode | undefined {

    let typeNode = checker.typeToTypeNode(currentType, undefined, undefined)
    let typeString = checker.typeToString(currentType)
    console.log(typeString, currentSymbol)
    if (!typeNode) {
      return
    }
    function isObjectType(node: ts.Type): node is ts.ObjectType {
      return !!(node.flags & ts.TypeFlags.Object);
    }
    console.log("typeNode", ts.SyntaxKind[typeNode.kind], ts.TypeFlags[currentType.flags])
    if (repalceTypes[typeString]) {
      return {
        type: repalceTypes[typeString],
        description: getNodeComment(currentSymbol),
      }
    }
    if (isObjectType(currentType)) {
      console.log('objectFlags', ts.TypeFlags[currentType.objectFlags])
      if (ts.isArrayTypeNode(typeNode!)) {
        let arrayEle = checker.getTypeArguments(currentType as ts.TypeReference)[0]
        if (!arrayEle) {
          return
        }
        return {
          type: SwaggerTypes.array,
          items: getAllTypeNode(arrayEle, arrayEle.getSymbol()!),
        }
      }
      let dataObject: ExtractTypeObj = {}
      currentType.getProperties().map((symbolNode) => {


        // let currentType = checker.getTypeOfSymbol(symbolNode)
        // let name = symbolNode.getName()
        let currentType = checker.getTypeOfSymbol(symbolNode)
        let name = symbolNode.getName()
        if (visiteObjs.has(symbolNode)) {
          let typeName = ''
          symbolNode.getDeclarations()?.forEach(declaration => {
            if (ts.isPropertySignature(declaration)) {
              let { type } = declaration
              if (type) {
                if (ts.isTypeReferenceNode(type)) {
                  typeName = type.typeName.getText()
                }
              }
            }
          })
          dataObject[name] = {
            type: SwaggerTypes.string,
            description: `<${typeName}>  ` + getNodeComment(symbolNode),
          }
          return
        }
        visiteObjs.add(symbolNode)
        let currentData = getAllTypeNode(currentType, symbolNode)
        visiteObjs.delete(symbolNode)
        let description = getNodeComment(symbolNode)
        if (currentData) {
          currentData.description = currentData.description || description
          dataObject[name] = currentData
        }

        // if(currentData){
        //   if(data[name]){
        //     data[name]  = {
        //       ...data[name],
        //       ...currentData
        //     }
        //   }else{
        //     data[name] = currentData
        //   }
        // }
      })
      return {
        type: SwaggerTypes.object,
        properties: dataObject,
      }
    }
    if (currentType.isUnion()) {
      let types = currentType.types
      let currentDocs: ExtractTypeNode = {
      }
      let undefinedTypeIndex = types.findIndex(type => {
        let typeNode = checker.typeToTypeNode(type)
        return typeNode.kind == ts.SyntaxKind.UndefinedKeyword
      })
      let _types = [...types]
      if (undefinedTypeIndex > -1) {
        let undefinedType = _types.splice(undefinedTypeIndex, 1)[0];
        currentDocs.required = false
      }
      let enums = _types.filter(type => type.flags & ts.TypeFlags.EnumLiteral)
      _types = _types.filter(type => !(type.flags & ts.TypeFlags.EnumLiteral))
      if (_types.length == 1) {
        let type = _types[0]
        let description = getNodeComment(type.getSymbol())
        let res = getAllTypeNode(type, type.getSymbol())
        if (res) {
          currentDocs = {
            ...currentDocs,
            ...res,
            description,
          }
        }
        return currentDocs
      }
      let description = getNodeComment(currentSymbol)
      if (_types.length) {
        currentDocs.oneOf = []
        _types.forEach((type) => {
          let docData = getAllTypeNode(type, type.getSymbol())
          if (docData) {
            currentDocs.oneOf!.push(docData)
            // description += getNodeComment(type.getSymbol())
          }
        })
        currentDocs.oneOf.sort((pre, next) => {
          let preLength = Object.keys(pre.properties || {}).length
          let nextLegnth = Object.keys(next.properties || {}).length
          return nextLegnth - preLength
        })
      }
      if (enums.length) {
        currentDocs.enum = []
        let enumType: ExtractTypeNode['type'] = SwaggerTypes.string
        enums.forEach((type) => {
          let value = (type as any).value
          currentDocs.enum?.push(value)
          let desc = getNodeComment(type.getSymbol() || currentSymbol)
          if (typeof value == 'number') {
            enumType = SwaggerTypes.number
          }
          if (desc) {
            description += ` ${value}:${desc},`
          }
        })
        currentDocs.type = enumType
      }
      currentDocs.description = description
      return currentDocs
    }

    if (currentType.isNumberLiteral()) {
      let { value } = currentType
      return {
        type: SwaggerTypes.number,
        description: value.toString(),
      }
    }
    if (currentType.isStringLiteral()) {
      let { value } = currentType
      return {
        type: SwaggerTypes.string,
        description: value.toString(),
      }
    }
    let type = getDocType(typeNode)

    if (type) {
      let comment = ''
      if (type == 'undefined') {
        return {
          type: SwaggerTypes.string,
          // value: checker.typeToString(currentType),
          description: comment,
        }
      }
      if (!currentSymbol) {
        return {
          type: type,
          // value: checker.typeToString(currentType),
          description: comment,
        }
      }

      comment = getNodeComment(currentSymbol)
      return {
        type: type,
        // value: checker.typeToString(currentType),
        description: comment,
      }
    }
    return {}
  }
}
function isFristBreakLine(fullText: string) {
  let texts = fullText.split('')
  let firstBreakline = false
  for (let m of texts) {
    if (m == ' ') {
      continue
    }
    if (m == '\n') {
      firstBreakline = true
      return
    }
    if (m == '/') {
      break
    }
  }
  return firstBreakline
}
function getDocType(typeNode: ts.TypeNode): ExtractTypeNode['type'] | "undefined" {
  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return SwaggerTypes.string
    case ts.SyntaxKind.NumberKeyword:
      return SwaggerTypes.number
    case ts.SyntaxKind.BooleanKeyword:
      return SwaggerTypes.boolean
    case ts.SyntaxKind.UndefinedKeyword:
      return 'undefined'
  }
}



function processPathInfo(checker: ts.TypeChecker, member: ts.MethodDeclaration, response?: ExtractTypeNode, basePath: string = '') {
  let { modifiers } = member
  let pathInfo: PathInfo = {
    // path: '', method: '',query:{},
    // body:{},
    // response:{}
  }
  let path = ''
  console.log(HttpMethod)
  let http: HttpMethod = HttpMethod.GET
  modifiers?.forEach(modifer => {
    if (ts.isDecorator(modifer)) {
      let { expression } = modifer
      if (!ts.isCallExpression(expression)) {
        return
      }
      let arg = expression.arguments[0]
      if (!ts.isIdentifier(expression.expression)) {
        return
      }
      if (expression.expression.escapedText != 'HTTPMethod') {
        return
      }
      if (ts.isObjectLiteralExpression(arg)) {
        let { properties } = arg
        properties.forEach(propertie => {
          if (!ts.isPropertyAssignment(propertie)) {
            return
          }
          let { name, initializer } = propertie
          if (name.getText() == 'method') {
            if (ts.isPropertyAccessExpression(initializer)) {
              http = initializer.name.getText() as HttpMethod
              http = http.toLowerCase() as HttpMethod
            }
          }
          if (name.getText() == 'path') {
            if (ts.isStringLiteral(initializer)) {
              path = basePath + initializer.getText().slice(1, -1)
            }
          }
        })

      }
    }
  })
  let queryInfos = processQuery(checker, member)

  let currentPathInfo: HttpContent = {}
  if (Object.keys(queryInfos.query).length) {
    currentPathInfo.parameters = queryInfos.query
  }
  if (Object.keys(queryInfos.body).length) {
    currentPathInfo.requestBody = queryInfos.body
  }
  if (response) {
    currentPathInfo.responses = response
  }
  let file = getFile(member.getSourceFile().fileName)
  function getPathInfoForJsDoc(options: { http, path, currentPathInfo: HttpContent }) {
    let { http, path } = options
    let summary = ''
    let description = ''
    let tags = ts.getJSDocTags(member)
    let hasRouter = false
    type CommentPos = {
      pos: number,
      end: number
    }

    let tagObjs: {
      summary?: ts.JSDocTag,
      description?: ts.JSDocTag,
      router?: ts.JSDocTag,
      response?: ts.JSDocTag,
      request?: ts.JSDocTag,
    } = {
    }

    tags.forEach(tag => {
      let { tagName, comment } = tag
      let tagNameText = tagName.getText().toLowerCase()
      let commentText = comment?.toString() || ''

      tagObjs[tagNameText] = tag;
      if (tagNameText == 'summary') {
        summary = comment?.toString() || ""
      }
      if (tagNameText == 'description') {
        description = comment?.toString() || ''
      }
      return
      if (tagNameText == 'router') {
        hasRouter = true
        let [httpComment, pathComment] = commentText.split(' ');
        let commentIndex = tag.pos + tag.getFullText().indexOf(commentText);
        if (httpComment != http.toLowerCase()) {
          file.replace(commentIndex, commentIndex + httpComment.length, http)
        }
        if (pathComment != path) {
          file.replace(commentIndex + httpComment.length + 1, commentIndex + httpComment.length + 1 + pathComment.length, path)
        }
      }
    })
    if (!Object.keys(tagObjs).length) {


      return {
        summary, description
      }
    }
    let lastTagsPos = tags[tags.length - 1].pos
    if (!tagObjs.description) {
      file.replace(lastTagsPos, lastTagsPos, `\n * @description  `)
    }
    if (!tagObjs.summary) {
      file.replace(lastTagsPos, lastTagsPos, `\n * @summary  `)
    }
    if (!tagObjs.router) {
      file.replace(lastTagsPos, lastTagsPos, `\n * @router ${http} ${path}`)
    } else {
      let tag = tagObjs.router
      let commentText = tag?.comment?.toString() || ''
      let [httpComment, pathComment] = commentText.split(' ');
      let commentIndex = tag.pos + tag.getFullText().indexOf(commentText);
      if (httpComment != http.toLowerCase()) {
        file.replace(commentIndex, commentIndex + httpComment.length, http)
      }
      if (pathComment != path) {
        file.replace(commentIndex + httpComment.length + 1, commentIndex + httpComment.length + 1 + pathComment.length, path)
      }
    }
    if (tagObjs.response) {
      let tag = tagObjs.response
      let commentText = tag?.comment?.toString() || ''
      let [httpStatus, type, description] = commentText.split(' ');
      let commentIndex = tag.pos + tag.getFullText().indexOf(commentText);
      let res = currentPathInfo.responses
      let replaceText = httpStatus
      if (httpStatus != '200') {
        replaceText = '200'
        file.replace(commentIndex, commentIndex + httpStatus.length, replaceText)
      }
      commentIndex = commentIndex + replaceText.length + 1
      replaceText = type
      if (type != res?.type) {
        replaceText = res?.type || ''
        file.replace(commentIndex, commentIndex + type.length, replaceText)
      }
      commentIndex = commentIndex + type.length + 1
      replaceText = description
      if (description != res?.description) {
        replaceText = res?.description || ''
        file.replace(commentIndex, commentIndex + description.length, replaceText)
      }
    } else {
      let res = currentPathInfo.responses
      file.replace(lastTagsPos, lastTagsPos, `\n * @response 200 ${res?.type || ''} ${res?.description || ''}`)
    }
    if (tagObjs.request) {
      let req = currentPathInfo.requestBody
      if (req) {

      }

    } else {

    }

    return {
      summary,
      description
    }
  }
  let { summary, description } = getPathInfoForJsDoc({ http, path, currentPathInfo })
  fs.writeFileSync(`${__dirname}/teggController.ts`, file.text)
  pathInfo = {
    [path]: {
      [http]: {
        summary,
        description,
        ...currentPathInfo,

        // parameters: queryInfos.query,
        // requestBody: queryInfos.body,
        // responses: response
      }
    },
  }

  return pathInfo
}

function processQuery(checker: ts.TypeChecker, member: ts.MethodDeclaration) {
  let { parameters, body } = member
  let query: ExtractTypeNode = {}
  let bodyDocs: ExtractTypeNode = {}
  parameters.forEach(parameter => {
    let { type, questionToken, name, modifiers = [] } = parameter
    let nameText = name.getText()
    console.log(name.getText())
    if (!type) {
      return
    }
    if (modifiers.find(modifier => modifier.kind == ts.SyntaxKind.Decorator && modifier.getText() == '@HTTPQuery()')) {
      let docs = ts.getJSDocCommentsAndTags(parameter)
      let commentNode = docs.length ? docs[0].comment : ''
      function getComment(commentNode: ts.JSDoc['comment']) {
        let comment = ''
        if (!commentNode) {
          return ''
        }
        if (typeof commentNode == 'string') {
          comment = commentNode
        } else {
          comment = commentNode[0]?.getText()
        }
        return comment
      }
      let typeText = getDocType(type)
      if (typeText) {
        query[nameText] = {
          type: typeText,
          required: !questionToken,
          description: getComment(commentNode),
        }
      }

    }
    function getBodyType() {
      let isBody = modifiers.find(modifier => modifier.kind == ts.SyntaxKind.Decorator && modifier.getText() == '@HTTPBody()')
      if (isBody && type) {
        let typeObject = checker.getTypeAtLocation(type)
        let response = getTypeNode(checker, typeObject, typeObject.getSymbol()!)
        if (response) {
          bodyDocs = response
        }
      }
    }
    getBodyType()
  })



  body?.statements.forEach(statement => {
    if (ts.isVariableStatement(statement)) {
      statement.declarationList.declarations.forEach(declaration => {
        let { initializer, name } = declaration
        let nameText = name.getText()
        if (!initializer) {
          return
        }
        let type = checker.getTypeAtLocation(initializer)
        if (ts.isAsExpression(initializer)) {
          let { expression } = initializer
          if (ts.isPropertyAccessExpression(expression)) {
            let { name } = expression
            let nameText = name.getText()
            if (nameText == 'query') {
              let nextExpress = expression.expression
              if (ts.isIdentifier(nextExpress)) {
                let nextName = nextExpress.getText()
                if (nextName == 'ctx') {
                  let symbolNode = type.getSymbol()
                  if (symbolNode) {
                    let _query = getTypeNode(checker, type, symbolNode)
                    if (_query) {
                      query = {
                        ...query,
                        ..._query,
                      }

                    }
                  }
                }

              }
            }
          }
        }
      })
    }

  })

  return { query: query, body: bodyDocs }

}

function processBody() {

}

function getNodeComment(currentSymbol?: ts.Symbol) {
  let comment = ''
  if (!currentSymbol) {
    return comment
  }
  currentSymbol.getDeclarations()?.forEach(declaration => {
    let parent = declaration.parent

    if (ts.isTypeLiteralNode(parent) || ts.isInterfaceDeclaration(parent) || ts.isEnumDeclaration(parent)) {
      let currentIndex = parent.members.indexOf(declaration as any)
      function getComment(node: ts.Node) {
        let fullText = node.getFullText()

        let isBeforelineBreak = isFristBreakLine(fullText)
        if (isBeforelineBreak) {
          return ''
        }
        return node.getFullText().match(/(?<=\/\/).+(?=\n)/)?.[0] || ''
      }
      if (currentIndex > -1) {
        if (currentIndex != parent.members.length - 1) {
          let next = parent.members[currentIndex + 1]
          comment = getComment(next)
        } else {
          let node = findNodeAtPosition(declaration.parent, declaration.end + 1)
          if (node) {
            comment = getComment(node)
          }
        }
        console.log(comment)
      }

    }
  })

  return comment.trim()
}



// const tagsInfo:{
//   summary?:{
//     text:string,
//     node: ts.JSDocTag,

//   }& CommentPos,
//   description?:{
//     text:string,
//     node: ts.JSDocTag,
//   }& CommentPos,
//   router?:{
//     http: {text:HttpMethod } & CommentPos,
//     path: {text:string } & CommentPos,
//     node: ts.JSDocTag,
//   },
//   request?:{
//     //body/path/query/header/formData
//     position: 'body'|'path'|'query'|'header'|'formData',
//     properties?:{
//       [key:string]:{
//         name: string,
//         type:SwaggerTypes,
//         required:boolean,
//         description:string,
//         example?:string,
//         ndoe:ts.JSDocTag,
//       }
//     }
//   }[],
//   response?:{
//     httpStatus:number,
//     description:string,
//     type: SwaggerTypes,
//     ndoe:ts.JSDocTag,
//     properties?:{
//       [key:string]:{
//         name: string,
//         type:SwaggerTypes,
//         required:boolean,
//         description:string,
//         example?:string
//       }
//     }
//   }
// } = {

// }