import Taro, { Component } from "@tarojs/taro"
import { View, ScrollView, Image, Navigator, Text } from "@tarojs/components"

import { AtActivityIndicator } from "taro-ui"
import { getOffline } from "../../api/knowledge"
import { throttle } from "../../utils/util"
import { onScrollToLower } from "../../utils/scroll"
import LL_loading from "../../components/LL_loading/LL_loading"
import ScrollEnd from "../../components/ScrollEnd"
import "./index.scss"

class Index extends Component {
  config = {
    navigationBarTitleText: "线下学院"
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
    return getOffline(this.state.page)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        // 判断是否到底
        if (res.data.offschool && res.data.offschool.length >= 15) {
          this.setState({ isScrollEnd: false })
        } else {
          this.setState({ isScrollEnd: true })
        }

        // 专家列表数据
        if (this.state.page == 1) {
          // 首次请求
          this.setState({
            dataList: res.data.offschool,
            page: 2 // 默认为1,这里 1+1
          })
        } else {
          // 非首次请求
          this.setState(
            {
              dataList: [...this.state.dataList, ...res.data.offschool],
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
    return (
      <View className='KnowledgeOnlineCourse'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            height: "100%",
            boxSizing: "border-box",
            paddingTop: Taro.pxTransform(20)
          }}
          onScrollToUpper={this.onScrollToUpper} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
          onScrollToLower={onScrollToLower.bind(this)} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
        >
          {/* 滚动到顶部加载信息 */}
          {this.state.isScrollTop && <LL_loading></LL_loading>}

          {/* 线下学院 */}
          {this.state.dataList.map(item => (
            <Navigator
              key={item.id}
              url={
                "/pages/knowledge-offline-detail?id=" +
                item.id
              }
              className='ll-cells ll-cell--noborder media media-offline'
            >
              <View className='ll-cell ll-cell--primary media__bd'>
                <View className='ll-cell__hd hdBanner'>
                  <Image
                    className='media__img'
                    src={
                      item.cover_img ||
                      "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                    }
                  />
              {/*
                  <View className='applyList'>
                     <View className='headList'>
                      {
                          item.list && item.list.length > 0 &&
                              item.list.map((b, k) => (
                                  <Image key={k} className='headImg' src={b.headimgurl} />
                              ))
                       }
                      </View>
                      {
                          item.list && item.list.length > 0 &&
                          <Text>{item.learn_num || 0}人已报名</Text>
                      }
                  </View>
                  */}
                </View>
                <View className='ll-cell__bd'>
                  <View className='media__title ellipsis'>{item.name}</View>
                  <View className='media__small'>
                    {item.cat.length > 0 && item.cat.map(itemName => (
                      <Text key={itemName} className='media__tag'>
                        {itemName}
                      </Text>
                    ))}
                  </View>
                  <View className='media__ft'>
                      {item.price == 0
                          ?
                      <View className='media__price'>
                          免费
                      </View>
                        :
                      (item.type == 0 && item.vip_price
                          ?
                      <View className='media__price'>
                        ¥<Text className='normal_price'>{item.price}</Text>
                        <Text className='vip_price'>¥{item.vip_price}</Text>
                        <View className='label--freeIcon-vip vip_icon'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_price%402x.png'/></View>
                      </View>
                        :
                      <View className='media__price'>
                        ¥<Text className='normal_price'>{item.price}</Text>
                        <View className='label--freeIcon-vip'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_1%402x.png'/></View>
                      </View>

                        )
                      }
              {/*<View className='media__num'>{item.learn_num}人预约</View>*/}
                  </View>
                </View>
              </View>
            </Navigator>
          ))}

          {/* 上拉加载显示 */}
          <ScrollEnd isScrollEnd={this.state.isScrollEnd}></ScrollEnd>
          {/* 滚动到底部无内容了 */}
          {this.state.isScrollEnd && !!this.state.dataList.length && (
            <View className='ll-divider'>没有更多内容了</View>
          )}
          {/* 提示为空-快捷键`vi.showNull` */}
          {!this.state.dataList.length && (
            <View className='null-tip'>
              <Image
                className='null-tip__img'
                src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_searchnone@2x.png'
                mode='scaleToFill'
                lazy-load='false'
              ></Image>
              <View class='color-text-regular'>没有找到您想要的</View>
            </View>
          )}
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
