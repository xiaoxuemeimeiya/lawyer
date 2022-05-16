import Taro, { Component } from "@tarojs/taro"
import { View, Image, RichText,Button,Navigator } from "@tarojs/components"

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
      isShowContactExperts:false,
      selectContactExpertsType:0
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

  // 拨打客服电话
  customerService = () => {
    Taro.makePhoneCall({
      //phoneNumber: "13632288249" //仅为示例，并非真实的电话号码
        phoneNumber: "13632288343" //仅为示例，并非真实的电话号码
    })
  }

   // 关闭联系专家弹框
   hideContactExperts = () => {
    this.setState({isShowContactExperts:false})
  }
  // 选择联系专家的方式
  selectContactExpertsType = (event) =>{
		console.log("TCL: selectContactExpertsType -> event", event)
    const type=event.currentTarget.dataset.type;
    this.setState({selectContactExpertsType:type})
  }
  // 选择联系专家-确定
  pay = () => {
    if(this.state.selectContactExpertsType === 0 ){
      wx.navigateTo({ url: '/pages/expert-voice-pay/expert-voice-pay?id='+this.data.expertId });
    }else if(this.state.selectContactExpertsType === 1 ){
      wx.navigateTo({ url: '/pages/expert-questioning/expert-questioning?id='+this.data.expertId });
    }
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

        <View className='ll-cells ll-cell--noborder center'>
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

        {/* 底部栏 */}
        <View className='ll-cells ll-cell--noborder bottom'>
          <View className='ll-cell bottom__bd'>
            <Navigator url='/' >
              <View className='ll-cell__hd'>
                <Button className='btn bottom__btn'>
                  <View className='icon icon-index1'></View>
                  <View className='bottom-btn__text'>首页</View>
                </Button>
              </View>
            </Navigator>
            <View className='ll-cell__hd'>
              <Button className='btn bottom__btn' onClick={this.customerService}>
                <View className='icon icon-kefu1'></View>
                <View className='bottom-btn__text'>平台客服</View>
              </Button>
            </View>
            <View className='ll-cell__bd'>
              <Button className='btn btn-primary--large btn-learn-now'>立即链专家</Button>
            </View>
          </View>
        </View>
        
        {/*-- 联系专家模块 --*/}
        <View className="ll-mask" onClick={this.hideContactExperts}></View>
        <View className="concat-expert">
          <View className="ll-cells concat-expert__hd">
            <View className="ll-cell">
              <View className="ll-cell__hd">
                <Image className="avatar-image concat-expert__avatar"
                  src={this.state.info.header_img || 'https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_ll_logo.png?text=%E5%8D%A0%E4%BD%8D'}>
                </Image>
              </View>
              <View className="ll-cell__bd"></View>
              <View className="ll-cell__ft">
                <View className="icon icon-close" bindtap={this.hideContactExperts}></View>
              </View>
            </View>
            <View className="ll-cell">
              <View className="ll-cell__bd">
                <View className="concat-expert__h1 color-black">TA擅长的领域</View>
                <View className="concat-expert__small color-black">{this.state.info.us_workon}</View>
              </View>
            </View>
            <view class="ll-cell">
              <view class="ll-cell__bd">
                <view class="concat-expert__h1 color-black">选择约聊方式</view>
                <view class="concat-expert-type">
                  <view bindtap={this.selectContactExpertsType} className={["concat-expert-type__item",this.state.selectContactExpertsType && 'active']}>
                    <view class="concat-expert-type__title color-black">线上问答</view>
                    <view class="concat-expert-type__small color-gray">线上提问</view>
                    <view class="concat-expert-type__small color-gray">专家回复</view>
                    <view class="icon icon-right"></view>
                  </view>
                  <view className="concat-expert-type__item">
                    <view class="concat-expert-type__title color-gray">线下约见</view>
                    <view class="concat-expert-type__small color-gray">敬请期待</view>
                    <view class="icon icon-right"></view>
                  </view>
                </view>
                <view class="concat-expert__footer">
                  <button class="btn btn-primary" bindtap="pay">确定</button>
                </view>
              </view>
            </view>
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
