import Taro, { Component } from "@tarojs/taro"
import { View, ScrollView, Image, Navigator, Text } from "@tarojs/components"

import { AtTabs, AtActivityIndicator } from "taro-ui"
import { getOnline } from "../../api/knowledge"
import { throttle } from "../../utils/util"
import { onScrollToLower } from "../../utils/scroll"
import ScrollEnd from "../../components/ScrollEnd"

import "./index.scss"

class Index extends Component {
  config = {
    navigationBarTitleText: "线上学习"
  }

  constructor() {
    super(...arguments)
    this.state = {
      tabIndex: 0, // tab 组件下标
      type: 1, // 类型1 为最新。2为最热
      isFirstLoding: true, // 是否首次加载数据
      dataList: [], // 分页数据
      page: 1, // 页码
      isScrollEnd: false, // scroll-view 是否滚动到底部
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
    return getOnline(this.state.page, this.state.type)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        // 判断是否到底
        if (res.data.course && res.data.course.length >= 15) {
          this.setState({ isScrollEnd: false })
        } else {
          this.setState({ isScrollEnd: true })
        }

        // 专家列表数据
        if (this.state.page == 1) {
          // 首次请求
          this.setState({
            dataList: res.data.course,
            page: 2 // 默认为1,这里 1+1
          })
        } else {
          // 非首次请求
          this.setState(
            {
              dataList: [...this.state.dataList, ...res.data.course],
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

  handleClick = throttle(value => {
    if (process.env.TARO_ENV === 'h5')  {
      document.querySelector("#sKnowledgeOnlineCourse").scrollTo(0,0)
    }

    this.setState(
      {
        tabIndex: value,
        type: value + 1,
        page: 1,
        isScrollEnd: false
      },
      () => {
        this.getData()
      }
    )
  }, 1000)

  render() {
    const tabList = [{ title: "最新" }, { title: "最热" }]
    return (
      <View className='KnowledgeOnlineCourse'>
        {/* 头部 */}
        <View className='ll-cells ll-cell--noborder title-box online-title'>
          <View className='ll-cell'>
            <View className='ll-cell__bd'>
              <View className='title'>线上学习</View>
            </View>
            <View className='ll-cell__ft'>
              <AtTabs
                current={this.state.tabIndex}
                tabList={tabList}
                onClick={this.handleClick}
              ></AtTabs>
            </View>
          </View>
        </View>

        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{ height: "calc(100% - " + Taro.pxTransform(130) + ")" }}
          onScrollToLower={onScrollToLower.bind(this)} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
          id='sKnowledgeOnlineCourse'
        >
          {/* media */}
          {this.state.dataList.map(item => (
            <Navigator
              url={
                "/pages/knowledge-online-detail?id=" +
                item.id
              }
              className='ll-cells ll-cell--noborder media'
              key={item.id}
            >
              <View className='ll-cell ll-cell--primary media__bd'>
                <View className='ll-cell__hd'>
                  <Image
                    className='media__img'
                    src={
                      item.cover_img ||
                      "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                    }
                  />
                </View>
                <View className='ll-cell__bd'>
                  <View className='media__title ellipsis-2'>{item.name}</View>
                  <View className='media__small'>
                    {item.category.map(itemName => (
                      <Text key={itemName} className='media__tag'>
                        {itemName}
                      </Text>
                    ))}
                  </View>
                  <View className='media__ft'>
                    <View className='media__name'>{item.us_regist_name}</View>
                    <View className='media__num'>{item.learn_num}人在学</View>
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
