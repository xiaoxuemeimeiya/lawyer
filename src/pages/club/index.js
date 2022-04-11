import Taro, { Component } from "@tarojs/taro"
import {
  View,
  Image,
  Button,
  Navigator,
  ScrollView,
  Text
} from "@tarojs/components"

import ClipboardJS from "clipboard"
import dayjs from "dayjs"
import { observer, inject } from "@tarojs/mobx"
import { payClub } from "../../api/pay"

import { getSharePeople } from "../../api/club"
import InlineShare from "../../components/InlineShare"
import Title from "../../components/Title"
import Login from "../../components/Login"
import { decryption } from "../../utils/aes"
import Tabbar from "../../components/Tabbar"
import { Case, Content } from "./components"

import "./index.scss"

@Title("链链俱乐部")
@Login
@inject("userStore")
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "链链俱乐部"
  };

  constructor() {
    super(...arguments)
    this.state = {
      /** 是否显示模态框 */
      isOpened: false,

      dataList: {},

      /** 微信分享配置 */
      shareOpts: { wx: null, moments: null },
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  componentDidMount() {
    this.getDataList()
    this.share()
    if (this.state.userInfo && this.state.userInfo.headimgurl) {
    } else {
      this.props.userStore.getUserInfoAsync()
    }
  }

  componentWillUnmount() {
    this.copyObj.destroy()
  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    this.getData()
  }


  /** 立即加入 */
  joinNow = () => {

    Taro.showLoading({
      title: '', //提示的内容,
      mask: true, //显示透明蒙层，防止触摸穿透,
    })

    payClub()
      .then(res => {
        console.log("TCL: submit -> res", res)
        this.WeixinPay(res.data)
          .then(() => {
            console.log('支付成功!')

            // 更新用户信息
            this.props.userStore.getUserInfoAsync()
              .then(() => {
                Taro.hideLoading()
                // Taro.redirectTo({ url: '/pages/info-succ?type=clubInviteCode' })
                window.location.replace(window.location.origin + '/#/pages/info-succ?type=clubInviteCode')


              })
              .catch(err => {
                console.log(err)
                Taro.hideLoading()
                Taro.showModal({
                  title: '提示',
                  content: '您已购买成功',
                  showCancel: false, //是否显示取消按钮,
                  confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
                  confirmColor: "#d62419", //确定按钮的文字颜色,
                  success: () => {
                    // 跳转回首页
                    window.location.href = `${window.location.protocol}//${window.location.host}/`
                  }
                })
              })
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
        Taro.hideLoading()
        console.log(err)

        Taro.showToast({
          title: err.msg ? err.msg : err, //提示的内容, 
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


  getData() {
    return getSharePeople()
      .then(res => {
        this.setState(
          {
            dataList: res.data
          },
          () => {
            this.copy()
          }
        )

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

  /** 复制邀请码 */
  copy() {
    if (!this.copyObj) {
      this.copyObj = new ClipboardJS(".copy")
      this.copyObj.on("success", function (e) {
        // 复制成功
        console.log(e.text)
        Taro.showToast({ title: "复制成功!" })
      })
      this.copyObj.on("error", function (e) {
        //复制失败；
        Taro.showToast({ title: "复制失败!请手动复制邀请码", icon: "none" })
        console.log(e.action)
      })
    }
  }

  /** 跳转到对应的详情区域 */
  toDetail(index) {
    Taro.navigateTo({ url: `/pages/club-detail?index=${index}` })
  }

  /** 微信H5分享 */
  share() {
    const { userinfo } = this.state.userInfo
    const shareOpts = {
      // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
      wx: {
        title: `${userinfo.nickname}邀请您加入链链俱乐部`, // 分享标题
        desc: "领取链链俱乐部8大权益", // 分享描述
        link:
          process.env.NODE_ENV === "production"
            ? "http://wap.mylyh.com/#/pages/club"
            : "http://devwap.mylyh.com/#/pages/club", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: "http://wap.mylyh.com/#/pages/club-inviting" // 分享图标
      },
      // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
      moments: {
        title: `${userinfo.nickname}邀请您加入链链俱乐部`, // 分享标题
        link:
          process.env.NODE_ENV === "production"
            ? "http://wap.mylyh.com/#/pages/club"
            : "http://devwap.mylyh.com/#/pages/club", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: "http://wap.mylyh.com/#/pages/club-inviting" // 分享图标
      }
    }

    this.setState({ shareOpts })
  }

  render() {
    let { isClubVIP } = this.state.userInfo
    let userInfo = this.state.userInfo.userinfo

    const scrollText = [
      '小链刚刚加入了链链俱乐部',
      '小陈刚刚加入了链链俱乐部',
      '张鑫刚刚加入了链链俱乐部',
      '李东明刚刚加入了链链俱乐部',
      '陈森刚刚加入了链链俱乐部',
      '黄强刚刚加入了链链俱乐部'
    ]


    return (
      <View className='ClubInviting Club'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            height: "100%",
            boxSizing: "border-box",
          }}
          onScroll={this.onScroll}
        >

          <View className={['header', isClubVIP === 0 && 'unVip']}>
            {
              isClubVIP !== 0 &&
              <View>
                <View className='ll-cells ll-cell--noborder header-info'>
                  <View className='ll-cell ll-cell--access ll-cell--primary'>
                    <View className='ll-cell__hd'>
                      <Image className='avatar header-info__avatar' src={this.state.userInfo.userinfo.headimgurl || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
                    </View>
                    <View className='ll-cell__bd'>
                      <View className='header-info__title'>{this.state.userInfo.userinfo.nickname}</View>
                      <View className='header-info__title--sm'>
                        {isClubVIP == 1 && (dayjs(this.state.userInfo.end_time * 1000).format("YYYY年MM月DD日到期"))}
                        {isClubVIP == 2 && ("已到期")}
                      </View>
                    </View>
                    <Navigator url='/pages/club-rule' className='ll-cell__ft ll-cell__ft--in-access header-info__ft'>规则</Navigator>
                  </View>
                </View>

                <View className='ll-cells ll-cell--noborder profit'>
                  <View className='ll-cell'>
                    <Navigator
                      className='ll-cell__bd'
                      url='/pages/profit'
                    >
                      <View className='profit-title--sm'>收益</View>
                      <View className='profit-title'>{this.state.userInfo.club_account}</View>
                    </Navigator>
                    <Navigator
                      className='ll-cell__bd'
                      url='/pages/stored-card'
                    >
                      <View className='profit-title--sm'>学习储值卡</View>
                      <View className='profit-title'>{this.state.userInfo.club_card || 0}</View>
                    </Navigator>
                    <Navigator
                      className='ll-cell__bd'
                      url='/pages/club-invited'
                    >
                      <View className='profit-title--sm'>助力好友</View>
                      <View className='profit-title'>{this.state.dataList.help_num}</View>
                    </Navigator>
                  </View>
                </View>
              </View>
            }
            {
              isClubVIP === 0 &&
              <View>
                <View className='logo'>
                  <Image className='logo__img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/logo.png'></Image>
                  <View className='logo__text'>链接知识领袖，助力全球贸易</View>
                </View>

                <View className='ll-cells ll-cell--noborder sign-info'>
                  <View className='ll-cell'>
                    <View className='ll-cell__bd'>
                      <View className='sign-info__bd'>
                        <Image className='avatar sign-info__avatar' src='https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'></Image>
                        <View className='sign-info__text'>
                          <View className={['textInfo', 'ellipsis', !scrollText && 'hide']}>
                            {
                              scrollText && scrollText.map(v => (
                                <Text key={v}>{v}</Text>
                              ))
                            }
                          </View>
                        </View>
                      </View>
                    </View>
                    <View className='ll-cell__ft sign-info__ft'>
                      已有达人1000+
                      </View>
                  </View>
                </View>
              </View>
            }

            <View className='ll-cells ll-cell--noborder card'>
              <Navigator url='/pages/club-detail?index=0' className='ll-cell ll-cell--access card__hd'>
                <View className='ll-cell__bd card-title'>
                  俱乐部8大权益
                  </View>
                <View className='ll-cell__ft ll-cell__ft--in-access card--in-access'>查看详情 </View>
              </Navigator>
              <View className='card__bd clearfix'>
                <View className='card-item' onClick={this.toDetail.bind(this, 0)}>
                  <Image className='card-item__img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/club_01.png' />
                  <View className='card-item__text'>1000元储值卡</View>
                </View>
                <View className='card-item' onClick={this.toDetail.bind(this, 1)}>
                  <Image className='card-item__img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/club_02.png' />
                  <View className='card-item__text'>大咖闭门会</View>
                </View>
                <View className='card-item' onClick={this.toDetail.bind(this, 2)}>
                  <Image className='card-item__img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/club_03.png' />
                  <View className='card-item__text'>高端走访活动</View>
                </View>
                <View className='card-item' onClick={this.toDetail.bind(this, 3)}>
                  <Image className='card-item__img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/club_04.png' />
                  <View className='card-item__text'>推荐新人奖励</View>
                  <View className='card-item__tip'>+200</View>
                </View>
                <View className='card-item' onClick={this.toDetail.bind(this, 4)}>
                  <Image className='card-item__img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/club_04.png' />
                  <View className='card-item__text'>课程服务奖励</View>
                  <View className='card-item__tip'>+20%</View>
                </View>
                <View className='card-item' onClick={this.toDetail.bind(this, 5)}>
                  <Image className='card-item__img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/club_06.png' />
                  <View className='card-item__text'>付费直播</View>
                </View>
                <View className='card-item' onClick={this.toDetail.bind(this, 6)}>
                  <Image className='card-item__img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/club_07.png' />
                  <View className='card-item__text'>付费活动优先资格</View>
                </View>
                <View className='card-item' onClick={this.toDetail.bind(this, 7)}>
                  <Image className='card-item__img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/club_08.png' />
                  <View className='card-item__text'>专属微信群</View>
                </View>
              </View>
            </View>

          </View>


          <View className='title'>俱乐部达人专享</View>

          {/* 移动卡片 */}
          <Content></Content>
          {/* 达人声音 */}
          <Case></Case>
        </ScrollView>

        {/* 底部 */}
        {
          isClubVIP !== 0 &&
          <View className='bottom'>
            <View className='ll-cells ll-cell--noborder'>
              <View className='ll-cell'>
                <View className='ll-cell__bd invite-info'>
                  你的邀请码：<Text>{this.state.dataList.code}</Text>{" "}
                  <View
                    className='copy'
                    data-clipboard-text={this.state.dataList.code}
                  >
                    复制
                  </View>
                </View>
                <View className='ll-cell__ft'>
                  <Button
                    className='btn btn-invite'
                    onClick={() => {
                      this.setState({ isOpened: true })
                    }}
                  >
                    邀请好友加入
                  </Button>
                </View>
              </View>
            </View>
          </View>
        }

        {/* 支付按钮,非会员 */}
        {
          isClubVIP === 0 &&
          <View className='join'>
            <Navigator url='/pages/club-invite-code' className='btn join__left'>我有推荐人</Navigator>
            <Button className='btn join__right' onClick={this.joinNow}>
              支付869元加入
            </Button>
          </View>
        }

        <Tabbar></Tabbar>

        {/* 模态框 */}
        <View
          className='model'
          style={{ display: this.state.isOpened ? "block" : "none" }}
        >
          <Image
            className='model__img'
            src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_share@2x.png'
          ></Image>
          <View className='model__text'>点击右上角分享给朋友</View>
          <View
            className='btn model__btn'
            onClick={() => {
              this.setState({ isOpened: false })
            }}
          >
            知道了
          </View>
        </View>

        {/* 微信H5分享 */}
        <InlineShare {...this.state.shareOpts}></InlineShare>
      </View>
    )
  }
}

export default Index
