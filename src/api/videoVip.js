import Request from '../utils/request'

const request = new Request()

/**
 * 优惠券列表
 *
 */
export function couponList() {
    return request.post('/weapp/coupon/index')
}
/**
 * 用户已领取优惠券列表
 *
 */
export function usercouponList() {
    return request.post('/weapp/coupon/user_index')
}
/**
 * 用户领取优惠券
 *
 */
export function get_coupon(data) {
    return request.post('/weapp/coupon/get_coupon', data)
}
/**
 * 链享会员开通
 *
 */
export function get_lian(data) {
    return request.post('/weapp/newpay/lian', data)
}

/**
 * 链享会员开通
 *
 */
export function new_lian(data) {
    return request.post('/weapp/newpay/new_lian', data)
}
/**
 * 链享会员7.5折课程
 *
 */
export function vipDiscountCourse() {
    return request.post('/miniapp/knowledge/vip')
}
/**
 * 会员专区（会员年费）
 *
 */
export function member_reccommend(page) {
    return request.post('/miniapp/knowledge/member_reccommend',{page})
}

/**
 *
 */
export function ActiveList(page=1) {
    return request.post('/miniapp/knowledge/active_list',{ page })
}

/**
 * 知识模块首页-名家学堂
 *
 * @export
 * @returns
 */
export function getFamous(page=1) {
    return request.post("/miniapp/knowledge/famous_course", { page })
}
/**
 * 用户领取名家学堂
 *
 */
export function get_FamousCourse(data) {
    return request.post('/weapp/coupon/get_course', data)
}

/**
 * 获取我自己的已经领取的名家学堂课程
 *
 */
export function get_my_famous(data) {
    return request.post('/weapp/coupon/my_famous', data)
}

/**
 * 获取分享id
 *
 */
export function get_share_id() {
    return request.post('/weapp/coupon/share_id')
}
/**
 * 获取会员体验卡
 *
 */
export function get_experience_card(data) {
    return request.post('/weapp/coupon/get_card', data)
}

/**
 * 获取免费会员
 *
 */
export function get_freeVip() {
    return request.post('/weapp/active/active_lian')
}

/**
 * 获取会员订单
 *
 */
export function get_buyVipList() {
    return request.post('/miniapp/myorders/vip')
}

/**
 * 获取会员购买价格
 *
 */
export function get_vipPrice() {
    return request.post('/weapp/coupon/share_price')
}

/**
 * 获取各种会员购买价格
 *
 */
export function get_pervipPrice(data) {
    return request.post('/weapp/coupon/per_price',data)
}

/**
 * 获取会员购买价格
 *
 */
export function get_activevipPrice() {
    return request.post('/weapp/coupon/share_active_price')
}


/**
 * 获取验证码
 *
 */
export function get_sms(data) {
    return request.post('/miniapp/sms/index',data)
}

/**
 * 验证验证码
 */
export function verity_code(data){
    return request.post('/miniapp/sms/verity',data)
}

/**
 * 手机号是否被验证verity
 */
export function is_verify(data){
    return request.post('/miniapp/qas/isverity',data)
}


/**
 * 免费领取会员卡
 */
export function free_lian(data){
    return request.post('/weapp/active/active_lian_detail',data)
}

/**
 * 学生免费领取会员卡
 */
export function student_free_lian(data){
    return request.post('/weapp/active/student_lian',data)
}

/**
 * 兑换会员卡
 */
export function exchange_lian(data){
    return request.post('/weapp/active/lian_exchange',data)
}
/**
 * 免费领取会员卡填写信息
 */
export function goddess_free(data){
    return request.post('/weapp/active/goddess_detail',data)
}

/**
 * 免费领取会员卡
 */
export function goddess_free_get(data){
    return request.post('/weapp/active/goddess',data)
}

/**
 * 免费领取会员卡
 */
export function goddess_check(data){
    return request.post('/weapp/active/checkget',data)
}
/**
 * 图片上传
 *
 */
export function upload(data) {
    return request.post('/weapp/coupon/file_up', data)
}

/**
 * 一对一预约信息
 */
export function oneByoneDetail(){
    return request.post('/miniapp/experts/oneByoneDetail')
}

/**
 * 一对一预约信息提交
 */
export function oneByone(data){
    return request.post('/miniapp/experts/oneByone',data)
}

/**
 * 线下活动报名
 */
export function signFree(data){
    return request.post('/miniapp/knowledge/signFree',data)
}

/**
 * 获取链链会员所有套餐
 */
export function allPackage(type){
    return request.post('/weapp/package/all_price',type)
}