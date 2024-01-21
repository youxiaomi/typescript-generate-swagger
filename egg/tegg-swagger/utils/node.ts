import * as ts from 'typescript'

export function isFristBreakLine(fullText: string) {
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
export function findNodeAtPosition(node: ts.Node, position: number): ts.Node | undefined {
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

export function getNodeComment(node:ts.Node){
  let docs = ts.getJSDocCommentsAndTags(node)
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
  return getComment(commentNode)
}
export  function isObjectType(node: ts.Type): node is ts.ObjectType {
  return !!(node.flags & ts.TypeFlags.Object);
}

export function extractTypesForUnionType(type: ts.UnionType,checker:ts.TypeChecker) {
  let types = type.types
  let undefinedTypeIndex = types.findIndex(type => {
    let typeNode = checker.typeToTypeNode(type,undefined,undefined)
    return typeNode && typeNode.kind == ts.SyntaxKind.UndefinedKeyword
  })
  let _types = [...types]
  if (undefinedTypeIndex > -1) {
    _types.splice(undefinedTypeIndex, 1)[0];
  }
  let typeEnums = _types.filter(type => type.flags & ts.TypeFlags.EnumLiteral) as ts.EnumType[];
  let typeOthers = _types.filter(type => !(type.flags & ts.TypeFlags.EnumLiteral));
  return {
    isOptional:undefinedTypeIndex>-1,
    typeEnums,
    typeOthers,
  }
  // let enum1 = typeEnums[0]
  // let sb = enum1.getSymbol()
  // sb?.valueDeclaration?.parent
  // let name = sb?.getName()
  // let a = checker.typeToTypeNode(typeEnums[0],undefined,undefined)
  // if(a){
  //   checker.getSymbolAtLocation(a) 
  // }
}
export function isOptionalType(type:ts.Type,checker:ts.TypeChecker){
  if(type.isUnion()){
    let types = type.types
    return !!types.find(type => {
      let typeNode = checker.typeToTypeNode(type,undefined,undefined)
      return typeNode && typeNode.kind == ts.SyntaxKind.UndefinedKeyword
    })
  }
}