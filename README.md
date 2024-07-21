## swagger-generate/swagger-tegg
只支持egg.js的tegg版本。通过typescript的类型定义,自动生成swaggger文档。   
通过读取带controller标识的文件名来获取tegg的controller（userController.ts）   
Only the tegg version of egg.js is supported.    
Automatically generate swagger documents with typescript type definitions and javascript comments

### install 
```
  npm install https://github.com/youxiaomi/swagger-generate/releases/download/1.0.0/swagger-generate-1.0.0.tgz --save-dev
```

### usage

```
const  { swaggerTegg } = require("@typescript-generate-swagger/swagger-tegg")
const path = require('path');
swaggerTegg({
  projectDir: path.join(__dirname, '../'),
  outPutL: __dirname,
  outFile: 'swagger.json'
})
```

