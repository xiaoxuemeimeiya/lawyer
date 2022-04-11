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
import { verity_code, free_lian, get_sms } from "../../api/videoVip"
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
      vipPrice: 0,
      count:60,
      show:false,
      liked:true,
      data:{
        name:'',
        phone:'',
        company:'',
      },
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {

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
    }else{
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
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
              clearInterval(timer);
              this.setState({
                liked: true ,
                count: 60
              })
            }
          });
        }, 1000);
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
     // setCookie("Prev_URL", window.location.href)
      //Taro.redirectTo({ url: "/pages/author" })
    }
  }


  freeVip = () => {
    // 确认是否登陆
    if (this.state.userInfo && this.state.userInfo.my_famous) {
      //验证验证码
      verity_code({ phone: this.state.data.phone,code: this.state.data.code }).then(res1 => {console.log(res1)
        Taro.showLoading({ mask: true })
        free_lian({ phone: this.state.data.phone,name:this.state.data.name,company:this.state.data.company }).then(res => {
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/videoVip-buy--success' })
          }, 500)
          Taro.showToast({
            title: res.msg,
            icon: res.code === 1 ? "success" : 'none', //图标,
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
        }).catch((res) => {
          Taro.showToast({
            title: res.msg,
            icon: res.code === 1 ? "success" : 'none', //图标,
            duration: 2000, //延迟时间,
            mask: true //显示透明蒙层，防止触摸穿透,
          })
        })
      }).catch((res1) => {console.log(11111);console.log(res1)
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
          <Text className='text'>免费领取链享卡</Text>
          <View className='ll-cell content__bd'>
             <View className='ll-cell__bd'>
              <Input
              className='ll-input'
              type='text'
              onChange={handleInput.bind(this, "data.name")}
              placeholder='姓名'
              ></Input>
            </View>
          </View>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__bd'>
            <Input
            className='ll-input'
            type='text'
            onChange={handleInput.bind(this, "data.company")}
            placeholder='公司名称/学校名称'
            ></Input>
          </View>
        </View>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__bd'>
              <Input
                className='ll-input'
                type='text'
                onChange={handleInput.bind(this, "data.phone")}
                placeholder='手机号码'
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
            <View className='ll-cell__bd'>
              <Input
              className='ll-input'
              type='text'
              onChange={handleInput.bind(this, "data.code")}
              placeholder='验证码'
              ></Input>
            </View>
          </View>
          <View className='free_card' onclick={this.freeVip}>立即领取</View>
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
