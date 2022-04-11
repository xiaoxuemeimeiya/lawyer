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
import Title from "../../components/Title"
import Share from "@/src/components/Share"
import { decryption } from "../../utils/aes"
import { setCookie } from './../../utils/storage.js'
import "./index.scss"
import {careGzh} from "../../api/expert"
import {student_free_lian} from "../../api/videoVip"

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
      show:false,
      checkout_sign:'',
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
    /** 信息更新 */
    if (this.state.userInfo && this.state.userInfo.headimgurl) {
      const data = await this.props.userStore.getUserInfoAsync()
    }else{
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
    }
    this.care()
    Share({
      wx: {
        title: '链链会员', // 分享标题
        desc: `邀请您享受免费课程、专家咨询等权益！`, // 分享描述
        link: `${window.location.href}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: `${this.props.userStore.imgUrl}share_experience_img.png`, // 分享图标
        success: function () {
          // 设置成功
        }
      }
    })
  }

  care = () => {
    // 确认是否登陆
    var user = Object.keys(this.state.userInfo).length
    if(user){
      //用户已经登陆（查看用户是否已经关注我们的公众号）
      careGzh()
          .then(res => {
            //查看用户是否关注
            if(res.state == 1){
              //用户未关注
                var that = this
              this.setState({
                show: true,
                checkout_sign: setInterval(function(){
                    that.care1()
                },5000)
              })
            }else{
              this.setState({
                show: false
              })
                clearInterval(this.state.checkout_sign)
            }
            //否则已经关注
          })
          .catch(err => {
            console.log(err)
            Taro.showToast({
              title: err.msg ? err.msg : String(err), //提示的内容,
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true, //显示透明蒙层，防止触摸穿透,
            })
          })
    }else {
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
    }
  }

    care1 = () => {
        // 确认是否登陆
        var user = Object.keys(this.state.userInfo).length
        if(user){
            //用户已经登陆（查看用户是否已经关注我们的公众号）
            careGzh()
                .then(res => {
                    //查看用户是否关注
                    if(res.state == 1){
                        //用户未关注
                        var that = this
                        this.setState({
                            show: true,
                        })
                    }else{
                        this.setState({
                            show: false
                        })
                    }
                    //否则已经关注
                })
                .catch(err => {
                    console.log(err)
                    Taro.showToast({
                        title: err.msg ? err.msg : String(err), //提示的内容,
                        icon: 'none', //图标,
                        duration: 2000, //延迟时间,
                        mask: true, //显示透明蒙层，防止触摸穿透,
                    })
                })
        }else {
            setCookie("Prev_URL", window.location.href)
            Taro.redirectTo({ url: "/pages/author" })
        }
    }

  freeVip = () => {
    var user = Object.keys(this.state.userInfo).length
    if(user){
      //用户已经登陆（查看用户是否已经关注我们的公众号）
      careGzh()
          .then(res => {
            //查看用户是否关注
            if(res.state == 1){
              //用户未关注
              this.setState({
                show: true
              })
            }else{
              this.setState({
                show: false
              })
              //已经关注了，去领取会员卡
              student_free_lian({}).then(res1 => {
                setTimeout(() => {
                  Taro.navigateTo({ url: '/pages/videoVip-buy--success' })
                }, 500)
                Taro.showToast({
                  title: res1.msg,
                  icon: res1.code === 1 ? "success" : 'none', //图标,
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
              }).catch((res1) => {
                Taro.showToast({
                  title: res1.msg,
                  icon: res1.code === 1 ? "success" : 'none', //图标,
                  duration: 2000, //延迟时间,
                  mask: true //显示透明蒙层，防止触摸穿透,
                })
              })
            }
            //否则已经关注
          })
          .catch(err => {
            console.log(err)
            Taro.showToast({
              title: err.msg ? err.msg : String(err), //提示的内容,
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true, //显示透明蒙层，防止触摸穿透,
            })
          })
    }else {
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
              <Image className='img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_1%402x.png" />
            </View>
        </View>

          {/* 姓名和手机号码 */}
        <View className='ll-cells ll-cell--noborder content buySubmit-phone'>
          <Text className='text'>会员权益</Text>
          <View className='sixVipPrivilege'>
            <View className='item' >
              <Image className='img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_video.png"/>
              <Text className='text-vip'>直播课2场</Text>
              <Text className='gray-vip'>支持回放</Text>
            </View>
            <View className='item' >
                <Image className='img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_txt.png"/>
                <Text className='text-vip'>课堂资料</Text>
                <Text className='gray-vip'>课件/笔记</Text>
            </View>
            <View className='item' >
                <Image className='img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_answer.png"/>
                <Text className='text-vip'>在线预归类服务</Text>
                <Text className='gray-vip'>尊享5次</Text>
            </View>
            <View className='item' >
                <Image className='img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_phone.png"/>
                <Text className='text-vip'>连线专家3次</Text>
                <Text className='gray-vip'>20分钟/次</Text>
            </View>
            <View className='item' >
                <Image className='img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_course.png"/>
                <Text className='text-vip'>畅享精选课程</Text>
                <Text className='gray-vip'>免费专区</Text>
            </View>
          </View>
          <View className='free_card' onclick={this.freeVip}>立即领取</View>
        </View>
        {this.state.show && (
        <View className='careGzh'>
          <View className='GzhErcode'><Image className="ercode" src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/link_qrcode.jpg'/></View>
        </View>
        )}
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
