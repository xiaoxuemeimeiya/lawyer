import Request from '../utils/request'

const request=new Request()

/**
 * config接口注入权限验证配置
 *
 * @param {string} tourl url
 * @export
 * @returns
 */
export function getShareAPI(tourl){
  return request.post('/weapp/wuser/jsapi',{tourl})
}

