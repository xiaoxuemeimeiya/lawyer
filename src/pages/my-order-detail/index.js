import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Text
} from "@tarojs/components"

import { AtActivityIndicator } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import Login from "../../components/Login"
import { userOnCourseDetail as on, userOffCourseDetail as off } from "../../api/my-order"
import { cancel, payUnCourse, payUnOffCourse } from '../../api/pay'
import { addZero } from './../../utils/util'
import "./index.scss"

@inject('loginStore', 'userStore')
@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "订单详情"
  };

  constructor() {
    super(...arguments)
    this.state = {
      id: '',
      type: '',
      dataList: {},
      isFirstLoding: true
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
    const id = +this.$router.params.id
    const type = this.$router.params.type
    if (id && type) {
      this.setState({ id, type }, () => {
        this.getData(type)
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

  getData(type) {
    if (type == 'on') {
      type = on
    } else if (type == 'off') {
      type = off
    }

    return type(this.state.id)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        this.setState({
          dataList: res.data
        })

        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
      })
      .catch(err => {
        console.log(err)

        Taro.showToast({
          title: err.msg ? err.msg : err + "", //提示的内容,
          icon: "none", //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })

      })
  }

  /** 支付课程 */
  WeixinPay(obj) {
    return new Promise((resolve, reject) => {
      function onBridgeReady() {
        WeixinJSBridge.invoke("getBrandWCPayRequest", obj, function (res) {
          if (res.err_msg == "get_brand_wcpay_request:ok") {
            // 使用以上方式判断前端返回,微信团队郑重提示：
            //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
            return resolve()
          } else if (res.err_msg == "get_brand_wcpay_request:cancel") {
            return reject('已取消支付')
          } else {
            return reject('支付失败')
          }
        })
      }

      if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
          document.addEventListener("WeixinJSBridgeReady", onBridgeReady, false)
        } else if (document.attachEvent) {
          document.attachEvent("WeixinJSBridgeReady", onBridgeReady)
          document.attachEvent("onWeixinJSBridgeReady", onBridgeReady)
        }
      } else {
        onBridgeReady()
      }
    })
  }


  pay = (id, type, event) => {
    event.stopPropagation()

    const map = {
      'on': payUnCourse,
      'off': payUnOffCourse
    }
    if (!map[type]) return

    Taro.showLoading({ mask: true })
    map[type](id)
      .then(res => {
        this.WeixinPay(res.data)
          .then(() => {
            console.log('支付成功!')

            setTimeout(() => {
              window.location.reload()
            }, 2000)
            // let data = this.state.dataList
            // data.order_status = 3
            // let now = new Date()
            // data.pay_time = addZero(now.getFullYear()) + '-' + addZero(now.getMonth() + 1) + '-' + addZero(now.getDate()) + ' ' + addZero(now.getHours()) + ':' + addZero(now.getMinutes())
            // this.state.dataList.order_status
            // this.setState({ dataList: { ...data } })
          })
          .catch(() => {
            console.log('支付失败')

            Taro.hideLoading()
            Taro.showToast({
              title: '支付失败!', //提示的内容, 
              icon: 'none', //图标, 
              duration: 2000, //延迟时间, 
              mask: true, //显示透明蒙层，防止触摸穿透, 
            })
          })
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

  }

  /** 取消订单 */
  cancel = (id, event) => {
    // window.location.replace(window.location.href)
    event.stopPropagation()

    Taro.showLoading({ mask: true })
    cancel(id)
      .then(() => {
        Taro.showToast({
          title: '取消成功!', //提示的内容,
          icon: 'success', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
        })

        setTimeout(() => {
          window.location.reload()
        }, 2000)
        this.props.userStore.getUserInfoAsync()
        // let data = this.state.dataList
        // data.order_status = 4
        // this.setState({ dataList: { ...data } })
      })
      .catch(err => {
        Taro.hideLoading()
        console.log(err)
        Taro.showToast({
          title: err.msg ? err.msg : String(err), //提示的内容, 
          icon: 'none', //图标, 
          duration: 2000, //延迟时间, 
          mask: true, //显示透明蒙层，防止触摸穿透, 
        })
      })

  }

  comment = (id, event) => {
    event.stopPropagation()
    Taro.navigateTo({ url: `/pages/my-order-comment?id=${id}` })
  }

  render() {
    const status = ['待付款', '', '已付款/待评价', '已取消', '', '已评价']
    return (
      <View className='MyOrderDetail'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{ flex: 1 }}
        >
          {/* 订单详情 */}
          <View className='ll-cells ll-cell--noborder detail'>

            <View className='ll-cell detail__hd'>
              <View className='ll-cell__bd'>
                订单号：{this.state.dataList.out_trade_no}
              </View>
              <View className='ll-cell__ft'>
                <View className='detail-status'>{status[this.state.dataList.order_status - 1]}</View>
              </View>
            </View>

            <View className='ll-cell ll-cell--primary detail__bd'>
              <View className='ll-cell__hd'>
                <Image className='detail-img' src={this.state.dataList.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
              </View>
              <View className='ll-cell__bd detail-name ellipsis-4'>
                {this.state.dataList.name}
              </View>
            </View>

            {this.state.dataList.order_createtime && <View className='ll-cell detail__ft detail__ft--first'>
              <View className='ll-cell__bd color-text-regular'>
                下单时间
              </View>
              <View className='ll-cell__ft color-text-primary'>
                {this.state.dataList.order_createtime}
              </View>
            </View>}
            {this.state.dataList.pay_time && <View className='ll-cell ll-cell--noborder detail__ft detail__ft--second'>
              <View className='ll-cell__bd color-text-regular'>
                支付时间
              </View>
              <View className='ll-cell__ft color-text-primary'>
                {this.state.dataList.pay_time}
              </View>
            </View>}
            {/* <View className='ll-cell detail__ft'>
              <View className='ll-cell__bd color-text-regular'>
              合计金额
              </View>
              <View className='ll-cell__ft color-primary'>
                ¥{this.state.dataList.total_fee/100}
              </View>
            </View> */}

          </View>

          {/* 优惠计算 */}
          <View className='ll-cells ll-cell--noborder content prizeCount'>
            <View className='ll-cell discountItem'>
              <View className='ll-cell__hd content__label content__label--title'>
                商品金额
              </View>
              <View className='ll-cell__ft ll-cell__bd content__label'>
                ¥{this.state.dataList.total_fee / 100}
              </View>
            </View>
            <View className='ll-cell discountItem'>
              <View className='ll-cell__hd content__label content__label--title'>
                学习储蓄卡
              </View>
              <View className='ll-cell__ft ll-cell__bd content__price'>
                -¥{this.state.dataList.order_account / 100}
              </View>
            </View>
            <View className='ll-cell discountItem'>
              <View className='ll-cell__hd content__label content__label--title'>
                会员7.5折
              </View>
              <View className='ll-cell__ft ll-cell__bd content__price'>
                -¥{this.state.dataList.discount_amount / 100}
              </View>
            </View>
            <View className='ll-cell discountItem'>
              <View className='ll-cell__hd content__label content__label--title'>
                优惠券
              </View>
              <View className='ll-cell__ft ll-cell__bd content__price'>
                -¥{this.state.dataList.coupon_amount / 100}
              </View>
            </View>
            <View className='ll-cell discountItem'>
              <View className='ll-cell__ft ll-cell__bd content__price red--box'>
                实付<Text className='red'>¥{this.state.dataList.wx_account/100}</Text>
              </View>
            </View>
          </View>

          {/* 上课消息 */}
          {
            this.state.type == 'off' &&
            <View className='ll-cells ll-cell--noborder sign-up color-text-primary'>
              <View className='ll-cell sign-up-title'>
                <View className='ll-cell__bd'>
                  上课消息
                </View>
              </View>
              <View className='ll-cell ll-cell--noborder'>
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
                    <View className='sign-up__hd'>时长</View>
                    <View className='sign-up__bd'>{this.state.dataList.course_lenth}</View>
                  </View>
                </View>
              </View>
            </View>
          }



          {/* 首次加载 */}
          {this.state.isFirstLoding && (
            <AtActivityIndicator size={36}></AtActivityIndicator>
          )}
        </ScrollView>
        {
          (this.state.dataList.order_status === 1 || this.state.dataList.order_status === 3) &&
          <View className={['footer--hanlde']}>
            <View className={['footer__btn', this.state.dataList.order_status !== 1 && 'hide']} onClick={this.cancel.bind(this, this.state.dataList.id)}>取消订单</View>
            <View className={['footer__btn footer__btn--red', this.state.dataList.order_status !== 1 && 'hide']} onClick={this.pay.bind(this, this.state.dataList.id, 'on')}>付款</View>
            <View className={['footer__btn', this.state.dataList.order_status !== 3 && 'hide']} onClick={this.comment.bind(this, this.state.dataList.id)}>评价</View>
          </View>
        }
      </View >
    )
  }
}

export default Index
