import Taro, { Component } from "@tarojs/taro"
import { View, Navigator } from "@tarojs/components"

import dayjs from 'dayjs'

import "./index.scss"

class Index extends Component {

  static defaultProps={
    isClubVIP:null,
    endTime:''
  }

  constructor() {
    super(...arguments)

    this.state={
      /** null:初始状态 0:非俱乐部会员 1:俱乐部会员 2:俱乐部会员已到期 */
      _isClubVIP:this.props.isClubVIP,
      /** 会员到期时间 */
      _endTime:this.props.endTime,
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isClubVIP !== this.state._isClubVIP){
      this.setState({_isClubVIP:nextProps.isClubVIP})
    }
    if(nextProps.endTime !== this.state._endTime){
      this.setState({_endTime:nextProps.endTime})
    }
  }

  render() {
    if (this.state._isClubVIP === null) return null

    return (
      <View className='ShowClubEntry'>
        <Navigator
          url={this.state._isClubVIP === 0 ? "/pages/club-inviting" : "/pages/club"}
          className='ll-cells ll-cell--noborder club'
        >
          <View className='ll-cell'>
            <View className='ll-cell__bd'>
              <View className='icon icon-club-logo2'></View>
            </View>
            <View className='ll-cell__ft club-text'>
              {this.state._isClubVIP === 0 && <View>加入送1000元学习卡</View>}
              {this.state._isClubVIP === 1 && (
                <View>
                  {dayjs(this.state._endTime * 1000).format(
                    "YYYY年MM月DD日"
                  )}
                  到期
                </View>
              )}
              {this.state._isClubVIP === 2 && <View>已过期</View>}
            </View>
            <View className='ll-cell__ft'>
              <View className='icon icon-club-arrow'></View>
            </View>
          </View>
        </Navigator>
      </View>
    )
  }
}

export default Index
