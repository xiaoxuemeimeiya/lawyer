import Taro, { Component } from "@tarojs/taro"
import { View, ScrollView, Image, Navigator, Text,Button } from "@tarojs/components"

import { AtActivityIndicator,AtModal,AtModalContent } from "taro-ui"
import { getCardTotal } from "../../api/stored-card"
import { throttle } from "../../utils/util"
import Login from "../../components/Login"
import Title from "../../components/Title"
import "./index.scss"

@Title("储值卡")
@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "储值卡"
  }

  constructor() {
    super(...arguments)
    this.state = {
      /** 是否首次加载数据 */
      isFirstLoding: true,
      /** 模态框显示 */
      isOpened:false, 
      /** 分页数据 */
      dataList: [], 
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
    return getCardTotal()
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        this.setState({
          dataList: res.data
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

  render() {
    return (
      <View className='StoredCard'>
        <View className='card-box'>
          <View className='ll-cells ll-cell--noborder card'>
            <View className='ll-cell card__hd'>
              <View className='ll-cell__bd card-title'>
                余额(元)
              </View>
              <View className='ll-cell__ft' onClick={()=>{this.setState({isOpened:true})}}>
                什么是储值卡<View className='icon icon-ques2'></View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder card__bd'>
              <View className='ll-cell__bd'>
                <View className='card-total'>{this.state.dataList.type===0 ? '0' : this.state.dataList.account}</View>
                <View className='card-info'>可用于购买课程，培训等平台产品</View>
                <Navigator url='/pages/stored-card-detail' className='btn card-btn'>明细</Navigator>
              </View>
            </View>
          </View>
        </View>
        {/* <View className='ll-cells recharge ll-cell--noborder'>
          <View className='ll-cell recharge-title'>
            <View className='ll-cell__hd'>
              充值
            </View>
          </View>
          <View className='ll-cell ll-cell--noborder recharge__bd'>
            {
              this.state.dataList.map((item,index)=>(
                <View className={`recharge-item ${index===0 ? 'active' :' '}`} key={index}>
                  {item.remark}
                </View>
              ))
            }
          </View>
          <View className='recharge-info'>
            点击充值，即代表已阅读并同意
            <Navigator className='recharge-info__link'>充值规则</Navigator>
          </View>
        </View> */}
        
        {/* 模态框 */}
        <AtModal isOpened={this.state.isOpened}>
          <AtModalContent>
            <View className='model'>
              <View className='model-title'>什么是学习储值卡？</View>
              <View className='model-content'>
              学习储值卡是链链平台推出的一种虚拟消费卡，现阶段获得方式：<View className='strong'>加入链链达人俱乐部即可获得：</View>
              </View>
              <View className='model-content'>
              可用于<View className='strong'>link学堂；</View>
              </View>
              <View className='model-content'>
              储值卡内的金额无法提现，转赠。  
              </View>
              <Button className='btn btn-primary--large model-btn' onClick={()=>{this.setState({isOpened:false})}}>知道了</Button>
            </View>
          </AtModalContent>
        </AtModal>

        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
