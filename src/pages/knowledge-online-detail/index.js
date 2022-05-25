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
import Share from "../../components/Share"
import Tg1 from "../../components/Tg1"
import Gzh from "../../components/Gzh"
import {is_set_Course,receive_Course} from "../../api/my-course"
import "./index.scss"
import voice from '@/src/components/musicPlayer'

@Title("课程详情")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "课程详情"
  }

  constructor() {
    super(...arguments)
    this.state = {
      tabIndex: 0,
      /** 邀请码 */
      code: '',
      id: "", // 线下详情id
      isFirstLoding: true,
      course: "",
      dataList: [], // 分页数据
      isScrollTop: false, // scroll-view 是否滚动到顶部
      scrollIntoView: "",
      /** 是否置顶 */
      isFixed: false,
      scrolling: false,
      close:false,
      /** 是否隐藏分享提示 */
      hideShareTip: getCookie("HIDE_SHARE_TIP"),
      /** 是否为名家学堂课程 */
      famous: !!this.$router.params.famous,
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
    //this.detachVedeo()
  }

  componentDidShow(){
      if(typeof (this.player) != "undefined" && !this.player.paused){
        console.log(7979)
        document.querySelector('.xgplayer-play').click()
      }
  }


  handleTabChage = value => {
    // 微信小程序环境中使用,H5环境请用下面一段代码
    /* this.setState(
      {
        tabIndex: value,
        scrollIntoView: "tab"
      },
      () => {
        this.setState({ scrollIntoView: "" })
      }
    ) */

    // HACK: 解决H5设置crollIntoView不置顶问题

    /** 滑动函数
     * @dom 滚动元素
     * @direction 方向
     * @target 目标位置
     * @original 当前滚动位置
     */
    const scroolAnimation = (dom, direction, target, original) => {
      if (direction) {
        let move = () => {
          original = original + Math.ceil(target - original) / 8
          dom.scrollTo(0, original)
          if (original > target) {
            this.setState({
              scrolling: false,
            })
          } else {
            window.requestAnimationFrame(move)
          }
        }
        move()
      } else {
        let move = () => {
          original = original - Math.ceil(original - target) / 8
          dom.scrollTo(0, original)
          if (original < target) {
            this.setState({
              scrolling: false,
            })
          } else {
            window.requestAnimationFrame(move)
          }
        }
        move()
      }
    }


    if (process.env.TARO_ENV === 'h5') {
      this.setState({
        tabIndex: value,
        isFixed: true,
        scrolling: true,
      })

      var $tab = document.getElementById("tab")
      var rectTop = $tab.getBoundingClientRect().top
      var $scrView = document.querySelector(".KnowledgeOnlineDetail").querySelector(".scrollview")
      let scrollLength = ~~$scrView.scrollTop
      if (value === 0) {
        setTimeout(() => {
          if (rectTop > 2 || rectTop < -2) {
            let sTop = ~~$scrView.scrollTop + rectTop
            if (sTop < scrollLength) this.setState({ isFixed: false })
            scroolAnimation($scrView, sTop > scrollLength, sTop, scrollLength)
          }
        }, 0)
      }
      if (value === 1) {
        let richTextHeight = document.querySelector('.rich-text').offsetHeight || document.querySelector('.rich-text').clientHeight || document.querySelector('.rich-text').scrollHeight
        setTimeout(() => {
          var sTop = $scrView.scrollTop + rectTop + richTextHeight
          scroolAnimation($scrView, sTop > scrollLength, sTop, scrollLength)
        }, 0)
      }
      if (value === 2) {
        let richTextHeight = document.querySelector('.rich-text').offsetHeight || document.querySelector('.rich-text').clientHeight || document.querySelector('.rich-text').scrollHeight
        let courseCatalogHeight = document.querySelector('.course-catalog').offsetHeight || document.querySelector('.course-catalog').clientHeight || document.querySelector('.course-catalog').scrollHeight
        setTimeout(() => {
          var sTop = $scrView.scrollTop + rectTop + richTextHeight + courseCatalogHeight
          scroolAnimation($scrView, sTop > scrollLength, sTop, scrollLength)
        }, 0)
      }
    }
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

  /** 更新课程数据 */
  updateCourseData() {
    return new Promise(resolve => {
      getOnlineDetail(this.state.id).then(res => {
        this.setState({
          course: res.data.detail,
          dataList: res.data.comment,
        }, () => {
          resolve('ok')
        })
      })
    })
  }

  getData() {
    return getOnlineDetail(this.state.id)
      .then(res => {
        // 根据富文本数据确定是否取消父盒子的内边距
        if (res.data && res.data.detail && res.data.detail.content) {
          const content = res.data.detail.content
          paddingZero(content)
        }

        /** 个性化分享 */
        Share({
          wx: {
            title: res.data.detail.leader_word || res.data.detail.name, // 分享标题
            desc: res.data.detail.desc_word, // 分享描述
            link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: res.data.detail.cover_img || "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png", // 分享图标
            success: function () {
              // 设置成功
              console.log('ok~~')
            }
          }
        })

        this.setState({
          course: res.data.detail,
          dataList: res.data.comment,
        }, () => {
          this.initVideo()
        })

        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
      })
      .catch(err => {
        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
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

  /** 初始化视频 */
  initVideo = () => {
    let playUrl = ''
    this.player = null

    if (this.state.course.radio_try) {
      playUrl = this.state.course.radio_try
    } else if (this.state.course.part_list[0] && this.state.course.part_list[0]['music_url']) {
      playUrl = this.state.course.part_list[0]['music_url']
    } else {
      return
    }

    let player = this.player = new Player({
      id: 'mse',
      width: '100%',
      height: '100%',
      playsinline: true, // 开启ios和微信的内联模式
      closeVideoTouch: true,
      "whitelist": [""],
      url: playUrl,
      poster: this.state.course.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'
    })
    // 设置播放loading时的背景图
    this.player.once('ready', () => {

      // 添加免费试播放的样式
      document.querySelector('.xgplayer-start').classList.add('op0')
      // 开始播放后把这个样式移除
      document.querySelector('.try-play').addEventListener('click', function () {
        document.querySelector('.try-play').classList.add('hide')
        //document.querySelector('.xgplayer').classList.add('flur-img')
        //document.querySelector('.xgplayer-play').click()
        document.querySelector('.xgplayer-start').click()
        document.querySelector('.xgplayer-start').classList.remove('op0')
        voice.hidePlayer()
      })
      //停止播放后把这个样式移除
      /*
      document.querySelector('.xgplayer-play').addEventListener('click', function () {
        document.querySelector('.try-play').classList.remove('hide')
        document.querySelector('.try-playing').classList.add('hide')
      })
      */
      document.querySelector('.xgplayer-play').addEventListener('click', function () {
        if(!player.paused){
          //
          voice.hidePlayer()
        }
      })

     let vedio = this.state.course.part_list[0].video

      let time = setTimeout(function(){console.log(player.paused)
        if(player.paused){
          document.querySelector('.try-playing-view').classList.add('hide')
        }else{
          voice.hidePlayer()
          document.querySelector('.try-playing-view').classList.remove('hide')

          if (vedio == 2) {
            document.querySelector('.xgplayer').classList.remove('xgplayer-inactive')
          }
        }
      },200)


      document.querySelector('.xgplayer-enter').setAttribute('style', `background:url(${this.state.course.cover_img});background-position: center;background-size: cover;`)
      // 当时音频的时候，将封面设置上去
      //if (playUrl.match(/mp3$/)) {
      if (this.state.course.part_list[0].video == 2) {
        document.querySelector('.xgplayer').setAttribute('style', `background:url(${this.state.course.cover_img});background-position: center;background-size: cover;filter:`)
        document.querySelector('.xgplayer').classList.add('xgplayer-fliter-video')
      }
    })
  }


  /** 解除视频 */
  detachVedeo = () => {
    //this.player && this.player.destroy()
    if(typeof (this.player) != "undefined"  && !this.player.paused){
      this.player.destroy()
    }
  }

  /**
   * 滚动到顶部/左边时触发
   */
  onScrollToUpper = throttle(() => {
    // H5环境取消下拉刷新
    if (process.env.TARO_ENV !== 'h5') {
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

  /** 购买
   * @videoId 当前点击的item对应的视频ID
   */
  showBottom = async (videoId) => {console.log(7877879)
    const { isLogin } = this.props.loginStore
    if (!isLogin) {
      checkReg()
      return
    }

    // 判断是否免费或者是否对俱乐部会员免费开放
    if (+this.state.course.price === 0 || (this.state.course.type === 1 && this.state.userInfo.lian)) {
      if(this.state.course.is_active === 1 && this.state.userInfo.lian_type === 2){
        if(this.state.course.is_adv == 1){
          /*
          Taro.navigateTo({
            url: '/pages/video-success'
          })
          */
          window.location.href = this.state.course.redirect_url
        }else {
          if (this.state.course.part_list[0]['video'] == 2) {
            voice.saveVoiceInfo(this.state.course, this.state.course.part_list, 0)
            //voice.isShowPlayer()
            //音频
            Taro.navigateTo({
              url: '/pages/videoDetail'
            })
          } else {
            Taro.navigateTo({
              url: '/pages/knowledge-video?id=' + this.state.id
            })
          }
        }
        return
      }else if(this.state.course.is_active === 0){
        if (this.state.course.part_list[0]['video'] == 2) {
          voice.saveVoiceInfo(this.state.course, this.state.course.part_list, 0)
          //voice.isShowPlayer()
          //音频
          Taro.navigateTo({
            url: '/pages/videoDetail'
          })
        } else {
          Taro.navigateTo({
            url: '/pages/knowledge-video?id=' + this.state.id
          })
        }
        return
      }
    }


    /** 购买课程后 返回来页面没有刷新, 需要检测一下是否已经支付,已支付的纸条跳转到课程页面 */
    Taro.showLoading({ mask: true })
    await this.updateCourseData()

    if (this.state.userInfo.isVIP || this.state.course.pay_type == 1 || this.state.course.pay_type == 2 || this.state.course.pay_type == 3) {
      if(this.state.course.is_adv == 1){
        /*
         Taro.navigateTo({
           url: '/pages/video-success'
         })
         */
        window.location.href = this.state.course.redirect_url
      }else{
        if(this.state.course.part_list[0]['video'] == 2){
          voice.saveVoiceInfo(this.state.course, this.state.course.part_list, 0)
          //voice.isShowPlayer()
          //音频
          Taro.navigateTo({
            url: '/pages/videoDetail'
          })
        }else {
          Taro.navigateTo({
            url: `/pages/knowledge-video?id=${this.state.id}&videoId=${videoId}`
          })
        }
      }

      return
    } else if (this.state.course.pay_type == 0) {
      // 更新一下用户信息 余额信息
      await this.props.userStore.getUserInfoAsync()

      Taro.navigateTo({
        url: '/pages/knowledge-online-pay?id=' + this.state.id + '&code=' + this.state.code
      })
      return
    }

  }

  //会员免费
  showBottom1 = async (videoId) => {console.log(312321)
    const { isLogin } = this.props.loginStore
    if (!isLogin) {
      checkReg()
      return
    }

    // 判断是否免费或者是否对俱乐部会员免费开放
    if (+this.state.course.price === 0 || (this.state.course.type === 1 && this.state.userInfo.lian)) {
      //判断是否是直播课
      if(this.state.course.is_adv == 1){
        //跳转到小鹅通
        /*
         Taro.navigateTo({
           url: '/pages/video-success'
         })
         */
        window.location.href = this.state.course.redirect_url
        return
      }else{
        if(this.state.course.part_list[0]['video'] == 2){
          voice.saveVoiceInfo(this.state.course, this.state.course.part_list, 0)
          //voice.isShowPlayer()
          //音频
          Taro.navigateTo({
            url: '/pages/videoDetail'
          })
        }else{
          Taro.navigateTo({
            url: '/pages/knowledge-video?id=' + this.state.id
          })
        }
        return
      }
    }else{
      //弹框，让开通会员
      this.setState({ close: true})
    }
  }

  xiazaiclose = () => {
    this.setState({ close: false})
  }
  stopxiazaiclose = (e) => {
    e.stopPropagation()
  }
  openvip = () => {
    Taro.navigateTo({
      url: '/pages/videoVip'
    })
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
    this.setState({ hideShareTip: true })

    Taro.navigateTo({ url: `/pages/knowledge-share?type=on&id=${this.state.id}` })
  }

  /* 监听滚动事件 */
  scrollFn = throttle(() => {
    if (this.state.scrolling) return
    const fn = () => {
      const $tabsBox = document.querySelector("#tab")
      const top1 = $tabsBox.getBoundingClientRect().top


      const $courseCatalog = document.querySelector(".course-catalog")
      const top2 = $courseCatalog.getBoundingClientRect().top
/*
      const $courseEvaluate = document.querySelector(".course-evaluate")
      const top3 = $courseEvaluate.getBoundingClientRect().top
      */

      setTimeout(() => {
        /*
        if (this.state.tabIndex !== 2 && top3 <= 73) {
          this.setState({ tabIndex: 2 })
        }

        if (this.state.tabIndex !== 1 && top2 <= 73 && top3 > 73) {
          this.setState({ tabIndex: 1 })
        }
        */
        if (this.state.tabIndex !== 2) {
          this.setState({ tabIndex: 2 })
        }

        if (this.state.tabIndex !== 1 && top2 <= 73) {
          this.setState({ tabIndex: 1 })
        }

        if (this.state.tabIndex !== 0 && top1 < 0 && top2 > 100) {
          this.setState({ tabIndex: 0 })
          this.setState({ isFixed: true })
        }
      }, 0)

      if (top1 < 2) {
        this.setState({ isFixed: true })
      } else {
        this.setState({ isFixed: false })
      }
    }
    fn()
  }, 20)

  render() {
    /** 按钮显示文字 */
    /*
   const buttonTip = (() => {
     if (+this.state.course.price === 0) {
       return '免费学习'
     } else if (this.state.course.type === 1 && (this.state.userInfo.isClubVIP || this.state.userInfo.lian)) {
       return '会员免费学'
     } else if (this.state.userInfo.isVIP || this.state.course.pay_type == 1 || this.state.course.pay_type == 2 || this.state.course.pay_type == 3) {
       return '立即学习'
     } else {
       return '￥'+this.state.course.price+'立即购买'
     }
   })()
   */
    let showbuttonTip = false
    let showbuttonTip1 = false
    let buttonTip1 = ''
    let big = false
    const buttonTip = (() => {
      if (+this.state.course.price === 0) {
        showbuttonTip = true
        big = true
        return '免费学习'
      } else if (this.state.course.pay_type == 1 || this.state.course.pay_type == 2 || this.state.course.pay_type == 3) {
        showbuttonTip = true
        big = true
        return '立即学习'
      } else if ( this.state.course.type === 1 && this.state.userInfo.lian) {
        if(this.state.course.is_active === 1 && this.state.userInfo.lian_type === 2){
          buttonTip1 = '会员免费学'
          big = true
          showbuttonTip1 = true
        }else if(this.state.course.is_active === 0 ){
          buttonTip1 = '会员免费学'
          big = true
          showbuttonTip1 = true
        }else{
          //不免费
          big = true
          showbuttonTip = true
          return '季卡会员专享'
        }
      }else {
        if(this.state.course.type === 1){
          buttonTip1 = '会员免费学'
          showbuttonTip1 = true
          showbuttonTip = true
          return '¥'+this.state.course.price+'购买'
        }else{
          big = true
          showbuttonTip = true
          return '¥'+this.state.course.price+'购买'
        }
      }
    })()



    const tabList = this.state.course.is_adv === 0 ? [{title: "课程介绍"}, {title: "课程目录"}] : [{title: "课程介绍"}]


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
          onScroll={this.scrollFn}
        >
          {/* 滚动到顶部加载信息 */}
          {this.state.isScrollTop && <LL_loading></LL_loading>}
          {/* 视频 */}
          <View className='video-box'>
            {
              this.state.course.radio_try || (this.state.course.part_list && this.state.course.part_list[0] && this.state.course.part_list[0]['music_url']) ?
                <View id='mse'></View> :
                <View
                  className='video-box_img'
                  style={{ backgroundImage: `url(${this.state.course.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'})` }}
                >
                </View>
            }
            <Image className='try-play' src={this.props.userStore.imgUrl + 'freeTry.png'}></Image>
            {this.state.course.part_list && this.state.course.part_list[0]['video'] == 2 &&
              <View className='try-playing-view hide'>
                < Image
                className = 'try-playing'
                src = 'https://oss.mylyh.com/miniapp/versionv3.0/try-paying.gif' > < /Image>
                <View className='try-text'>播放中...</View>
              </View>
            }

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
              <View className='ll-cell__ft'>
                {this.state.course.part_num}集
              </View>
            </View>

            <View className='course-price videoVip'>
            <Text className='course-price__bd'> ¥{this.state.course.price}</Text>
            </View>


            {/* <View className='vip'>
              <Image
                className='vip__bd'
                src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/banner_vip_learn.png'
              />
            </View> */}

            {/* 链享卡入口 */}
            {/*
            <Navigator url='/pages/videoVip-buy' className={this.state.userInfo.lian && 'hide'}>
              <Image src={this.props.userStore.imgUrl + 'videoCardBanner.png'} className='club-entry'></Image>
            </Navigator>
            */}
            <Navigator url='/pages/videoVip'>
              <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/member-cover.png' className='club-entry'></Image>
            </Navigator>

          </View>
          {/* 专家信息 */}
          <View className='expert ll-cell--noborder ll-cells'>
            <Navigator url={'/pages/expert-detail?id=' + this.state.course.us_id} className='ll-cell ll-cell--access'>
              <View className='ll-cell__hd'>
                <Image
                  className='avatar avatar-expert'
                  src={
                    this.state.course.header_img ||
                    "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                  }
                />
              </View>
              <View className='ll-cell__bd'>
                <View className='expert__hd'>
                  <View className='expert__name'>
                    {this.state.course.us_regist_name}
                  </View>
                  {this.state.course.us_type == 2 && (
                    <View className='icon icon-expert-authentication'></View>
                  )}
                </View>
                <View className='expert__bd color-text-secondary'>
                  {this.state.course.chainman || ""}
                </View>
              </View>
              <View className='expert__ft ll-cell__ft ll-cell__ft--in-access'>
                TA的履历
              </View>
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
                    onClick={this.handleTabChage.bind(this)}
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

            {/* {this.state.tabIndex == 1 && ( */}
            {this.state && this.state.course.is_adv == 0 && (
              <View className='ll-cells ll-cell--noborder course-catalog'>
                <View className='ll-cell'>
                  <View className='ll-cell__bd'>
                    <View className='expert-title'>课程目录</View>
                  </View>
                </View>
                {this.state.course && this.state.course.part_list &&
                  this.state.course.part_list.map((item, index) => (
                    <View className='ll-cell' key={item.id} onClick={this.showBottom.bind(this, item.id)}>
                      <View className='ll-cell__hd course-catalog__hd'>
                        {index + 1}
                      </View>
                      <View className='ll-cell__bd course-catalog__bd ellipsis-2'>
                        {item.course_per}
                      </View>
                      <View className='ll-cell__ft'>
                        <View className='icon icon-play-lists'></View>
                      </View>
                    </View>
                  ))}
              </View>
            )}

            {/* {this.state.tabIndex == 2 && ( */}
            {/*}
            {this.state && (
              <Block>
                <View className='ll-cells ll-cell--noborder course-evaluate'>
                  <View className='ll-cell'>
                    <View className='ll-cell__bd'>
                      <View className='expert-title'>评价</View>
                    </View>
                  </View>
                  {
                    this.state.dataList.map(item => (
                      <View className='ll-cell ll-cell--primary' key={item.id}>
                        <View className='ll-cell__hd course-evaluate__hd'>
                          <Image
                            className='avatar'
                            src={
                              item.headimgurl ||
                              "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                            }
                          />
                        </View>
                        <View className='ll-cell__bd course-evaluate__bd'>
                          <View className='course-evaluate__name clearfix'>
                            <View className='fl'>{item.nickname}</View>
                            <View className='fr'>{item.addtime}</View>
                          </View>
                          <View className='course-evaluate__content ellipsis-2'>
                            {item.comment}
                          </View>
                        </View>
                      </View>
                    ))}
                </View>
                */}
                {/* 查看更多 或者 是空状态 */}
            {/*}
                {!!this.state.dataList.length ? (
                  <View className='ll-cells ll-cell--noborder'>
                    <View className='ll-cell'>
                      <View className='ll-cell__bd'>
                        <Navigator url='' className='btn btn-see-more m80 hide'>
                          查看更多
                          <View className='icon icon-more'></View>
                        </Navigator>
                      </View>
                    </View>
                  </View>
                ) : (
                    <View className='course-evaluate__emptyComment'>
                      <Image src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_recallnone%402x.png' />
                      <View className='text'>还没有任何评价</View>
                    </View>
                  )}
              </Block>
            )}
            */}
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
          {/* 分享提示 */}
          {
            !this.state.hideShareTip && <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/share_tip@2x.png' className='share-tip hide'></Image>
          }
        </View>
        <View className={['xiazai',!this.state.close && 'n-display']} onClick={this.xiazaiclose}>
           <View className='xiazai-content' onClick={(e)=>this.stopxiazaiclose(e)}>
              <View className='xiazai-rights'>开通会员即可体验此权益</View>
              <View className='xiazai-submit' onClick={this.openvip}>立即开通</View>
            </View>
         </View>
        <Tg1
            course={this.state.course}
        ></Tg1>
        {/* 首次加载 */}
        {this.state.isFirstLoding && <AtActivityIndicator size={36}></AtActivityIndicator>}
      </View>
    )
  }
}

export default Index
