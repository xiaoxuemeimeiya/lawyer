import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Button,
  Image,
  Navigator,
  Text,
  RichText,
  Block
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { decryption } from "../../utils/aes"
import Title from "../../components/Title"
import "./index.scss"

@Title("课程详情")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "智汇圈加群"
  }

  constructor() {
    super(...arguments)
    this.state = {
      /** 邀请码 */
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
    /** 信息更新 */
    if (!Object.keys(this.state.userInfo).length ) {
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
    }
    console.log(this.state.userInfo)
    //this.getDataList()
  }


  render() {
    return (
      <View className='group-detail'>
      
          {/* 群内容 */}
          <View className='ll-cells ll-cell--noborder' style={{ overflow: 'auto' }}>
            <View className='ll-cell group-title'>添加小助手微信号，邀请您进群</View>
            <View className='ll-cell group-progress'>添加方法一：点击按钮，返回微信进入【服务通知】添加助手</View>
            <View className='ll-cell group-service'>
              <View className='title'>联系客服</View>
              <View className='right'>></View>
            </View>
            <View className='ll-cell group-progress'>添加方法二：保存二维码图片至手机，打开微信扫码识别添加</View>
            <View className='group-ercode'><Image className='qrcode' src='https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'/></View>
            <View className='ll-cell group-desc'>*如已添加智汇圈小助手为好友，可直接联系小助手回复“加群”即可。</View>
            <View className='group-operate'>操作指引</View>
            <View className='group-operate-ercode'><Image className='operate-qrcode' src='https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'/></View>
          </View>
      </View>
    )
  }
}

export default Index
