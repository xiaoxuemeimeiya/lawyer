/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text
} from "@tarojs/components"
import { AtTabs, AtActivityIndicator } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import { onScrollToLower } from "../../utils/scroll"
import Login from "../../components/Login"
import Title from "../../components/Title"
import ScrollEnd from "../../components/ScrollEnd"
import { userOnCourse, userOffCourse } from '../../api/my-order'
import { cancel, payUnCourse, payUnOffCourse, payUnVip } from '../../api/pay'
import { get_buyVipList } from '@/src/api/videoVip'

import "./index.scss"


@inject('loginStore', 'userStore')
@Title("我的订单")
@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "我的订单"
  };

  constructor() {
    super(...arguments)
    this.state = {
      tabIndex: 0,
      conditionMap: [userOnCourse, userOffCourse, get_buyVipList],

      /** 是否首次加载数据 */
      isFirstLoding: true,
      /** 分页数据 */
      dataList: [],
      /** 页码 */
      page: 1,
      /** scroll-view 是否滚动到底部 */
      isScrollEnd: false,
      // 列表是否为空
      empty: false
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
    this.getData()
  }

  getData() {
    if (this.state.isScrollEnd) return
    return this.state.conditionMap[this.state.tabIndex](this.state.page)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        // 判断是否到底
        if (res.data && res.data.length >= 15) {
          this.setState({ isScrollEnd: false })
        } else {
          this.setState({ isScrollEnd: true })
        }

        // 判断是否list是否为空
        try {
          this.setState({
            empty: res.data.length < 1,
          })
        } catch (err) { }

        // 专家列表数据
        if (this.state.page == 1) {
          // 首次请求
          this.setState({
            dataList: res.data,
            page: 2 // 默认为1,这里 1+1
          })
        } else {
          // 非首次请求
          this.setState(
            {
              dataList: [...this.state.dataList, ...res.data],
              page: this.state.page + 1
            },
            () => {
              console.log(
                "TCL: getExpertsList -> this.state.page",
                this.state.page
              )
            }
          )
        }

        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
      })
      .catch(err => {
        Taro.showToast({
          title: err.msg ? err.msg : err + "", //提示的内容,
          icon: "none", //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
  }

  handleClick = (value) => {
    this.setState({
      tabIndex: value,
      page: 1,
      isScrollEnd: false,
      dataList: []
    }, () => {
      this.getData()
    })
  };

  /** 取消订单 */
  cancel = (id, event) => {
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
        let index = this.state.dataList.findIndex(item => item.id === id)
        this.state.dataList[index]['order_status'] = 4
        let dataList = [...this.state.dataList]
        this.setState({ dataList }, () => {
          Taro.hideLoading()
        })
        // 更新数据 取消订单会返回一些 储蓄卡余额
        setTimeout(() => {
          this.props.userStore.getUserInfoAsync()
        }, 2000)
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

  pay = (id, type, event) => {
    event.stopPropagation()

    const map = {
      'on': payUnCourse,
      'off': payUnOffCourse,
      'vip': payUnVip,
    }
    if (!map[type]) return

    Taro.showLoading({ mask: true })
    map[type](id)
      .then(res => {
        this.WeixinPay(res.data)
          .then(() => {
            Taro.showToast({
              title: '支付成功!', //提示的内容, 
              icon: 'success', //图标, 
              duration: 2000, //延迟时间, 
              mask: true, //显示透明蒙层，防止触摸穿透, 
            })

            // 更新数据 更新一下会员状态 后台可能数据更新不及时 慢点请求
            setTimeout(() => {
              this.props.userStore.getUserInfoAsync()
            }, 1500)

            let index = this.state.dataList.findIndex(item => item.id === id)
            this.state.dataList[index]['order_status'] = 3 // 已支付/待评价
            let dataList = [...this.state.dataList]
            this.setState({ dataList })
          })
          .catch(() => {
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


  comment = (id, event) => {
    event.stopPropagation()
    Taro.navigateTo({ url: `/pages/my-order-comment?id=${id}` })
  }

  render() {
    const tabList = [{ title: "线上课程" }, { title: "线下学院" }, { title: "会员" }]
    const status = {
      '1': '待付款',
      '3': '已支付/待评价',
      '4': '已取消',
      '6': '已完成',
      '7': '退款中'
    }
    const presentUrl = window.location.origin
    return (
      <View className='MyOrder'>
        {/* 头部 */}
        <View
          className='ll-cells ll-cell--noborder ll-cell--noborder'
        >
          <View className='ll-cell tabs-mycourse'>
            <View className='ll-cell__ft'>
              <AtTabs
                current={this.state.tabIndex}
                tabList={tabList}
                onClick={this.handleClick}
              >
              </AtTabs>
            </View>
            <View className='ll-cell__bd'></View>
          </View>
        </View>

        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{ boxSizing: 'border-box', height: "calc(100% - " + Taro.pxTransform(96) + ")" }}
          onScrollToLower={onScrollToLower.bind(this)} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
        >
          <View style='height:101%'>
            {/* 线上课程订单 */}
            {
              this.state.tabIndex == 0 &&
              this.state.dataList.map(item => (
                <Navigator url={`/pages/my-order-detail?type=on&id=${item.id}`} className='ll-cells order' key={item.id}>
                  <View className='ll-cell order__hd'>
                    <View className='ll-cell__bd order-title'>订单号:{item.out_trade_no}</View>
                    {item.order_status !== 6 && <View className='ll-cell__ft order-status'>{status[item.order_status]}</View>}
                    {item.order_status === 6 &&
                      <View className='order-status--resolved'>
                        <View className='icon icon-fulfilled order-status--resolved__img'></View>
                      </View>
                    }
                  </View>

                  <View className='ll-cell ll-cell--primary'>
                    <View className='ll-cell__hd'>
                      <Image className='order-img' src={item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
                    </View>
                    <View className='ll-cell__bd order-name ellipsis-3'>{item.name}</View>
                    <View className='ll-cell__ft order-price'>
                      ¥<Text className='order-price__bd'>{item.wx_account / 100}</Text>
                    </View>
                  </View>

                  <View className='ll-cell ll-cell--noborder order__ft'>
                    <View className='ll-cell__bd'></View>
                    <View className='ll-cell__ft'>
                      {item.order_status === 1 && <View className='btn order-btn order-btn--cancel' onClick={this.cancel.bind(this, item.id)}>取消订单</View>}
                      {item.order_status === 1 && <View className='btn order-btn order-btn--pay' onClick={this.pay.bind(this, item.id, 'on')}>付款</View>}
                      {item.order_status === 3 && <View className='btn order-btn order-btn--cancel' onClick={this.comment.bind(this, item.id)}>评价</View>}
                    </View>
                  </View>
                </Navigator>
              ))
            }

            {/* 线下课程订单 */}
            {
              this.state.tabIndex == 1 &&
              this.state.dataList.map(item => (
                <Navigator url={`/pages/my-order-detail?type=off&id=${item.id}`} className='ll-cells order' key={item.id}>
                  <View className='ll-cell order__hd'>
                    <View className='ll-cell__bd order-title'>订单号:{item.out_trade_no}</View>
                    {(item.order_status == 2 || item.order_status == 6) || <View className='ll-cell__ft order-status'>{status[item.order_status]}</View>}
                    {(item.order_status == 2 || item.order_status == 6) && <View className='order-status--resolved'>
                      <View className='icon icon-fulfilled order-status--resolved__img'></View>
                    </View>}
                  </View>

                  <View className='ll-cell ll-cell--primary'>
                    <View className='ll-cell__hd'>
                      <Image className='order-img' src={item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
                    </View>
                    <View className='ll-cell__bd order-name ellipsis-3'>{item.name}</View>
                    <View className='ll-cell__ft order-price'>
                      ¥<Text className='order-price__bd'>{item.total_fee / 100}</Text>
                    </View>
                  </View>

                  <View className='ll-cell ll-cell--noborder order__ft'>
                    <View className='ll-cell__bd'></View>
                    <View className='ll-cell__ft'>
                      {item.order_status == 1 && <View className='btn order-btn order-btn--cancel' onClick={this.cancel.bind(this, item.id)}>取消订单</View>}
                      {item.order_status == 1 && <View className='btn order-btn order-btn--pay' onClick={this.pay.bind(this, item.id, 'off')}>付款</View>}
                    </View>
                  </View>
                </Navigator>
              ))
            }

            {/* vip订单 */}
            {
              this.state.tabIndex == 2 &&
              this.state.dataList.map(item => (
                <Navigator className='ll-cells order' key={item.id}>
                  <View className='ll-cell order__hd'>
                    <View className='ll-cell__bd order-title'>订单号:{item.out_trade_no}</View>
                    {(item.order_status == 2 || item.order_status == 6) || <View className='ll-cell__ft order-status'>{status[item.order_status]}</View>}
                    {(item.order_status == 2 || item.order_status == 6) && <View className='order-status--resolved'>
                      <View className='icon icon-fulfilled order-status--resolved__img'></View>
                    </View>}
                  </View>

                  <View className='ll-cell ll-cell--primary'>
                    <View className='ll-cell__hd'>
                      <Image className='order-img' src={item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
                    </View>
                    <View className='ll-cell__bd order-name ellipsis-3'>{item.name}</View>
                    <View className='ll-cell__ft order-price'>
                      ¥<Text className='order-price__bd'>{item.total_fee / 100}</Text>
                    </View>
                  </View>

                  <View className='ll-cell ll-cell--noborder order__ft'>
                    <View className='ll-cell__bd'></View>
                    <View className='ll-cell__ft'>
                      {item.order_status == 1 && <View className='btn order-btn order-btn--cancel' onClick={this.cancel.bind(this, item.id)}>取消订单</View>}
                      {item.order_status == 1 && <View className='btn order-btn order-btn--pay' onClick={this.pay.bind(this, item.id, 'vip')}>付款</View>}
                    </View>
                  </View>
                </Navigator>
              ))
            }

            {/* 上拉加载显示 */}
            <ScrollEnd isScrollEnd={this.state.isScrollEnd}></ScrollEnd>
            {/* 空提示 */}
            {
              this.state.empty === true &&
              <View className='null-tip'>
                <Image
                  className='null-tip__img'
                  src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_searchnone@2x.png'
                  mode='scaleToFill'
                  lazy-load='false'
                >
                </Image>
                <View className='color-text-regular'>没有找到您想要的</View>
                <View className='btn btn-primary--large null-tip__btn'>
                  <Text href={presentUrl} style='color:#fff'>去看看</Text>
                </View>
              </View>
            }
            {/* 滚动到底部无内容了 */}
            {this.state.isScrollEnd && !!this.state.dataList.length && (
              <View className='ll-divider'>没有更多内容了</View>
            )}
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
