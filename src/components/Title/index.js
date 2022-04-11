import Taro, { Component } from '@tarojs/taro'
import {tryToCall} from '../../utils/tryToCall'

function Title(n) {
  let iTitle = n || ''
  return function (WrappedComponent){
    return class extends Component{
      static displayName=`title(${WrappedComponent.displayName})`

      componentDidShow(){
        tryToCall(this.wrappedRef.componentDidShow, this.wrappedRef)

        setTimeout(() => {
          if (process.env.TARO_ENV === 'weapp') {
            Taro.setNavigationBarTitle({
              title:iTitle
            })
          }
          if (process.env.TARO_ENV === 'h5') {
            document.title = iTitle
          }
        }, 0)
      }

      render(){
        setTimeout(() => {
          if (process.env.TARO_ENV === 'weapp') {
            Taro.setNavigationBarTitle({
              title:iTitle
            })
          }
          if (process.env.TARO_ENV === 'h5') {
            document.title = iTitle
          }
        }, 0)

        return <WrappedComponent ref={ref => { this.wrappedRef = ref }} {...this.props} />
      } 
    }
  }
}

export default Title