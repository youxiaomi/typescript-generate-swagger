import * as ts from 'typescript'
import { HttpContent, HttpMethod, PathInfo, SwaggerTypes, TypeNodeArray, TypeNodeInfo, TypeNodeObject, TypeNodePrimitive, getSchemaName } from '../generateDoc/createDoc'
import { findNodeAtPosition, isFristBreakLine, isObjectType,  } from './utils/node'
import { omitUndefined } from './utils'


export function getDocType(typeNode?: ts.TypeNode) {
  if(!typeNode){
    return SwaggerTypes.string
  }
  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return SwaggerTypes.string
    case ts.SyntaxKind.NumberKeyword:
      return SwaggerTypes.number
    case ts.SyntaxKind.BooleanKeyword:
      return SwaggerTypes.boolean
    case ts.SyntaxKind.UndefinedKeyword:
      return SwaggerTypes.string
    default:
      return SwaggerTypes.string
  }
}
//不需要深度递归的类型，替换成原始类型
const repalceTypes = {
  BigNumber: SwaggerTypes.string,
  String: SwaggerTypes.string,
  Number: SwaggerTypes.number,
}
function getNodeComment(node: ts.Node) {
  let fullText = node.getFullText()

  let isBeforelineBreak = isFristBreakLine(fullText)
  if (isBeforelineBreak) {
    return ''
  }
  return node.getFullText().match(/(?<=\/\/).+(?=\n)/)?.[0] || ''
}
function getSymbolComment(currentSymbol?: ts.Symbol) {
  let comment = ''
  if (!currentSymbol) {
    return comment
  }
  
  currentSymbol.getDeclarations()?.forEach(declaration => {
    let parent = declaration.parent
    if (ts.isTypeLiteralNode(parent) || ts.isInterfaceDeclaration(parent) || ts.isEnumDeclaration(parent)) {
      let currentIndex = parent.members.indexOf(declaration as any)
      
      if (currentIndex > -1) {
        if (currentIndex != parent.members.length - 1) {
          let next = parent.members[currentIndex + 1]
          comment = getNodeComment(next)
        } else {
          let node = findNodeAtPosition(declaration.parent, declaration.end + 1)
          if (node) {
            comment = getNodeComment(node)
          }
        }
      }

    }
  })

  return comment.trim()
}
export function getCommentTags (node:ts.Node,){
  let summary = ''
  let description = ''
  let tags = ts.getJSDocTags(node)

  tags.forEach(tag => {
    let { tagName, comment } = tag
    let tagNameText = tagName.getText().toLowerCase()
    let commentText = comment?.toString() || ''

    if (tagNameText == 'summary') {
      summary = commentText
    }
    if (tagNameText == 'description') {
      description = commentText
    }
    return
  })

  return {
    summary,
    description
  }
}


