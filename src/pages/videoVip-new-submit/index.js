/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text, Input, Button,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import Swiper from '@/src/lib/swiper'
import store from '../../store'
import { couponList, get_lian,new_lian,verity_code, is_verify, get_sms, get_vipPrice ,get_pervipPrice } from "../../api/videoVip"
import { throttle } from '../../utils/util'
import Tabbar from "../../components/Tabbar"
import Title from "../../components/Title"
import Share from "@/src/components/Share"
import { decryption } from "../../utils/aes"
import Chunktitle from "./component/title"
import { setCookie } from './../../utils/storage.js'
import {handleInput} from '../../utils/util'
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
      vipPrice: 68,
      count:60,
      show:false,
      liked:true,
      data:{
        name:'',
        phone:'',
      },
      isFirstLoding: true,
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {

    //await this.getVipPrice()
    await this.get_pervipPrice()
    await this.getverify()

    /** 信息更新 */
    /*
    if (this.state.userInfo && this.state.userInfo.headimgurl) {
      const data = await this.props.userStore.getUserInfoAsync()
      this.setState({
        userInfo: data
      }, () => {
        if (this.state.userInfo.lian) {
          //Taro.redirectTo({ url: '/pages/videoVip-index' })
        }
      })
    }
    */

/*
    couponList().then(res => {
      this.setState({ couponList: res.data })
    })
    */

    this.state.isFirstLoding && this.setState({ isFirstLoding: false })

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

  get_pervipPrice() {
    const type = this.$router.params.type ? this.$router.params.type : ''
    return get_pervipPrice({type:type}).then(res => {
      this.setState({ vipPrice: Number(res.data) })
    })
  }

  /** 获取手机号验证 */
  getverify() {
    return is_verify().then(res => {
      this.setState({ show: res.data== true? true : false })
    })
  }


  sms = () => {
    // 确认是否登陆
    if (this.state.userInfo && this.state.userInfo.my_famous) {
      Taro.showLoading({ mask: true })
      get_sms({ type: 1,phone:this.state.data.phone }).then(result => {console.log(result)
        let count = this.state.count
        console.log(count)
        const timer = setInterval(() => {
          this.setState({ count: (count--), liked: false }, () => {
            if (count === 0) {
              clearInterval(timer)
              this.setState({
                liked: true ,
                count: 60
              })
            }
          })
        }, 1000)
        Taro.showToast({
          title: result.msg,
          icon: result.code === 1 ? "success" : 'none', //图标,
          duration: 1000, //延迟时间,
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
      }).catch((result) => {
        Taro.showToast({
          title: result.msg,
          icon: result.code === 1 ? "success" : 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
    } else {
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
    }
  }


  buyVip = () => {
    // 确认是否登陆
    if(this.state.userInfo && this.state.userInfo.lian == 1){
      Taro.showToast({
        title: '您已经是会员',
        icon:  'none', //图标,
        duration: 2000, //延迟时间,
        mask: true //显示透明蒙层，防止触摸穿透,
      })
      return false
    }
    if (this.state.userInfo && this.state.userInfo.my_famous) {
      //验证验证码
      verity_code({ phone: this.state.data.phone,code: this.state.data.code }).then(res1 => {console.log(res1)
        Taro.showLoading({ mask: true })
        const share_id = this.$router.params.share_id ? this.$router.params.share_id : ''
        const share_code = this.$router.params.share_code ? this.$router.params.share_code : ''
        const type = this.$router.params.type ? this.$router.params.type : ''
        new_lian({ total_fee: this.state.vipPrice ,top_id:share_id ,code:share_code,lian_type:type}).then(res => {
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
      }).catch((res1) => {
        Taro.showToast({
          title: res1.msg,
          icon: res1.code === 1 ? "success" : 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
        setTimeout(() => {
          res1.code === '13' && Taro.navigateTo({ url: '/pages/videoVip-index' })
        }, 1000)
      })
    } else {
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
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
        <View>
         {/* 权益 */}
         <View className='sixPrivilege'>
            <View className='buySubmit-title'>链链知迅</View>
            <View className='buySubmit-list'>
              <Image className='img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/lian-card.png" />
              <Text className='text'>链链会员卡--链享卡</Text>
              <Text className='text-price'>￥{this.state.vipPrice}</Text>
            </View>
        </View>

          {/* 姓名和手机号码 */}
        <View className='ll-cells ll-cell--noborder content buySubmit-phone' display={this.state.show}>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__hd content__label content__label--title'> 手机号码 </View>
            <View className='ll-cell__bd'>
              <Input
                className='ll-input'
                type='text'
                onChange={handleInput.bind(this, "data.phone")}
                placeholder='请输入您的手机号码'
                    ></Input>
    {
      this.state.liked ?
    <
      View
      onclick = {this.sms}
      className = 'very-code' > 获取验证码 < /View>
    :
    <
      View
      className = 'very-code' > {this.state.count + 's'} < /View>
    }
            </View>
          </View>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__hd content__label content__label--title'> 验证码 </View>
            <View className='ll-cell__bd'>
              <Input
              className='ll-input'
              type='text'
              onChange={handleInput.bind(this, "data.code")}
              placeholder='请输入您的验证码'
              ></Input>
            </View>
          </View>
        </View>

        {/* 底部栏 */}
        <View className='ll-cells ll-cell--noborder bottom'>
              <View className='ll-cell bottom__bd'>
              <View className='ll-cell__bd'>
              <View className='price'><Text className='small'>¥</Text>{this.state.vipPrice}</View>
          </View>
          <View className='ll-cell__ft'>
              <Button className='btn bottom__btn btn-pay' onClick={this.buyVip}>支付{this.state.vipPrice}元</Button>
          </View>
          </View>
          </View>
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
