import * as ts from 'typescript'


export const createTsChecker = (program:ts.Program)=>{


  let checker = program.getTypeChecker();
  let semanticDiagnostics = program.getSemanticDiagnostics()
  if (semanticDiagnostics.length) {
    getErrorMessage(semanticDiagnostics[0],'semanticDiagnostics')
  }
  let syntacticDiagnosticsSyncs = program.getSyntacticDiagnostics()
  if (syntacticDiagnosticsSyncs.length) {
    getErrorMessage(syntacticDiagnosticsSyncs[0],'syntacticDiagnosticsSyncs')
  }
  let declarationDiagnostics = program.getDeclarationDiagnostics()
  if (declarationDiagnostics.length) {
    getErrorMessage(declarationDiagnostics[0],'DeclarationDiagnostics')
  }
  return checker
}

function getErrorMessage(diagnostic:ts.Diagnostic,type:string) {
  let { file, messageText, start } = diagnostic
  const {line,character} = file.getLineAndCharacterOfPosition(start)
  let text = `${type} error: ${messageText}, fileName:${file.fileName}:line:${line+1},chracter:${character+1}, please check `
  throw new Error(text)
}