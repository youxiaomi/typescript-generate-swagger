import * as ts from 'typescript'


export const createTsChecker = (program:ts.Program)=>{


  let checker = program.getTypeChecker();
  let semanticDiagnostics = program.getSemanticDiagnostics()
  if (semanticDiagnostics.length) {
    semanticDiagnostics.forEach(diagnostic => {
      console.error(diagnostic.messageText)
      throw new Error('semanticDiagnostics error '+ diagnostic.messageText)
    })
    return checker
  }
  let bb = program.getSyntacticDiagnostics()
  let dd = program.getDeclarationDiagnostics()


  return checker
}