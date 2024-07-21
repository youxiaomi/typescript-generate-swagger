import { swaggerTegg } from '../index'
import path from 'path'




swaggerTegg({
  projectDir: path.join(__dirname, '../example'),
  outPut: path.join(__dirname),
  swaggerConfig:{
    info:{
      title:'这是自动生成的文档通过typescript-generate-swagger/swagger-tegg',
      termsOfService: "http://typescript-generate-swagger/swagger-tegg",
      description:"swagger doc生成example",
    }
  }
})