import Taro, { Component } from "@tarojs/taro"
import { View } from "@tarojs/components"
import "./LL_loading.scss"

class Index extends Component {
  render() {
    // H5环境取消下拉刷新功能
    if (process.env.TARO_ENV === "h5") {
      return null
    } else {
      return (
        <View className='ll-loading'>
          <View className='ll-spinner'>
            <View className='ll-spinner-item bounce1'></View>
            <View className='ll-spinner-item bounce2'></View>
            <View className='ll-spinner-item bounce3'></View>
          </View>
        </View>
      )
    }
  }
}

export default Index
