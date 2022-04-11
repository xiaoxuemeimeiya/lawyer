// 知识模块
import Request from "../utils/request"

const request = new Request()

/**
 * 知识模块首页
 *
 * @export
 * @param {number} [page=1]
 * @returns
 */
export function getKnowledge(page=1) {
  return request.post("/miniapp/knowledge", { page })
}

/**
 * 知识模块首页-免费听课
 *
 * @export
 * @param {number} [page=1] 页码
 * @returns
 */
export function getFreeCourse(page=1) {
  return request.post("/miniapp/knowledge/free_course",{page})
}

/**
 * 知识模块首页-本月上线
 *
 * @export
 * @returns
 */
export function getMonths(page=1) {
  return request.post("/miniapp/knowledge/recommend_course", { page })
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
 * 知识模块-线上学习-列表
 *
 * @export
 * @param {*} page - 页码
 * @param {*} type - 类型1 为最新。2为最热
 * @param {*} key_id - 关键字id
 * @returns
 */
export function getOnline(page, type,key_id='') {
  return request.post("/miniapp/knowledge/online", {
    key_id,
    page,
    type
  })
}

/**
 * 知识模块首页-上新页面
 *
 * @export
 * @returns
 */
export function getKnowledgeNews() {
  return request.post("/miniapp/knowledge/news")
}

/**
 * 知识模块-线上学院-详情
 *
 * @export
 * @param {*} course_id
 * @param {*} page
 * @returns
 */
export function getOnlineDetail(course_id, page) {
  return request.post("/miniapp/knowledge/ondetail", { course_id, page })
}

/**
 * 知识模块-线下学院-列表
 *
 * @export
 * @param {*} page
 * @returns
 */
export function getOffline(page) {
  return request.post("/miniapp/course/offschool", { page })
}

/**
 * 知识模块-线下学院-详情
 *
 * @export
 * @param {*} course_id
 * @returns
 */
export function getOfflineDetail(course_id) {
  return request.post("/miniapp/knowledge/offdetail", { course_id })
}

/**
 * 知识模块-线上学院-课程列表观看主页
 *
 * @export
 * @param {*} course_id
 * @returns
 */
export function getOnlineCourseDetail(course_id) {
  return request.post("/miniapp/onlearn/ondetail", { course_id })
}

/**
 * 知识模块-线上学院-课程列表-音频详细
 *
 * @export
 * @param {*} course_id - 课程id
 * @param {*} part_id - 章节id
 * @returns
 */
export function getOnlineCoursePart(course_id, part_id) {
  return request.post("/miniapp/onlearn/part", { course_id, part_id })
}

/**
 * h5分享课程图片url
 *
 * @export
 * @param {*} type 默认1，type=1线上音频，type=2线下学院
 * @param {*} id 课程id
 * @returns
 */
export function getShareImg(type, id) {
  return request.post("/miniapp/share/share_img", { type, id })
}

/**
 * h5分享文章url
 *
 * @export
 * @param {*} id 课程id
 * @returns
 */
export function getShareImg2( id) {
  return request.post("/miniapp/share/share_img2", {  id })
}

/**
 * 抗疫详情
 *
 * @export
 * @returns
 */
export function getDisease(name) {
  return request.post("/miniapp/disease/index",{name})
}

/**
 * 资讯
 *
 * @export
 * @param {*} page - 页码
 * @param {*} type - 类型1 为推荐，2为行业资讯，3为综合资讯
 * @param {*} key_id - 关键字id
 * @returns
 */
export function getArticle(page, type,article_type,recommend,key_id='') {
  return request.post("/miniapp/advert/Article_list", { page, type,article_type,recommend})
}

/**
 * 资讯详情
 *
 * @export
 * @param {*}  ua_id- 关键字ua_id
 * @returns
 */
export function articleDetail(ua_id) {
  return request.post("/miniapp/advert/acticle_detail", {ua_id})
}


/**
 * 资讯点赞/取消，收藏/取消
 *
 * @export
 * @param {*}  ua_id- 关键字ua_id
 * @returns
 */
export function focuson(type,ua_id,action) {
  return request.post("/miniapp/article/focuson", {type,ua_id,action})
}

/**
 * 资讯评论
 *C
 * @export
 * @param {*}  ua_id- 关键字ua_id
 * @returns
 */
export function addcomment(ua_id,content) {
  return request.post("/miniapp/advert/addcomment", {ua_id,content})
}

/**
 * 资讯评论点赞/取消
 *
 * @export
 * @param {*}  comment_id- 评论id
 * @returns
 */
export function commentFocuson(comment_id,action) {
  return request.post("/miniapp/article/comment_focuson", {comment_id,action})
}

/**
 * 轮播图
 * @param {*} page
 */
export function live(type,page){
  return request.post('/miniapp/adv/index',{type,page})
}
