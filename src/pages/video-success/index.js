/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text, Input, Button,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import store from '../../store'
import Title from "../../components/Title"
import { getOnlineDetail } from "../../api/knowledge"
import "./index.scss"

const { loginStore } = store

@Title("领取成功")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "领取成功"
  };

  constructor() {
    super(...arguments)
    this.state = {
      dataList:''
    }
  }

  async componentDidMount() {
    this.getid()
  }

  getid(){
    const id = +this.$router.params.id
    if (id) {
      this.setState({ id }, () => {
        this.getData()
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

  getData() {
    return getOnlineDetail(this.state.id, 1)
        .then(res => {
          this.setState({
            dataList: res.data.detail,
          })

          // 取消显示首次loading
          this.state.isFirstLoding && this.setState({ isFirstLoding: false })
        })
        .catch(err => {
          if (err.code == 16) {
            Taro.showModal({
              title: "提示", //提示的标题,
              content: "很抱歉,该课程已下架!", //提示的内容,
              showCancel: false, //是否显示取消按钮,
              confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
              confirmColor: "#d62419", //确定按钮的文字颜色,
              success: () => {
                Taro.navigateBack({
                  delta: 1 //返回的页面数，如果 delta 大于现有页面数，则返回到首页,
                })
              }
            })
          } else {
            Taro.showToast({
              title: err.msg ? err.msg : err + "", //提示的内容,
              icon: "none", //图标,
              duration: 2000, //延迟时间,
              mask: true //显示透明蒙层，防止触摸穿透,
            })
          }
        })
  }

  study = () => {
    window.location.href = this.state.dataList.redirect_url
  }

  render() {

    return (
      <View className='goddessSuccess' >
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            boxSizing: "border-box",
            flex: 1,
          }}
        >
          <View className='top'>
            <View className='success'>
              <Image className='img' src="https://oss.mylyh.com/miniapp/icon_suc1%402x.png" />
            </View>
            <View className='desc'>恭喜你购买成功</View>
          </View>

          <View className='goddessSuccess1'>
            <View className='content'>
              <View className='title'>
                <Image className='img' src="https://oss.mylyh.com/miniapp/last_pro.png" />
              </View>
              <View className='subTitle'>添加课程助手领取学习地址</View>
              <View className='ercode'>
                <Image className='img' src="https://oss.mylyh.com/miniapp/versionv2.2/pic_kefucode@2x.png" />
              </View>
              <View className='desc'>发送添加请求后将会在24小时内通过</View>
              <View className='study' onClick={this.study.bind(this)}>立即学习</View>
            </View>
          </View>
        </ScrollView>

        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
