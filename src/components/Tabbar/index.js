import Taro, { Component } from "@tarojs/taro"
import {
  View,
} from "@tarojs/components"
import { inject } from '@tarojs/mobx'
import { decryption } from "../../utils/aes"

import './index.scss'


@inject('loginStore', 'userStore')
class Index extends Component {

  constructor() {
    super(...arguments)
    this.state = {
      /** 当前页面的url */
      url: window.location.hash.replace('#', ''),
      userInfo: decryption(localStorage.getItem('userInfo')) || {},
      bottom: false
    }
  }

  componentDidMount() {

    try {
      let ua = window.navigator.userAgent.toLowerCase()
      if (!ua.match('micromessenger')) return
      setTimeout(() => this.isIPhoneX(), 100)
      const checkIsIphone = setInterval(() => {
        this.isIPhoneX()
        if (!this.state.bottom) clearInterval(checkIsIphone)
      }, 1000)
    } catch (err) { }
  }

  componentWillUnmount() {
    this.setState({ bottom: false })
  }

  isIPhoneX() {
    let isIphone = /iphone/gi.test(window.navigator.userAgent)
    let windowW = window.screen.width
    let windowH = window.screen.height
    let pixelRatio = window.devicePixelRatio

    let isIPhoneX = isIphone && pixelRatio && pixelRatio === 3 && windowW === 375 && windowH === 812
    let isIPhoneXSMax = isIphone && pixelRatio && pixelRatio === 3 && windowW === 414 && windowH === 896
    let isIPhoneXR = isIphone && pixelRatio && pixelRatio === 2 && windowW === 414 && windowH === 896

    if ((isIPhoneX || isIPhoneXSMax || isIPhoneXR) && (window.outerHeight > 800)) {
      this.setState({ bottom: true })
    } else {
      this.setState({ bottom: false })
    }
  }


  /**
   * @param {url} url 跳转的url
   */
  tolink(url) {
    if (this.state.url === url) return
    // 判断是否链享会员 跳转到开通的页面还是未开通页面
    // 当不是链享会员的时候 却跳到了会员的详情页 就让他去购买页
    if (url === '/pages/videoVip-index' || url === '/pages/videoVip-buy') {
      if (this.state.userInfo.isVip > 0) {
        Taro.navigateTo({ url: '/pages/videoVip-index' })
      } else {
        //Taro.navigateTo({ url: '/pages/videoVip-buy' })
        Taro.navigateTo({ url: '/pages/videoVip' })
      }
      return
    }
    Taro.navigateTo({ url })
  }

  render() {
    return (
      <View className='tabbar ll-cells'>
        <View className='tabbarHeader ll-cell tabbar__bd'>
          <View onClick={this.tolink.bind(this, '/')} className='ll-cell__bd'>
            <View className={['icon', (this.state.url === '/' || this.state.url === '') ? 'icon-bottom-1b' : 'icon-bottom-1a']}></View>
            <View className={['tabbar__title', (this.state.url === '/' || this.state.url === '') ? 'color-primary' : '']}>首页</View>
          </View>
    {/*}
          <View onClick={this.tolink.bind(this, '/pages/club')} className='ll-cell__bd'>

            <View className={['icon', this.state.url === '/pages/club' ? 'icon-bottom-4b' : 'icon-bottom-4a']}></View>
            <View className={['tabbar__title', this.state.url === '/pages/club' ? 'color-primary' : '']}>俱乐部</View>

          </View>
          */}
          <View onClick={this.tolink.bind(this, '/pages/videoVip-index')} className='ll-cell__bd'>

            <View className={['icon', this.state.url.match('/pages/videoVip') ? 'icon-bottom-6b' : 'icon-bottom-6a']}></View>
            <View className={['tabbar__title', this.state.url.match('/pages/videoVip') ? '' : '']}>会员</View>

          </View>
          <View onClick={this.tolink.bind(this, '/pages/supervisor')} className='ll-cell__bd'>

            <View className={['icon', this.state.url === '/pages/supervisor' ? 'icon-bottom-5b' : 'icon-bottom-5a']}></View>
            <View className={['tabbar__title', this.state.url === '/pages/supervisor' ? 'color-primary' : '']}>发需求</View>

          </View>
          <View onClick={this.tolink.bind(this, '/pages/my')} className='ll-cell__bd'>

            <View className={['icon', this.state.url === '/pages/my' ? 'icon-bottom-3b' : 'icon-bottom-3a']}></View>
            <View className={['tabbar__title', this.state.url === '/pages/my' ? 'color-primary' : '']}>个人中心</View>

          </View>

        </View>
        <View className={`${!this.state.bottom && 'hide'}`} style={{ height: '20px' }}></View>
      </View>
    )
  }
}

export default Index
