// 状态码
const CODE={
  /** 接口成功 */
  SUCC:1, 
  /** 登录验证的code 失效了，请重新获取 */
  UNLOGIN:2, 
  /** 缺失参数 */
  MISS_PARAM:3, 
  /** 非post 请求方式 */
  NOTPOST:4, 
  /** session key 失效了，需要重新获取 */
  TOKEN_INVALID:5,
  /** 系统升级中 */
  SYSTEM_UPGRADE:6, 
  /** 用户信息出错！请重新登录试试看 */
  USER_ERROR:7,
  /** 该用户已经注册过了 */
  USER_REGED:8, 
  /** 重复操作 */
  REPEAT:9, 
  /** 操作出错了，等会再来试试吧！ */
  WAIT:10, 
  /** 已经取消关注了！ */
  REMOVE_CONCERNS:11 , 
  /** 文章可能下架了！ */
  ARTICLE_SHELF:12,
  /** 已经购买过该课程了！ */
  COURSE_BUYED:13,
  /** 找不到该课程了！ */
  COURSE_NOTFOUND:14, 
  /** 还没购买课程！ */
  COURSE_NOBUY:15,
  /** session id (sid)过期了。出现大概原因：如果你电脑端登录小程序，手机端又测试登录了。那么小程序端的sid 就无效了，需要重新获取 */
  TOKEN_OVERDUE:40001, 
  /** session_key 失效了。重新获取一次code */
  TOKEN_TYRAGAIN:40002, 
  /** 未注册 */
  UNREG:25, 
}

// eslint-disable-next-line import/prefer-default-export
export { CODE }