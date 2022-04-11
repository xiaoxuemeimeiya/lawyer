import Taro, { Component } from '@tarojs/taro'

import { getCookie, setCookie, removeCookie } from "../../utils/storage"
import store from "../../store"
import {tryToCall} from '../../utils/tryToCall'

function Login(WrappedComponent){
  return class extends Component{
    static displayName=`login(${WrappedComponent.displayName})`

    componentDidShow(){
      tryToCall(this.wrappedRef.componentDidShow, this.wrappedRef)
    }

    render(){
      console.log("----------------组件已被login HOC 劫持----------------")
      const {token} = store.loginStore
      if (token) {
        getCookie("Prev_URL") && removeCookie("Prev_URL")
        return <WrappedComponent ref={ref => { this.wrappedRef = ref }} {...this.props} />
      } else {
        setCookie("Prev_URL", window.location.href)
        Taro.redirectTo({ url: "/pages/author" })
        return null
      }
      
    } 
  }
}

export default Login