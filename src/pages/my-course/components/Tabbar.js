import Taro, { Component } from "@tarojs/taro"
import {
  View,
  Navigator,
} from "@tarojs/components"

import "../index.scss"

class Index extends Component {
  render() {
    return (
      <View className='tabbar ll-cells'>
        <View className='ll-cell tabbar__bd'>
          <Navigator url='/' className='ll-cell__bd'>
            <View className='icon icon-bottom-1a'></View>
            <View className='tabbar__title'>首页</View>
          </Navigator>
          <Navigator url='/pages/club' className='ll-cell__bd'>
            <View className='icon icon-bottom-4a'></View>
            <View className='tabbar__title'>俱乐部</View>
          </Navigator>
          <View url='/pages/my-course' className='ll-cell__bd'>
            <View className='icon icon-bottom-5b'></View>
            <View className='tabbar__title color-primary'>我的学习</View>
          </View>
          {/* <Navigator url='/' className='ll-cell__bd'>
            <View className='icon icon-bottom-2a'></View>
            <View className='tabbar__title'>全部课程</View>
          </Navigator> */}
          <Navigator url='/pages/my' className='ll-cell__bd'>
            <View className='icon icon-bottom-3a'></View>
            <View className='tabbar__title'>个人中心</View>
          </Navigator>
        </View>
      </View>
    )
  }
}

export default Index
