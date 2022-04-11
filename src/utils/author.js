import Taro from "@tarojs/taro"

import { setToken, removeToken } from "./auth"
import { getCookie, removeCookie, setCookie } from "./storage"
import { getQueryVariable } from "./util"

const API = process.env.API

function login(obj = {}) {
  // 配置项
  const {
    showLoading = false // 是否显示loading加载提示
  } = { ...obj }

  // 清除原有登录信息
  removeToken()

  if (getQueryVariable("code")) {
    return getUserinfo(showLoading).then(() => {
      const Prev_URL=getCookie("Prev_URL") || getIndexURL()
      removeCookie("Prev_URL")
      window.location.replace(Prev_URL)
    })
  }

  getAppId(showLoading).then(appid => {
    var url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${window.location.href}&response_type=code&scope=snsapi_userinfo&state=${Math.floor(Math.random()*1000)}#wechat_redirect`
    window.location.replace(url)
  })
}

/**
 * 处理错误
 *
 * @param {*} str
 * @param {*} fn
 */
function handleError(str, fn) {
  fn =
    fn ||
    function() {
      removeCookie("APPID")
      Taro.reLaunch({ url: getIndexURL() })
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

    if(getCookie("APPID")){
      showLoading && Taro.hideLoading()
      return resolve(getCookie("APPID"))
    }

    Taro.request({
      url: API + "/wechat/login/index",
      method:'POST',
      header: {
        "content-type": "application/x-www-form-urlencoded"
      }
    })
      .then(res => {
        showLoading && Taro.hideLoading()

        if (res.data.code == 1) {
          setCookie("APPID",res.data.data.appid)
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

    const code=getQueryVariable("code")
    Taro.request({
      url: API + "/wechat/login/getUserinfo",
      method:'POST',
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
          setToken(res.data.data.sessionkey)
          return resolve({
            sessionkey: res.data.data.sessionkey
          })
        } else if (res.data.code == 40163) {
          reject()
          handleError("登录失败,请点击确定刷新该页面试试", function() {
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
function getIndexURL(){
  return window.location.protocol+'//'+window.location.host+'/'
}

export default login
