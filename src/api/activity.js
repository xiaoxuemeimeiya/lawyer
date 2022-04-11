import Request from '../utils/request'

const request=new Request()

/**
 * 双蛋活动—-领取奖励
 *
 */
export function active(){
  return request.post('/weapp/active/index')
}
