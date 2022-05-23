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

// eslint-disable-next-line import/no-commonjs
const math = require('mathjs')

@Title("提交订单")
@Login
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "提交订单"
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
      /** 所选的优惠券 */
      selectedCoupon: {},
      /** 优惠券列表 */
      couponList: [],
      /** 最后支付价格-右下角显示的价格 */
      total_fee: 0,
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
    await this.getCouponData()
    this.getDataList()
    this.getTimestamp()
  }

  /**获取优惠时间时间**/
  getTimestamp() { //把时间日期转成时间戳
    //优惠开始时间(2021-01-08 23:59:59)
    var starttime = (new Date('2021/01/28 00:00:00')).getTime() / 1000
    var endtime = (new Date('2021/02/17 23:59:59')).getTime() / 1000
    var time = (new Date()).getTime() / 1000
    if(time >= starttime && time <= endtime){
      //活动期间
      this.setState({ newyears: 1 })
    }else{
      this.setState({ newyears: 0 })
    }
  }

  /** 获取优惠券数据 */
  getCouponData() {
    return new Promise(resolve => {
      usercouponList().then(res => {
        if (res.code === 1) {
          // 过滤 状态正常的券
          res.data = res.data.filter(v => v.status === 1)
          this.setState({ couponList: res.data }, () => {
            resolve('ok')
          })
        }
      })
    })
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
    // let type = this.state.discount > 0 ? 1 : 0

    let type = ((this.state.userInfo.lian || this.state.userInfo.is_club) && !this.state.newyears) ? 1 : 0
    // 实付金额小于 0.1 就不要使用视频会员卡了
    // if (this.state.total_fee < 0.1) type = 0
    const user_coupon_id = this.state.selectedCoupon.id || ''
    console.log(this.state.id, this.state.balance, this.state.total_fee, this.state.code, type, user_coupon_id)
    payCourse(this.state.id, this.state.balance, this.state.total_fee, this.state.code, type, user_coupon_id)
      .then(async res => {
        const userInfo = await this.props.userStore.getUserInfoAsync()
        this.setState({ userInfo })

        // 使用余额抵扣
        if (res.data.length === 0) {
          if(this.state.dataList.is_adv == 1){
            Taro.redirectTo({ url: '/pages/video-success?id='+this.state.id })
          }else{
            Taro.redirectTo({ url: '/pages/info-succ?type=payCourse' })
          }

          // window.location.replace(window.location.origin + '/#/pages/info-succ?type=payCourse')
          return
        }

        this.WeixinPay(res.data)
          .then(() => {
            if(this.state.dataList.is_adv == 1){
              Taro.redirectTo({ url: '/pages/video-success?id='+this.state.id })
            }else{
              Taro.redirectTo({ url: '/pages/info-succ?type=payCourse' })
            }
            //Taro.redirectTo({ url: '/pages/info-succ?type=payCourse' })
            // window.location.replace(window.location.origin + '/#/pages/info-succ?type=payCourse')

          })
          .catch(err => {

            if (err.code == 13) {
              Taro.showToast({
                title: '已经购买过了!', //提示的内容, 
                icon: 'none', //图标, 
                duration: 2000, //延迟时间, 
                mask: true, //显示透明蒙层，防止触摸穿透, 
              })
              setTimeout(() => {
                Taro.redirectTo({ url: '/pages/knowledge-online-detail?id=' + this.state.id })
              }, 1000)
            } else if (err.code == 14) {
              Taro.showToast({
                title: '找不到该课程!', //提示的内容, 
                icon: 'none', //图标, 
                duration: 2000, //延迟时间, 
                mask: true, //显示透明蒙层，防止触摸穿透, 
              })
            } else {
              Taro.showToast({
                title: err.msg ? err.msg : String(err), //提示的内容, 
                icon: 'none', //图标, 
                duration: 2000, //延迟时间, 
                mask: true, //显示透明蒙层，防止触摸穿透, 
              })
            }
          })

      })
      .catch(err => {
        Taro.showToast({
          title: err.msg ? err.msg : err, //提示的内容,
          icon: "none", //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
  }, 2000)

  /** 微信支付 */
  async WeixinPay(obj) {
    await this.getCouponData()
    this.updateTotalFee()
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

  /** Switch 开关 */
  handleChange = (useBalance) => {
    this.setState({ useBalance }, () => {
      this.updateTotalFee()
    })
  }

  /**
   * 计算实际支付
   *
   * @param {boolean} auto - 优惠券是否使用推荐算法
   */
  updateTotalFee = (auto = true) => {

    /** 课程原价格 */
    //let price = +this.state.dataList.price
    let price = 0
    if(this.state.newyears == 1 && (this.state.userInfo.lian || this.state.userInfo.is_club) && this.state.dataList.is_active ){
      price = +16.8
    }else{
      price = +this.state.dataList.price
    }

    /** 学习储值卡余额 */
    let club_card = +this.state.userInfo.club_card || 0

    /** 是否为会员7.5折--------现在已经去掉 */
    let isVideoVip = false
    /*
    let isVideoVip = false
    if(this.state.newyears != 1){
       isVideoVip = !!this.state.userInfo.lian
    }
    */

    /** 所选的优惠券 */
    let selectedCoupon = { suit_amount: 0, id: 0, amount: 0 }

    /** 推荐合适的优惠券 */
    let couponUsed = (nowPrice) => {
      const couponList = this.state.couponList || []
      if (couponList.length > 0) {
        // 找合适的优惠券
        couponList.map(v => {
          v.choose = false
          /** 课程价格大于优惠券金额 */
          const flag1 = +nowPrice >= v.amount
          /** 课程价格大于优惠券门槛 */
          const flag2 = +nowPrice >= v.suit_amount
          /** 优惠券门槛大于已选的优惠券门槛 */
          const flag3 = v.suit_amount >= selectedCoupon.suit_amount
          /** 优惠券金额大于已选的优惠券金额 */
          const flag4 = v.amount > selectedCoupon.amount
          if (flag2 && flag3 && flag4) {
            selectedCoupon = {
              id: v.id,
              suit_amount: v.suit_amount,
              amount: v.amount
            }
          }
        })
        // 选中那一张
        couponList.find(item => item.id === selectedCoupon.id && (item.choose = true))

        this.setState({
          couponList: [...couponList]
        })
      }
    }


    /** 使用多少余额 */
    let balance = 0

    if (this.state.useBalance) {
      balance = price > club_card ? club_card : price
    }

    /** 实付价格 */
    let totalFee = math.number(
      math
        .chain(math.bignumber(price))
        .subtract(math.bignumber(balance))
        .multiply(math.bignumber(isVideoVip ? 0.75 : 1))
        .done()
    )

    totalFee = (Math.ceil(+totalFee * 100) / 100).toFixed(2)
    // totalFee = +totalFee.toFixed(2)

    /** 视频会员折扣-----暂时删掉 */
    let discount = 0
    /*
    let discount = math.number(
      math
        .chain(math.bignumber(price))
        .subtract(math.bignumber(balance))
        .multiply(math.bignumber(isVideoVip ? 0.25 : 0))
        .done()
    )
    discount = (Math.floor(+discount * 100) / 100).toFixed(2)
    */

    // 课程价格少于0.1元上面的运算作废 并且价格不是等于0(用了储蓄卡会等于0)
    // if (price < 0.1 && +totalFee !== 0) {
    //   totalFee = price
    // }
    /**
     * totalFee 等于0 说明全部用了储值卡抵扣，不需要使用优惠券
     * auto && isVideoVip 可以推荐算法获取合适的优惠券
     * 使用之前已选择的优惠券
     */
    if (+totalFee === 0 && balance === price) {

    } else if (auto && isVideoVip) {
      couponUsed(totalFee)
    } else {
      selectedCoupon = this.state.selectedCoupon
    }

    /** 处理浮点数减法出现问题 */
    totalFee = (+totalFee - (selectedCoupon.amount || 0)).toFixed(2)
    totalFee = Number(totalFee)

    // 实付金额少于 0 元
    if (+totalFee < 0) {
      totalFee = 0
    }

    const allDiscount = Math.abs(totalFee - price).toFixed(2)

    this.setState({ total_fee: totalFee, balance, discount, selectedCoupon, allDiscount })

  }

  /** 优惠券弹窗的操作
   * @param {boolean} SW - 弹窗关闭开关
   * @param {Array} data - 优惠券的选中数据
   */
  couponShowHandle = (SW, data) => {
    this.setState({ couponShow: SW }, () => {
      if (!SW) this.updateTotalFee(false)
    })
  }

  choose(id, allow) {
    if (!allow) return
    const couponList = this.state.couponList
    let selectedCoupon = { suit_amount: 0, id: 0, amount: 0 }
    // 已选的那种
    couponList.find(v => {
      if (v.id === id) {
        v.choose = !v.choose
      }
    })

    couponList.map(v => {
      if (v.choose) {
        if (v.id === id) {
          selectedCoupon = v
        } else {
          v.choose = false
        }
      }
    })


    this.setState({
      couponList: [...couponList],
      selectedCoupon
    }, () => {
      this.updateTotalFee(false)
    })
  }

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

          {/* 学习储值卡 + 优惠券选择 */}
    {/*
          <View className='ll-cells ll-cell--noborder content discountPart'>
            <View className='ll-cell content__bd'>
              <View className='ll-cell__hd content__label content__label--title'>
                学习储值卡
              </View>
              <View className='ll-cell__bd content__label'>
                {!+club_card && '无'}可用余额{+club_card > 0 && +club_card + '元'}
              </View>
              <View className='ll-cell__ft'>
                <AtSwitch
                  color='#d62419'
                  border={false}
                  disabled={club_card <= 0}
                  checked={this.state.useBalance}
                  onChange={this.handleChange}
                />
              </View>
            </View>
            <View className='ll-cell content__bd'>
              <View className='ll-cell__hd content__label content__label--title'>
                优惠券
              </View>
              { this.state.newyears ?
                <View className={['ll-cell__ft', 'content__label', this.state.selectedCoupon.amount ? 'll-cell__bd tl' : 'll-cell__bd ll-cell__ft--in-access']}>
                活动期间不可用
                </View>
                  :
              <View className={['ll-cell__ft', 'content__label', this.state.selectedCoupon.amount ? 'll-cell__bd tl' : 'll-cell__bd ll-cell__ft--in-access']} onClick={this.couponShowHandle.bind(this, true)}>
                {
                  this.state.userInfo.lian ?
                    (+this.state.selectedCoupon.amount > 0 ? '已选推荐优惠券' : '无可用优惠券')
                    :
                    '需要开通会员'
                }
              </View>
               }
              <View className={['ll-cell__ft', 'content__label', 'll-cell__ft--in-access', !this.state.selectedCoupon.amount && 'hide']} onClick={this.couponShowHandle.bind(this, true)}>
                -¥{this.state.selectedCoupon.amount}
              </View>
            </View>
          </View>
          */}
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
    {/*
            <View className='ll-cell discountItem'>
              <View className='ll-cell__hd content__label content__label--title'>
              学习储蓄卡
              </View>
              <View className='ll-cell__ft ll-cell__bd content__price'>
              -¥{this.state.balance}
              </View>
            </View>
            */}
    {/*
            <View className='ll-cell discountItem'>
              <View className='ll-cell__hd content__label content__label--title'>
              会员7.5折
              </View>
              <View className='ll-cell__ft ll-cell__bd content__price'>
              -¥{this.state.discount}
              </View>
            </View>
            */}
    {/*
            <View className='ll-cell discountItem'>
              <View className='ll-cell__hd content__label content__label--title'>
              优惠券
              </View>
              <View className='ll-cell__ft ll-cell__bd content__price'>
              -¥{this.state.selectedCoupon.amount || 0}
              </View>
            </View>
        */}

          </View>

    {/*
          <View className='discountDocs'>
            <View className='docs__title'>
              <Image className='icon' src={this.props.userStore.imgUrl + 'icon_cal.png'} />
              <Text className='text'>优惠规则说明</Text>
            </View>
            <View className='docs__content'>
              1.拥有学习储值卡，可以使用学习储值卡余额抵扣；
            <View className='br'></View>
            2.开通了链链会员，即可享有会员权益：7.5折以及优惠券，优惠顺序为：先打折后用优惠券；
            <View className='br'></View>
            3.拥有学习储值卡并开通了链链会员，可享有两者的权益，优先使用使用学习储值卡余额抵扣，抵扣后的金额再享受会员权益的优惠，即继续打折后用优惠券；
            <View className='br'></View>
            4.普通用户不享受优惠。
          </View>
          </View>
*/}
          {
            // <Coupon total_fee={this.state.total_fee} couponList={this.state.couponList} couponShow={this.state.couponShow} couponShowHandle={this.couponShowHandle}></Coupon>
            <View className={['couponDialog', !this.state.couponShow ? 'out' : 'in']}>
              <View className={['coupon']}>
                <View className='header'>
                  <View className='title'>优惠券</View>
                  <View className='cancel' onClick={this.couponShowHandle.bind(this, false)}>取消</View>
                </View>
                <View className='main'>
                  <View className='mainScroll'>
                    {
                      !this.state.userInfo.lian && this.state.couponList.length === 0 &&
                      <Navigator url='/pages/videoVip'>
                        <Image src={this.props.userStore.imgUrl + 'videoCardBanner.png'} className='club-entry'></Image>
                      </Navigator>
                    }
                    {this.state.couponList && this.state.couponList.length > 0 && this.state.couponList.map((v, k) =>
                      <View key={k.id} className='main__couponItem' onClick={this.choose.bind(this, v.id, v.suit_amount <= (this.state.total_fee + this.state.selectedCoupon.amount))}>
                        <Image className='coupon__background' src={this.props.userStore.imgUrl + (v.suit_amount <= (this.state.total_fee + this.state.selectedCoupon.amount) ? 'bg_tik_nor.png' : 'bg_tik_dis.png')} />
                        <View className='money'>
                          <Text className='money__main'>¥{v.amount}</Text>
                          <Text className='small'>满{v.suit_amount}元使用</Text>
                        </View>
                        <View className='coupon__docs'>
                          <View className='docs__mian'>用于线上课程</View>
                          <View className='docs__subhead'>每月更新</View>
                        </View>
                        <Image className='switch' src={this.props.userStore.imgUrl + ((v.choose || v.id === this.state.selectedCoupon.id) ? 'radio_on.png' : 'radio_off.png')} />
                      </View>
                    )}
                  </View>
                </View>
                <View onClick={this.couponShowHandle.bind(this, false)} className='btn'>确定</View>
              </View>
            </View>
          }
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
              已优惠¥{this.state.allDiscount}
            </View>
            <View className='ll-cell__ft'>
              <Button className='btn bottom__btn btn-pay' onClick={this.submit}>提交订单</Button>
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
