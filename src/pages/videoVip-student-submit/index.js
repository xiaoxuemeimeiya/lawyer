/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text, Input, Button,
} from "@tarojs/components"
import Request from './../../utils/request'

import { observer, inject } from '@tarojs/mobx'
import {AtActivityIndicator, AtImagePicker} from "taro-ui"
import Swiper from '@/src/lib/swiper'
import store from '../../store'
import { couponList, get_lian,verity_code, is_verify, get_sms, get_vipPrice ,get_pervipPrice,upload } from "../../api/videoVip"
import { throttle } from '../../utils/util'
import Tabbar from "../../components/Tabbar"
import Title from "../../components/Title"
import Share from "@/src/components/Share"
import { decryption } from "../../utils/aes"
import Chunktitle from "./component/title"
import { setCookie } from './../../utils/storage.js'
import {handleInput} from '../../utils/util'
import "./index.scss"
const request=new Request()


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
      vipPrice: 99,
      count:60,
      show:false,
      liked:true,
      headImg:'',
      backImg:'',
      files:[],
      data:{
        name:'',
        phone:'',
      },
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {

    //await this.getVipPrice()
    await this.get_pervipPrice()
    await this.getverify()

    if (this.state.userInfo.lian) {
      //Taro.redirectTo({ url: '/pages/videoVip-index' })
    }

    /** 信息更新 */
    if (this.state.userInfo && this.state.userInfo.headimgurl) {
      const data = await this.props.userStore.getUserInfoAsync()
      this.setState({
        userInfo: data
      }, () => {
        if (this.state.userInfo.lian) {
          //Taro.redirectTo({ url: '/pages/videoVip-index' })
        }
      })
    }


    couponList().then(res => {
      this.setState({ couponList: res.data })
    })

    Share({
      wx: {
        title: '链链会员', // 分享标题
        desc: `邀请您购买链链会员，课程享受7.5折，100元专属优惠券等权益！`, // 分享描述
        link: `${window.location.href}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: `${this.props.userStore.imgUrl}share_experience_img.png`, // 分享图标
        success: function () {
          // 设置成功
        }
      }
    })
  }

  /** 获取vip价格 */
  getVipPrice() {
    return get_vipPrice().then(res => {
      this.setState({ vipPrice: Number(res.data) })
    })
  }

  get_pervipPrice() {
    const type = this.$router.params.type ? this.$router.params.type : ''
    return get_pervipPrice({type:type}).then(res => {
      this.setState({ vipPrice: Number(res.data) })
    })
  }

  /** 获取手机号验证 */
  getverify() {
    return is_verify().then(res => {
      this.setState({ show: res.data== true? true : false })
    })
  }


  sms = () => {
    // 确认是否登陆
    if (this.state.userInfo && this.state.userInfo.my_famous) {
      Taro.showLoading({ mask: true })
      get_sms({ type: 1,phone:this.state.data.phone }).then(result => {console.log(result)
        let count = this.state.count
        console.log(count)
        const timer = setInterval(() => {
          this.setState({ count: (count--), liked: false }, () => {
            if (count === 0) {
              clearInterval(timer)
              this.setState({
                liked: true ,
                count: 60
              })
            }
          })
        }, 1000)
        Taro.showToast({
          title: result.msg,
          icon: result.code === 1 ? "success" : 'none', //图标,
          duration: 1000, //延迟时间,
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
      }).catch((result) => {
        Taro.showToast({
          title: result.msg,
          icon: result.code === 1 ? "success" : 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
    } else {
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
    }
  }

  buyVip = () => {
    // 确认是否登陆
    if(this.state.userInfo && this.state.userInfo.lian == 1){
      Taro.showToast({
        title: '您已经是会员',
        icon:  'none', //图标,
        duration: 2000, //延迟时间,
        mask: true //显示透明蒙层，防止触摸穿透,
      })
      return false
    }
    if (this.state.userInfo && this.state.userInfo.my_famous) {
      //验证验证码
      verity_code({ phone: this.state.data.phone,code: this.state.data.code }).then(res1 => {console.log(res1)
        Taro.showLoading({ mask: true })
        const share_id = this.$router.params.share_id ? this.$router.params.share_id : ''
        const type = this.$router.params.type ? this.$router.params.type : ''
        get_lian({ total_fee: this.state.vipPrice ,top_id:share_id ,lian_type:type,head_img:this.state.headImg,back_img:this.state.backImg}).then(res => {
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
      }).catch((res1) => {
        Taro.showToast({
          title: res1.msg,
          icon: res1.code === 1 ? "success" : 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
        setTimeout(() => {
          res1.code === '13' && Taro.navigateTo({ url: '/pages/videoVip-index' })
        }, 1000)
      })
    } else {
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
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
  handSelectFiles(e) {
      let files = e.target.files
      this.handUploadFilesFun(files,1)
  }
  handSelectBackFiles(e){
      let files = e.target.files
      this.handUploadFilesFun(files,2)
  }

    //文件循环遍历处理
  handUploadFilesFun(files,type) {console.log(files)
        let that = this
        const { uploadTypeIsImage } = this.state
        let tipsText = uploadTypeIsImage ? '张图片' : '个文件'
        let fileNamesData = []
        let imagesSrcData = [] //转化为blob格式在浏览器上显示缓存的图片
        let uploadfilemaxsize = 10 * 1024 * 1024 //大小的上限
        let uploadData = [] //确定按钮时获取的值
        if (!files.length) {
            Taro.showToast({
                title:'请选择图片',
                icon:  'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
            return
        } else {

            let filesItem = files[0]
            if (filesItem.size > uploadfilemaxsize) {
                let uploadfilemsg = '上传文件大小超过系统规定上限(10M),请重新选择图片'
                Taro.showToast({ title: uploadfilemsg, icon: 'success', duration: 2000 })
                return
            } else {
                var file = filesItem
                var reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = function (e) {
                    // 读取到的图片base64 数据编码 将此编码字符串传给后台即可
                    var imgcode = e.target.result
                    console.log(imgcode)
                    upload({ new_img: imgcode }).then(res => {
                        if(res.code ==1){
                            if(type == 1){
                                that.setState({headImg: res.data})
                            }else{
                                that.setState({backImg: res.data})
                            }

                        }else{
                            Taro.showToast({
                                title:res.msg,
                                icon:  'none', //图标,
                                duration: 2000, //延迟时间,
                                mask: true //显示透明蒙层，防止触摸穿透,
                            })
                        }
                    })
                }
            }
        }
  }

  render() {

    return (
      <View className='videoVip videoVipBuy' >
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
        <View>
         {/* 权益 */}
         <View className='sixPrivilege'>
            <View className='buySubmit-title'>链链知迅</View>
            <View className='buySubmit-list'>
              <Image className='img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/lian-card.png" />
              <Text className='text'>链链会员卡--链享卡</Text>
              <Text className='text-price'>￥{this.state.vipPrice}</Text>
            </View>
          </View>

          {/* 姓名和手机号码 */}
        <View className='ll-cells ll-cell--noborder content buySubmit-phone' display={this.state.show}>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__hd content__label content__label--title'> 手机号码 </View>
            <View className='ll-cell__bd'>
              <Input
                className='ll-input'
                type='text'
                onChange={handleInput.bind(this, "data.phone")}
                placeholder='请输入您的手机号码'
                    ></Input>
                {
                  this.state.liked ?
                <
                  View
                  onclick = {this.sms}
                  className = 'very-code' > 获取验证码 < /View>
                :
                <
                  View
                  className = 'very-code' > {this.state.count + 's'} < /View>
                }
            </View>
          </View>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__hd content__label content__label--title'> 验证码 </View>
            <View className='ll-cell__bd'>
              <Input
              className='ll-input'
              type='text'
              onChange={handleInput.bind(this, "data.code")}
              placeholder='请输入您的验证码'
              ></Input>
            </View>
          </View>
        </View>

        <View className='ll-cells ll-cell--noborder content buySubmit-phone' display={this.state.show}>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__hd content__label content__label--title'> 学生证照片 </View>
          </View>
          <View className='ll-cell content__bd'>
            <View className="studentId">
              <img className="studentImg" src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/icon_add%402x.png"/>
              <View className="studentTitle">学生证封面照片</View>
              <Input className='imgUpload'
                type='file'
                name='file'
                id='uploadInput'
                onChange={this.handSelectFiles.bind(this)} />
               <img className="imgUploadUrl" src={this.state.headImg} style={{ display: this.state.headImg ? 'block' : 'none' }}/>
            </View>
          </View>
          <View className='ll-cell content__bd'>
            <View className="studentId">
              <img className="studentImg" src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/icon_add%402x.png"/>
              <View className="studentTitle">学生证首页及盖章页</View>
              <Input className='imgUpload'
                  type='file'
                  name='file'
                  id='uploadInputBack'
                  onChange={this.handSelectBackFiles.bind(this)} />
               <img className="imgUploadUrl" src={this.state.backImg} style={{ display: this.state.backImg ? 'block' : 'none' }}/>
            </View>
          </View>
        </View>

        {/* 底部栏 */}
        <View className='ll-cells ll-cell--noborder bottom'>
              <View className='ll-cell bottom__bd'>
              <View className='ll-cell__bd'>
              <View className='price'><Text className='small'>¥</Text>{this.state.vipPrice}</View>
          </View>
          <View className='ll-cell__ft'>
              <Button className='btn bottom__btn btn-pay' onClick={this.buyVip}>支付{this.state.vipPrice}元</Button>
          </View>
          </View>
          </View>
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
