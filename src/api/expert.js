import Request from '../utils/request'

const request = new Request()


/**
 * 专家主页详细信息
 *
 * @export
 * @param {*} us_id
 * @returns
 */
 export function getExpert(us_id) {
  return request.post('/miniapp/experts/list', { us_id })
}

/**
 * 
 * @param {*} us_id 
 * @returns 
 */
export function need(data){
  return request.post('/miniapp/need/commit', data)
}

/**
 * 专家主页详细信息
 *
 * @export
 * @param {*} us_id
 * @returns
 */
export function getExpertDetail(us_id) {
  return request.post('/miniapp/experts/detail', { us_id })
}

/**
 * 专家信息 - TA的履历
 *
 * @export
 * @param {*} us_id
 * @returns
 */
export function getExpertInfoDetail(us_id) {
  return request.post('/miniapp/advert/expert_detail', { us_id })
}

/**
 * 获取专家分类
 *
 * @export
 * @returns
 */
export function getCategory() {
  return request.post('/miniapp/qas/category')
}

/**
 * 获取专家文章
 * @param {*} ua_id 文章id
 * @param {number} [page=1] 页码
 */
export function getArticle(ua_id, page = 1) {
  return request.post('/miniapp/advert/acticle', { ua_id, page })
}

/**
 * 专家的服务列表
 * @param {int} data.ua_id 文章id
 * @param {int} data.page=1] 页码
 */
export function getExpretList(data) {
  return request.post('/weapp/service/index', data)
}

/**
 * 专家的服务详情
 * @param {int} data.ua_id 文章id
 */
export function getExpretDetail(data) {
  return request.post('/weapp/service/detail', data)
}

/**
 * 专家的的电话
 * @param {str} data.company company
 * @param {str} data.name name
 * @param {str} data.phone phone
 */
export function getSevice_calling(data) {
  return request.post('/miniapp/phone/sevice_calling', data)
}

/**
 * 热门直播
 */
export function alive() {
  return request.post('/miniapp/adv/alive')
}

/**
 * 热门直播列表
 */
export function aliveList() {
  return request.post('/miniapp/adv/alive_list')
}

/**
 * 直播预约
 */
export function alive_yuyue(alive_id) {
  return request.post('/miniapp/adv/alive_yuyue',{alive_id})
}

/**
 * 直播详情
 */
export function alive_detail(id){
  return request.post('/miniapp/adv/alive_detail',{id})
}

/**
 * 推荐专栏
 */
export function course_cat() {
  return request.post('/miniapp/knowledge/course_cat')
}

/**
 * 用户是否关注微信公众号
 */
export function careGzh() {
  return request.post('/miniapp/adv/check_care')
}

/**
 * 预约信息提交
 * @param {str} data.company company
 * @param {str} data.name name
 * @param {str} data.phone phone
 * @param {str} data.position position
 */
export function yuyue_detail(data) {
  return request.post('/miniapp/adv/form_post', data)
}

export function yuyue_set(alive_id){
    return request.post('/miniapp/adv/check_form', alive_id)
}

export function choose_card(){
  return request.post('/weapp/wxcard/config')
}
export function add_card(){
  return request.post('/weapp/wxcard/choose_sign')
}

/**********************新******************************/
/**
 * 新热门直播列表
 */
export function liveList() {
  return request.post('/miniapp/adv/new_alive_list')
}

export function liveDetail(id) {
  return request.post('/miniapp/adv/new_alive_detail',{id})
}

export function live() {
  return request.post('/miniapp/adv/new_alive')
}

/**
 * 用户是否在活动期购买会员
 */
export function vipCheck() {
  return request.post('/weapp/active/vip_check')
}

/**********************************************盲盒活动**********************************************/
/**
 *查看用户是否近期购买过会员，参与过抽奖
 */
export function boxCheck(){
  return request.post('/weapp/active/box_check')
}

/**
 *抽奖
 */
export function prizeGet(){
  return request.post('/weapp/active/get_prize')
}

/**
 *填写地址，领取奖品
 */
export function prize(data){
  return request.post('/weapp/active/prize',data)
}

/**
 *用户的奖品信息
 */
export function box(){
  return request.post('/weapp/active/box')
}

/**
 * 判断用户是否已经领取奖品
 */
export function checkGet(){
  return request.post('/weapp/active/check_get')
}

/**
 * 查看用户是否关注
 */
export function checkCare(){
  return request.post('/weapp/active/check_care')
}

/**
 * 查看用户是否关注
 */
export function boxScan(){
  return request.post('/weapp/active/box_scan')
}

/**
 * 用户浏览
 */
export function scan(province,city,ip){
  return request.post('/miniapp/disease/scan',{province,city,ip})
}

/**
 * 直播兑换
 */
export function exchange(live_id){
  return request.post('/miniapp/adv/exchange_live',live_id)
}

