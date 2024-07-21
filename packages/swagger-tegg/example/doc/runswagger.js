const { swaggerTegg }  = require('@typescript-generate-swagger/swagger-tegg')
const path = require('path')

swaggerTegg({
  projectDir:path.join(__dirname,'../'),
  outPut: __dirname,
})