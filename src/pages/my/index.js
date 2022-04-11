import Taro, { Component } from "@tarojs/taro"
import {
  View,
  Image,
  Navigator,
  ScrollView,
} from "@tarojs/components"
import { inject } from '@tarojs/mobx'

import dayjs from 'dayjs'
import { AtActivityIndicator } from "taro-ui"
import { decryption } from "../../utils/aes"
import Login from "../../components/Login"
import Title from "../../components/Title"
import Tabbar from "../../components/Tabbar"
// import {Tabbar} from './components'

import "./index.scss"

@inject('userStore')
@Title("个人中心")
@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "个人中心"
  }

  constructor() {
    super(...arguments)
    this.state = {
      isFirstLoding: false, // 是否首次加载数据
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
    // 更新一下数据, 确认数据是否已经变更
    const data = await this.props.userStore.getUserInfoAsync()
    this.setState({
      userInfo: data
    })
    setTimeout(() => {
      /** 获取缓存中是否同意的专栏作者合作协议 */
      if (sessionStorage.getItem('agreed')) {
        this.setState({
          userInfo: { ...this.state.userInfo, agree: 1 }
        })
      }
    }, 200)
  }


  render() {
    return (
      <View className='My'>
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{ boxSizing: 'border-box', flex: 1, paddingBottom: '10px' }}
        >
          <View className='header'>
            <Image className='avatar my-avatar' src={this.state.userInfo.headimgurl} />
            <View className='my-name'>{this.state.userInfo.nickname}</View>
          </View>

          {/* 收益-储值卡 */}
          <View className='profit' >
            <Navigator url='/pages/profit' className='profit-item'>
              <View className='profit__title'>收益</View>
              <View className='profit__price'>{this.state.userInfo.club_account}</View>
            </Navigator>
            <Navigator url='/pages/stored-card' className='profit-item'>
              <View className='profit__title'>学习储值卡</View>
              <View className='profit__price'>{this.state.userInfo.club_card || 0}</View>
            </Navigator>
          </View>

          {/* 链链俱乐部入口 */}
          {
            this.state.userInfo.isClubVIP !== null && (
              <Navigator url='/pages/club' className='ll-cells ll-cell--noborder club'>
                <View className='ll-cell'>
                  <View className='ll-cell__bd'>
                    <View className='icon icon-club-logo2'></View>
                  </View>
                  <View className='ll-cell__ft club-text'>
                    {
                      this.state.userInfo.isClubVIP === 0 && (
                        <View>
                          加入送1000元学习卡
                        </View>
                      )
                    }
                    {
                      this.state.userInfo.isClubVIP === 1 && (
                        <View>
                          {dayjs(this.state.userInfo.end_time * 1000).format("YYYY年MM月DD日")}到期
                        </View>
                      )
                    }
                    {
                      this.state.userInfo.isClubVIP === 2 && (
                        <View>
                          已过期
                        </View>
                      )
                    }
                  </View>
                  <View className='ll-cell__ft'>
                    <View className='icon icon-club-arrow'></View>
                  </View>
                </View>
              </Navigator>
            )
          }

          <View className='ll-cells ll-cell--noborder list'>
            <Navigator url='/pages/my-course?tabbarShow=false' className='ll-cell ll-cell--access' hoverClass='ll-hover'>
              <View className='ll-cell__hd'>
                <View className='icon icon-course-h5'></View>
              </View>
              <View className='ll-cell__bd'>
                我的课程
            </View>
              <View className='ll-cell__ft ll-cell__ft--in-access'></View>
            </Navigator>
            <Navigator url='/pages/my-order' className='ll-cell ll-cell--access' hoverClass='ll-hover'>
              <View className='ll-cell__hd'>
                <View className='icon icon-order-h5'></View>
              </View>
              <View className='ll-cell__bd'>
                我的订单
            </View>
              <View className='ll-cell__ft ll-cell__ft--in-access'></View>
            </Navigator>
            <Navigator url={`/pages/agreement?agreed=${this.state.userInfo.agree}`} className='ll-cell ll-cell--access' hoverClass='ll-hover'>
              <View className='ll-cell__hd'>
                <View className='icon icon-agreement-h5'></View>
              </View>
              <View className='ll-cell__bd'>
                专栏作者合作协议
            </View>
              {
                this.state.userInfo.agree === 1 &&
                <View className='agreed'>
                  已同意
              </View>
              }
              <View className='ll-cell__ft ll-cell__ft--in-access'></View>
            </Navigator>
            {
              !!this.state.userInfo.end_time &&
              (<Navigator url='/pages/club' className='ll-cell ll-cell--access' hoverClass='ll-hover'>
                <View className='ll-cell__hd'>
                  <View className='icon icon-share-h5'></View>
                </View>
                <View className='ll-cell__bd'>
                  邀请好友加入链链俱乐部
              </View>
                <View className='ll-cell__ft ll-cell__ft--in-access'></View>
              </Navigator>)
            }
            {/* <View className='ll-cell ll-cell--access'>
            <View className='ll-cell__hd'>
              <View className='icon icon-share-h5'></View>
            </View>
            <View className='ll-cell__bd'>
              推荐「链链」给好友
            </View>
            <View className='ll-cell__ft ll-cell__ft--in-access'></View>
          </View> */}
          </View>


          {/* 首次加载 */}
          {this.state.isFirstLoding && (
            <AtActivityIndicator size={36}></AtActivityIndicator>
          )}
        </ScrollView>
        {/* 底部导航栏 */}
        <Tabbar></Tabbar>
      </View>
    )
  }
}

export default Index
