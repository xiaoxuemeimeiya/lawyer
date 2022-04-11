// Taro.request 封装
import Taro from "@tarojs/taro"
import Qs from 'qs'
import {getToken,removeToken} from './auth.js'
import {removeCookie,getCookie,setCookie} from './storage.js'
import { CODE } from '../utils/constant'

const API=process.env.API

class Request {

  get(url, data = {}) {
    return new Promise((resolve, reject) => {
      request(url, data,{method:'GET'},resolve, reject)
    })
  }

  post(url, data = {}) {
    return new Promise((resolve, reject) => {
      request(url, data,{method:'POST'},resolve, reject)
    })
  }

}

var request =function (url, data, config={}, successCbk, errorCbk) {
  var token=""
  // 如果有token，添加到sid参数中(sid:token)
  if(getToken()){
    token=getToken()
  }
  // console.log(`#### ${url} 开始请求...`);
  // let start = +new Date();
  let {
    method='GET',
    contentType='application/x-www-form-urlencoded',
    // contentType='application/json',
    ...otherConfig
  }={...config}
  let URL=API+url
  return Taro.request({
    url:URL,
    data:Qs.stringify(data),
    header:{
      'content-type': contentType,
      'sid':token,
    },
    method,
    ...otherConfig,
    success: (res)=>{
      // 全局拦截
      const resData=res.data
      Taro.hideLoading()
      if (resData.code == CODE.SUCC) {
        successCbk(resData)
      }else if([CODE.USER_ERROR,CODE.UNREG].indexOf(+resData.code)>-1){
        // USER_ERROR:7, 用户信息出错！请重新登录试试看
        console.warn("--------------用户信息出错！请重新登录试试看---------------")
/*
        if(!getCookie("THROTTLE")){
          setCookie("THROTTLE",true)
          setTimeout(() => {
            setCookie("THROTTLE",false)
            removeToken()
            setCookie("Prev_URL", window.location.href)
            Taro.navigateTo({ url: "/pages/author" })
          }, 200)
        }
        */
        setTimeout(() => {
          setCookie("THROTTLE",false)
          removeToken()
          setCookie("Prev_URL", window.location.href)
          Taro.navigateTo({ url: "/pages/author" })
        }, 200)
        
        errorCbk()
      }else if([CODE.TOKEN_INVALID].indexOf(+resData.code)>-1){
        // USER_ERROR:5, 系统升级中!
        Taro.showModal({
          title:"提示",
          content:'系统升级中!',
          showCancel:false,
          confirmColor:'#D62419',
          success(){
            Taro.reLaunch({
              url: '/pages/404'
            })
          }
        })
      }else if([CODE.UNLOGIN,CODE.TOKEN_OVERDUE,CODE.TOKEN_TYRAGAIN,CODE.MISS_PARAM].indexOf(+resData.code)>-1){
        Taro.showModal({
          title:"提示",
          content:"登录失效，请重新登录！",
          showCancel:false,
          confirmColor:'#D62419',
          success(){
            removeToken()
            setCookie("Prev_URL", window.location.href)
            Taro.navigateTo({ url: "/pages/author" })
          }
        })
      }else{
        errorCbk && errorCbk(resData)
      }
    },
    fail: (error) => {
      console.error(`#### ${url} 请求失败：`, error)
      errorCbk && errorCbk(new Error('网络不给力，请检查网络设置！'))
    },
    complete: () => {
      // console.log(`#### ${url} 请求完成！`);
      // console.log(`#### ${url} 本次请求耗时：`, (+new Date()) - start, 'ms');
    }
  })
}

export default Request