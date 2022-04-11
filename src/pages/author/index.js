import Taro, { Component } from "@tarojs/taro"
import {
  View
} from "@tarojs/components"

import store from '../../store'

const {loginStore} = store 

class Index extends Component {
  config = {
    navigationBarTitleText: "登录"
  };

  componentWillMount() {}

  componentDidMount() {}

  componentDidShow(){
    loginStore.login()
  }

  render() {
    return (
      <View className='Index'>
      </View>
    )
  }
}

export default Index
