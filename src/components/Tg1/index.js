import Taro, { Component } from "@tarojs/taro"
import {
  Image,
  View,
} from "@tarojs/components"
import { inject } from '@tarojs/mobx'
import { decryption } from "../../utils/aes"

import './index.scss'
import {is_set_Course,receive_Course} from "../../api/my-course"


@inject('loginStore', 'userStore')
class Tg1 extends Component {

  constructor() {
    super(...arguments)
    this.state = {
      userInfo: decryption(localStorage.getItem('userInfo')) || {},
      closeTg:false,//关闭/开启弹框
      showShare:false,
      showOpen:false,
    }
  }

  componentDidMount() {
    this.checkCare()
  }
  async checkCare() {
    //查看用户是否登陆
    var user = Object.keys(this.state.userInfo).length
    if(user){
      //用户已经登陆（查看用户是否已经领取课程）
      is_set_Course()
          .then(res => {
            console.log(res)
            if(res.code == 1 && res.count == 0){
              //用户可以领取
              this.setState({
                closeTg:false,//关闭/开启弹框
                showShare:true,
              })
            }else{
              this.setState({
                closeTg:false,//关闭/开启弹框
                showOpen:true,
              })
            }

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

    }else{
      //用户未登陆


    }
  }

  //关闭弹框
  tgClose = () => {
    //关闭
    this.setState({closeTg:false})
  }
  //跳转
  tgCloseTo = () => {
    Taro.redirectTo({ url: '/pages/videoVip' })
  }

  //开启弹框
  TgShareOpen = () =>{
    console.log(this.state.showShare)
    this.setState({closeTg:true})
  }

  copyShaneUrl = (shareLink) =>{
    var input = document.createElement("textarea")   // 直接构建input
    var value = this.props.course.name +"\n\n"+'http://wap.mylyh.com/#/pages/knowledge-online-free?id='+this.props.course.id
    input.value = value  // 设置内容
    document.body.appendChild(input)   // 添加临时实例
    input.select()   // 选择实例内容
    document.execCommand("Copy")   // 执行复制
    document.body.removeChild(input) // 删除临时实例
    is_set_Course()
        .then(res => {
          console.log(res)
          if(res.code == 1 && res.count == 0){
            //用户可以领取
            receive_Course(this.$router.params.id)
                .then(res1 => {
                  console.log(res1)
                  if(res1.code == 1 && res1.receive == 1){
                    //用户领取成功
                    Taro.showModal({
                      title: "提示", //提示的标题,
                      content: "领取成功", //提示的内容,
                      showCancel: false, //是否显示取消按钮,
                      confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
                      confirmColor: "#d62419", //确定按钮的文字颜色,
                      success: () => {
                        Taro.navigateTo({
                          url: '/pages/knowledge-online-detail?id=' + this.$router.params.id
                        })
                      }
                    })
                  }else{
                    //用户已经使用完该权益
                    if( res1.receive == 3){
                      Taro.showToast({
                        title: '您已经购买过该课程', //提示的内容,
                        icon: 'none', //图标,
                        duration: 2000, //延迟时间,
                        mask: true, //显示透明蒙层，防止触摸穿透,
                      })
                    }else{
                      Taro.showToast({
                        title: '您已经领取过该权益', //提示的内容,
                        icon: 'none', //图标,
                        duration: 2000, //延迟时间,
                        mask: true, //显示透明蒙层，防止触摸穿透,
                      })
                    }
                  }
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
          }else{

          }

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
  render() {
    return (
    <View>
        /**弹框**/
        <View className="TgShare">
          <Image className="TgShare-img" onClick={this.TgShareOpen} src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/icon_inter%402x.png"/>
        </View>
        {this.state.closeTg && this.state.showShare &&
        <View className='tg-care1'>
            <View className='user'>
              <Image className='close-img' onClick={this.tgClose.bind()} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/icon_close@2x.png'></Image>
              <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/pic_main%402x.png'></Image>
              <Image className='close'onClick={this.copyShaneUrl.bind()}  src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/btn_bg2%402x.png'></Image>
            </View>
        </View>
        }
    {/* 开通 */}
    {this.state.closeTg && this.state.showOpen &&
      <View className='tg-care2'>
          <View className='user'>
            <Image className='close-img' onClick={this.tgClose.bind()} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/icon_close@2x.png'></Image>
            <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/finish_5%402x.png'></Image>
            <Image className='close'onClick={this.tgCloseTo.bind()}  src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.4/btn_bg%402x.png'></Image>
          </View>
          </View>
      }
      </View>

    )
  }
}

export default Tg1
