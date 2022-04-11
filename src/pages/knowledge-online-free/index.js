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

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator, AtSwitch } from "taro-ui"
import { getOnlineDetail } from "../../api/knowledge"
import { payCourse } from "../../api/pay"
import { usercouponList } from "../../api/videoVip"
import { checkReg } from '../../utils/login'
import { throttle } from '../../utils/util'
import Title from "../../components/Title"
import { decryption } from "../../utils/aes"
import Login from "../../components/Login"


import "./index.scss"
import {is_set_Course, receive_Course} from "../../api/my-course";

// eslint-disable-next-line import/no-commonjs
const math = require('mathjs')

@Title("领取课程")
@Login
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "领取课程"
  };

  constructor() {
    super(...arguments)
    this.state = {
      id: '',
      /** 邀请码 */
      code: '',
      dataList: {},
      couponShow: false,
      newyears:1,
      /** 是否使用余额 */
      useBalance: true,
      /** 使用了多少学习卡的金额 */
      balance: 0,
      /** 打折扣减的金额 */
      discount: 0,
      /** 总优惠的金额 */
      allDiscount: 0,
      /** 最后支付价格-右下角显示的价格 */
      total_fee: 0,
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
    this.getDataList()
  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    const code = this.$router.params.code
    if (code) {
      this.state.code = code
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
    return getOnlineDetail(this.state.id, 1)
      .then(res => {

        let club_card = this.state.userInfo.club_card || 0
        this.setState({
          dataList: res.data.detail,
          useBalance: club_card > 0
        }, () => {
          this.updateTotalFee()
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

  /** 支付课程 */
  submit = throttle(() => {
    const { isLogin } = this.props.loginStore
    if (!isLogin) {
      checkReg()
      return
    }

    Taro.showLoading({ mask: true })

      //是否领取课程
      is_set_Course()
          .then(res => {
            console.log(res)
            if(res.code == 1 && res.count == 0){
              //用户可以领取
              receive_Course(this.$router.params.id)
                  .then(res1 => {
                    console.log(res1)
                    if(res1.code == 1 && res1.receive == 1){
                      //用户领取成功
                      Taro.showModal({
                        title: "提示", //提示的标题,
                        content: "领取成功", //提示的内容,
                        showCancel: false, //是否显示取消按钮,
                        confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
                        confirmColor: "#d62419", //确定按钮的文字颜色,
                        success: () => {
                          Taro.navigateTo({
                            url: '/pages/knowledge-online-detail?id=' + this.$router.params.id
                          })
                        }
                      })
                    }else{
                      //用户已经使用完该权益
                      if( res1.receive == 3){
                        Taro.showToast({
                          title: '您已经购买过该课程', //提示的内容,
                          icon: 'none', //图标,
                          duration: 2000, //延迟时间,
                          mask: true, //显示透明蒙层，防止触摸穿透,
                        })
                      }else{
                        Taro.showToast({
                          title: '您已经领取过该权益', //提示的内容,
                          icon: 'none', //图标,
                          duration: 2000, //延迟时间,
                          mask: true, //显示透明蒙层，防止触摸穿透,
                        })
                      }
                    }
                  })
                  .catch(err => {
                    console.log(err)
                    Taro.showToast({
                      title: err.msg ? err.msg : String(err), //提示的内容,
                      icon: 'none', //图标,
                      duration: 2000, //延迟时间,
                      mask: true, //显示透明蒙层，防止触摸穿透,
                    })
                  })
            }else{
              //用户已经使用完该权益
              Taro.showToast({
                title: '您已经领取过该权益', //提示的内容,
                icon: 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true, //显示透明蒙层，防止触摸穿透,
              })
            }

          })
          .catch(err => {
            console.log(err)
            Taro.showToast({
              title: err.msg ? err.msg : String(err), //提示的内容,
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true, //显示透明蒙层，防止触摸穿透,
            })
          })
  }, 2000)


  render() {
    const { club_card = 0 } = this.state.userInfo
    return (
      <View className='knowledgeOnlinePay'>
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
          <View className='ll-cells ll-cell--noborder content'>
            <View className='ll-cell'>
              <View className='ll-cell__hd content__title'>
                {this.state.dataList.us_regist_name}
              </View>
            </View>
            <View className='ll-cell ll-cell--primary content__bd'>
              <View className='ll-cell__hd'>
                <Image className='content__img' src={this.state.dataList.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}></Image>
              </View>
              <View className='ll-cell__bd'>
                <View className='content__text ellipsis-2'>{this.state.dataList.name}</View>
              </View>
              <View className='ll-cell__ft content__price'>
                <Text className='small'>¥</Text>{(this.state.newyears && (this.state.userInfo.lian || this.state.userInfo.is_club) && this.state.dataList.is_active ) ? '16.8' :this.state.dataList.price}
              </View>
            </View>
          </View>

          {/* 非优惠计算 */}
          <View className='ll-cells ll-cell--noborder content prizeCount'>
            <View className='ll-cell discountItem'>
              <View className='ll-cell__hd content__label content__label--title'>
              商品金额
              </View>
              <View className='ll-cell__ft ll-cell__bd content__label'>
              ¥{this.state.dataList.price}
              </View>
            </View>

            <View className='ll-cell discountItem'>
              <View className='ll-cell__hd content__label content__label--title'>
              优惠金额
              </View>
              <View className='ll-cell__ft ll-cell__bd content__price'>
              -¥{this.state.dataList.price}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 底部栏 */}
        <View className='ll-cells ll-cell--noborder bottom'>
          <View className='ll-cell bottom__bd'>
            <View className=''>
              <View className='price'>
                <Text className='normal'>实付 </Text>
                <Text className='small' >¥</Text>
                <Text>{this.state.total_fee}</Text>
              </View>
            </View>
            <View className='ll-cell__bd discount'>
              已优惠¥{this.state.dataList.price}
            </View>
            <View className='ll-cell__ft'>
              <Button className='btn bottom__btn btn-pay' onClick={this.submit}>免费领取</Button>
            </View>
          </View>
        </View>



        {/* 首次加载 */}
        {
          this.state.isFirstLoding && (
            <AtActivityIndicator size={36}></AtActivityIndicator>
          )
        }
      </View >
    )
  }
}

export default Index
