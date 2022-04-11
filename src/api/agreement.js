import Request from '../utils/request'

const request=new Request()

/**
 * 双蛋活动—-领取奖励
 *
 */
export function confirmAgreement(){
  return request.post('/miniapp/my/agree')
}
