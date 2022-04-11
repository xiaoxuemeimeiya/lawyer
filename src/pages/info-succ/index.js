import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Swiper,
  SwiperItem,
  Image,
  Navigator,
  Text,
  Button
} from "@tarojs/components"

import "./index.scss"

class Index extends Component {
  config = {
    navigationBarTitleText: "个人中心"
  }

  // eslint-disable-next-line react/sort-comp
  conditionMap = {
    offline: "线下课程报名",
    payCourse: "线上课程",
    withdraw: "提现",
    clubInviteCode: "成功加入",
    dan:'领取成功'
  }

  constructor() {
    super(...arguments)
    this.state = {
      type: ""
    }
  }

  componentDidShow() {
    this.getDataList()
  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    const type = this.$router.params.type
    if (type) {
      this.setState({ type }, () => {
        window.document.title = this.conditionMap[type]
      })
    } else {
      Taro.showModal({
        title: "提示", //提示的标题,
        content: "该详情不存在,请返回上一页", //提示的内容,
        showCancel: false, //是否显示取消按钮,
        confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
        confirmColor: "#D62419", //确定按钮的文字颜色,
        success: () => {
          Taro.navigateBack({
            delta: 1 //返回的页面数，如果 delta 大于现有页面数，则返回到首页,
          })
        }
      })
    }
  }

  /** 返回 */
  back=()=>{
    // 跳转回首页
    window.location.href= `${window.location.protocol}//${window.location.host}/`
  }

  render() {
    return (
      <View className='InfoSucc'>
        {/* 线下课程报名成功 */}
        {this.state.type == "offline" && (
          <View className='ll-cells ll-cell--noborder'>
            <View className='ll-cell icon-tip'>
              <View className='ll-cell__bd'>
                <View className='icon icon-suc'></View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__bd'>
                <View className='tip-main color-black'>
                  报名成功
                </View>
                <View className='tip-small color-gray'>
                  我们将及时与您联系，请您留意短信通知
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 线上课程付费成功 */}
        {this.state.type == "payCourse" && (
          <View className='ll-cells ll-cell--noborder'>
            <View className='ll-cell icon-tip'>
              <View className='ll-cell__bd'>
                <View className='icon icon-suc'></View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__bd'>
                <View className='tip-main color-black'>
                  支付成功，开始你的学习之旅吧
                </View>
                <View className='tip-small color-gray'>
                  您可以在「个人中心-我的订单」查看
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 提现成功 */}
        {this.state.type == "withdraw" && (
          <View className='ll-cells ll-cell--noborder'>
            <View className='ll-cell icon-tip'>
              <View className='ll-cell__bd'>
                <View className='icon icon-suc'></View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__bd'>
                <View className='tip-main color-black'>提现申请成功</View>
                <View className='tip-small color-gray'>7个工作日内到账</View>
              </View>
            </View>
          </View>
        )}

        {/* 链链俱乐部成功加入 */}
        {this.state.type === "clubInviteCode" && (
          <View className='ll-cells ll-cell--noborder'>
            <View className='ll-cell icon-tip'>
              <View className='ll-cell__bd'>
                <View className='icon icon-suc'></View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__bd'>
                <View className='tip-main color-black'>恭喜你，成功加入链链俱乐部</View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__bd'>
                <Button className='btn btn-primary--large club-invite-code-back' onClick={this.back}>返回</Button>
              </View>
            </View>
          </View>
        )}

        {/* 双旦活动 */}
        {this.state.type === "dan" && (
          <View className='ll-cells ll-cell--noborder'>
            <View className='ll-cell icon-tip'>
              <View className='ll-cell__bd'>
                <View className='icon icon-suc'></View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__bd'>
                <View className='tip-main color-black'>
                领取成功
                </View>
                <View className='tip-small color-gray'>
                  可在[个人中心-学习储值卡]查看
                </View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__bd'>
                <Button className='btn btn-primary--large btn-dan' onClick={this.back}>返回首页</Button>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}

export default Index
