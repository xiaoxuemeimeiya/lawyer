import Taro, { Component } from "@tarojs/taro"
import {
  Image,
  View,
} from "@tarojs/components"
import { inject } from '@tarojs/mobx'
import { decryption } from "../../utils/aes"

import './index.scss'


@inject('loginStore', 'userStore')
class Tg extends Component {

  constructor() {
    super(...arguments)
    this.state = {
      userInfo: decryption(localStorage.getItem('userInfo')) || {},
      closeTg:false,//关闭/开启弹框
      newyears:0
    }
  }

  componentDidMount() {
    //this.checkCare()
    this.active()
    this.getTimestamp()
  }
  async active(){
    var enter_status = localStorage.getItem('active_time')

    if(enter_status == 0){
      this.setState({
        closeTg:true,
      })
    }else{
      console.log(enter_status)
      this.setState({
        closeTg:false,
      })
    }
  }
  async checkCare() {
    //查看用户是否登陆
    var user = Object.keys(this.state.userInfo).length
    if(user){
      //用户已经登陆（查看用户是否已经关注我们的公众号）
      var time = localStorage.getItem('TloginTime')//上次拜访时间
      if((time && Date.parse(new Date())/1000 > parseInt(time) + 7*24*3600) || !time ){
        //需要重新提示关注（1.超过7天了，2.第一次进入）
        this.setState({
          closeTg:true,
        })
        localStorage.setItem('TloginTime',(Date.parse(new Date()) / 1000))
      }else{
        //不需要重新提示(需要等7天)
        this.setState({
          closeTg:false,
        })
      }

    }else{
      //用户未登陆
      var time = localStorage.getItem('TloginTime')
      if((time && Date.parse(new Date())/1000 > parseInt(time) + 7*24*3600) || !time ){
        //需要重新提示关注（1.超过7天了，2.第一次进入）
        this.setState({
          closeTg:true,
        })
        localStorage.setItem('TloginTime',(Date.parse(new Date()) / 1000))
      }else{
        this.setState({
          closeTg:false,
        })
      }
      //不需要重新提示

    }
  }

  //关闭弹框
  tgClose = () => {
    //关闭
    this.setState({closeTg:false})
    //localStorage.setItem('TgClose',true)
    //localStorage.setItem('ToginTime',(Date.parse(new Date()) / 1000))

    localStorage.setItem('active_time',1)
  }
  tgKnown = () => {
      localStorage.setItem('active_time',1)
      setTimeout(function(){
          Taro.redirectTo({ url: "/pages/videoVip" })
      },300)

  }

  /**获取优惠时间时间**/
  getTimestamp() { //把时间日期转成时间戳
    //优惠开始时间(2021-01-08 23:59:59)
    var starttime = (new Date('2021/12/24 00:00:00')).getTime() / 1000
    var endtime = (new Date('2021/12/28 23:59:59')).getTime() / 1000
    var time = (new Date()).getTime() / 1000
    if(time >= starttime && time <= endtime){
      //活动期间
      this.setState({ newyears: 1 })
    }else{
      this.setState({ newyears: 0 })
    }
  }

  render() {
    return (
    <View>
        {this.state.closeTg && this.state.newyears==1 &&
        <View className='tg-care'>
            <View className='user'>
              {/*
              <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/pic_main%402x.png'></Image>
              <Image className='close'onClick={this.tgClose.bind()}  src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/icon_close%402x.png'></Image>
              <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/double.png'></Image>
              */}
              <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/pic_main3%402x.png'></Image>
              <Image className='known-more'onClick={this.tgKnown.bind()}  src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/btn_bg3%402x.png'></Image>
            </View>
            <Image className='right-close'onClick={this.tgClose.bind()}  src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/icon_close%402x.png'></Image>
        </View>
        }
    </View>
    )
  }
}

export default Tg
