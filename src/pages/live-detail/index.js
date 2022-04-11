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

import Player from 'xgplayer'
import { observer, inject } from '@tarojs/mobx'
import { AtTabs, AtActivityIndicator } from "taro-ui"
import { getOnlineDetail } from "../../api/knowledge"
import { throttle, paddingZero } from "../../utils/util"
import { checkReg } from "../../utils/login"
import { getCookie, setCookie } from "../../utils/storage"
import LL_loading from "../../components/LL_loading/LL_loading"
import { decryption } from "../../utils/aes"
import Title from "../../components/Title"
import {liveDetail,exchange} from "../../api/expert"
import { my } from "../../api/my"
import Tg1 from "../../components/Tg1"
import Gzh from "../../components/Gzh"
import {is_set_Course,receive_Course} from "../../api/my-course"
import "./index.scss"

@Title("直播详情")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "直播详情"
  }

  constructor() {
    super(...arguments)
    this.state = {
      tabIndex: 0,
      id: "", // 线下详情id
      isFirstLoding: true,
      course: "",
      isScrollTop: false, // scroll-view 是否滚动到顶部
      scrollIntoView: "",
      /** 是否置顶 */
      isFixed: false,
      Spclose:false,
      Spclose1:false,
      close:false,
      /** 是否隐藏分享提示 */
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
    /** 信息更新 */
    if (!Object.keys(this.state.userInfo).length ) {
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
    }

    console.log(this.state.userInfo)
    this.getDataList()
  }

  componentWillUnmount() {
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
    return liveDetail(this.state.id)
      .then(res => {
        // 根据富文本数据确定是否取消父盒子的内边距
        if (res.code == 1 ) {

          this.setState({
            course: res.data,
          }, () => {
            //this.initVideo()
          })
        }
        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
      })
      .catch(err => {
        // 取消显示首次loading
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


  /** 购买
   * @videoId 当前点击的item对应的视频ID
   */
  showBottom = async () => {
    const { isLogin } = this.props.loginStore
    if (!isLogin) {
      checkReg()
      return
    }
    var time = (new Date()).getTime() / 1000


    if(time > this.state.course.endtime){
        //直播已经完成
      if(this.state.course.is_adv){
        // 判断是否免费或者是否对俱乐部会员免费开放
          //判断是否已经购买
        if ( this.state.course.price == 0 ) {
          //免费学习
            Taro.navigateTo({
                url: '/pages/live-video?id=' + this.state.id
            })
          return
        }else if(this.state.course.pay_type == 1 || this.state.course.pay_type == 2){
            //已经付费
            Taro.navigateTo({
                url: '/pages/live-video?id=' + this.state.id
            })
        }else{
          //去支付
            Taro.navigateTo({
                url: '/pages/live-pay?id=' + this.state.id
            })
        }
        /** 购买会员 返回来页面没有刷新, 需要检测一下是否已经成为会员*/
        Taro.showLoading({ mask: true })
        await this.getDataList()
      }else{
        //视频未上传
        Taro.showToast({
          title: "视频上传中....", //提示的内容,
          icon: "none", //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      }
    }else{
      //直播还未开始或者正在直播
      //弹出关注二维码
      this.setState({ Spclose1: true})
    }
  }

    //会员免费
    showBottom1 = async () => {
        //弹框，让开通会员
        if(this.state.userInfo.lian){
            //兑换课程
            return exchange({id:this.state.id})
                .then(res => {
                    if (res.code == 1 ) {console.log(res)
                        Taro.navigateTo({
                            url: '/pages/live-video?id=' + this.state.id
                        })
                    }
                })
                .catch(err => {
                    // 取消显示首次loading
                    Taro.showToast({
                        title: err.msg ? err.msg : err + "", //提示的内容,
                        icon: "none", //图标,
                        duration: 2000, //延迟时间,
                        mask: true //显示透明蒙层，防止触摸穿透,
                    })

                })

        }else{
            this.setState({ close: true})
        }
    }

    openvip = () => {
        Taro.navigateTo({
            url: '/pages/videoVip'
        })
    }

  closeWx1 = () => {
      this.setState({ Spclose1: false})
  }


  xiazaiclose = () => {
    this.setState({ close: false})
  }
  stopxiazaiclose = (e) => {
    e.stopPropagation()
  }

  // 拨打客服电话
  customerService = () => {
    Taro.makePhoneCall({
      //phoneNumber: "18664503307" //仅为示例，并非真实的电话号码
      phoneNumber: "13632288343" //仅为示例，并非真实的电话号码
    })
  }

  // 分享
  share = () => {
    setCookie("HIDE_SHARE_TIP", true)
    Taro.navigateTo({ url: `/pages/knowledge-share?type=on&id=${this.state.id}` })
  }


  render() {
    /** 按钮显示文字 */
    /*
   const buttonTip = (() => {
     //查看是否已经直播完
      var time = (new Date()).getTime() / 1000
      if(time > this.state.course.endtime){
          //直播已经完成
        if(this.state.course.is_adv){
          //已经上传视频
            if (this.state.course.price == 0) {
               return '免费学习'
            } else if(this.state.course.pay_type == 1) {
                return '立即学习'
            }else { //return '会员免费学'
                return '¥'+this.state.course.price+'购买'
            }
        }else{
          //没有上传视频
          return '视频上次传中....'
        }
      }else{
        //直播还未开始或者正在直播
        return '预约直播'
      }

   })()
   */
      let showbuttonTip = false
      let showbuttonTip1 = false
      let buttonTip1 = ''
      let big = false
      const buttonTip = (() => {
          var time = (new Date()).getTime() / 1000
          if(time > this.state.course.endtime) {
              if (+this.state.course.price === 0) {
                  showbuttonTip = true
                  big = true
                  return '免费学习'
              } else if (this.state.course.pay_type == 1 || this.state.course.pay_type == 2) {
                  showbuttonTip = true
                  big = true
                  return '立即学习'
              } else if (this.state.userInfo.lian) {
                  if (this.state.course.total > 0) {
                      //是会员，且还有兑换次数
                      buttonTip1 = '会员免费学'
                      big = true
                      showbuttonTip1 = true
                  } else {
                      //不免费，只能付费购买
                      big = true
                      showbuttonTip = true
                      return '¥' + this.state.course.price + '购买'
                  }
              } else {
                  buttonTip1 = '会员免费学'
                  showbuttonTip1 = true
                  showbuttonTip = true
                  return '¥' + this.state.course.price + '购买'
              }
          }else{
              big = true
              showbuttonTip = true
              return '预约直播'
          }
      })()

    const tabList = [{title: "课程介绍"}]

    return (
      <View className='KnowledgeOnlineDetail'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation={false}
          style={{
            height: `calc(100% - ${Taro.pxTransform(112)})`,
            boxSizing: "border-box",
          }}
          scrollIntoView={this.state.scrollIntoView}
          onScrollToUpper={this.onScrollToUpper} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
        >
          {/* 滚动到顶部加载信息 */}
          {this.state.isScrollTop && <LL_loading></LL_loading>}
          {/* 视频 */}
          <View className='video-box'>
              <View
                className='video-box_img'
                style={{ backgroundImage: `url(${this.state.course.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'})` }}
              >
              </View>
          </View>
          {/* 课程内容 */}
          <View className='ll-cells ll-cell--noborder' style={{ overflow: 'auto' }}>
            <View className='ll-cell course-title'>
              <View className='ll-cell__bd'><Image className= 'audio-type' src={this.state.course.part_list && this.state.course.part_list[0]['video'] == 2 ? 'https://oss.mylyh.com/miniapp/versionv3.0/Audio%402x.png' : 'https://oss.mylyh.com/miniapp/versionv3.0/Audio1%402x.png'}></Image>{this.state.course.name}</View>
              <View className='ll-cell__ft hide'>
                <View className='collection hide'>
                  <View className='icon icon-collection-selected'></View>
                  <View>已收藏</View>
                </View>
                <View className='collection'>
                  <View className='icon icon-collection-unselect'></View>
                  <View>收藏</View>
                </View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder color-text-secondary learn-info'>
              <View className='ll-cell__bd'>
                {this.state.course.fake_data}人在学
              </View>
            </View>

            <View className='course-price videoVip'>
              <Text className='course-price__bd'> ¥{this.state.course.price}</Text>
            </View>
            {/* 链享卡入口 */}
            <Navigator url='/pages/videoVip'>
              <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/member-cover.png' className='club-entry'></Image>
            </Navigator>
          </View>
          <View
            id='tab'
            style={{
              minHeight: "100%",
              background: "#fff"
            }}
          >
            {/* 课程介绍-课程目录-评价 */}
            <View className={`ll-cells ll-cell--noborder ${this.state.isFixed ? 'tabsFixed' : ''}`}>
              <View className='ll-cell tabs-course'>
                <View className='ll-cell__hd'>
                  <AtTabs
                    current={this.state.tabIndex}
                    tabList={tabList}
                  ></AtTabs>
                </View>
                <View className='ll-cell__bd'></View>
              </View>
            </View>
            {/* 拷贝上面元素 置顶时占位 */}
            <View className='ll-cells ll-cell--noborder' style={{ visibility: 'hidden', display: this.state.isFixed ? 'block' : 'none' }}>
              <View className='ll-cell tabs-course'>
                <View className='ll-cell__hd'>
                  <AtTabs
                    current={this.state.tabIndex}
                    tabList={tabList}
                  ></AtTabs>
                </View>
                <View className='ll-cell__bd'></View>
              </View>
            </View>

            {/* {this.state.tabIndex == 0 && ( */}
            {this.state && (
              <View className='ll-cells ll-cell--noborder'>
                <View className='ll-cell'>
                  <RichText
                    className='rich-text'
                    nodes={this.state.course.content}
                  />
                </View>
              </View>
            )}

          </View>
        </ScrollView>

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
              <Button className='btn bottom__btn' onClick={this.share}>
                <View className='icon icon-share1'></View>
                <View className='bottom-btn__text'>分享</View>
              </Button>
            </View>
            <View className='ll-cell__hd'>
              <Button
                className='btn bottom__btn'
                onClick={this.customerService}
              >
                <View className='icon icon-kefu1'></View>
                <View className='bottom-btn__text'>平台客服</View>
              </Button>
            </View>


              {showbuttonTip &&
              <View className='ll-cell__bd'>
                  {big
                              ?
                  <Button
                  className='btn btn-primary--large btn-learn-now btn-learn-big'
                  onClick={this.showBottom}
                      >
                      {
                          buttonTip
                      }
                      </Button>
              :
              <Button
                  className='btn btn-primary--large btn-learn-now'
                  onClick={this.showBottom}
                      >
                      {
                          buttonTip
                      }
                      </Button>
              }
              </View>
              }
              {showbuttonTip1 &&
              <View className='ll-cell__bd'>
                  {big
                              ?
                  <Button
                  className='btn btn-primary--large btn-learn-free btn-learn-big'
                  onClick={this.showBottom1}
                      >
                      {
                          buttonTip1
                      }
                      </Button>
              :
              <Button
                  className='btn btn-primary--large btn-learn-free'
                  onClick={this.showBottom1}
                      >
                      {
                          buttonTip1
                      }
                      </Button>
              }
              </View>
              }

          </View>
        </View>

        <View className={['ws-care',!this.state.Spclose1 && 'n-display']}>
           <View className='yuyue-warn1' >
              <View className='text--black'>预约直播</View>
              <View className='onebyone'>为了不错过您关注的直播，请关注我们，我们会在开播前提醒您。</View>
          <View className='ercode'>
              <Image className='gzh-img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/live.jpg" />
              </View>
              <View className='care'>长按关注我们</View>
              </View>
              <View className="close-img" onClick={this.closeWx1}> <Image src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_close2%402x.png"/></View>
        </View>

        <View className={['xiazai',!this.state.close && 'n-display']} onClick={this.xiazaiclose}>
           <View className='xiazai-content' onClick={(e)=>this.stopxiazaiclose(e)}>
              <View className='xiazai-rights'>开通会员即可体验此权益</View>
              <View className='xiazai-submit' onClick={this.openvip}>立即开通</View>
           </View>
        </View>

        {/* 首次加载 */}
        {this.state.isFirstLoding && <AtActivityIndicator size={36}></AtActivityIndicator>}
      </View>
    )
  }
}

export default Index
