import * as fs from 'fs'


type readFileOptionsType  = {
  cb?:(dir,file)=>boolean
}
export const readFiles = (path,options:readFileOptionsType={})=>{
  let dirs = fs.readdirSync(path);
  let files:string[] = []
  dirs.forEach(dir => {
    let filePath = path.resolve(path,dir)
    let stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      let dirChildren = readFiles(filePath)
      files = [...files,...dirChildren]
    } else {
      if(options.cb && !options.cb(path,dir)){
        return
      }
      return files.push(filePath)
    }
  })
  return files
}