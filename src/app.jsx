/* eslint-disable import/first */
import Taro, { Component } from '@tarojs/taro'
import '@tarojs/async-await'
import { Provider } from '@tarojs/mobx'
import Index from './pages/index'

import store from './store'
import '@/src/utils/versionUpdate'
import '@/src/app.scss'

import '@/src/assets/fonts/iconfont.css'

// 如果需要在 h5 环境中开启 React Devtools 
// (process.env.NODE_ENV !== 'production' && )
// 取消以下注释：
if (process.env.TARO_ENV === 'h5') {
  // require('nerv-devtools')
  // var VConsole=require('vconsole/dist/vconsole.min.js')
  // new VConsole()
}
if (process.env.NODE_ENV === 'test') {
  var VConsole = require('vconsole/dist/vconsole.min.js')
  new VConsole()
}

//import './components/musicPlayer/index'

// eslint-disable-next-line import/no-commonjs
// var fundebug = require("fundebug-javascript")

// fundebug.apikey = "6cf2a725cc75bb1ad0faa6e475ed63d12ce40df678f7ec1095ee195b5c752114"

// 取消骨架屏
if(document.querySelector('.Skeleton')){
  document.querySelector('.Skeleton').remove()
}


class App extends Component {

  config = {
    pages: [
      'pages/knowledge',    //首页
      'pages/videoDetail',  //课程视频
      'pages/videoVip-index',//会员页面
      'pages/videoVip-coupon',//会员优惠券页面
      'pages/videoVip-course--select',
      'pages/single-list',
      'pages/single-detail',
      'pages/author',
      'pages/agreement',
      'pages/my-order-detail',
      'pages/my-order',
      'pages/my-course',
      'pages/info-succ',
      'pages/knowledge-sign',
      'pages/knowledge-video',
      'pages/knowledge-offline-detail',
      'pages/knowledge-online-detail',
      'pages/knowledge-online-course',
      'pages/knowledge-online-pay',
      'pages/knowledge-offline-course',
      'pages/knowledge-new-list',
      'pages/expert-detail',
      'pages/search',
      'pages/knowledge-share',
      'pages/stored-card',//储值卡
      'pages/stored-card-detail',//储值卡消费记录
      'pages/profit',//提现金额总览
      'pages/withdraw',//提现金额
      'pages/my',//我的
      'pages/404',
      'pages/my-order-comment',
      'pages/expert-article',
      'pages/videoVip-buy-submit',
      'pages/videoVip-free',
      'pages/videoVip',
      'pages/knowledge-list',
      'pages/supervisor',
      'pages/knowledge-active',
      'pages/my-article',
      'pages/article-detail',
      'pages/article-share',
      'pages/yuyue-success',
      'pages/yuyue-warn',
      'pages/single-success',
      'pages/videoVip-rights',
      'pages/videoVip-new-submit',
      'pages/knowledge-recommend',
      'pages/videoVip-vipfree-course',
      'pages/knowledge-sign-free',
      'pages/alive-list',
      'pages/video-success',
      'pages/knowledge-online-free',
      'pages/yuyue-form',
      'pages/videoVip-exchange',
      'pages/member-card',
      'pages/expert-list',
      'pages/social-list',
      'pages/group',
      'pages/group-detail'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  }

  componentDidMount() { }

  componentDidShow() { }

  componentDidHide() { }

  componentDidCatchError() { }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
