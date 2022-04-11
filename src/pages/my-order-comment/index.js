import Taro, { Component } from "@tarojs/taro"
import {
  View,
  Textarea
} from "@tarojs/components"

import Title from "../../components/Title"
import "./index.scss"
import { debounce } from "../../utils/util"
import { myordersComment } from '../../api/my-order'


@Title("评价")
class Index extends Component {
  config = {
    navigationBarTitleText: "我的订单"
  };

  constructor() {
    super(...arguments)
    this.state = {
      content: '',
      count: 0,
      inputPartHeight: 0 // 输入部分高度
    }
  }

  componentDidMount() {
    setTimeout(() => {
      const top = document.querySelector('.inputPart').clientHeight || document.querySelector('.inputPart').offsetHeight
      this.setState({
        inputPartHeight: top
      })
    }, 1)
  }


  valueChange = debounce((onInputEventDetail) => {
    if (onInputEventDetail && onInputEventDetail.detail.value != undefined) {
      this.setState({ count: onInputEventDetail.detail.value.length })
      document.querySelector('.count').style.position = 'static'
      document.querySelector('.inputPart').style.height = this.state.inputPartHeight + (Math.floor(onInputEventDetail.detail.value.length / 18) * 18 - 1) + 'px'
    }
  }, 100)

  valueRecord = (onInputEventDetail) => {
    this.setState({ content: onInputEventDetail.detail.value })
    document.querySelector('.count').style.position = 'absolute'
  }

  submit = () => {
    if (this.state.count < 1) {
      Taro.showToast({
        title: '评论不能为空', //提示的内容, 
        icon: 'none', //图标, 
        duration: 1000, //延迟时间, 
        mask: true, //显示透明蒙层，防止触摸穿透, 
      })
      return
    }
    Taro.showLoading({
      title: '请求中', //提示的内容,
      mask: true, //显示透明蒙层，防止触摸穿透,
    })
    myordersComment(this.$router.params.id, this.state.content).then(res => {
      Taro.hideLoading()
      if (res.code === 1) {
        Taro.showToast({
          title: '评论成功!', //提示的内容, 
          icon: 'success', //图标, 
          duration: 1000, //延迟时间, 
          mask: true, //显示透明蒙层，防止触摸穿透, 
        })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/my-order' })
        }, 1000)
      } else {
        Taro.showToast({
          title: res.msg, //提示的内容, 
          icon: 'none', //图标, 
          duration: 1000, //延迟时间, 
          mask: true, //显示透明蒙层，防止触摸穿透, 
        })
      }
    })
  }

  render() {

    return (
      <View className='my-order-comment'>
        <Textarea
          maxlength='200'
          autoHeight
          placeholder='请为专家的课程作出评价'
          autoFocus
          onInput={this.valueChange}
          onBlur={this.valueRecord}
          className='inputPart'
        >
        </Textarea>
        <View className='count'>{this.state.count}/200</View>
        <View className='btn' onClick={this.submit}>提交</View>
      </View>
    )
  }
}

export default Index
