import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Button,
  Image,
  Navigator,
  Text,
  RichText,
  Block
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { decryption } from "../../utils/aes"
import Title from "../../components/Title"
import "./index.scss"
import {groupDetail} from "../../api/knowledge"
import {getExpertInfoDetail} from "../../api/expert"

@Title("课程详情")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "智汇圈加群"
  }

  constructor() {
    super(...arguments)
    this.state = {
      id:'',
      info:''
    }
  }

  async componentDidMount() {
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

    groupDetail(this.state.id)
        .then(res=>{
          this.setState({info:res.data})

          // 取消显示首次loading
          this.state.isFirstLoding && this.setState({ isFirstLoding: false })
        })
        .catch(err=>{
          console.log(err)
          Taro.showToast({
            title: err.msg?err.msg:String(err), //提示的内容,
            icon: 'none', //图标,
            duration: 2000, //延迟时间,
            mask: true, //显示透明蒙层，防止触摸穿透,
          })
        })

  }


  render() {
    return (
      <View className='group-detail'>
      
          {/* 群内容 */}
          <View className='ll-cells ll-cell--noborder' style={{ overflow: 'auto' }}>
            <View className='ll-cell group-title'>添加小助手微信号，邀请您进群</View>
            <View className='ll-cell group-progress'>添加方法一：点击按钮，返回微信进入【服务通知】添加助手</View>
            <View className='ll-cell group-service'>
              <View className='title'>联系客服</View>
              <View className='right'>></View>
            </View>
            <View className='ll-cell group-progress'>添加方法二：保存二维码图片至手机，打开微信扫码识别添加</View>
            <View className='group-ercode'><Image className='qrcode' src={this.state.info.customer}/></View>
            <View className='ll-cell group-desc'>*如已添加智汇圈小助手为好友，可直接联系小助手回复“加群”即可。</View>
            <View className='group-operate'>操作指引</View>
            <View className='group-operate-ercode'><Image className='operate-qrcode' src='https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'/></View>
          </View>
      </View>
    )
  }
}

export default Index
