import Taro, { Component } from "@tarojs/taro"
import {
  View
} from "@tarojs/components"

class Index extends Component {
  config = {
    navigationBarTitleText: "报错了"
  };

  componentWillMount() {}

  componentDidMount() {}

  render() {
    return (
      <View className='Index'>
        404
      </View>
    )
  }
}

export default Index
