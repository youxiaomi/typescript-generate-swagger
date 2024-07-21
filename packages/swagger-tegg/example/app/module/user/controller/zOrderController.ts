import { Context } from 'egg';
import { HTTPController, HTTPMethod, HTTPMethodEnum } from '@eggjs/tegg'


type Order = {
  orderId: string  // 订单id
  /** 地址 */
  address?: string
  /** 金额 */
  price: number
}




@HTTPController({path:'/order'})
export class UserController {
  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/getOrder',
  })
  async getOrder(){
    let order:Order = {
      orderId: 'P90000',
      address: '北京',
      price: 2000
    }
    return order
  }
}