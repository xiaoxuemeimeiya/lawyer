import Request from '../utils/request'

const request=new Request()

/**
 * 个人中心-我的收益接口
 *
 * @export
 * @param {*} page
 * @returns
 */
export function getProfit(page){
  return request.post('/miniapp/account/myaccount',{page})
}

/**
 * 个人中心-提现接口
 *
 * @export
 * @param {*} cash - 提现金额 (金额不低于最小金额1.00元，金额累计不超过20000.00元。)
 * @returns
 */
export function cashout(cash){
  return request.post('/weapp/wxpay/cashout',{cash})
}

