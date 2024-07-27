type Obj = {
   
    enabled?:false | false
    enabled2?: false | true
    enabled3?: boolean
    enabled4?: boolean
    enabled5: boolean
    enabled6: boolean | undefined
     /** name */
     name:string
     age?:number,  //age可选
}
const obj:Obj = {
  name:'name',
  age: 18, // age
  enabled: false,
  enabled5:true,
  enabled6:true,
}

type union = string | number | boolean
type unionObject  = {name:string} | {age:number} | {enabled?: boolean}

type insection = {name:string} & {age:number} & {enabled?: boolean}
type propertieOptions = {
  /** name */
  name:string
  age?:number,  //age可选
  enabled?:boolean
}

const typeInfer = {
  /** name */
  name:'name',
  age: 18, // age
  enabled: false
}
const typeInferNest = {
  name:'name',
  /** nest */
  nestObj: typeInfer
}