import Taro, { Component } from "@tarojs/taro"
import {
  View,
  Image,
  Input,
  Text,
  Button,
  ScrollView
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import {AtActivityIndicator,AtSwitch } from "taro-ui"
import {checkReg} from '../../utils/login'
import Login from "../../components/Login"
import Title from "../../components/Title"
import {handleInput} from '../../utils/util'
import {getCookie, removeCookie, setCookie} from '../../utils/storage'
import {payOfflineCourse} from '../../api/pay'
import { decryption } from "../../utils/aes"
import {getOfflineDetail} from '../../api/knowledge'

import "./index.scss"
import {get_sms, verity_code,signFree} from "../../api/videoVip"

// eslint-disable-next-line import/no-commonjs
const math = require('mathjs')

@Title("活动报名")
@Login
@inject('loginStore','userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "活动报名"
  };

  constructor() {
    super(...arguments)
    this.state = {
      /** 邀请码 */
      code:'',
      id:'',
      liked:true,
      dataList:{},
      count:60,
      data:{
        name:'',
        phone:'',
        company:'',
        position:'',
        code:'',
      },
      /** 报名 0:初始化 1:未开始 2:进行中 3: 已过期 */
      isTimePass:0,

      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount(){
    this.getDataList()
  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    const code = this.$router.params.code
    if(code !== undefined){
      this.state.code=code
    }else{
      this.state.code=''
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
    getOfflineDetail(this.state.id)
        .then(res => {
          console.log("TCL: getExpertsList -> res", res)

          this.setState({
            dataList: res.data
          },()=>{
            //检查是否时免费
            console.log(res.data.price)
            if(res.data.price < 0){
              //返回报名页
              Taro.showModal({
                title: "提示", //提示的标题,
                content: "该活动为付费活动", //提示的内容,
                showCancel: false, //是否显示取消按钮,
                confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
                confirmColor: "#d62419", //确定按钮的文字颜色,
                success: () => {
                  Taro.navigateTo({url:'/pages/knowledge-offline-detail?id='+this.state.id})
                }
              })
              return
            }
            // 检查报名时间
            this.checkTime(res.data.sign_starttime,res.data.sign_endtime)
          })
          // 取消显示首次loading
          this.state.isFirstLoding && this.setState({ isFirstLoding: false })
        })
        .catch(err => {
          console.log(err)
          if (err.code == 16) {
            Taro.showModal({
              title: "提示", //提示的标题,
              content: "很抱歉,该活动已下架!", //提示的内容,
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

  /**
   * 活动是否过期
   *
   * @param {*} start - 开始时间
   * @param {*} end - 结束时间
   */
  checkTime(start,end){
    var now=Date.now()
    start=start*1000
    end=end*1000

    if( now < start){
      this.state.isTimePass=1
      this.setState({isTimePass:1})
    }else if(now >= start && now <= end){
      this.state.isTimePass=2
      this.setState({isTimePass:2})
    }else if(now > end){
      this.state.isTimePass=3
      this.setState({isTimePass:3})
    }

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

  // 提交
  submit= async ()=>{
    Taro.showLoading({
      title: '', //提示的内容,
      mask: true, //显示透明蒙层，防止触摸穿透,
    })

    //前端验证
    const re = await this.validate().then(()=>true).catch(()=>false)

    // 验证失败
    if(!re){
      Taro.hideLoading()
      return
    }

    // 验证成功
    //1.验证验证码
    verity_code({ phone: this.state.data.phone,code: this.state.data.code })
        .then(res=>{
          console.log("TCL: submit -> res", res)
          //提交资料
          signFree({ id:this.state.id,phone: this.state.data.phone,company: this.state.data.company,position:this.state.data.position,name:this.state.data.name })
              .then(res1=> {
                console.log("TCL: submit -> res1", res1)
                Taro.redirectTo({ url: '/pages/info-succ?type=offline'})
              })
              .catch(err=>{
              Taro.hideLoading()
              console.log(err)
              if(err.code == 13){
                Taro.showToast({
                  title: '您已经报名!', //提示的内容,
                  icon: 'none', //图标,
                  duration: 2000, //延迟时间,
                  mask: true, //显示透明蒙层，防止触摸穿透,
                })
              }else if(err.code == 14){
                Taro.showToast({
                  title: '找不到该课程!', //提示的内容,
                  icon: 'none', //图标,
                  duration: 2000, //延迟时间,
                  mask: true, //显示透明蒙层，防止触摸穿透,
                })
              }else{
                Taro.showToast({
                  title: err.msg?err.msg:err, //提示的内容,
                  icon: 'none', //图标,
                  duration: 2000, //延迟时间,
                  mask: true, //显示透明蒙层，防止触摸穿透,
                })
              }
          })

        })
        .catch(err=>{
          Taro.hideLoading()
          console.log(err)
          if(err.code == 13){
            Taro.showToast({
              title: '已经购买过了!', //提示的内容,
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true, //显示透明蒙层，防止触摸穿透,
            })
          }else if(err.code == 14){
            Taro.showToast({
              title: '找不到该课程!', //提示的内容,
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true, //显示透明蒙层，防止触摸穿透,
            })
          }else{
            Taro.showToast({
              title: err.msg?err.msg:err, //提示的内容,
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true, //显示透明蒙层，防止触摸穿透,
            })
          }
        })

  }

  // 验证规则
  validate=()=>{
    return new Promise((resolve,reject)=>{
      const {isLogin} = this.props.loginStore
      if(!isLogin){
        checkReg()
        return reject()
      }

      if(this.state.isTimePass===1){
        Taro.showToast({
          title: '该活动暂未开始接受报名!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
        })
        return reject()
      }

      if(this.state.isTimePass===3){
        Taro.showToast({
          title: '该活动已过期!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
        })
        return reject()
      }

      if(!this.state.data.name){
        Taro.showToast({
          title: '请输入您的名字!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
        })
        return reject()
      }

      if(!this.state.data.phone){
        Taro.showToast({
          title: '请输入手机号码!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
        })
        return reject()
      }

      if(!(/^[1][3,4,5,7,8][0-9]{9}$/.test(this.state.data.phone))){
        Taro.showToast({
          title: '请输入正确的手机号码!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
        })
        return reject()
      }


      return resolve()

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
              height: "100%",
                  boxSizing: "border-box",
                  paddingBottom: Taro.pxTransform(112)
            }}
          >
            <View className='ll-cells ll-cell--noborder content'>
              <View className='ll-cell'>
                <View className='ll-cell__hd content__title'> {this.state.dataList.us_regist_name} </View>
              </View>
              <View className='ll-cell ll-cell--primary content__bd'>
                <View className='ll-cell__hd'>
                  <Image className='content__img' src={this.state.dataList.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}></Image>
                </View>
                <View className='ll-cell__bd'>
                  <View className='content__text ellipsis-2'>{this.state.dataList.name}</View>
                </View>
              </View>
            </View>

            {/* 姓名和手机号码 */}
            <View className='ll-cells ll-cell--noborder content'>
              <View className='ll-cell content__bd'>
                <View className='ll-cell__hd content__label content__label--title'> 姓名 </View>
                <View className='ll-cell__bd'>
                  <Input
                  className='ll-input'
                  type='text'
                  onChange={handleInput.bind(this, "data.name")}
                  placeholder='请输入您的名字'
                  ></Input>
                </View>
              </View>
              <View className='ll-cell content__bd'>
                <View className='ll-cell__hd content__label content__label--title'> 公司 </View>
                <View className='ll-cell__bd'>
                  <Input
                  className='ll-input'
                  type='text'
                  onChange={handleInput.bind(this, "data.company")}
                  placeholder='请输入您所在公司'
                      ></Input>
                </View>
              </View>
              <View className='ll-cell content__bd'>
                <View className='ll-cell__hd content__label content__label--title'> 职务 </View>
                <View className='ll-cell__bd'>
                  <Input
                  className='ll-input'
                  type='text'
                  onChange={handleInput.bind(this, "data.position")}
                  placeholder='请输入您的职位'
                      ></Input>
                </View>
              </View>
              <View className='ll-cell content__bd'>
                <View className='ll-cell__hd content__label content__label--title'> 手机号码 </View>
                <View className='ll-cell__bd phoneSend'>
                  <Input
                  className='ll-input'
                  type='text'
                  onChange={handleInput.bind(this, "data.phone")}
                  placeholder='请输入您的手机号码'
                      ></Input>
                      {this.state.liked
                          ?
                      <View className='sendCode' onClick={this.sms}>发送验证码</View>
                          :
                      <View className='sendCode'>{this.state.count + 's'}</View>
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
                    placeholder='请输入验证码'
                  ></Input>
                </View>
              </View>
              <View className='ll-cell content__bd'>
                <View className='sub-free-sign' onClick={this.submit}>提交报名</View>
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
