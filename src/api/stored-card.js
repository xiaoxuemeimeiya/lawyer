// 搜索模块
import Request from '../utils/request'

const request=new Request()

/**
 * 学习卡充值优惠
 *
 * @export
 * @returns
 */
export function cardList(){
  return request.post('/miniapp/card/card_list')
}

/**
 * 学习卡总余额
 *
 * @export
 * @returns
 */
export function getCardTotal(){
  return request.post('/miniapp/card/card_total')
}

/**
 * 学习卡消费/充值记录接口
 *
 * @export
 * @param {*} page
 * @returns
 */
export function getCardLog(page){
  return request.post('/miniapp/card/card_log',{page})
}
