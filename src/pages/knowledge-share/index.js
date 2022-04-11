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
import { getOnlineDetail as on,getOfflineDetail as off , getShareImg} from "../../api/knowledge"
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
      type: "",
      id:'',

      dataList:{},
      userInfo:{},
      qrcode:"",
      shareImg:'',
      logo:'https://oss.mylyh.com/miniapp/logo%402x.png',

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
         // this.div2canvas()
          
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
            img2base64(this.state.logo,true)
              .then(logo=>{
                this.setState({logo:res.data},()=>{
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

      const type = this.$router.params.type
      const id = +this.$router.params.id
      if (id&&type) {
        this.setState({ id,type }, () => {
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
      
      let type=null
      if(this.state.type=='on'){
        type=on
      }else if(this.state.type=='off'){
        type=off
      }
  
      return type(this.state.id)
        .then(res => {
          console.log("TCL: getExpertsList -> res", res)
          
          res.data.detail = res.data.detail || res.data

          this.setState({
            dataList: res.data.detail
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
      const obj={
        "on":1,
        "off":2
      }
      getShareImg(obj[this.state.type],this.state.id)
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
            <Image className='share__banner' src={this.state.dataList.cover_img} />
            <View className='share-title ellipsis-2'>{this.state.dataList.name}</View>
            <View className='share-user clearfix'>
              <Image className='avatar share-user__avatar' src={this.state.userInfo.headimgurl}   />
              <View className='share-user__name'>
                <View className='share-user-name__hd'>{this.state.userInfo.nickname}</View>
                <View className='share-user-name__ft'>我已加入链链，邀请您加入</View>
              </View>
            </View>
          </View>
          <View className='share__ft clearfix'>
            <View className='logo-header'>
              <Image className='logo' src='data:image/png;base64,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' />
              <View>识别二维码查看课程</View>
            </View>
            <View className='qrcode'>
              <Image className='qrcode__right' src={this.state.qrcode} />
            {/*
              <View className='qrcode__left'>
                <View>识别二维码</View>
                <View>查看课程</View>
              </View>
              */}
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
