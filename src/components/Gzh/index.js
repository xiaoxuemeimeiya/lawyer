import Taro, { Component } from "@tarojs/taro"
import {
  Image,
  View,
} from "@tarojs/components"
import { inject } from '@tarojs/mobx'
import { decryption } from "../../utils/aes"

import './index.scss'
import {careGzh} from "../../api/expert"


@inject('loginStore', 'userStore')
class Gzh extends Component {

  constructor() {
    super(...arguments)
    this.state = {
      userInfo: decryption(localStorage.getItem('userInfo')) || {},

      closeGzh:false,//关闭/开启弹框
      closeGzhTime:false,//浏览时间大于或者小于20s
      careGzh:false,//关闭/开启公众号二维码
      userClose:localStorage.getItem('userClose') || true,//否/是用户是否关闭了弹框
    }
  }

  componentDidMount() {
    this.checkCare()
  }

  //定时器
  async scan_time(){
    //是否浏览了20s
    var scantime = localStorage.getItem('scan_time') || Date.parse(new Date()) / 1000
    var time = Date.parse(new Date()) / 1000
    console.log(time)
    console.log(scantime)
    console.log(time - scantime)
    if(time - scantime >=20){
      this.setState({
        closeGzhTime:true,
      })
    }else{
      var resttime = 20 - (time - scantime)
      const timer = setInterval(() => {
        console.log(resttime)
        resttime --
        if (resttime === 0) {
          clearInterval(timer)
          this.setState({
            closeGzhTime:true
          })
          //重置用户关闭弹框的动作
          localStorage.setItem('userClose',false)
        }
      }, 1000)
    }
  }


  async checkCare() {
    //查看用户是否登陆
    var user = Object.keys(this.state.userInfo).length
    if(user){
      //用户已经登陆（查看用户是否已经关注我们的公众号）
      careGzh()
          .then(res => {
            //查看用户是否关注
            if(res.state == 1){
              //用户未关注
              var time = localStorage.getItem('loginTime')//上次拜访时间
              if((time && Date.parse(new Date())/1000 > parseInt(time) + 7*24*3600) || !time ){
                //需要重新提示关注（1.超过7天了，2.第一次进入）
                this.setState({
                  closeGzh:true,
                  userClose:false
                })
                localStorage.setItem('userClose',false)
                //查看一下时间浏览时间是否
                this.scan_time()
              }else{
                //不需要重新提示(需要等7天)
                console.log(this.state.userClose)
                console.log(this.state.closeGzh)
                console.log(localStorage.getItem('loginTime'))
              }

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
    }else{
      //用户未登陆
      var time = localStorage.getItem('loginTime')
      if((time && Date.parse(new Date())/1000 > parseInt(time) + 7*24*3600) || !time ){
        //需要重新提示关注（1.超过7天了，2.第一次进入）
        this.setState({
          closeGzh:true,
          userClose:false
        })
        localStorage.setItem('userClose',false)
        //查看一下时间浏览时间是否
        this.scan_time()
      }
      //不需要重新提示

    }
  }

  //关闭弹框
  closeGzh = () => {
    //关闭
    this.setState({closeGzh:false})
    localStorage.setItem('userClose',true)
    localStorage.setItem('loginTime',(Date.parse(new Date()) / 1000))
  }

  //关注公众号
  careGzh = () => {
    //关注
    this.setState({careGzh:true,closeGzh:false})
  }
  //关闭公众号二维码
  ercodeClose = () => {
    this.setState({careGzh:false})
    localStorage.setItem('userClose',true)
    localStorage.setItem('loginTime',(Date.parse(new Date()) / 1000))
  }

  render() {
    return (
        <View>
        {this.state.closeGzh && this.state.closeGzhTime && !this.state.userClose && (
              <View className='care-gzh'>
          <View className='care-desc'>
          <Image className="logo-position" src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/logo_position%402x.png'></Image>
          <View className='logo-detail'>
          <View className='care' onClick={this.careGzh.bind()}>关注</View>
          <Image className='logo-close' onClick={this.closeGzh.bind()} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/logo_icon_closed%402x.png'></Image>
          </View>
          </View>
          </View>
        )}

      {this.state.careGzh && (
      <View className='user-care'>
          <View className='user'>
          <View className='title'>关注</View>
          <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/link_gzh%402x.png'></Image>
          <View className='des'>长按识别关注我们</View>
          <View className='close' onClick={this.ercodeClose.bind()}>取消</View>
          </View>
          </View>
      )}
      </View>
    )
  }
}

export default Gzh
