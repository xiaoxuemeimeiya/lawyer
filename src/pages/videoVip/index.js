/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
    View,
    ScrollView,
    Image,
    Navigator,
    Text, Input,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import Swiper from '@/src/lib/swiper'
import store from '../../store'
import { checkReg } from '../../utils/login'

import { couponList, get_lian, vipDiscountCourse, member_reccommend, get_vipPrice ,getFamous,allPackage} from "../../api/videoVip"
import { throttle } from '../../utils/util'
import Tabbar from "../../components/Tabbar"
import Title from "../../components/Title"
import Share from "@/src/components/Share"
import { decryption } from "../../utils/aes"
import Chunktitle from "./component/title"
import { removeCookie, getCookie, setCookie } from './../../utils/storage.js'
import "./index.scss"
import * as knowledgeApi from "../../api/knowledge"
import TitleInfo from "../videoVip-index/components/title"
import {alive, alive_yuyue, careGzh, getExpretList,yuyue_detail,yuyue_set } from "../../api/expert"
import {getKnowledge} from "../../api/knowledge";
import { my } from "../../api/my"
import dayjs from 'dayjs'
import { handleInput, HttpException } from '@/src/utils/util'

const { loginStore } = store

@Title("会员")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "会员"
  };

  constructor() {
    super(...arguments)
    this.state = {
        alive_id:'',
        alive_link:'',
        alive_state:'',
        form: {
            name:'',
            company:'',
            phone:'',
            position:''
        },
        yuyueForm:false,
      bottomBtn: false,
      myFamous: null,
      famousData: null,
      discountCouser: null,
      famousDataShow: null,
      vipPrice: 69,
      priceList:[
          { type: '1', name: "月享卡" ,price:'?',time :'1个月',unit:'月',banner:'lian-vip1@2x.png',icon:'card_m@2x.png',num:5},
          { type: '2', name: "季享卡" ,price:'?',time :'3个月',unit:'季',banner:'lian-vip2@2x.png',icon:'card_j@2x.png',num:7},
      ],
      couponList: [],
      index:0,
      newyears:1,
      aliveList:[],
      expretList:[],
      offline:[],
      famousLists:null,
      num:0,
      yuyue_warn:false,
      gz_yuy_warn:false,
      close:false,
      newCardActive:false,
      img:'icon_coupon@2x.png',
        /** 是否首次加载数据 */
      isFirstLoding: true,
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
      /** 信息更新 */
      my()
    
      if (this.state.userInfo && this.state.userInfo.headimgurl) {
          const data = await this.props.userStore.getUserInfoAsync()
          this.setState({
              userInfo: data
          }, () => {
              if (this.state.userInfo.lian) {
                  Taro.redirectTo({ url: '/pages/videoVip-index' })
              }
          })
      }else{
          const data = await this.props.userStore.getUserInfoAsync()
          this.setState({
              userInfo: data
          })
      }

      await this.getAllPrice()
    //await this.getVipPrice()
    //await this.getTimestamp()
    //await this.newCardActive()
    //let that = this

    //this.getVipDiscountCourse()
    await this.getMember_reccommend()
    //await this.getFamous()
      this.alive()
      this.getKnowledge()
      this.getExpretListData()
      this.state.isFirstLoding && this.setState({ isFirstLoding: false })

/*
    new Swiper('.swiper-container', {
      loop: true,
      initialSlide: 2,
      slidesPerView: 4, // 显示5个
      centeredSlides: true,
      spaceBetween: -15,
      effect: 'coverflow',
    })


    couponList().then(res => {
      this.setState({ couponList: res.data })
    })
    */

    Share({
        wx: {
            title: '链链知迅会员，让你收获更多！', // 分享标题
            desc: `链接业内大咖，尊享好课免费学、精选免费专区`, // 分享描述
            link: `${window.location.origin}/#/pages/videoVip`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: `${this.props.userStore.imgUrl}vip_share.jpg`, // 分享图标
            success: function () {
                // 设置成功
            }
        }
    })
  }

    /** 获取线下学院 */
    getKnowledge = () => {
        return getKnowledge()
            .then(res => {
                console.log("TCL: Index -> getSwiper -> res", res)

                this.setState({
                    //swiper: res.data.header, // 轮播图
                    //ques: res.data.everyday, // 每日答疑解惑
                    //liveActive: res.data.radio, // 推荐直播
                    offline: res.data.offline, // 线下学院
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

    /** 专家的服务列表 */
    getExpretListData() {
        getExpretList({ page: 1, us_id: 0 }).then(res => {
            // 限制6个显示
            this.setState({ expretList: res.data.slice(0, 6) })
        })
    }

    alive = () => {
        alive()
            .then(res => {console.log(res)
                this.setState({
                    aliveList: res.data
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

  /** 获取vip价格 */
  getVipPrice() {
    return get_vipPrice().then(res => {
      this.setState({ vipPrice: Number(res.data) })
    })
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

    /**获取优惠时间时间**/
    newCardActive() { //把时间日期转成时间戳
        //优惠开始时间(2021-01-08 23:59:59)
        var starttime = (new Date('2021/11/08 00:00:00')).getTime() / 1000
        var endtime = (new Date('2021/11/21 23:59:59')).getTime() / 1000
        var time = (new Date()).getTime() / 1000
        if(time >= starttime && time <= endtime){
            //活动期间
            this.setState({ newCardActive: 1 })
        }else{
            this.setState({ newCardActive: 0 })
        }
    }

  /** 获取7.5折课程数据 */
  getVipDiscountCourse = () => {
    vipDiscountCourse().then(res => {
      const all = {}
      all.a = res.data.splice(0, 4)
      all.b = res.data.splice(0, 4)
      all.c = res.data.splice(0, 4)
      all.a = [...all.a, ...all.a]
      all.b = [...all.b, ...all.b]
      all.c = [...all.c, ...all.c]
      this.setState({ discountCouser: all })
    })
  }

  /** 专属免费专区数据 */
  getMember_reccommend = () => {
    return member_reccommend().then(res => {
      if (res.code === 1) {
        let famousDataShow = []
        if (res.data.length < 4) {
          famousDataShow = [...res.data, ...res.data]
        } else {
          famousDataShow = [...res.data]
        }
        let famousData = []
        if (res.data.length > 4) famousData = res.data.splice(0, 4)
        else famousData = res.data


        return this.setState({ famousData, famousDataShow }, () => {
          return true
        })
      }
    })
  }

    /** 名家学堂课程  */
    getFamous = () => {
        return  getFamous().then(res => {
                if (res.code === 1) {
                    let famousLists = []
                    if (res.data.length < 4) {
                        famousLists = [...res.data, ...res.data]
                    } else {
                        famousLists = [...res.data]
                    }
                    let famousListsData = []
                    if (res.data.length > 4) famousListsData = res.data.splice(0, 4)
                    else famousListsData = res.data
                    return this.setState({ famousListsData, famousLists }, () => {
                        return true
                    })
                }
            })
    }

  /** 获取优惠券列表 */
/*
  scrollFn = throttle(() => {
    const $tabsBox = document.querySelector(".btn--black")
    const top = $tabsBox.getBoundingClientRect().top
    this.setState({ bottomBtn: top < 2 })
  }, 100)
  */

  getAllPrice = () => {
    return allPackage({type:1}).then(res => {
        for(var i=0; i<this.state.priceList.length; i++){
            this.state.priceList[i].name = res.data[i].lian_name
            this.state.priceList[i].price = res.data[i].price
            this.state.priceList[i].active = res.data[i].active
        }
        var er = this.state.priceList
        console.log(er)
        this.setState({ priceList: er })
    })
  }

  buyVipNext = () => {
      var type = 1
      if(this.state.index == 1){
          //季卡
          type = 2
      }else if(this.state.index == 2){
          //年卡
          type = 1
      }else{
          //月卡
          type = 3
      }
      const share_id = this.$router.params.share_code ? this.$router.params.share_code : ''
      if(share_id){
          Taro.navigateTo({ url: '/pages/videoVip-new-submit?type='+type+'&share_code='+share_id})
      }else{
          Taro.navigateTo({ url: '/pages/videoVip-new-submit?type='+type})
      }


      /*
    setTimeout(() => {
        const share_id = this.$router.params.share_id ? this.$router.params.share_id : ''
        var type = ''
        if(this.state.newyears == 1){
            if(this.state.index == 1){
                type = 2
            }else if(this.state.index == 2){
                type = 1
            }else if(this.state.index == 3){
                type = 3
            }else if(this.state.index == 4){
                type = 4
            }else{
                type = 5 //月卡
            }
        }else{
            if(this.state.index == 1){
                type = 1
            }else if(this.state.index == 2){
                type = 3
            }else if(this.state.index == 3){
                type = 4
            }else{
                type = 2 //月卡
            }
        }

      if(share_id){
        if(type == 4){
            Taro.navigateTo({ url:'/pages/videoVip-student-submit?type='+type+'share_id='+ share_id})
        }else{
            Taro.navigateTo({ url:'/pages/videoVip-buy-submit?type='+type+'share_id='+ share_id})
        }
      }else{
       if(type == 4){
          Taro.navigateTo({ url:'/pages/videoVip-student-submit?type='+type})
        }else{
          Taro.navigateTo({ url: '/pages/videoVip-buy-submit?type='+type})
        }
      }
    }, 500)
    */
  }

  buyVip = () => {
    // 确认是否登陆
    if (this.state.userInfo && this.state.userInfo.my_famous) {
      Taro.showLoading({ mask: true })
      const share_id = this.$router.params.share_id ? this.$router.params.share_id : ''
      get_lian({ total_fee: this.state.vipPrice,code:share_id }).then(res => {
        this.WeixinPay(res.data).then(result => {
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/videoVip-buy--success' })
          }, 500)
          Taro.showToast({
            title: result.msg,
            icon: result.code === 1 ? "success" : 'none', //图标,
            duration: 500, //延迟时间,
            mask: true //显示透明蒙层，防止触摸穿透,
          }).catch(err => {
            console.log(err)
            Taro.showToast({
              title: err.msg ? err.msg : String(err), //提示的内容, 
              icon: 'none', //图标, 
              duration: 1000, //延迟时间, 
              mask: true, //显示透明蒙层，防止触摸穿透, 
            })
          })
        })

      }).catch((res) => {
        Taro.showToast({
          title: res.msg,
          icon: res.code === 1 ? "success" : 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
        setTimeout(() => {
          res.code === '13' && Taro.navigateTo({ url: '/pages/videoVip-index' })
        }, 1000)
      })
    } else {
      setCookie("Prev_URL", window.location.href)
      Taro.navigateTo({ url: "/pages/author" })
    }
  }

  /** 微信支付 */
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

    choiceVip = index => {
        this.setState({ index: index })
        console.log(index)
    }


    close1 = () => {
        this.setState({ gz_yuy_warn:false})
    }

    vipRight = (id) => {
      console.log(id)
        let type = 0
        console.log(this.state.index)
        if(this.state.index == 0){
            type=1
        }else{
            type = 0
        }
        Taro.navigateTo({ url: "/pages/videoVip-rights?index="+id+"&type="+type })
    }

    ziliao = () => {
        this.setState({ close: true})
    }

    xiazaiclose = () => {
        this.setState({ close: false})
    }
    stopxiazaiclose = (e) => {
        e.stopPropagation()
    }

    close = () => {
        this.setState({yuyueForm:false})
    }

    /**
     * 参数校验器
     * @param(Object) from 数据源
     * @param(Object) rules 校验规则
     * @param(Object) msg 提示语
     */
    validate = (from, rules, msg) => {
        const rulesName = {
            name: '称呼',
            phone: '手机号码',
            company: '您的公司',
            position: '职务',//可不填
        }
        Object.keys(rules).map(v => {
            if (!from[v]) throw new HttpException(`${rulesName[v]}不能为空`)
            if (rules[v] instanceof Object) {
                if (rules[v].min && from[v].length < rules[v].min) {
                    throw new HttpException(`输入的${rulesName[v]}不能少于${rules[v].min}个字符`)
                }
                if (rules[v].max && from[v].length > rules[v].max) {
                    throw new HttpException(`输入的${rulesName[v]}不能超过${rules[v].max}个字符`)
                }
                // 正则
                if (String(rules[v]).indexOf('/') === 0) {
                    if (!from[v].match(rules[v])) throw new HttpException(msg[v])
                }
            }

        })
    }

    service = () => {
        //判断还有次数没
        const from = this.state.form
        console.log(from)
        const rules = {
            name: {
                max: 20,
                min: 1,
            },
            phone: /^1[34578]\d{9}$/,
            company: {
                max: 30,
                min: 1,
            },
        }
        const msg = {
            name: '请输入称呼',
            phone: '请输入正确的手机号码',
            company: '请输入您的公司',
        }
        try {
            this.validate(from, rules, msg)
            //Taro.showLoading({ mask: true })
            yuyue_set({alive_id:this.state.alive_id})
                .then(setRes => {
                    if(setRes.count == 0){
                        yuyue_detail(Object.assign(this.state.form, {alive_id: this.state.alive_id})).then(res => {
                            this.setState({yuyueForm:false})
                            this.aliveYuyue(this.state.alive_id,this.state.alive_state,this.state.alive_link,0)
                        })
                    }else{
                        this.setState({yuyueForm:false})
                        this.aliveYuyue(this.state.alive_id,this.state.alive_state,this.state.alive_link,0)
                    }
                })
        } catch (err) {
            Taro.showToast({
                title: err.msg,
                icon: 'none', //图标,
                duration: 1500, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
        }

    }



    render() {
/*
      const sixPrivilege1 = [
          { url: 'icon_discount@2x.png', text: "所有产品享受7.5折" },
          { url: 'icon_free@2x.png', text: "享受会员免费专区" },
          { url: 'icon_two@2x.png', text: "名家课免费学两门" },
          { url: this.state.img, text: "100元专属优惠券" },
          { url: 'icon_card1@2x.png', text: this.state.num+"张体验卡" },
          { url: 'icon_id@2x.png', text: "专属身份标识" },
      ]
      const perVip1 = [
          { type: '1', name: "季卡" ,price:'88',perprice:'269',time :'3个月',unit:'季'},
          { type: '2', name: "年卡" ,price:'299',perprice:'998',time :'12个月',unit:'年'},
          { type: '3', name: "月卡" ,price:'49',perprice:'168',time :'1个月',unit:'月'},
          { type: '4', name: "学生卡" ,price:'99',perprice:'99',time :'6个月',unit:'半年'},
      ]

    const sixPrivilege = [
      { url: 'icon_discount@2x.png', text: "所有产品享受7.5折" },
      { url: 'icon_free@2x.png', text: "享受会员免费专区" },
      { url: 'icon_two@2x.png', text: "名家课免费学两门" },
      { url: this.state.img, text: "100元专属优惠券" },
      { url: 'icon_card1@2x.png', text: this.state.num+"张体验卡" },
      { url: 'icon_id@2x.png', text: "专属身份标识" },
    ]
    const perVip = [
      { type: '1', name: "季卡" ,price:'269',time :'3个月',unit:'季'},
      { type: '2', name: "年卡" ,price:'998',time :'12个月',unit:'年'},
      { type: '3', name: "月卡" ,price:'168',time :'1个月',unit:'月'},
      { type: '4', name: "学生卡" ,price:'99',time :'6个月',unit:'半年'},
    ]
    */
      const sixPrivilege = [
          { url: 'icon_vip_live@2x.png', text: "直播课6场",desc:'支持回放',text1: "直播课2场",},
          { url: 'icon_salon@2x.png', text: "线下课程/沙龙",desc:'1次'},
          { url: 'icon_note@2x.png', text: "课堂资料" ,desc:'课件/笔记'},
          { url: 'icon_pre-classification@2x.png', text: "在线预归类服务",desc:'不限次数',desc1:'尊享5次'},
          { url: 'icon_phoneline@2x.png', text: "连线专家5次",desc:'20分钟/次',text1: "连线专家3次",},
          { url: 'icon_adviser@2x.png', text: "上门一对一",desc:'1次'},
          { url: 'icon_course@2x.png', text: "畅享精选课程",desc:'免费专区'},
      ]

/*
    const perVip = [
      { type: '1', name: "月享卡" ,price:!this.state.newCardActive ? '69':'59',time :'1个月',unit:'月',banner:'lian-vip1@2x.png',icon:'card_m@2x.png',num:5},
      { type: '2', name: "季享卡" ,price:!this.state.newCardActive ? '139': '118',time :'3个月',unit:'季',banner:'lian-vip2@2x.png',icon:'card_j@2x.png',num:7},
      //{ type: '3', name: "年享卡" ,price:'399',time :'12个月',unit:'月',banner:'lian-vip2@2x.png',icon:'card_j@2x.png'},
    ]
    */
    return (
      <View className='videoVip newvideoVip' >
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            boxSizing: "border-box",
            flex: 1,
          }}
          onScroll={this.scrollFn}
        >

        <View className='vip3_top'>
          <View className='header-background'>
            {
                this.state.priceList.map((v, k) =>
                   <View className={['header', k != this.state.index && 'n-display']}>
                      <Image className='header__background' src={'https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/'+v.banner} />
                      {
                          this.state.userInfo.userinfo &&
                              <View className='header--box'>
                                  <Image className='header__head' src={this.state.userInfo.userinfo.headimgurl} />
                                  <View className='header__info'>
                                      <View className='info__name'>
                                      <Text className='info__name--text ellipsis'>{this.state.userInfo.userinfo.nickname}</Text>
                                      </View>
                                      <View className='info__time'>您还不是会员，开通立享{v.num}大权益</View>
                                  </View>
                              </View>
                      }
                      <View className='header-xf'>
                        <Image className='label__img' src={'https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/'+v.icon} />
                        <View className='header__btn' onClick={this.buyVipNext}>立即开通</View>
                      </View>
                    </View>
            )}

          </View>
          {/* 权益 */}
          <View className='sixPrivilege'>
          {
            sixPrivilege.map((v, k) =>
              <View className={['item', (k==1 || k==5) && this.state.index == 0 && 'opacity-half']} key={k} onClick={this.vipRight.bind(this,k)}>
                <Image className='img' src={"https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/"+v.url}/>
                <Text className='text-vip'>{this.state.index == 0 && (k==0 || k==4) ? v.text1 : v.text}</Text>
                <Text className='gray-vip'>{ this.state.index == 0 && k==3 ? v.desc1 : v.desc}</Text>
              </View>
            )
          }
          </View>

      {/*
          <View className='perVip'>
              <View className='courseItem course1 clearfix'>
              {
                  perVip.map((v, k) =>
                  <View className={['perCard', k == this.state.index && 'active']} key={k} onClick={this.choiceVip.bind(this, k)} >
                    <View className={['name', k == this.state.index && 'active']}>{v.name}</View>
                    <View className={['price', k == this.state.index && 'active']}><span className="unit">￥</span>{v.price}<span className="unit">/{v.unit}</span></View>
                    <View className={['time', k == this.state.index && 'active']}>{v.time}</View>
                    {k == 0
                      ?
                    <View className = 'recommend ' > 推荐 < /View>
                    : ''
                    }
                  </View>
              )}
            </View>
          </View>
          */}

          <View className='new-perVip'>
              <View className='courseItem course1 clearfix'>
              {
                  this.state.priceList.map((v, k) =>
                      <View className={['perCard', k == this.state.index && 'active']} key={k} onClick={this.choiceVip.bind(this, k)} >
                        <View className={['name', k == this.state.index && 'active']}>{v.name}</View>
                        <View className={['price', k == this.state.index && 'active']}><span className="unit">￥</span>{v.price}<span className="unit">/{v.unit}</span></View>
                          <View className={['time', k == this.state.index && 'active']}>{v.time}</View>
                          {k == 0
                              ?
                          <View className = 'recommend ' > {v.active ? '限时' : '推荐'} < /View>
                          :
                          <View className = {['recommend',!v.active && 'n-display']} > 限时< /View>
                          }
                      </View>
              )}
                </View>
              </View>
          </View>

      {/*非活动*/}


          <View className="vipBuy" onClick={this.buyVipNext}>立即开通</View>
      {/*
          <Chunktitle title_mian='线上课程7.5折' title__subhead='所有产品享受7.5折'></Chunktitle>
          <View className='discountCourse'>
            <View className='courseItem course1 clearfix'>
              {
                this.state.discountCouser &&
                this.state.discountCouser.a.map((v, k) =>
                  <Image key={k} src={v.cover_img} className='imgs'></Image>
                )
              }
            </View>
            <View className='courseItem course2 clearfix'>
              {
                this.state.discountCouser &&
                this.state.discountCouser.b.map((v, k) =>
                  <Image key={k} src={v.cover_img} className='imgs'></Image>
                )
              }
            </View>
            <View className='courseItem course3 clearfix'>
              {
                this.state.discountCouser &&
                this.state.discountCouser.c.map((v, k) =>
                  <Image key={k} src={v.cover_img} className='imgs'></Image>
                )
              }
            </View>
          </View>
          */}
        

          {/* 线下学院------------月享卡不享有该权益 */}
          {this.state.index != 0 &&
            <View>
               <Chunktitle title_mian='线下课程/沙龙' title__subhead='分享知识见识，结识同行同好，延展人脉资源'></Chunktitle>
               <View className='section'>
                  {this.state.offline && this.state.offline.map(item => (
                      <Navigator
                          url={"/pages/knowledge-offline-detail?id=" +item.id}
                          className='ll-cells ll-cell--noborder media media-offline'
                          key={item.id} >
                          <View className='ll-cell ll-cell--primary media__bd'>
                            <View className='ll-cell__hd hdBanner'>
                              <Image
                              className='media__img'
                              src={item.cover_img || "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"}/>
              {/*
                              <View className='applyList'>
                                <View className='headList'>
                                  {
                                      item.list && item.list.length > 0 &&
                                          item.list.map((b, k) => (
                                              <Image key={k} className='headImg' src={b.headimgurl} />
                                      ))
                                  }
                                </View>
                                {
                                  item.list && item.list.length > 0 &&
                                  <Text>{item.join_num || 0}人已报名</Text>
                                }
                              </View>
                              */}
                            </View>
                            <View className='ll-cell__bd'>
                                <View className='media__title ellipsis'>{item.name}</View>
                                {/* <View className='media__small'>中美贸易·贸易风险·企业</View> */}
                                <View className='media__ft'>
                                  <View className='media__price'>
                                      ¥<Text>{item.price}</Text>
                                  </View>
                                  <View className='media__num'>
                                      {
                                          dayjs(item.course_timein).format(
                                      "MM月DD日 HH:mm"
                                        )
                                      }
                                      {/* {item.join_num}人在学 */}
                                  </View>
                                </View>
                            </View>
                        </View>
                      </Navigator>
                  ))
                  }
                {/* 查看更多 */}
                <Navigator url='/pages/knowledge-offline-course' className='btn-more'>查看更多</Navigator>
              </View>
            </View>
          }

          {/*课堂资料*/}
          <Chunktitle title_mian='课堂资料' title__subhead='智·识营养，一键收藏'></Chunktitle>
          <View className='ll-cells ll-cell--noborder guilei' onClick={this.ziliao}>
            <img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_note@2x.png'/>
          </View>


            {/* 专家服务 */}
          <Chunktitle title_mian='连线专家' title__subhead='解决燃眉之急,启发新思路'></Chunktitle>
          <View className='section expert'>
            <View className='expert-banner'>
                <img className="expert-banner-img" src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_phoneline@2x.png'/>
            </View>
            <View className='tt-cells'>
            {
                this.state.expretList && this.state.expretList.map(item => (
              <Navigator
                  key={item.id}
                  className='tt-cell-box tt-cell-box--half'
                  url={`/pages/single-detail?id=${item.id}`} >
                <View className='tt-cell tt-cell--circle'>
                    <Image className='tt-cell__img' src={item.index_img || item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}/>
                    <View className='tt-cell__info'>
                        <View className='ellipsis-2'>{item.title}</View>
                    </View>
                </View>
              </Navigator>
            ))
            }
            </View>
            {/* 查看更多 */}
            <Navigator url='/pages/single-list?type=expert' className='btn-more' style={{ marginTop : '0px' }}>查看更多</Navigator>
          </View>

          {/*顾问一对一------------月享卡不享有该权益*/}
          {this.state.index !== 0 &&
              <View>
                  <Chunktitle title_mian='顾问上门一对一' title__subhead='专家赋能，为工作减负提效'></Chunktitle>
                  <View className='ll-cells ll-cell--noborder guilei' onClick={this.ziliao}>
                    <img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_card_go@2x.png'/>
                  </View>
              </View>
           }

          <Chunktitle title_mian='免费专区' title__subhead='随心充电，默默成长，惊艳所有人'></Chunktitle>
          <View className='vipFree'>
            {this.state.famousData && this.state.famousData.map(v =>
              <Navigator className='navigatorLable' key={v.id} url={`/pages/knowledge-online-detail?id=${v.id}`}>
                <View className='vipFree__item'>
                  <Image className='img' src={v.cover_img || this.props.userStore.imgUrl + 'icon_id@2x.png'}></Image>
                  <View className='vipFree__content'>
                    <View className='title ellipsis'>{v.name}</View>
                    <View className='else'>
                      <Text className='prize'>¥{v.price}</Text>
                      {/*<Text className='redText'>会员免费</Text>*/}
                       <Image className='vip-free-img media__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_1%402x.png'/>
                    </View>
                  </View>
                </View>
              </Navigator>
            )}
          </View>
          <Navigator url='/pages/videoVip-freeCourse?type=free'>
            <View className='btn-more'>查看更多</View>
          </Navigator>

      {/*
          <Chunktitle title_mian='名家课程免费学' title__subhead='名家课免费学两门'></Chunktitle>
          <View className='courseFree'>
            <View className='swiper-container'>
              <View className='swiper-wrapper'>
                {
                  this.state.famousLists && this.state.famousLists.map((item, index) =>
                    <View key={'famousData' + index} className='swiper-slide'>
                      <Navigator url={`/pages/knowledge-online-detail?id=${item.id}`}>
                        <Image className='swiper__img' src={item.index_img || item.cover_img} />
                      </Navigator>
                      <View className='swiper__docs'>
                        <View className='course__title ellipsis-2'>
                          {item.name}
                        </View>
                        <View className='course__subhead ellipsis'>
                          {item.us_regist_name + '·' + item.chainman}
                        </View>
                      </View>
                    </View>
                  )
                }
              </View>
            </View>
          </View>
          */}

      {/*
          <Chunktitle title_mian='100元专属优惠券' title__subhead='优惠券与7.5折优惠可以同时使用'></Chunktitle>
          <View className='couponList'>
            {this.state.couponList.map(v =>
              <View key={v.id} className='main__couponItem'>
                <Image className='coupon__background' src={this.props.userStore.imgUrl + 'bg_tik_nor.png'} />
                <View className='money'>
                  <Text className='money__main'>¥{v.amount}</Text>
                  <Text className='small'>满{v.suit_amount}元使用</Text>
                </View>
                <View className='coupon__docs'>
                  <View className='docs__mian'>用于线上课程</View>
                  <View className='docs__subhead'>每月更新</View>
                </View>
                <View className='btn'>领取</View>
              </View>
            )}
          </View>
          */}
 

          <Chunktitle title_mian='关于链链知迅' title__subhead='about us'></Chunktitle>
          <View className='about-us'>
            <View className='content'>
               <View className='content-p'>我们是精耕关务合规30年的昊链科技旗下的全球贸易合规知识服务平台。</View>
               <View className='content-p'>关注 <text>“链链知迅”</text>微信服务号，不错过每一次精彩。</View>
            </View>
          </View>

          <View className='notice'>
            <View className='notice__main'>
              购买须知
                </View>
            <View className='notice__subhead'> 1.会员卡为虚拟产品，一经出售暂不支持退款，敬请谅解。</View>
            <View className='notice__subhead'>2.购买季卡可提供发票。</View>
          </View>
        </ScrollView>

        <Tabbar></Tabbar>
        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
        <View className={['xiazai',!this.state.close && 'n-display']} onClick={this.xiazaiclose}>
          <View className='xiazai-content' onClick={(e)=>this.stopxiazaiclose(e)}>
            <View className='xiazai-rights'>开通会员即可体验此权益</View>
            <View className='xiazai-submit' onClick={this.buyVipNext}>立即开通</View>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
