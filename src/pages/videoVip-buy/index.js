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

import { couponList, get_lian, vipDiscountCourse, member_reccommend, get_vipPrice } from "../../api/videoVip"
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

    await this.getVipPrice()

    if (this.state.userInfo.lian) {
      Taro.redirectTo({ url: '/pages/videoVip-index' })
    }

    /** 信息更新 */
    if (this.state.userInfo && this.state.userInfo.headimgurl) {
      const data = await this.props.userStore.getUserInfoAsync()
      this.setState({
        userInfo: data
      }, () => {
        if (this.state.userInfo.lian) {
          Taro.redirectTo({ url: '/pages/videoVip-index' })
        }
      })
    }


    let that = this

    this.getVipDiscountCourse()
    await this.getMember_reccommend()

    new Swiper('.swiper-container', {
      loop: true,
      initialSlide: 2,
      slidesPerView: 4, // 显示5个
      centeredSlides: true,
      spaceBetween: -15,
      effect: 'coverflow',
    })

    couponList().then(res => {
      this.setState({ couponList: res.data })
    })

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
  getVipPrice() {
    return get_vipPrice().then(res => {
      this.setState({ vipPrice: Number(res.data) })
    })
  }

  /** 获取7.5折课程数据 */
  getVipDiscountCourse = () => {
    vipDiscountCourse().then(res => {
      const all = {}
      all.a = res.data.splice(0, 4)
      all.b = res.data.splice(0, 4)
      all.c = res.data.splice(0, 4)
      all.a = [...all.a, ...all.a]
      all.b = [...all.b, ...all.b]
      all.c = [...all.c, ...all.c]
      this.setState({ discountCouser: all })
    })
  }

  /** 专属免费专区数据 */
  getMember_reccommend = () => {
    return member_reccommend().then(res => {
      if (res.code === 1) {
        let famousDataShow = []
        if (res.data.length < 4) {
          famousDataShow = [...res.data, ...res.data]
        } else {
          famousDataShow = [...res.data]
        }
        let famousData = []
        if (res.data.length > 4) famousData = res.data.splice(0, 4)
        else famousData = res.data


        return this.setState({ famousData, famousDataShow }, () => {
          return true
        })
      }
    })
  }

  /** 获取优惠券列表 */

  scrollFn = throttle(() => {
    const $tabsBox = document.querySelector(".btn--black")
    const top = $tabsBox.getBoundingClientRect().top
    this.setState({ bottomBtn: top < 2 })
  }, 100)

  buyVipNext = () => {
    setTimeout(() => {
      const share_id = this.$router.params.share_id ? this.$router.params.share_id : ''

      if(share_id){
        Taro.navigateTo({ url:'/pages/videoVip-buy-submit?share_id='+ share_id})
      }else{
        Taro.navigateTo({ url: '/pages/videoVip-buy-submit' })
      }
    }, 500)
  }

  buyVip = () => {
    // 确认是否登陆
    if (this.state.userInfo && this.state.userInfo.my_famous) {
      Taro.showLoading({ mask: true })
      const share_id = this.$router.params.share_id ? this.$router.params.share_id : ''
      get_lian({ total_fee: this.state.vipPrice,code:share_id }).then(res => {
        this.WeixinPay(res.data).then(result => {
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/videoVip-buy--success' })
          }, 500)
          Taro.showToast({
            title: result.msg,
            icon: result.code === 1 ? "success" : 'none', //图标,
            duration: 500, //延迟时间,
            mask: true //显示透明蒙层，防止触摸穿透,
          }).catch(err => {
            console.log(err)
            Taro.showToast({
              title: err.msg ? err.msg : String(err), //提示的内容, 
              icon: 'none', //图标, 
              duration: 1000, //延迟时间, 
              mask: true, //显示透明蒙层，防止触摸穿透, 
            })
          })
        })

      }).catch((res) => {
        Taro.showToast({
          title: res.msg,
          icon: res.code === 1 ? "success" : 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
        setTimeout(() => {
          res.code === '13' && Taro.navigateTo({ url: '/pages/videoVip-index' })
        }, 1000)
      })
    } else {
      setCookie("Prev_URL", window.location.href)
      Taro.navigateTo({ url: "/pages/author" })
    }
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

    const sixPrivilege = [
      { url: 'icon_75@2x.png', text: "所有产品享受7.5折" },
      { url: 'icon_free@2x.png', text: "享受会员免费专区" },
      { url: 'icon_famous_course@2x.png', text: "名家课免费学两门" },
      { url: 'icon_coupon@2x.png', text: "100元专属优惠券" },
      { url: 'icon_card_1@2x.png', text: "9张体验卡" },
      { url: 'icon_id@2x.png', text: "专属身份标识" },
    ]
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
            <Image className='top__background' src={this.props.userStore.imgUrl + 'pic_membercard@2x.png'}></Image>
            <View className='btn btn--black' onClick={this.buyVipNext}>{this.state.vipPrice}元/年 立即开通</View>
          </View>
          <Chunktitle title_mian='会员权益' title__subhead='六大权益'></Chunktitle>

          {/* 权益 */}
          <View className='sixPrivilege'>
            {
              sixPrivilege.map((v, k) =>
                <View className='item' key={k}>
                  <Image className='img' src={this.props.userStore.imgUrl + v.url} />
                  <Text className='text'>{v.text}</Text>
                </View>
              )
            }
          </View>
          <Chunktitle title_mian='线上课程7.5折' title__subhead='所有产品享受7.5折'></Chunktitle>
          <View className='discountCourse'>
            <View className='courseItem course1 clearfix'>
              {
                this.state.discountCouser &&
                this.state.discountCouser.a.map((v, k) =>
                  <Image key={k} src={v.cover_img} className='imgs'></Image>
                )
              }
            </View>
            <View className='courseItem course2 clearfix'>
              {
                this.state.discountCouser &&
                this.state.discountCouser.b.map((v, k) =>
                  <Image key={k} src={v.cover_img} className='imgs'></Image>
                )
              }
            </View>
            <View className='courseItem course3 clearfix'>
              {
                this.state.discountCouser &&
                this.state.discountCouser.c.map((v, k) =>
                  <Image key={k} src={v.cover_img} className='imgs'></Image>
                )
              }
            </View>
          </View>
          <Chunktitle title_mian='专属会员专区' title__subhead='享受会员免费专区'></Chunktitle>

          <View className='vipFree'>
            {this.state.famousData && this.state.famousData.map(v =>
              <Navigator className='navigatorLable' key={v.id} url={`/pages/knowledge-online-detail?id=${v.id}`}>
                <View className='vipFree__item'>
                  <Image className='img' src={v.cover_img || this.props.userStore.imgUrl + 'icon_id@2x.png'}></Image>
                  <View className='vipFree__content'>
                    <View className='title ellipsis'>{v.name}</View>
                    <View className='else'>
                      <Text className='prize'>¥{v.price}</Text>
                      <Text className='redText'>会员免费</Text>
                    </View>
                  </View>
                </View>
              </Navigator>
            )}
          </View>

          <Chunktitle title_mian='名家课程免费学' title__subhead='名家课免费学两门'></Chunktitle>
          <View className='courseFree'>
            {/* 轮播图 */}
            <View className='swiper-container'>
              <View className='swiper-wrapper'>
                {
                  this.state.famousDataShow && this.state.famousDataShow.map((item, index) =>
                    <View key={'famousData' + index} className='swiper-slide'>
                      <Navigator url={`/pages/knowledge-online-detail?id=${item.id}`}>
                        <Image className='swiper__img' src={item.cover_img} />
                      </Navigator>
                      <View className='swiper__docs'>
                        <View className='course__title ellipsis-2'>
                          {item.name}
                        </View>
                        <View className='course__subhead ellipsis'>
                          {item.us_regist_name + '·' + item.chainman}
                        </View>
                      </View>
                    </View>
                  )
                }
              </View>
            </View>
          </View>

          <Chunktitle title_mian='100元专属优惠券' title__subhead='优惠券与7.5折优惠可以同时使用'></Chunktitle>

          <View className='couponList'>
            {this.state.couponList.map(v =>
              <View key={v.id} className='main__couponItem'>
                <Image className='coupon__background' src={this.props.userStore.imgUrl + 'bg_tik_nor.png'} />
                <View className='money'>
                  <Text className='money__main'>¥{v.amount}</Text>
                  <Text className='small'>满{v.suit_amount}元使用</Text>
                </View>
                <View className='coupon__docs'>
                  <View className='docs__mian'>用于线上课程</View>
                  <View className='docs__subhead'>每月更新</View>
                </View>
                <View className='btn'>领取</View>
              </View>
            )}
          </View>

          <View className='banner1'>
            <Image className='img' src={this.props.userStore.imgUrl + 'bg_card_s@2x.png'}></Image>
            <View className='banner1__left'>
              <Text className='mian__docs'>9张链享体验卡</Text>
              <Text className='subhead__docs'>开通即可送给好友</Text>
            </View>
            <View className='banner1__right'>
              立即开通
            </View>
          </View>

          <View className='notice'>
            <View className='notice__main'>
              购买须知
                </View>
            <View className='notice__subhead'>
              会员服务为虚拟产品，一经出售暂不支持退款。
                </View>
          </View>

          <View className={['btn__open ll-cell', !this.state.bottomBtn && 'hide']} onClick={this.buyVipNext}>
            <Image className='btn_background' src={this.props.userStore.imgUrl + 'bg_btn@2x.png'} />
            <Image className='textImg' src={this.props.userStore.imgUrl + 'icon_member_font@2x.png'} />
            <View className='ll-cell__bd'>{this.state.vipPrice}元/年</View>
            <View className='ll-cell__ft'>立即开通</View>
          </View>

        </ScrollView>

        <Tabbar></Tabbar>
        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
