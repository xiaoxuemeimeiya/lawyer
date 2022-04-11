import { observable, autorun } from 'mobx'
// import { observable } from 'mobx'
import Taro from '@tarojs/taro'

import { getToken, setToken, removeToken } from '../utils/auth'
import { getCookie, removeCookie, setCookie } from "../utils/storage"
import { getQueryVariable } from "../utils/util"
import userStore from './user'
import { my } from './../api/my'
import { get_my_famous } from './../api/videoVip'
import { encrypt, decryption } from './../utils/aes'

const loginStore = observable({
  token: getToken(),

  /**
   * 设置token
   */
  setToken(token) {
    this.token = token
  },

  /**
   * 删除token
   */
  removeToken() {
    this.token = ''
  },

  /* 是否登录 */
  get isLogin() {
    return !!this.token
  },



  /**
   * 获取用户信息
   */
  login(obj = {}) {
    // 配置项
    const {
      showLoading = false // 是否显示loading加载提示
    } = { ...obj }

    // 清除原有登录信息
    this.removeToken()
    removeToken()

    if (getQueryVariable("code")) {
      return getUserinfo(showLoading).then(async () => {
        const Prev_URL = getCookie("Prev_URL") || getIndexURL()
        removeCookie("Prev_URL")
        localStorage.removeItem('userInfo')
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1000
        })
        const { data } = await my()
        const my_famous = await get_my_famous()
        data.my_famous = []
        // 和后台沟通，这个需要除以100
        data.club_account = (data.club_account / 100).toFixed(2)
        data.my_famous.push(...my_famous.data)
        data.isClubVIP = isClubVIP(data)

        /** 加密数据 */
        const a = encrypt(data)
        localStorage.setItem('userInfo', a)

        setTimeout(() => {
          window.location.replace(Prev_URL)
        }, 1000)
      })
    }

    getAppId(showLoading).then(appid => {
      // redirect_uri参数必须encodeURIComponent转码
      var url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(window.location.href)}&response_type=code&scope=snsapi_userinfo&state=${Math.floor(Math.random() * 1000)}#wechat_redirect`
      window.location.replace(url)
    })
  }
})

/**
 * 处理错误
 *
 * @param {*} str
 * @param {*} fn
 */
function handleError(str, fn) {
  fn =
    fn ||
    function () {
      removeCookie("APPID")
      // Taro.reLaunch({ url: getIndexURL() })
      removeToken()
      // 跳转回首页
      window.location.href = `${window.location.protocol}//${window.location.host}/`
    }

  Taro.showModal({
    title: "提示", //提示的标题,
    content: str, //提示的内容,
    showCancel: false, //是否显示取消按钮,
    confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
    confirmColor: "#D62419", //确定按钮的文字颜色,
    success: () => {
      fn()
    }
  })
}

/** 计算vip状态
 * @param xxxx 用户信息
 */

export function isClubVIP(xxxx) {
  // 初始状态
  if (xxxx.end_time === undefined) {
    return null
  }

  if (xxxx.end_time === '') {
    return 0
  }
  let now = +Date.now()
  if (now < xxxx.end_time * 1000) {
    return 1
  } else if (now >= xxxx.end_time * 1000) {
    return 2
  }
}
/**
 * 获取APPID
 *
 * @param {boolean} [showLoading=false] - 是否显示loading遮罩
 * @returns
 */
function getAppId(showLoading = false) {
  return new Promise((resolve, reject) => {
    // 打开loading遮罩
    if (showLoading) {
      Taro.showLoading({
        title: "获取数据中...", //提示的内容,
        mask: true //显示透明蒙层，防止触摸穿透,
      })
    }

    if (getCookie("APPID")) {
      showLoading && Taro.hideLoading()
      return resolve(getCookie("APPID"))
    }

    Taro.request({
      url: process.env.API + "/wechat/login/index",
      method: 'POST',
      header: {
        "content-type": "application/x-www-form-urlencoded"
      }
    })
      .then(res => {
        showLoading && Taro.hideLoading()

        if (res.data.code == 1) {
          setCookie("APPID", res.data.data.appid)
          resolve(res.data.data.appid)
        } else {
          reject()
          handleError("登录失败,请稍后再尝试登录")
        }
      })
      .catch(err => {
        showLoading && Taro.hideLoading()

        reject(err)
        handleError("登录失败,请稍后再尝试登录")
      })
  })
}

/**
 * 获取用户信息
 *
 * @param {boolean} [showLoading=false] - 是否显示loading遮罩
 * @returns
 */
function getUserinfo(showLoading = false) {
  return new Promise((resolve, reject) => {
    // 打开loading遮罩
    if (showLoading) {
      Taro.showLoading({
        title: "获取数据中...", //提示的内容,
        mask: true //显示透明蒙层，防止触摸穿透,
      })
    }

    const code = getQueryVariable("code")
    Taro.request({
      url: process.env.API + "/wechat/login/getUserinfo",
      method: 'POST',
      data: {
        code
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      }
    })
      .then(res => {
        showLoading && Taro.hideLoading()

        if (res.data.code == 1) {
          // 注意:此处要先于loginStore.setToken(res.data.data.sessionkey)执行,因为request sid请求用的getToken()而不是mobx
          setToken(res.data.data.sessionkey)
          loginStore.setToken(res.data.data.sessionkey)
          return resolve({
            sessionkey: res.data.data.sessionkey
          })
        } else if (res.data.code == 40163) {
          reject()
          handleError("登录失败,请点击确定刷新该页面试试", function () {
            Taro.reLaunch({
              url: window.location.href.replace(/&?code=[^&|^#]*/g, "")
            })
          })
        } else {
          reject()
          handleError("登录失败,请稍后再尝试登录")
        }
      })
      .catch(err => {
        showLoading && Taro.hideLoading()

        reject(err)
        handleError("登录失败,请稍后再尝试登录")
      })
  })
}

/**
 * 返回首页
 *
 * @returns
 */
function getIndexURL() {
  return window.location.protocol + '//' + window.location.host + '/'
}

// autorun(()=>{
//   if(process.env.NODE_ENV !== 'production'){
//     console.warn('----------loginStore autorun 监听到了 '+ loginStore.isLogin +'-------------')
//   }
//   /* 每次更新后更新userinfo信息 */
//   if(loginStore.token){
//     setTimeout(() => {
//       userStore.checkUserInfoAsync()
//         .then(()=>{ 
//           if(process.env.NODE_ENV !== 'production'){
//             console.warn('----------loginStore autorun 监听到了 => 用户信息更新成功!-------------')
//           }
//         })   
//         .catch(err=>{
//           console.log(err)
//         }) 
//     }, 0)
//   }else{
//     userStore.removeUserInfo()
//   }
// })

export default loginStore