import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text,
  Button,
  Input
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import { getProfit,cashout } from "../../api/profit"
import {checkReg} from '../../utils/login'
import { throttle,handleInput} from "../../utils/util"
import Login from "../../components/Login"
import Title from "../../components/Title"
import "./index.scss"

@Title("提现")
@Login
@inject('loginStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "提现"
  }

  constructor() {
    super(...arguments)
    this.state = {
      /** 是否首次加载数据 */
      isFirstLoding: true, 
      /** 可提现收益 */
      account:0,
      /** 提现金额 */
      cash:''
    }
  }

  componentDidMount() {
    this.getDataList()
  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    this.getData()
  }

  getData() {
    return getProfit()
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        // 首次请求
        this.setState({
          account:res.data.account
        })

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

  /** 全部提现 */
  withdrawAll=()=>{
    this.setState({'cash':this.state.account})
  }

  // 提交
  submit= async ()=>{
    Taro.showLoading({
      title: '', //提示的内容,
      mask: true, //显示透明蒙层，防止触摸穿透,
    })
    
    const re = await this.validate().then(()=>true).catch(()=>false)

    // 验证失败
    if(!re){
      Taro.hideLoading()
      return
    }
  
    // 验证成功
    cashout(Number(this.state.cash))
      .then(res=>{ 
        console.log("TCL: submit -> res", res)

        Taro.hideLoading()
        Taro.redirectTo({ url: '/pages/info-succ?type=withdraw'})
      })   
      .catch(err=>{
        Taro.hideLoading()
        console.log(err)
        Taro.showToast({ 
          title: err.msg?err.msg:err, //提示的内容, 
          icon: 'none', //图标, 
          duration: 2000, //延迟时间, 
          mask: true, //显示透明蒙层，防止触摸穿透, 
        }) 
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

      if(!this.state.cash){
        Taro.showToast({
          title: '提现金额不能为空!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
        })
        return reject()
      }

      // 上面已经提前判断cash为空的情况,所以这里isNaN无需多一层判断(isNaN为空时是false)
      // eslint-disable-next-line no-restricted-globals
      if(isNaN(this.state.cash)){
        Taro.showToast({
          title: '请输入数字', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
        })
        return reject()
      }

      // 这里仍然是字符串,默认做隐式转换
      if(this.state.cash < 200){
        Taro.showToast({
          title: '金额不能低于最小金额200元!', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
        })
        return reject()
      }

      // 这里仍然是字符串,默认做隐式转换
      if(this.state.cash > 20000){
        Taro.showToast({
          title: '金额累计不能超过20000!', //提示的内容,
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
    return (
      <View className='Withdraw'>
        <View className='withdraw-title'>
          提现金额
        </View>
        <View className='ll-cells ll-cell--noborder'>
          <View className='ll-cell'>
            <View className='ll-cell__hd withdraw-icon'>
              ¥
            </View>
            <View className='ll-cell__bd'>
              <Input
                className='ll-input withdraw-input'
                type='text'
                value={this.state.cash}
                onChange={handleInput.bind(this, "cash")}
                placeholder='请输入提现金额'
              ></Input>
            </View>
          </View>
          <View className='ll-cell'>
            <View className='ll-cell__bd withdraw-info'>
              可提现金额：{this.state.account}元
            </View>
            <View className='ll-cell__ft'>
              <View className='withdraw-all' onClick={this.withdrawAll}>全部提现</View>
            </View>
          </View>
        </View>
        <View className='ll-cell ll-cell--noborder withdraw-btn'>
          <View className='ll-cell__bd'>
            <Button className='btn btn-primary--large' onClick={this.submit}>提现至我的微信钱包</Button>
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
