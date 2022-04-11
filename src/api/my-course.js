import Request from '../utils/request'

const request=new Request()

/**
 * 我的在线课程（已废弃）
 *
 * @export
 * @param {*} page
 * @returns
 */
export function myOnlineCourse(page){
  return request.post('/miniapp/my/joincourse',{
    page
  })
}

/**
 * 我的在线课程(新接口)
 *
 * @export
 * @param {*} page
 * @returns
 */
export function myOnlineCourseNew(page){
  return request.post('/miniapp/my/buycourse',{
    page
  })
}

/**
 * 我的线下课程
 *
 * @export
 * @param {*} page
 * @returns
 */
export function myOfflineCourse(page){
  return request.post('/miniapp/my/joinoffcourse',{
    page
  })
}

/**
 * 是否领取分享课程
 *
 * @export
 * @param {*} page
 * @returns
 */
export function is_set_Course(){
  return request.post('/miniapp/course/is_share_course'
  )
}

/**
 * 是否领取分享课程
 *
 * @export
 * @param {*} page
 * @returns
 */
export function receive_Course(course_id){
  return request.post('/miniapp/course/share_course',{
    course_id
  })
}

