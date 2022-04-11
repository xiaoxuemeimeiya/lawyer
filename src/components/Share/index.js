import Taro, { Component } from '@tarojs/taro'
import {getShareAPI} from '../../api/share'

import {tryToCall} from '../../utils/tryToCall'
// eslint-disable-next-line import/no-commonjs
const wx = require('../../utils/jweixin-1.4.0')

/* 分享配置初始化 */
function init () {
  return new Promise((resolve,reject)=>{
    // 有获取过分享的api数据就不重新获取了
    if(JSON.parse(sessionStorage.getItem('shareData'))){
      const data = JSON.parse(sessionStorage.getItem('shareData'))
      wx.config({
        debug: false,
        appId: data.appid, // 必填，公众号的唯一标识
        timestamp: data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.nonceStr, // 必填，生成签名的随机串
        signature: data.signature,// 必填，签名
        jsApiList: ['updateAppMessageShareData','updateTimelineShareData','onMenuShareAppMessage','onMenuShareTimeline'] // 必填，需要使用的JS接口列表
      })
      wx.ready(()=>{
        resolve(wx)
      })
      return
    }
    /* 获取api */
    getShareAPI(window.location.href)
      .then(res=>{ 
        console.log("TCL: res", res)
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: res.data.appid, // 必填，公众号的唯一标识
          timestamp: res.data.timestamp, // 必填，生成签名的时间戳
          nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
          signature: res.data.signature,// 必填，签名
          jsApiList: ['updateAppMessageShareData','updateTimelineShareData','onMenuShareAppMessage','onMenuShareTimeline'] // 必填，需要使用的JS接口列表
        })
        sessionStorage.setItem('shareData',JSON.stringify(res.data))
        wx.ready(()=>{
          resolve(wx)
        })
      })   
      .catch(err=>{
        console.log(err)
        Taro.showToast({ 
          title: err.msg?err.msg:String(err), //提示的内容, 
          icon: 'none', //图标, 
          duration: 2000, //延迟时间, 
          mask: true, //显示透明蒙层，防止触摸穿透, 
        }) 
        reject(err)
      }) 
  }) 
}

function Share(n){
  let options=n||{}

  // 有传数据的就是自定义分享的
  if(n && n.wx){
    init().then(() => {
      // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
      wx.updateAppMessageShareData(options.wx)
      wx.onMenuShareAppMessage(options.wx)
      // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0)
      wx.updateTimelineShareData(options.moments || options.wx)
      wx.onMenuShareTimeline(options.moments || options.wx)
    })
    return
  }
  return function (WrappedComponent){
    return class extends Component{
      static displayName=`Share(${WrappedComponent.displayName})`
      
      constructor(){
        super(...arguments)
        /* 默认配置 */
        const defaultOpts={
          // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
          wx:{
            title: "链链知迅-全球贸易合规知识服务平台 ", // 分享标题
            desc: "直播+课程+链接专家+精选服务，为您的工作与成长提速增效", // 分享描述
            link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: "http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.2/icon_ll_logo.jpg", // 分享图标
            success: function() {
              // 设置成功
            }
          },
          // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
          moments:{
            title: "链链知迅-全球贸易合规知识服务平台", // 分享标题
            link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: "http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.2/icon_ll_logo.jpg", // 分享图标
            success: function() {
              // 设置成功
            }
          }
        }

        let opts={}
        opts.wx= options.wx || defaultOpts.wx
        opts.moments= options.moments || defaultOpts.moments
        this.options=opts

      }

      componentDidMount(){
        process.env.TARO_ENV === "h5" && this.share()
      }

      componentDidShow(){
        tryToCall(this.wrappedRef.componentDidShow, this.wrappedRef)
      }

      /* 微信H5分享 */
      share() {
        init().then(() => {
          // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
          wx.updateAppMessageShareData(this.options.wx)
          // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
          wx.updateTimelineShareData(this.options.moments)
        })
      }

      render(){
        console.log("----------------组件已被Share HOC 劫持----------------")
        return <WrappedComponent ref={ref => { this.wrappedRef = ref }} {...this.props} />
      } 
    }
  }
}

export default Share