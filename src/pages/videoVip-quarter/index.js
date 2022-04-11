/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import Swiper from '@/src/lib/swiper'
import store from '../../store'
import { checkReg } from '../../utils/login'

import { couponList, get_lian, vipDiscountCourse, member_reccommend,get_pervipPrice } from "../../api/videoVip"
import { throttle } from '../../utils/util'
import Tabbar from "../../components/Tabbar"
import Title from "../../components/Title"
import Share from "@/src/components/Share"
import { decryption } from "../../utils/aes"
import Chunktitle from "./component/title"
import { removeCookie, getCookie, setCookie } from './../../utils/storage.js'
import "./index.scss"

const { loginStore } = store

@Title("会员")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "会员"
  };

  constructor() {
    super(...arguments)
    this.state = {
      bottomBtn: false,
      famousData: null,
      discountCouser: null,
      famousDataShow: null,
      vipPrice: 99,
      couponList: [],
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {

    await this.get_pervipPrice()
/*暂时注释
    if (this.state.userInfo.lian) {
      Taro.redirectTo({ url: '/pages/videoVip-index' })
    }
    */

    /** 信息更新 */
    if (this.state.userInfo && this.state.userInfo.headimgurl) {
      const data = await this.props.userStore.getUserInfoAsync()
      this.setState({
        userInfo: data
      }, () => {
        if (this.state.userInfo.lian) {
          /*暂时注释
          Taro.redirectTo({ url: '/pages/videoVip-index' })
          */
        }
      })
    }

    Share({
      wx: {
        title: '链链会员', // 分享标题
        desc: `邀请您购买链链会员，课程享受7.5折，100元专属优惠券等权益！`, // 分享描述
        link: `${window.location.href}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: `${this.props.userStore.imgUrl}share_experience_img.png`, // 分享图标
        success: function () {
          // 设置成功
        }
      }
    })
  }

  /** 获取vip价格 */
  get_pervipPrice() {
    return get_pervipPrice({type:2}).then(res => {
      this.setState({ vipPrice: Number(res.data) })
    })
  }

  buyVipNext = () => {
    setTimeout(() => {
      const share_id = this.$router.params.share_id ? this.$router.params.share_id : ''

      if(share_id){
        Taro.navigateTo({ url:'/pages/videoVip-buy-submit?share_id='+ share_id+'&type=2'})
      }else{
        Taro.navigateTo({ url: '/pages/videoVip-buy-submit?type=2'})
      }
    }, 500)
  }

  /** 微信支付 */
  WeixinPay(obj) {
    return new Promise((resolve, reject) => {
      function onBridgeReady() {
        WeixinJSBridge.invoke("getBrandWCPayRequest", obj, function (res) {
          if (res.err_msg == "get_brand_wcpay_request:ok") {
            // 使用以上方式判断前端返回,微信团队郑重提示：
            //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
            return resolve()
          } else if (res.err_msg == "get_brand_wcpay_request:cancel") {
            return reject('已取消支付')
          } else {
            return reject('支付失败')
          }
        })
      }

      if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
          document.addEventListener("WeixinJSBridgeReady", onBridgeReady, false)
        } else if (document.attachEvent) {
          document.attachEvent("WeixinJSBridgeReady", onBridgeReady)
          document.attachEvent("onWeixinJSBridgeReady", onBridgeReady)
        }
      } else {
        onBridgeReady()
      }
    })
  }


  render() {

    return (
      <View className='videoVip videoVipBuy' >
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            boxSizing: "border-box",
            flex: 1,
          }}
          onScroll={this.scrollFn}
        >
          <View className='videoVip__top'>
            <Image className='top__background' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_title.png'></Image><Image className='center__background' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_card.png'></Image>
          </View>
        <View className="center-privilege">
          <View className="center-title">季卡权益</View>
          <Image className='vip-card' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_quanyi.png"></Image>
          <View className="center-title center-gz">活动规则</View>
          <View className='notice'>
            <View className='notice__main'> 1.本次双11活动，增加<span> 赠送季卡会员书籍一本 </span>，价值100元； </View>
            <View className='notice__main'> 2.活动期间购买会员，<span>添加工作人员微信（18664503307）安排地址寄送（包邮）</span></View>
            <View className='notice__main'> 3.季卡客户享受，链链知迅知识服务平台多项服务权限；</View>
            <View className='notice__main'> 4.活动有效期：2020.11.1至11.12。</View>
          </View>
        </View>
          <View className='btn__open ll-cell' onClick={this.buyVipNext}>
            <View className='ll-cell__bt'>{this.state.vipPrice}元立即开通季卡</View>
          </View>
        </ScrollView>
        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
