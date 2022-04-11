import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text,
  Button
} from "@tarojs/components"

import dayjs from 'dayjs'
import { AtActivityIndicator,AtModal,AtModalContent } from "taro-ui"
import { getProfit } from "../../api/profit"
import { throttle } from "../../utils/util"
import { onScrollToLower } from "../../utils/scroll"
import LL_loading from "../../components/LL_loading/LL_loading"
import Login from "../../components/Login"
import Title from "../../components/Title"
import ScrollEnd from "../../components/ScrollEnd"
import "./index.scss"

@Title("收益")
@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "收益"
  }

  constructor() {
    super(...arguments)
    this.state = {
      /** 总收益 */
      allAccount:0,
      /** 可提现收益 */
      account:0,
      /** 是否首次加载数据 */
      isFirstLoding: true, 
      /** 分页数据 */
      dataList: [], 
      /** 页码 */
      page: 1, 
      /** scroll-view 是否滚动到底部 */
      isScrollEnd: false, 
      /** scroll-view 是否滚动到顶部 */
      isScrollTop: false,
      /** 模态框显示 */
      isOpened:false, 
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
    if (this.state.isScrollEnd) return
    return getProfit(this.state.page)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        // 判断是否到底
        if (res.data.loglist && res.data.loglist.length >= 15) {
          this.setState({ isScrollEnd: false })
        } else {
          this.setState({ isScrollEnd: true })
        }

        // 专家列表数据
        if (this.state.page == 1) {
          // 首次请求
          this.setState({
            allAccount:res.data.all_account,
            account:res.data.account,
            dataList: res.data.loglist,
            page: 2 // 默认为1,这里 1+1
          })
        } else {
          // 非首次请求
          this.setState(
            {
              dataList: [...this.state.dataList, ...res.data.loglist],
              page: this.state.page + 1
            },
            () => {
              console.log(
                "TCL: getExpertsList -> this.state.page",
                this.state.page
              )
            }
          )
        }

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

  /**
   * 滚动到顶部/左边时触发
   */
  onScrollToUpper = throttle(() => {
    // H5环境取消下拉刷新
    if(process.env.TARO_ENV !== 'h5'){
      console.log("滚动到顶部/左边时触发")
  
      this.setState(
        {
          page: 1,
          isScrollEnd: false,
          isScrollTop: true
        },
        () => {
          this.getData().finally(() => {
            setTimeout(() => {
              this.setState({
                isScrollTop: false
              })
            }, 1000)
          })
        }
      )
    }
  }, 2000)

  /** 跳转提现判断 */
  gotoWithdrawal=()=>{
    if(this.state.account < 200){
      Taro.showModal({
        title: "提示", //提示的标题,
        content: "提现金额需满200元", //提示的内容,
        showCancel: false, //是否显示取消按钮,
        confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
        confirmColor: "#D62419", //确定按钮的文字颜色,
      })
    }else{
      Taro.navigateTo({url:'/pages/withdraw'})
    }
  }

  render() {
    return (
      <View className='Profit'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            height: "100%",
            boxSizing: "border-box"
          }}
          onScrollToUpper={this.onScrollToUpper} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
          onScrollToLower={onScrollToLower.bind(this)} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
        >
          {/* 滚动到顶部加载信息 */}
          {this.state.isScrollTop && <LL_loading></LL_loading>}

          <View className='card-box'>
            <View className='ll-cells ll-cell--noborder card'>
              <View className='ll-cell ll-cell--access card__hd'>
                <View className='ll-cell__bd card-title'>待提现金额</View>
                <View className='ll-cell__ft ll-cell__ft--in-access' onClick={()=>{this.setState({isOpened:true})}}>
                  提现规则
                </View>
              </View>
              <View className='ll-cell ll-cell--noborder card__bd'>
                <View className='ll-cell__bd'>
                  <View className='card-total'>{this.state.account}</View>
                  <Button className='btn card-btn' onClick={this.gotoWithdrawal}>提现</Button>
                  <View className='card-info'>满200即可提现</View>
                </View>
              </View>
            </View>
          </View>
          <View className='ll-cells ll-cell--noborder detail'>
            <View className='ll-cell' style={{padding: `${Taro.pxTransform(60)}px ${Taro.pxTransform(24)}px ${Taro.pxTransform(60)}px`}}>
              <View className='ll-cell__bd detail-title'>明细</View>
              {
                this.state.allAccount > 0 && (
                  <View className='ll-cell--ft detail-acount'>累计收益: {this.state.allAccount}</View>
                )
              }
            </View>

            { 
              this.state.dataList.map(item=>(
                <View className='ll-cells ll-cell--noborder card-item' key={item.id}>
                  <View className='ll-cell'>
                    <View className='ll-cell__bd'>
                      <View className='card-title'>{item.remark}</View>
                      <View className='card-time'>{dayjs(item.addtime).format('YYYY-MM-DD')}</View>
                    </View>
                    <View className='ll-cell__ft card-num'>
                      {
                        item.status === 1 && (
                          <View>
                            <View className='color-text-secondary'>{item.type===3 ? '-' :'+'}{item.cash}</View>
                            <View className='card-num__status'>审核中</View>
                          </View>
                        )
                      }
                      {
                        item.status === 2 && <View className={item.type===3 ? 'color-text-primary' :''}>{item.type===3 ? '-' :'+'}{item.cash}</View>
                      }
                      {
                        item.status === 3 && <View className='color-text-primary card-num__status'>审核失败</View>
                      }
                    </View>
                  </View>
                </View>
              ))
            }
            

          </View>
          
          {/* 上拉加载显示 */}
          <ScrollEnd isScrollEnd={this.state.isScrollEnd}></ScrollEnd>
          {/* 滚动到底部无内容了 */}
          {this.state.isScrollEnd && !!this.state.dataList.length && (
            <View className='ll-divider'>没有更多内容了</View>
          )}
          {/* 首次加载 */}
          {this.state.isFirstLoding && (
            <AtActivityIndicator size={36}></AtActivityIndicator>
          )}
        </ScrollView>

        {/* 模态框 */}
        <AtModal isOpened={this.state.isOpened}>
          <AtModalContent>
            <View className='model'>
              <View className='model-title'>提现规则</View>
              <View className='model-content'>
                满200元即可提现
              {/* 学习储值卡是链链平台推出的一种虚拟消费卡，现阶段获得方式：<View className='strong'>加入链链达人俱乐部即可获得。</View> */}
              </View>
              <View className='model-content'>
              {/* 可用于<View className='strong'>购买线上课程，线下学院，专家电话问答，文字问答。</View> */}
              </View>
              <View className='model-content'>
              {/* 储值卡内的金额无法提现，转赠。  */}
              </View>
              <Button className='btn btn-primary--large model-btn' onClick={()=>{this.setState({isOpened:false})}}>知道了</Button>
            </View>
          </AtModalContent>
        </AtModal>
      </View>
    )
  }
}

export default Index
