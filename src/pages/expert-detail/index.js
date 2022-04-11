import Taro, { Component } from "@tarojs/taro"
import { View, Image, RichText } from "@tarojs/components"

import { AtActivityIndicator } from "taro-ui"
import {getExpertInfoDetail} from '../../api/expert'
import "./index.scss"

class Index extends Component {
  config = {
    navigationBarTitleText: "TA的履历"
  }

  constructor() {
    super(...arguments)
    this.state = {
      id: "",
      info: {},
      isFirstLoding: true, // 是否首次加载数据
    }
  }

  componentDidMount() {
    this.getDataList()
  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
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

    getExpertInfoDetail(this.state.id)
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
      <View className='ExpertDetail'>
        <View className='ll-cells expert-header'>
          <View className='ll-cell'>
            <View className='ll-cell__hd'>
              <Image
                className='expert-avatar'
                src={this.state.info.header_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
              />
            </View>
            <View className='ll-cell__bd'>
              <View className='expert-name'>{this.state.info.us_regist_name}</View>
              <View className='expert-title'>{this.state.info.chainman}</View>
            </View>
          </View>
        </View>

        <View className='ll-cells ll-cell--noborder'>
          <View className='ll-cell'>
            <View className='ll-cell__bd'>
              <View className='detail-title'>TA的简介</View>
              <RichText
                className='rich-text detail-content'
                nodes={this.state.info.us_desc}
              />
            </View>
          </View>
          <View className='ll-cell'>
            <View className='ll-cell__bd'>
              <View className='detail-title'>成功案例</View>
              <RichText
                className='rich-text detail-content'
                nodes={this.state.info.case}
              />
            </View>
          </View>
        </View>

        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
