import {  } from 'egg';
import {  Context, EggContext, HTTPBody, HTTPController, HTTPMethod, HTTPMethodEnum, HTTPQuery } from '@eggjs/tegg'


type User = {
  name: string  //用户名字
  age: number  //用户年龄
  /** 用户地址 */
  address?: string
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
    path: '/updateUser',
  })
  async updateUser(@Context() ctx: EggContext, @HTTPBody() body: User & {userId: number }){
    let user:User = {
      name: 'egg',
      age: 20,
      address: '北京',  
    }
    return user
  }
}