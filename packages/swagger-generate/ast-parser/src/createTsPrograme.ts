import * as ts from 'typescript'
import path from 'path'

function getDefaultCompilerOptions(CompilerOptions: ts.CompilerOptions) {
  const { rootDir }= CompilerOptions

  return {
    // types: [
    //   // `${base}/typings/global.d.ts`,
    //   ...types,
    // ],
    typeRoots: [
      `${rootDir}/typings`,
      `${rootDir}/typings/global.d.ts`,
      // './typings/app/controller'
    ],
    // noEmitOnError: true,
    // target: ts.ScriptTarget.ESNext,
    rootDir: rootDir,
    baseUrl: rootDir,
    "declaration": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/module/*": [rootDir + "/app/module/*"]
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
  }
}


export const createTsPrograme = (options: {
  basePath: string,
}) => {
  const { basePath } = options
  let tsconfigName = 'tsconfig.json'
  let tsconfigPath = path.join(basePath, tsconfigName)
  const readConfigFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if(!readConfigFile.config){
    throw new Error(`can not read tsconfig.json in ${basePath} tsconfig.json`)
  }
  const parsedConfig = ts.parseJsonConfigFileContent(readConfigFile.config, ts.sys, basePath);
  let program = ts.createProgram([
    ...parsedConfig.fileNames,
  ], parsedConfig.options);

  return program
}