import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Button,
  Image,
  Navigator,
  Text,
  RichText
} from "@tarojs/components"

import dayjs from 'dayjs'
import { observer, inject } from '@tarojs/mobx'
import {AtActivityIndicator } from "taro-ui"
import { getOfflineDetail } from "../../api/knowledge"
import { throttle, paddingZero } from "../../utils/util"
import { getCookie,setCookie } from "../../utils/storage"
import LL_loading from "../../components/LL_loading/LL_loading"
import Title from "../../components/Title"
import Share from "../../components/Share"
import Gzh from "../../components/Gzh"
import {checkReg} from '../../utils/login'

import "./index.scss"

@Title("课程详情")
@Share()
@inject('loginStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "课程详情"
  };

  constructor() {
    super(...arguments)
    this.state = {
      /** 邀请码 */
      code:'',
      id:'',
      dataList:{},
      isScrollTop:false,
      isFirstLoding:true,
      /** 报名 0:初始化 1:未开始 2:进行中 3: 已过期 */
      isTimePass:0, 
      /** 是否隐藏分享提示 */
      hideShareTip:getCookie("HIDE_SHARE_TIP_OFF")
    }
  }

  async componentDidShow() {
    this.getDataList()
  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    const code = this.$router.params.code
    if(code){
      this.state.code=code
    }

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
    return getOfflineDetail(this.state.id)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        if(res.data && res.data.course_content){
          const course_content = res.data.course_content
          paddingZero(course_content)
        }

        this.setState({
          dataList: res.data
        },()=>{
          this.checkTime(res.data.sign_starttime,res.data.sign_endtime)
        })

        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
      })
      .catch(err => {
        console.log(err)
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

  // 活动是否过期
  checkTime(start,end){
    var now=Date.now()
    start=start*1000
    end=end*1000

    if( now < start){
      this.state.isTimePass=1
      this.setState({isTimePass:1})

      // 距离报名开始还有limit天
      var limit= this.timeFormat(start - now)
      this.setState({dataList:{...this.state.dataList,time_limit:limit}})
    }else if(now >= start && now <= end){
      this.state.isTimePass=2
      this.setState({isTimePass:2})

      // 距离报名结束还有limit天
      var limit= this.timeFormat(end - now)
      this.setState({dataList:{...this.state.dataList,time_limit:limit}})
    }else if(now > end){
      this.state.isTimePass=3
      this.setState({isTimePass:3})
    }

  }

  /** 转换剩余时间 */
  timeFormat(time) {
    let days= Math.floor(time/(24*60*60*1000))
    let hours= Math.floor((time%(24*60*60*1000))/(60*60*1000))
    return {
      days,
      hours
    }
  }

  /**
   * 滚动到顶部/左边时触发
   */
  onScrollToUpper = throttle(() => {
    // H5环境取消下拉刷新
    if(process.env.TARO_ENV !== 'h5'){
      console.log("滚动到顶部/左边时触发")
  
      this.setState(
        {
          isScrollTop: true
        },
        () => {
          this.getData().finally(() => {
            setTimeout(() => {
              this.setState({
                isScrollTop: false
              })
            }, 1000)
          })
        }
      )
    }
  }, 2000)

  // 拨打客服电话
  customerService = () => {
    Taro.makePhoneCall({
      //phoneNumber: "13632288249" //仅为示例，并非真实的电话号码
        phoneNumber: "13632288343" //仅为示例，并非真实的电话号码
    })
  }

  // 分享
  share = () => {
    setCookie("HIDE_SHARE_TIP_OFF",true)
    this.setState({hideShareTip:true})

    Taro.navigateTo({url:`/pages/knowledge-share?type=off&id=${this.state.id}`})
  }

  // 立即学习
  showBottom = async () => {
    const {isLogin} = this.props.loginStore
    if (!isLogin) {
      checkReg()
      return
    }

    Taro.showLoading({mask:true})

    // 更新课程信息
    await this.getData()
console.log(this.state.dataList.free_sign)
    setTimeout(() => {
      if(this.state.dataList.is_pay || this.state.dataList.free_sign){
        Taro.hideLoading()
        Taro.showModal({title: '提示', content: '您已报名该活动!'})
        return
      }
      
      //Taro.navigateTo({url:'/pages/knowledge-sign?id='+this.state.id+'&code='+this.state.code})
        //Taro.navigateTo({url:'/pages/knowledge-sign-free?id='+this.state.id+'&code='+this.state.code})
        if(this.state.dataList.price == 0){
            //免费报名
            Taro.navigateTo({url:'/pages/knowledge-sign-free?id='+this.state.id+'&code='+this.state.code})
        }else{
            Taro.navigateTo({url:'/pages/knowledge-sign?id='+this.state.id+'&code='+this.state.code})
        }
    }, 400)

  }

  render() {
    return (
      <View className='KnowledgeOfflineDetail'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            height: "100%",
            boxSizing: "border-box",
            paddingBottom: Taro.pxTransform(112)
          }}
          onScrollToUpper={this.onScrollToUpper} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
        >
          {/* 滚动到顶部加载信息 */}
          {this.state.isScrollTop && <LL_loading></LL_loading>}

          {/* 封面 */}
          <View className='banner'>
            <Image className='banner__image' src={this.state.dataList.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />

            <View className='ll-cell ll-cell--noborder banner__ft'>
              {this.state.dataList.price == 0
                      ?
              <View className='ll-cell__bd'>
                  免费
              </View>
                      :
              <View className='ll-cell__bd'>
                <Text className='banner-ft__price'>¥</Text>
                {this.state.dataList.price}
              {this.state.dataList.vip_price && this.state.dataList.type == 0 &&
              <Text className='banner-ft__price' style='display:block;line-height:24px;'>¥{this.state.dataList.vip_price}会员价</Text>
              }
              </View>
              }
              <View className='ll-cell__ft'>
                {
                  this.state.isTimePass===1 && <View>距离报名开始时间还有 <Text className='banner-ft__num'>{this.state.dataList.time_limit.days}</Text> 天 <Text className='banner-ft__num'>{this.state.dataList.time_limit.hours}</Text> 小时</View>
                }
                {
                  this.state.isTimePass===2 && <View>距离报名结束时间还有 <Text className='banner-ft__num'>{this.state.dataList.time_limit.days}</Text> 天 <Text className='banner-ft__num'>{this.state.dataList.time_limit.hours}</Text> 小时</View>
                }
                {
                  this.state.isTimePass===3 && '报名时间已截止'
                }
              </View>
            </View>

          </View>

          {/* 课程内容 */}
          <View className='ll-cells ll-cell--noborder'>
            <View className='ll-cell ll-cell--primary course-title'>
              <View className='ll-cell__bd'>
                <View className='course-title__hd'>
                {this.state.dataList.name}
                </View>
                <View className='course-title__ft'>
                {this.state.dataList.desc}
                </View>
              </View>
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
            
            <View className='ll-cells ll-cell--noborder sign-up color-text-primary'>
              <View className='ll-cell'>
                <View className='ll-cell__bd'>
                  <View className='sign-up-item'>
                    <View className='icon icon-date sign-up__icon'></View>
                    <View className='sign-up__hd'>时间</View>
                    <View className='sign-up__bd'>{this.state.dataList.course_timein}</View>
                  </View>
                  <View className='sign-up-item'>
                    <View className='icon icon-location sign-up__icon'></View>
                    <View className='sign-up__hd'>地点</View>
                    <View className='sign-up__bd'>{this.state.dataList.course_local}</View>
                  </View>
                  <View className='sign-up-item'>
                      <View className='icon icon-time sign-up__icon'></View>
                      <View className='sign-up__hd'>{this.state.dataList.teacher_type ? this.state.dataList.teacher_type : '老师'}</View>
                      <View className='sign-up__bd'>{this.state.dataList.teacher_name ? this.state.dataList.teacher_name : '--'}</View>
                  </View>

              {/*
                  {!!this.state.dataList.course_lenth && <View className='sign-up-item'>
                    <View className='icon icon-time sign-up__icon'></View>
                    <View className='sign-up__hd'>时长</View>
                    <View className='sign-up__bd'>{this.state.dataList.course_lenth}</View>
                  </View>}
                  <View className='sign-up-item'>
                    <View className='icon icon-date sign-up__icon'></View>
                    <View className='sign-up__hd'>报名开始时间</View>
                    <View className='sign-up__bd'>{dayjs(this.state.dataList.sign_starttime*1000).format('YYYY-MM-DD HH:mm')}</View>
                  </View>
                  <View className='sign-up-item'>
                    <View className='icon icon-date sign-up__icon'></View>
                    <View className='sign-up__hd'>报名结束时间</View>
                    <View className='sign-up__bd'>{dayjs(this.state.dataList.sign_endtime*1000).format('YYYY-MM-DD HH:mm')}</View>
                  </View>
                  */}
                </View>
              </View>
            </View>
          </View>
          
          {/* 专家信息 */}
              {/*
          <Navigator url={'/pages/expert-detail?id='+this.state.dataList.us_id} className='expert ll-cell--noborder ll-cells'>
            <View className='ll-cell'>
              <View className='ll-cell__bd'>
                <View className='expert-title'>专家</View>
              </View>
            </View>
            <View className='ll-cell ll-cell--access'>
              <View className='ll-cell__hd'>
                {this.state.dataList.us_type==2 && <Image
                  className='avatar avatar-expert'
                  src={this.state.dataList.header_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                />}
              </View>
              <View className='ll-cell__bd'>
                <View className='expert__hd'>
                  <View className='expert__name'>{this.state.dataList.us_regist_name}</View>
                  <View className='icon icon-expert-authentication'></View>
                </View>
                <View className='expert__bd color-text-secondary'>
                {this.state.dataList.chainman || ''}
                </View>
              </View>
              <View className='expert__ft ll-cell__ft ll-cell__ft--in-access'>
                TA的履历
              </View>
            </View>
          </Navigator>
          */}
          
          {/* 课程介绍 */}
          <View className='ll-cells ll-cell--noborder'style='margin-top:20px;'>
            <View className='ll-cell'>
              <View className='ll-cell__bd'>
                <View className='expert-title'>活动详情</View>
              </View>
            </View>
            <View className='ll-cell'>
              <RichText className='rich-text' nodes={this.state.dataList.course_content} />
            </View>
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
              <Button className='btn bottom__btn' onClick={this.customerService}>
                <View className='icon icon-kefu1'></View>
                <View className='bottom-btn__text'>平台客服</View>
              </Button>
            </View>
            {/* 未报名该活动情况 */}
            {
              !this.state.dataList.is_pay && !this.state.dataList.free_sign && (
                <View className='ll-cell__bd'>
                  {this.state.isTimePass===1&&<Button className='btn btn-primary--large btn-learn-now' disabled style='background:rgba(214, 36, 25,0.7);'>
                    报名活动即将开始
                  </Button>}
                  {this.state.isTimePass===2&&<Button className='btn btn-primary--large btn-learn-now' onClick={this.showBottom}>
                    立即报名
                  </Button>}
                  {this.state.isTimePass===3&&<Button className='btn btn-primary--large btn-learn-now' disabled style='background:rgba(214, 36, 25,0.7);'>
                    报名时间已截止
                  </Button>}
                </View>
              )
            }
            {/* 已报名该活动情况 */}
            {
                (this.state.dataList.is_pay || this.state.dataList.free_sign) && (
                <View className='ll-cell__bd'>
                  <Button className='btn btn-primary--large btn-learn-now' disabled style='background:rgba(214, 36, 25,0.7);'>
                    您已报名该活动
                  </Button>
                </View>
              )
            }

          </View>
          {/* 分享提示 */}
          {
            !this.state.hideShareTip && <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/share_tip@2x.png' className='share-tip hide'></Image>
          }
        </View>
        <Gzh></Gzh>

        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
