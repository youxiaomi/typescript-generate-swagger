import * as ts from 'typescript'


export const createTsChecker = (program:ts.Program)=>{


  let checker = program.getTypeChecker();
  let semanticDiagnostics = program.getSemanticDiagnostics()
  if (semanticDiagnostics.length) {
    throw new Error(`semanticDiagnostics error  "${semanticDiagnostics[0].messageText}", please check semantic`)
  }
  let syntacticDiagnosticsSyncs = program.getSyntacticDiagnostics()
  if (syntacticDiagnosticsSyncs.length) {
    throw new Error('syntacticDiagnosticsSyncs error '+ syntacticDiagnosticsSyncs[0].messageText)
  }
  let declarationDiagnostics = program.getDeclarationDiagnostics()
  if (declarationDiagnostics.length) {
    let error =  new Error('declarationDiagnostics error '+ declarationDiagnostics[0].messageText)
    throw error
  }
  return checker
}