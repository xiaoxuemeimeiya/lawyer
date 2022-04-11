import Request from '../utils/request'

const request = new Request()

/**
 * 线上课程支付
 *
 * @export
 * @param {*} course_id - 课程id
 * @param {number} [account=0] - 传递价为0或者不传，都会默认没有使用学习卡
 * @param {int} real_amount - 实际付款金额
 * @param {string} [code=''] - 邀请码
 * @param {int} type - 默认0；0-不用链享卡，1-用链享卡(链享卡必传)
 * @param {int} user_coupon_id - 优惠券id
 * 
 ```
 返回结果:
 appId: "wx76e1ae8303060bcb"
 timeStamp: "1558719320"
 nonceStr: "quetqasn9d54akj9leoe06c9t70808wg"
 package: "prepay_id=wx250135201959589f427368157747103200"
 signType: "HMAC-SHA256"
 paySign: "16021210B9EB787CF4771331D18811278B0496FA12149FE6283806F094E5D51E"
 ```
 */
export function payCourse(course_id, account = 0, real_amount, code, type, user_coupon_id) {
  return request.post('/weapp/newpay/new_oncourse', {
    course_id,
    account,
    real_amount,
    code,
    type,
    user_coupon_id,
  })
}

/**
 * 线下学院支付
 *
 * @export
 * @param {*} course_id - 线下课程id
 * @param {Object} data - 用户报名信息
 * @param {*} data.name - 报名者
 * @param {*} data.phone - 联系电话
 * @param {number} [account=0] - 传递价为0或者不传，都会默认没有使用学习卡
 * @param {string} [code=''] - 邀请码
 * @returns
 */
export function payOfflineCourse(course_id, data, account = 0, code = '') {
  return request.post('/weapp/newpay/offcourse', {
    course_id,
    data,
    account,
    code
  })
}

/**
 * 链链俱乐部支付
 *
 * @export
 * @param {number} [type=2] - 1-有邀请码，2-无邀请码(默认)
 * @param {string} [invite_code=''] - 邀请码
 * @param {number} [total_fee=869] - 价格
 * @returns
 */
export function payClub(type = 2, invite_code = '', total_fee = process.env.NODE_ENV !== 'production' ? 0.01 : 869) {

  // 时间判断
  if (process.env.NODE_ENV === 'production') {
    var start = +new Date("2019-12-27T00:00:00")
    var end = +new Date("2019-12-28T00:00:00")
    var now = Date.now()
    if (now >= start && now < end) {
      total_fee = 139
    } else {
      total_fee = 869
    }
  } else {
    total_fee = 0.01
  }


  return request.post('/weapp/newpay/member', {
    type,
    invite_code,
    total_fee
  })
}

/**
 * 链链俱乐部支付 - 99元
 *
 * @export
 * @param {number} [type=2] - 1-有邀请码，2-无邀请码(默认)
 * @param {string} [invite_code=''] - 邀请码
 * @param {number} [total_fee=869] - 价格
 * @returns
 */
export function payClub99(type = 2, invite_code = '', total_fee = 99) {
  return request.post('/weapp/newpay/temp_wise_order', {
    type,
    invite_code,
    total_fee
  })
}

/**
 * 取消订单
 *
 * @export
 * @param {*} order_id - 订单id
 * @returns
 */
export function cancel(order_id) {
  return request.post('/weapp/newpay/cancel', {
    order_id
  })
}

/**
 * 音频待支付订单--支付接口
 *
 * @export
 * @param {*} order_id
 * @returns
 */
export function payUnCourse(order_id) {
  return request.post('/weapp/wxpay/oncourse', {
    order_id
  })
}

/**
 * 学院待支付订单--支付接口
 *
 * @export
 * @param {*} order_id
 * @returns
 */
export function payUnOffCourse(order_id) {
  return request.post('/weapp/wxpay/offcourse', {
    order_id
  })
}

/**
 * vip待支付订单--支付接口
 *
 * @export
 * @param {*} order_id
 * @returns
 */
export function payUnVip(order_id) {
  return request.post('/weapp/wxpay/vip', {
    order_id
  })
}


