// 搜索模块
import Request from '../utils/request'

const request=new Request()

/**
 * 搜索主页
 *
 * @export
 * @returns
 */
export function searches(){
  return request.post('/miniapp/search')
}

/**
 * 搜索记录添加
 *
 * @export
 * @param {*} keyword - 关键字
 * @returns
 */
export function record(keyword){
  return request.post('/miniapp/search/record',{keyword})
}

/**
 * 搜索关键字接口
 *
 * @export
 * @param {*} type - 搜索类型：1-综合，2-线上音频，3-线下学院
 * @param {*} keyword - 搜索关键字
 * @param {*} page
 * @returns
 */
export function search1(type,keyword,page){
  return request.post('/miniapp/knowledge/find',{type,keyword,page})
}

/**
 * 删除搜索记录
 *
 * @export
 * @returns
 */
export function delSearch(){
  return request.post('/miniapp/search/delsearch')
}


