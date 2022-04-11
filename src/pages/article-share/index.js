import Taro, { Component } from "@tarojs/taro"
import {
  View,
  Button,
  ScrollView,
  Swiper,
  SwiperItem,
  Image,
  Navigator,
  Text
} from "@tarojs/components"

import html2canvas from 'html2canvas'
import {AtActivityIndicator} from 'taro-ui'
import { articleDetail,getShareImg2} from "../../api/knowledge"
import { my } from "../../api/my"
import Login from "../../components/Login"
import {img2base64} from '../../utils/util'
import "./index.scss"

@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "分享"
  }

  constructor() {
    super(...arguments)
    this.state = {
      id:'',

      dataList:{},
      userInfo:{},
      qrcode:"",
      shareImg:'',

      isFirstLoding:true,
    }
  }

  async componentDidMount(){
    await this.getDataList()

    Promise.all([
      this.getUserInfo(),
      this.getData(),
      this.getQRCode()
    ])
        .then((res)=>{
          var dataList={...this.state.dataList,cover_img:res[2]}
          this.setState({dataList},()=>{
            this.div2canvas()

            // 取消显示首次loading
            this.state.isFirstLoding && this.setState({ isFirstLoding: false })
          })
        })
        .catch(err=>{
          console.log(err)
        })

  }

  div2canvas(){
    const $shareBox=document.querySelector("#share-box")
    html2canvas($shareBox)
        .then(canvas=>{
          $shareBox.removeChild($shareBox.querySelector(".share__hd"))
          $shareBox.removeChild($shareBox.querySelector(".share__ft"))

          var img=document.createElement("img")
          var _src=canvas.toDataURL("image/png")
          img.src=_src
          img.className="share-img"
          $shareBox.appendChild(img)

          this.setState({shareImg:_src})
        })
        .catch(err=>{
          console.log(err)
        })

  }

  /**
   * 获取个人信息
   */
  getUserInfo(){
    return new Promise((resolve,reject)=>{
      my()
          .then(res=>{
            img2base64(res.data.headimgurl,true)
                .then(img=>{
                  res.data.headimgurl=img
                  this.setState({userInfo:res.data},()=>{
                    resolve()
                  })
                })
                .catch(err=>{
                  console.log(err)
                  Taro.showToast({
                    title: err.msg?err.msg:String(err), //提示的内容,
                    icon: 'none', //图标,
                    duration: 2000, //延迟时间,
                    mask: true, //显示透明蒙层，防止触摸穿透,
                  })
                  reject(err)
                })

          })
          .catch(err=>{
            console.log(err)
            Taro.showToast({
              title: err.msg?err.msg:String(err), //提示的内容,
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true, //显示透明蒙层，防止触摸穿透,
            })
            reject(err)
          })
    })

  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    return new Promise((resolve,reject)=>{
      const id = +this.$router.params.id
      if (id) {
        this.setState({ id }, () => {
          resolve()
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
        reject()
      }

    })
  }

  getData() {
    return new Promise((resolve,reject)=>{



      return articleDetail(this.state.id)
          .then(res => {
            console.log("TCL: getExpertsList -> res", res)

            res.data.detail = res.data

            this.setState({
              dataList: res.data
            },()=>{
              resolve()
            })

          })
          .catch(err => {
            console.log(err)

            Taro.showToast({
              title: err.msg ? err.msg : err + "", //提示的内容,
              icon: "none", //图标,
              duration: 2000, //延迟时间,
              mask: true //显示透明蒙层，防止触摸穿透,
            })
            reject(err)
          })

    })
  }

  /* 获取二维码图片及封面图片 */
  getQRCode(){
    return new Promise((resolve,reject)=>{
      getShareImg2(this.state.id)
          .then(res=>{
            this.setState({qrcode:'data:image/png;base64,'+res.data.share},()=>{
              resolve('data:image/png;base64,'+res.data.cove_img)
            })
          })
          .catch(err=>{
            console.log(err)
            Taro.showToast({
              title: err.msg?err.msg:String(err), //提示的内容,
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true, //显示透明蒙层，防止触摸穿透,
            })
            reject(err)
          })

    })
  }

  render() {
    return (
        <View className='KnowledgeShare'>
        <View className='share-box' id='share-box'>
        <View className='share__hd'>
        <Image className='share__banner' src={this.state.dataList.article_img} />
    <View className='share-title'>{this.state.dataList.title}</View>
        <View className='share-user clearfix'>
        <Image className='avatar share-user__avatar' src={this.state.userInfo.headimgurl}   />
    <View className='share-user__name'>
        <View className='share-user-name__hd'>{this.state.userInfo.nickname}</View>
        <View className='share-user-name__ft'>我已加入链链，邀请您加入</View>
    </View>
    </View>
    </View>
    <View className='share__ft clearfix'>
        <Image className='logo' src='data:image/png;base64,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' />
        <View className='qrcode'>
        <Image className='qrcode__right' src={this.state.qrcode} />
    <View className='qrcode__left'>
        <View>识别二维码</View>
        <View>查看资讯</View>
        </View>
        </View>
        </View>
        </View>
        <View className='ll-cells ll-cell--noborder btn-box'>
        <View className='ll-cell'>
        <View className='ll-cell__bd'>
        <Button className='btn btn-save'>长按保存海报<Image src={this.state.shareImg}></Image></Button>
    <View className='tip'>保存分享给好友</View>
        </View>
        </View>
        </View>

    {/* 首次加载 */}
    {this.state.isFirstLoding && (
    <AtActivityIndicator size={36}></AtActivityIndicator>
    )}
  </View>
  )
  }
}

export default Index
