import {  } from 'egg';
import {  Context, EggContext, HTTPBody, HTTPController, HTTPMethod, HTTPMethodEnum, HTTPQuery } from '@eggjs/tegg'


type User = {
  name: string  //用户名字
  age: number  //用户年龄
  /** 用户地址 */
  address?: string
  /** 是否开启 */
  enabled?: boolean
}

@HTTPController({path:'/user'})
export class UserController {
   /**
   * @summary   获取用户名字
   * @description  这是descriptionm描述
   */
  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/getName',
  })
  async getName(@Context() ctx: EggContext, /** 用户id */ @HTTPQuery() userId: number ){
    let query = ctx.query as {
      name: string //这是  queryObj中的描述
    }
    let userInfo = {
      /** 这是对象上的注释egg */
      name: 'egg',  
      age: 18, //这是对象上的注释
    }    
    return  userInfo
  }

  /**
   * @summary 这是summary描述
   * @description  这是descriptionm描述
   */
  @HTTPMethod({
    method: HTTPMethodEnum.POST,
    path: 'updateUser',
  })
  async updateUser(@Context() ctx: EggContext, @HTTPBody() body: User & {userId: number }){
    let user:User = {
      name: 'egg',
      age: 20,
      address: '地址',  
      enabled: false
    }
    return user
  }


  /**
   * @summary 第一个是method,第二个参数是path,中间用空格分隔
   * @router delete /user/deleteUser
   * @description  适用于第三方包在编译过程过后，d.ts中没有httpMethod，所用通过 router 这个tag来识。不支持ctx.query识别类型，智能通过HTTPQuery来识别。
   */
  async deleteUser(@Context() ctx: EggContext, @HTTPQuery() userId:string){
    type User2<T> = {
      type:T
    }
    let user:{
      name:User2<string>,
      age:User2<number>
    } = {
      name: {
        type: 'name'
      },
      age:{
        type: 18
      }
    }
    return user
  }
}