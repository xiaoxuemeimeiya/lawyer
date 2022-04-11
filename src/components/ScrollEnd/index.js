import Taro, { Component } from "@tarojs/taro"
import { View } from "@tarojs/components"
import "./index.scss"

class Index extends Component {
  static defaultProps = {
    isScrollEnd: false
  };

  constructor() {
    super(...arguments)

    this.state = {
      /** 是否已滑到最底,没有数据了 */
      _isScrollEnd: this.props.isScrollEnd
    }
  }

  componentWillReceiveProps(nextProps) {
    Object.keys(nextProps).forEach(key => {
      this.changeProps(nextProps, key)
    })
  }

  /** 对比props更新 */
  changeProps = (nextProps, key) => {
    if (nextProps[key] !== this.state[`_${key}`]) {
      this.setState({ [`_${key}`]: nextProps[key] })
    }
  };

  render() {
    if (this.state._isScrollEnd) return null

    return (
      <View className='loadingio-spinner-spin-8dz5htwyiau'>
        <View className='ldio-6b4yg0o9ooe'>
          <View>
            <View></View>
          </View>
          <View>
            <View></View>
          </View>
          <View>
            <View></View>
          </View>
          <View>
            <View></View>
          </View>
          <View>
            <View></View>
          </View>
          <View>
            <View></View>
          </View>
          <View>
            <View></View>
          </View>
          <View>
            <View></View>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
