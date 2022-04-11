import Request from '../utils/request'

const request=new Request()

/**
 * 个人中心-我的助力好友接口
 *
 * @export
 * @param {*} page
 * @returns
 */
export function getSharePeople(page){
  return request.post('/miniapp/member/share_people',{page})
}

/**
 * 俱乐部权益首页
 */
export function getMemberRight(){
  return request.post('/miniapp/knowledge/member_right')
}

/**
 * 直播推荐
 */
export function getLives(){
  return request.post('/miniapp/adv/index',{type:3})
}

/**
 * 俱乐部权益-推荐课程
 * @param {*} page 
 */
export function getMemberReccommend(page=1){
  return request.post('/miniapp/knowledge/member_reccommend',{page})
}

/**
 * 俱乐部权益-直播推荐
 * @param {*} page 
 */
export function getMemberLive(page=1){
  return request.post('/miniapp/adv/index',{type:3,page})
}

/**
 * 俱乐部权益-大咖闭门会
 * @param {*} page 
 */
export function getBigClose(page=1){
  return request.post('/miniapp/article/article',{type:2,page})
}

/**
 * 俱乐部权益-高端行业走访活动
 * @param {*} page 
 */
export function getGo(page=1){
  return request.post('/miniapp/article/article',{type:3,page})
}
