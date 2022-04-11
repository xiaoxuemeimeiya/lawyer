import Taro, { Component } from "@tarojs/taro"
import { View, ScrollView, Image, Navigator, Text,Button } from "@tarojs/components"

import dayjs from 'dayjs'
import { AtActivityIndicator } from "taro-ui"
import { getCardLog } from "../../api/stored-card"
import { throttle } from "../../utils/util"
import { onScrollToLower } from "../../utils/scroll"
import LL_loading from "../../components/LL_loading/LL_loading"
import Login from "../../components/Login"
import Title from "../../components/Title"
import ScrollEnd from "../../components/ScrollEnd"
import "./index.scss"

@Title("明细")
@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "明细"
  }

  constructor() {
    super(...arguments)
    this.state = {
      isFirstLoding: true, // 是否首次加载数据
      dataList: [], // 分页数据
      page: 1, // 页码
      isScrollEnd: false, // scroll-view 是否滚动到底部
      isScrollTop: false // scroll-view 是否滚动到顶部
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
    return getCardLog(this.state.page)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        // 判断是否到底
        if (res.data && res.data.length >= 15) {
          this.setState({ isScrollEnd: false })
        } else {
          this.setState({ isScrollEnd: true })
        }

        // 专家列表数据
        if (this.state.page == 1) {
          // 首次请求
          this.setState({
            dataList: res.data,
            page: 2 // 默认为1,这里 1+1
          })
        } else {
          // 非首次请求
          this.setState(
            {
              dataList: [...this.state.dataList, ...res.data],
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

  render() {
    const typeNames=["线上课程购买","线下学院购买","专家电话问答","专家文字问答"]

    return (
      <View className='StoredCardDetail'>
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

          {
            this.state.dataList.filter(n=>(n.status===1)).map(item=>(
              <View className='ll-cells ll-cell--noborder card-item' key={item.card_id}>
                <View className='ll-cell'>
                  <View className='ll-cell__bd'>
                    <View className='card-title'>{typeNames[item.type_p]}</View>
                    <View className='card-time'>{item.addtime && dayjs(item.addtime * 1000).format("YYYY-MM-DD HH:mm")}</View>
                  </View>
                  <View className='ll-cell__ft card-num'>
                    {item.type === 1 ? '-':'+'}{item.cash}
                  </View>
                </View>
              </View>
            ))
          }

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
      </View>
    )
  }
}

export default Index
