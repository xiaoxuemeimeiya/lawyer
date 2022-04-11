// 问答模块
import Request from '../utils/request'

const request=new Request()

/**
 * 用户发起的线上课程订单
 *
 * @export
 * @param {*} page
 * @returns
 */
export function userOnCourse(page){
  return request.post('/miniapp/myorders/oncourse',{page})
}

/**
 * 用户发起的线上课程订单详情
 *
 * @export
 * @param {*} order_id
 * @returns
 */
export function userOnCourseDetail(order_id){
  return request.post('/miniapp/myorders/ondetail',{order_id})
}

/**
 * 用户发起的线下课程订单
 *
 * @export
 * @param {*} page
 * @returns
 */
export function userOffCourse(page){
  return request.post('/miniapp/myorders/offline',{page})
}

/**
 * 用户发起的线下课程订单详情
 *
 * @export
 * @param {*} order_id
 * @returns
 */
export function userOffCourseDetail(order_id){
  return request.post('/miniapp/myorders/offdetail',{order_id})
}

/**
 * 评论订单
 * @param {*} order_id
 * @param {*} comment
 */
export function myordersComment(order_id,comment){
  return request.post('/miniapp/myorders/comment',{order_id,comment})
}