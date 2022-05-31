import Taro, { Component } from "@tarojs/taro"
import { View, ScrollView, Image, Navigator, Textarea,Input,Button } from "@tarojs/components"

import { AtActivityIndicator } from "taro-ui"
import {getFamous, getOnline} from "../../api/knowledge"
import {member_reccommend} from "../../api/videoVip"
import { onScrollToLower } from "../../utils/scroll"
import ScrollEnd from "../../components/ScrollEnd"
import Share from "../../components/Share"
import Title from "../../components/Title"
import {need} from "../../api/expert"
import { handleInput, HttpException } from '@/src/utils/util'

import "./index.scss"

@Share()
@Title("发布需求")
class Index extends Component {
    config = {
        navigationBarTitleText: "发布需求"
    }

    constructor() {
        super(...arguments)
        this.state = {
            data:{
                phone:'',
                content:''
            }
        }
    }

    async componentDidMount () {
        
    }

     // 验证用户是否之前有过需求,如果有则不显示验证码
  showCode = () =>{
    validatePhone(getToken())
      .then(res=>{
        if(res.data && typeof res.data === 'string'){
          this.setData({
            showCode:false,
            phone:res.data,
            memoryPhone:res.data
          })
        }else{
          this.setData({
            showCode:true
          })
        }
      })
      .catch(err=>{throw err})
  }

  submit = () => {
    return need({phone:this.state.data.phone,content:this.state.data.content,verity:1}).then(res => {
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
  }


  /**
     * 参数校验器
     * @param(Object) from 数据源
     * @param(Object) rules 校验规则
     * @param(Object) msg 提示语
     */
   validate = (from, rules, msg) => {
    const rulesName = {
        phone: '手机号码'
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
  
  // 验证规则
  validate(){
    return new Promise((resolve,reject)=>{ 
      if(!this.data.content){
        wx.showToast({
          title: '请输入您的需求!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
          success: res => {}
        });
        return reject()
      }

      if(!this.data.phone){
        wx.showToast({
          title: '请输入手机号码!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
          success: res => {}
        });
        return reject()
      }

      if(!(/^[1][3,4,5,7,8][0-9]{9}$/.test(this.data.phone))){
        wx.showToast({
          title: '请输入正确的手机号码!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
          success: res => {}
        });
        return reject()
      }

      if(!this.data.showCode && this.data.memoryPhone!== this.data.phone){
        wx.showModal({
          title: '提示', //提示的标题,
          content: '您所填号码与上次输入不一致,请先通过验证!', //提示的内容,
          showCancel: false, //是否显示取消按钮,
          confirmText: '确定', //确定按钮的文字，默认为取消，最多 4 个字符,
          confirmColor: '#D62419', //确定按钮的文字颜色,
          success: res => {
            this.setData({showCode:true})
          }
        });
        return reject()
      }

      if(!this.data.code && this.data.showCode){
        wx.showToast({
          title: '请输入验证码!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
          success: res => {}
        });
        return reject()
      }

      return resolve()

    }) 
  }

    render() {
        return (
        <View className='New_year_festival_sipervisor'>
            <View className="ll-cells ll-cell--noborder">
                <View className="ll-cell">
                    <View className="ll-cell__bd">
                        <View className="demand-title color-black">平台为您定制服务</View>
                    </View>
                </View>
                <View className="ll-cell ll-cell--noborder demand-input demand-textarea">
                    <Textarea
                    onChange={handleInput.bind(this, "data.content")}
                    type="text"
                    className="ll-input"
                    placeholder="需求描述">
                    </Textarea>
                </View>
                <View className="ll-cell ll-cell--noborder demand-input">
                    <View className="ll-cell__hd">
                        <View className="demand-input__label">手机号码</View>
                    </View>
                    <View className="ll-cell__bd">
                        <Input
                        onChange={handleInput.bind(this, "data.phone")}
                        type="text"
                        className="ll-input"
                        placeholder="请输入您的手机号" />
                    </View>
                </View>
                {/*
                <View className="ll-cell ll-cell--noborder demand-input">
                    <View className="ll-cell__hd">
                        <View className="demand-input__label">验证码</View>
                    </View>
                    <View className="ll-cell__bd">
                        <Input
                        bindblur="handleInput"
                        bindinput="handleInput"
                        data-inputkey="code"
                        value="{{code}}"
                        type="text"
                        className="ll-input"
                        placeholder="请输入验证码" />
                    </View>
                    <View className="ll-cell__ft">
                        <Button disabled="disable" className="code-tip color-primary" onClick={this.getCode}>'tip'</Button>
                    </View>
                </View>
        */}
                <View className="ll-cell ll-cell--noborder">
                    <View className="ll-cell__bd">
                        <Button className="btn btn-primary--large btn-sure" onClick={this.submit}>
                        马上发布
                        </Button>
                        <View className="color-small">链英汇执行秘书24小时内与您联系。</View>
                    </View>
                </View>
            </View>
        </View>)}
}

export default Index
