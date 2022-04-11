import Taro, { Component } from "@tarojs/taro"
import {View} from "@tarojs/components"
import {getShareAPI} from '../../api/share'

// eslint-disable-next-line import/no-commonjs
const wx = require('../../utils/jweixin-1.4.0')

class Index extends Component {

  /** 分享的配置 */
  // eslint-disable-next-line react/sort-comp
  options='' 

  constructor(){
    super(...arguments)

    /* 默认配置 */
    const defaultOpts={
      // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
      wx:{
        title: "LINK链链", // 分享标题
        desc: "找专家,上链链", // 分享描述
        link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png", // 分享图标
        success: function() {
          // 设置成功
        }
      },
      // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
      moments:{
        title: "LINK链链", // 分享标题
        link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png", // 分享图标
        success: function() {
          // 设置成功
        }
      }
    }

    let opts={}
    opts.wx= this.props.wx || defaultOpts.wx
    opts.moments= this.props.moments || defaultOpts.moments

    this.options=opts

  }

  async componentWillMount(){
    if(process.env.TARO_ENV === "h5" && process.env.NODE_ENV !== 'development'){
      await this.init()
      this.share()
    }
  }

  componentWillReceiveProps(nextProps){
    if(process.env.TARO_ENV === "h5" && process.env.NODE_ENV !== 'development'){
      console.log('接收到新属性更新了')
  
      if(nextProps.wx){
        this.options.wx=nextProps.wx
  
        // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
        wx.updateAppMessageShareData(this.options.wx)
      }
      if(nextProps.moments){
        this.options.moments=nextProps.moments
  
        // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
        wx.updateTimelineShareData(this.options.moments)
      }
    }
  }

  /* 微信H5分享 */
  share() {
    // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
    wx.updateAppMessageShareData(this.options.wx)
    // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
    wx.updateTimelineShareData(this.options.moments)
  }

  /* 分享配置初始化 */
  init(){
    return new Promise((resolve,reject)=>{ 
      /* 获取api */
      getShareAPI(window.location.href)
        .then(res=>{ 
          console.log("TCL: res", res)
          wx.config({
            // debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: res.data.appid, // 必填，公众号的唯一标识
            timestamp: res.data.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
            signature: res.data.signature,// 必填，签名
            jsApiList: ['updateAppMessageShareData','updateTimelineShareData'] // 必填，需要使用的JS接口列表
          })
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

  render() {
    return <View></View>
  }
}

export default Index
