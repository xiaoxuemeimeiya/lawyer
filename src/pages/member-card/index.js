/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Text, Input,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import store from '../../store'
import { choose_card,add_card } from "../../api/expert"
import Title from "../../components/Title"
import { decryption } from "../../utils/aes"
import { setCookie } from './../../utils/storage.js'
import "./index.scss"

const wx = require('../../utils/jweixin-1.4.0')
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
      vipPrice: 0,
      count:60,
      show:false,
      liked:true,
      data:{
        dhcode:'',
        phone:'',
      },
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {

    if (this.state.userInfo.lian) {
      //Taro.redirectTo({ url: '/pages/videoVip-index' })
    }

    /** 信息更新 */
    if (this.state.userInfo && this.state.userInfo.headimgurl) {
      const data = await this.props.userStore.getUserInfoAsync()
      this.setState({
        userInfo: data
      }, () => {
        if (this.state.userInfo.lian) {
          //Taro.redirectTo({ url: '/pages/videoVip-index' })
        }
      })
    }else{
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
    }

    if(JSON.parse(sessionStorage.getItem('shareData'))){
      const data = JSON.parse(sessionStorage.getItem('shareData'))
      wx.config({
        debug: true,
        appId: data.appid, // 必填，公众号的唯一标识
        timestamp: data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.nonceStr, // 必填，生成签名的随机串
        signature: data.signature,// 必填，签名
        jsApiList: ['addCard','chooseCard'] // 必填，需要使用的JS接口列表
      })
      wx.ready((res1)=>{
        console.log(res1)
      })
      wx.error(function(res){
        console.log(res)
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
      })
      return
    }
  }


    getCard = () => {
    // 确认是否登陆
    if (this.state.userInfo && this.state.userInfo.my_famous) {
      //验证验证码

      add_card({  }).then(res1 => {console.log(res1)
        wx.chooseCard({
          shopId: '', // 门店Id
          cardType: res1.data.card_type, // 卡券类型
          cardId: res1.data.card_id, // 卡券Id
          timestamp: res1.data.timestamp, // 卡券签名时间戳
          nonceStr: res1.data.nonceStr, // 卡券签名随机串
          signType: res1.data.signType, // 签名方式，默认'SHA1'
          cardSign: res1.data.cardSign, // 卡券签名
          success: function (res) {
            console.log(res)
            var cardList= res.cardList// 用户选中的卡券列表信息
          },
          error:function (r){
            console.log(r)
          }
        })
      }).catch((res1) => {
        Taro.showToast({
          title: res1.msg,
          icon: res1.code === 1 ? "success" : 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
    } else {
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
    }
  }

    freeVip = () => {
        // 确认是否登陆
        if (this.state.userInfo && this.state.userInfo.my_famous) {
            choose_card({  }).then(res => {console.log(res)
                let ext = '{"code":"","openid":"","timestamp":' +res.data.timestamp+ ', "nonce_str":"' +res.data.nonceStr+ '","signature":"' +res.data.signature+ '"}'

              wx.addCard({
                cardList: [{
                  cardId: res.data.card_id,
                  cardExt: ext
                }], // 需要添加的卡券列表
                success: function (re) {
                  var cardList = re.cardList// 添加的卡券列表信息
                },
                error:function (r){
                  console.log(r)
                }
              })
            }).catch((res1) => {
              Taro.showToast({
                title: res1.msg,
                icon: res1.code === 1 ? "success" : 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
              })
            })

        } else {
            setCookie("Prev_URL", window.location.href)
            Taro.redirectTo({ url: "/pages/author" })
        }
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
            <View className='buySubmit-list'>
              <Image className='img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_1.png" />
            </View>
        </View>
          {/* 姓名和手机号码 */}
        <View className='ll-cells ll-cell--noborder content buySubmit-phone' display={this.state.show}>
          <Text className='text'>兑换链享卡</Text>

          <View className='free_card' onclick={this.getCard}>拉取</View>
          <View className='free_card' onclick={this.freeVip}>领取</View>
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
