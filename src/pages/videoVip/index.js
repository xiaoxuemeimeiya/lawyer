/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
    View,
    ScrollView,
    Image,
    Navigator,
    Text, Input,Button,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import store from '../../store'
import { checkReg } from '../../utils/login'

import { get_lian, vipDiscountCourse, member_reccommend, get_vipPrice ,getFamous,allPackage} from "../../api/videoVip"
import Tabbar from "../../components/Tabbar"
import Title from "../../components/Title"
import Share from "@/src/components/Share"
import { decryption } from "../../utils/aes"
import "./index.scss"
import {alive, getExpretList,yuyue_detail,yuyue_set } from "../../api/expert"
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
      bottomBtn: false,
      data:{
          name:'',
          phone:'',
          company:'',
          position:'',
      },
      famousDataShow: null,
      vipPrice: 69,
      priceList:[
          { type: '1', name: "月享卡" ,price:'?',time :'1个月',unit:'月',banner:'lian-vip1@2x.png',icon:'card_m@2x.png',num:5},
          { type: '2', name: "季享卡" ,price:'?',time :'3个月',unit:'季',banner:'lian-vip2@2x.png',icon:'card_j@2x.png',num:7},
      ],
      index:0,
      num:0,
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
      this.state.isFirstLoding && this.setState({ isFirstLoding: false })

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
          //个人会员
          type = 1
      }else if(this.state.index == 2){
          //企业会员
          type = 2
      }else{
          //其他
          type = 3
      }
      const share_id = this.$router.params.share_code ? this.$router.params.share_code : ''
      if(share_id){
          Taro.navigateTo({ url: '/pages/videoVip-new-submit?type='+type+'&share_code='+share_id})
      }else{
          Taro.navigateTo({ url: '/pages/videoVip-new-submit?type='+type})
      }
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


    render() {
      const sixPrivilege = [
          { url: 'icon_vip_live@2x.png', text: "直播课6场",desc:'支持回放',text1: "直播课2场",},
          { url: 'icon_salon@2x.png', text: "线下课程/沙龙",desc:'1次'},
          { url: 'icon_note@2x.png', text: "课堂资料" ,desc:'课件/笔记'},
          { url: 'icon_pre-classification@2x.png', text: "在线预归类服务",desc:'不限次数',desc1:'尊享5次'},
          { url: 'icon_phoneline@2x.png', text: "连线专家5次",desc:'20分钟/次',text1: "连线专家3次",},
          { url: 'icon_adviser@2x.png', text: "上门一对一",desc:'1次'},
          { url: 'icon_course@2x.png', text: "畅享精选课程",desc:'免费专区'},
      ]
    return (
      <View className='vip' >
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

            <View className="content">
                <View className="content__hd">
                    <View className="btn-group">
                        <View className="btn-group-border">
                            <View className="btn btn-active">个人版</View>
                            <View className="btn" onClick={this.toggle}>企业版</View>
                        </View>
                    </View>
                </View>
                <View className="content__bd" >
                    <View className="ll-cells ll-cell--noborder introduce">
                        <View className="ll-cell">
                            <View className="ll-cell__bd">
                                <View className="introduce__title">
                                    <View className="icon icon-crown"></View>
                                    <Text className="">VIP会员服务</Text>
                                </View>
                                <View className="introduce__small">
                                'person_price'元/'person_time'天
                                </View>
                            </View>
                        </View>
                        <View className="ll-cell ll-cell--noborder">
                            <View className="ll-cell__bd">
                                <View className="introduce__item">
                                    <Image className='introduce__icon' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_2@2x.png'></Image><Text>文章、课件阅读全开放</Text>
                                </View>
                                <View className="introduce__item">
                                    <Image className='introduce__icon' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_3@2x.png'></Image><Text>发起活动、获得协办</Text>
                                </View>
                                <View className="introduce__item">
                                    <Image className='introduce__icon' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_4@2x.png'></Image><Text>线下知识沙龙免费参加</Text>
                                </View>
                                <View className="introduce__item">
                                    <Image className='introduce__icon' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_5@2x.png'></Image><Text>对接专家找资源1天回复</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className="form-vip">
                        <View className="title">会员限时免费</View>
                        <View className="ll-cell__bd">
                            <Input
                                onChange={handleInput.bind(this, "data.name")}
                                type="text"
                                placeholder="姓名" />
                        </View>
                        <View className="ll-cell__bd">
                            <Input
                            onChange={handleInput.bind(this, "data.phone")}
                            type="text"
                            placeholder="电话" />
                        </View>
                        <View className="ll-cell__bd">
                            <Input
                            onChange={handleInput.bind(this, "data.company")}
                            type="text"
                            placeholder="公司" />
                        </View>
                        <View className="ll-cell__bd">
                            <Input
                            onChange={handleInput.bind(this, "data.position")}
                            type="text"
                            placeholder="职务" />
                        </View>
                    </View>
                </View>
            </View>

            <View style="background-image: url({'https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_2@2x.png#'+App.globalData.version})"
                className="content-business">
                <View className="btn-group">
                    <View className="btn-group-border">
                        <View className="btn" onClick={this.toggle}>个人版</View>
                        <View className="btn btn-active">企业版</View>
                    </View>
                </View>
            </View>
            <View className="ll-cells ll-cell--noborder bottom hide">
                <View className="ll-cell">
                    <View className="ll-cell__bd">
                        <Button  className="btn" onClick={this.payVIP}>支付'person_price'元</Button>
                    </View>
                </View>
            </View>
            <View className="ll-cells ll-cell--noborder bottom">
            {/*'package_id == 1'*/}
                <View className="ll-cell" >
                    <View className="ll-cell__bd">
                        <View className="price-change">
                            <View className="price color-primary">
                                ¥<Text>
                                <Text>0.00</Text>
                                <Text>"business_price"</Text>
                                </Text>/年
                            </View>
                            <View className="price color-primary price-change-rights">
                                原价<Text>
                                <Text>'person_price'</Text>
                                <Text>'business_price'</Text>
                                </Text>/年
                                <View className='center-img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/line.png'></View>
                            </View>
                        </View>
                        <View className="bottom__tip color-black">
                            购买即代表同意
                            <Navigator
                                className="link"
                                url="/pages/vip-agreement/vip-agreement">
                                  《会员购买协议》

                            </Navigator>
                        </View>
                    </View>
                    <View className="ll-cell__ft">
                        <View className="btn btn-buy" bindtap="payVIP">立即开通</View>
                    </View>
                </View>
            </View>

        </ScrollView>

        <Tabbar></Tabbar>
        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
