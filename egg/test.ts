const getUser = ():User|{code:123}|{message:string}=>{
  return {
    code:123
  }
}

type User  = {
  name:string
}
// let bb = getUser()