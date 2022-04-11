import Taro, { Component } from "@tarojs/taro"
import { View, Image, Navigator } from "@tarojs/components"
import { inject } from '@tarojs/mobx'
import "./index.scss"

@inject('userStore')
class Index extends Component {

  constructor() {
    super(...arguments)
    this.state = {
      show: !localStorage.getItem('videoVipTips') || true
    }
  }

  closeDialog = () => {
    this.setState({ show: false })
    localStorage.setItem('videoVipTips', 'used')
  }

  toBuy = () => {
    localStorage.setItem('videoVipTips', 'used')
    Taro.navigateTo({ url: '/pages/videoVip-buy' })
  }

  render() {
    return (
      <View>
        {
          this.state.show &&
          <View className={['videoVipCard']}>
            <View className='content'>
              <Image className='main' src={this.props.userStore.imgUrl + 'pic_missed.png'} />
              <Image className='closeBtn' onClick={this.closeDialog} src={this.props.userStore.imgUrl + 'icon_closed.png'} />
              <View className='btn' onClick={this.toBuy}>
                立即续费
                </View>
            </View>
          </View>
        }
      </View>
    )
  }
}

export default Index
