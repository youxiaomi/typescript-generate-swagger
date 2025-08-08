import { Context } from 'egg';
import { HTTPController, HTTPMethod, HTTPMethodEnum } from '@eggjs/tegg'

enum OrderStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
enum OrderTypeEnum {
  NORMAL, // 正常
  EXPRESS = 'EXPRESS',  // express 描述
}

type Order = {
  orderId: string | 123123123  // 订单id
  /** 地址 */
  address?: string
  /** 金额 */
  price: number
  userObj?:Object
  userObj2?: object
  enumObj?: OrderStatusEnum | OrderTypeEnum
  order?: Order
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
      price: 2000,
      enumObj: OrderStatusEnum.CANCELLED
    }
    return order
  } 
}