export class ParserTypeInfo{
  constructor(readonly checker:ts.TypeChecker, readonly programe:ts.Program){

  }
  symbolNameTypeInfos = new Map<string,TypeNodeInfo>()
  symbolNames = new Map<ts.Symbol,string>()
  visiteObjs = new Set<ts.Symbol>()
  getSchemaTypeInfo = ()=>{
    return this.symbolNameTypeInfos
  }
  getReturnType(checker: ts.TypeChecker, node: ts.MethodDeclaration) {
    let signature = checker.getSignatureFromDeclaration(node)
    if (!signature) {
      return
    }
    let returnType = signature.getReturnType()
    const isAsync = (node.modifiers || []).some(modifier => modifier.kind === ts.SyntaxKind.AsyncKeyword);
    let returnTypeNode = checker.typeToTypeNode(returnType, undefined, undefined)
    if(!returnTypeNode){
      return
    }
    if(ts.isTypeReferenceNode(returnTypeNode) && ts.isIdentifier(returnTypeNode.typeName)){
      if(returnTypeNode.typeName.escapedText== 'Promise'){
        returnType = checker.getTypeArguments(returnType as ts.TypeReference)[0]
      }
    }
    // returnType = isAsync ? checker.getTypeArguments(returnType as ts.TypeReference)[0] : returnType;
    let res = this.getTypeNode( returnType)
    console.log(JSON.stringify(res))
    return res
  }
  getTypeNodeArray(currentType:ts.Type):TypeNodeArray | undefined{
    let arrayEle = this.checker.getTypeArguments(currentType as ts.TypeReference)[0]
    if (!arrayEle) {
      return
    }
    return {
      type: SwaggerTypes.array,
      items: this.getAllTypeNode(arrayEle, arrayEle.getSymbol()!) || {type: SwaggerTypes.string},
    }
  }
  getTypeNodeObject(currentType:ts.Type,typeNode:ts.TypeNode){
    let visiteObjs = this.visiteObjs
    if (ts.isArrayTypeNode(typeNode)) {
      return this.getTypeNodeArray(currentType)
    }
    let typeNodeInfoObject: TypeNodeObject = {
      type: SwaggerTypes.object,
      properties: {},
    }
    function loopNestType(symbolNode: ts.Symbol) {
      let typeName = ''
      let name = symbolNode.getName()
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

      typeNodeInfoObject.properties[name] = {
        type: SwaggerTypes.string,
        description: `<${typeName}>  ` + getSymbolComment(symbolNode),
      }
    }
    currentType.getProperties().forEach((symbolNode) => {
      let currentType = this.checker.getTypeOfSymbol(symbolNode)
      let name = symbolNode.getName()
      if (visiteObjs.has(symbolNode)) {
        loopNestType(symbolNode)
        return
      }
      visiteObjs.add(symbolNode)
      let typeNodeInfo = this.getAllTypeNode(currentType, symbolNode)
      visiteObjs.delete(symbolNode)
      let description = getSymbolComment(symbolNode)
      if (typeNodeInfo) {
        typeNodeInfo.description = typeNodeInfo.description || description
        if(symbolNode.valueDeclaration && ts.isPropertySignature(symbolNode.valueDeclaration)){
          if(symbolNode.valueDeclaration.questionToken){
            typeNodeInfo.required = false
          }
        }
        typeNodeInfoObject.properties[name] = typeNodeInfo
        // if(isOptionalType(currentType,checker)){
        //   typeNodeInfoObject.required = false
        // }
      }
    })
    return typeNodeInfoObject
  }
  getUnionOrIntersectionTypes (currentType:ts.UnionType|ts.IntersectionType,currentSymbol?:ts.Symbol){
    const checker = this.checker
    const getTypes = (type:ts.TypeNode) =>{
      if(type){
        let types:ts.TypeNode[] = []
        if(ts.isUnionTypeNode(type) || ts.isIntersectionTypeNode(type)){
          types = [...type.types]
        }else{
          types = [type]
        }
        let unitTypes = types.map(type => {
          // let symbol = type.getSymbol()
          let currentType = checker.getTypeFromTypeNode(type)
          let symbol = currentType.getSymbol()
          return this.getAllTypeNode(currentType,symbol )
        })
        return omitUndefined(unitTypes)
      } 
      return []
    }
    if(!currentSymbol && currentType.isUnion()){
      let typeinfos = currentType.types.map(type => {
        return this.getAllTypeNode(type,currentSymbol)
      })
      return omitUndefined(typeinfos)
    }
    let types = currentSymbol?.declarations?.map(declaration => {
      if(ts.isPropertySignature(declaration)){
        let type = declaration.type
        if(type){
          return getTypes(type)
        }
      }
      return []
    })
    return types?.flat() || []

  }
  getTypeNodeIntersection(currentType:ts.IntersectionType,currentSymbol?:ts.Symbol):TypeNodeInfo{
    let types = this.getUnionOrIntersectionTypes(currentType,currentSymbol)
    if(types.length == 1){
      return types[0]
    }
    return {
      allOf: types
    }
  }
  getTypeNodeUnion(currentType:ts.UnionType,currentSymbol?:ts.Symbol):TypeNodeInfo{
    let types = this.getUnionOrIntersectionTypes(currentType,currentSymbol)
    if(types.length == 1){
      return types[0]
    }
    return {
      oneOf: types
    }
  }
  getTypeNodePrimitive(type:TypeNodePrimitive['type'],nodeType: ts.NumberLiteralType | ts.StringLiteralType):TypeNodePrimitive{
    let { value } = nodeType
    return {
      type: type,
      description: value.toString(),
    }
  } 
  getTypeNodeEnum(enums:ts.EnumType[],currentSymbol?:ts.Symbol):TypeNodePrimitive{
    let description = ``
    let enumType = SwaggerTypes.number
    let enumsValues = enums.map((type) => {
      let value = (type as any).value
      let desc = getSymbolComment(type.getSymbol() || currentSymbol)
      if (type.isStringLiteral()) {
        enumType = SwaggerTypes.string
      }
      if (desc) {
        description += ` ${value}:${desc},`
      }
      return value
    })
    return {
      type: SwaggerTypes.string,
      enum: enumsValues,
      description
    }
  }
  extractAllTypeNode = (currentType:ts.Type,currentSymbol: ts.Symbol|undefined)=>{
    let typeString = this.checker.typeToString(currentType)
    let typeNode = this.checker.typeToTypeNode(currentType, undefined, undefined)
    if (!typeNode) {
      return
    }
    if (repalceTypes[typeString]) {
      return {
        type: repalceTypes[typeString],
        description: getSymbolComment(currentSymbol),
      } 
    }
    let keyWord = this.getKeyWord(currentType)
    if(keyWord){
      return {
        type: keyWord,
        description: getSymbolComment(currentSymbol),
      }
    }

    if (currentType.isNumberLiteral()) {
      return this.getTypeNodePrimitive(SwaggerTypes.number,currentType)
    }
    if (currentType.isStringLiteral()) {
      return this.getTypeNodePrimitive(SwaggerTypes.string,currentType)
    }
    if(currentType.flags & ts.TypeFlags.Boolean){
      let typeInfo =  this.getDefaultTypeInfo(typeNode,currentSymbol)
      return typeInfo
    }
    if (isObjectType(currentType)) {
      console.log('objectFlags', ts.TypeFlags[currentType.objectFlags])
      return this.getTypeNodeObject(currentType,typeNode)
    }
    if(currentType.isIntersection()){
      return this.getTypeNodeIntersection(currentType,currentSymbol)
    }
    if(currentType.flags & ts.TypeFlags.EnumLike){
      let enumType = currentType as ts.UnionType
      let types = enumType.types as ts.EnumType[]
      let typeInfo = this.getTypeNodeEnum(types,currentSymbol);
      return typeInfo
    }
    if (currentType.isUnion()) {
      console.log(currentSymbol?.getName())
     
     return this.getTypeNodeUnion(currentType,currentSymbol)
    }
    
    return this.getDefaultTypeInfo(typeNode,currentSymbol)
  }
  getDefaultTypeInfo(typeNode:ts.TypeNode,currentSymbol:ts.Symbol|undefined){
    let type = getDocType(typeNode)
    if (type) {
      let comment = currentSymbol ?  getSymbolComment(currentSymbol) : ''
      return {
        type: type,
        // value: checker.typeToString(currentType),
        description: comment,
      }
    }
  }
  getAllTypeNode = (currentType: ts.Type, currentSymbol: ts.Symbol | undefined,cacheSchema?:boolean): TypeNodeInfo | undefined => {
    const checker = this.checker
    if(currentSymbol?.declarations?.length && currentSymbol?.declarations?.length>1){
      // debugger 
    }
    let typeNode = checker.typeToTypeNode(currentType, undefined, undefined)
    let typeString = checker.typeToString(currentType)
    console.log(typeString, currentSymbol)
    if (!typeNode) {
      return
    }
    let isTypeReferenceNode = false
    if(ts.isTypeReferenceNode(typeNode)){
      isTypeReferenceNode = true
    }
    console.log("typeNode", ts.SyntaxKind[typeNode.kind], ts.TypeFlags[currentType.flags])
    
    let symbolName = currentSymbol?.getName()
    
    let hasInternalSymbolName = Object.values(ts.InternalSymbolName).includes(symbolName as any)
    let isKeyWord = this.getKeyWord(currentType)
    let typeSymbol = currentType.getSymbol()
    if(isTypeReferenceNode && typeSymbol && !hasInternalSymbolName && cacheSchema && !isKeyWord){

      let symbolName = this.getTypeInfoSymbolName(typeSymbol,()=>this.extractAllTypeNode(currentType,currentSymbol))
      return {
        $ref: symbolName
      }
    }
    return this.extractAllTypeNode(currentType,currentSymbol)
  }
  getTypeNode( typeObject: ts.Type,options?:{cacheSchema?: boolean}) {
    const { cacheSchema = true } = options || {}
    let symbolObject = typeObject.getSymbol()
    this.visiteObjs = new Set<ts.Symbol>()

    let typeInfo = this.getAllTypeNode(typeObject, symbolObject,cacheSchema)
    
    return typeInfo
  }
  getTypeInfoSymbolName(symbol:ts.Symbol,cb:()=>TypeNodeInfo|undefined){
    let name = this.symbolNames.get(symbol);
    if(name){
      return getSchemaName(name)
    }
    name = symbol.getName()
    if(this.symbolNameTypeInfos.has(name)){
      name = `${name}_v`
    }
    let typeInfo = cb()
    if(typeInfo){
      this.symbolNames.set(symbol,name)
      this.symbolNameTypeInfos.set(name,typeInfo)
      return getSchemaName(name)
    }
  }
  getKeyWord(type:ts.Type){
    let typeString = this.checker.typeToString(type)
    const keyWords = {
      'string': ['String'],
      'number': ['Number','Int8Array','Int16Array','Int32Array','Uint8Array','Uint16Array','Uint32Array','Float32Array','Float64Array','BigInt64Array','BigUint64Array','Unit8ClampedArray'],
      "boolean": ['Boolean'],
    }
    if(typeString){
      return Object.keys(keyWords).find(key=> keyWords[key].includes(typeString))
    }
  }
}