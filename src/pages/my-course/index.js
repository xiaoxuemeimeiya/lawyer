import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text
} from "@tarojs/components"
import { AtTabs, AtActivityIndicator } from "taro-ui"
import { onScrollToLower } from "../../utils/scroll"
// import {Tabbar} from './components'
import Login from "../../components/Login"
import Title from "../../components/Title"
import Tabbar from "../../components/Tabbar"
import ScrollEnd from "../../components/ScrollEnd"
import { myOnlineCourse,myOnlineCourseNew, myOfflineCourse } from '../../api/my-course'

import "./index.scss"

@Title("我的课程")
@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "我的课程"
  };

  constructor() {
    super(...arguments)
    this.state = {
      tabIndex: 0,
      conditionMap: [myOnlineCourseNew, myOfflineCourse],

      /** 是否首次加载数据 */
      isFirstLoding: true,
      /** 分页数据 */
      dataList: [],
      /** 页码 */
      page: 1,
      /** scroll-view 是否滚动到底部 */
      isScrollEnd: false,
      // 内存是否为空
      empty: false
    }
  }

  async componentDidMount() {
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
    return this.state.conditionMap[this.state.tabIndex](this.state.page)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        // 判断是否到底
        if (res.data && res.data.length >= 15) {
          this.setState({ isScrollEnd: false })
        } else {
          this.setState({ isScrollEnd: true })
        }
        // 判断是否list是否为空
        try {
          this.setState({
            empty: res.data.length < 1,
          })
        } catch (err) { }

        // 专家列表数据
        if (this.state.page == 1) {
          // 首次请求
          this.setState({
            dataList: res.data,
            page: 2, // 默认为1,这里 1+1
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

  handleClick = (value) => {
    this.setState({
      tabIndex: value,
      page: 1,
      isScrollEnd: false,
      dataList: []
    }, () => {
      this.getData()
    })
  };

  render() {
    const tabList = [{ title: "线上课程" }, { title: "线下学院" }]
    const presentUrl = window.location.origin
    return (
      <View className='MyCourse'>

        {/* 头部 */}
        <View
          className='ll-cells ll-cell--noborder ll-cell--noborder header'
        >
          <View className='ll-cell tabs-mycourse'>
            <View className='ll-cell__ft'>
              <AtTabs
                current={this.state.tabIndex}
                tabList={tabList}
                onClick={this.handleClick}
              >
              </AtTabs>
            </View>
            <View className='ll-cell__bd'></View>
          </View>
        </View>

        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{ boxSizing: 'border-box', flex: 1 }}
          onScrollToLower={onScrollToLower.bind(this)} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
        >


          {/* 线上学院 */}
          {this.state.tabIndex == 0 && this.state.dataList.map(item => (
            <Navigator
              url={
                "/pages/knowledge-online-detail?id=" +
                item.course_id
              }
              className='ll-cells ll-cell--noborder media'
              key={item.course_id}
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
                    {item.category && item.category.map(itemName => (
                      <Text key={itemName} className='media__tag'>
                        {itemName}
                      </Text>
                    ))}
                  </View>
                  <View className='media__ft'>
                    <View className='media__name'>{item.us_regist_name}</View>
                    <View className='media__num'>{item.fake_data}人在学</View>
                  </View>
                </View>
              </View>
            </Navigator>
          ))}

          {/* 线下学院 */}
          {this.state.tabIndex == 1 && this.state.dataList.map(item => (
            <Navigator
              key={item.shop_id}
              url={
                "/pages/knowledge-offline-detail?id=" +
                item.shop_id
              }
              className='ll-cells ll-cell--noborder media media-offline'
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
                  <View className='media__title ellipsis'>{item.name}</View>
                  <View className='media__small'>
                    {item.cat && item.cat.map(itemName => (
                      <Text key={itemName} className='media__tag'>
                        {itemName}
                      </Text>
                    ))}
                  </View>
                  <View className='media__ft'>
                    <View className='media__price'>
                      ¥ <Text>{item.price}</Text>
                    </View>
                    <View className='media__num'>{item.join_num}人在学</View>
                  </View>
                </View>
              </View>
            </Navigator>
          ))}

          {/* 上拉加载显示 */}
          <ScrollEnd isScrollEnd={this.state.isScrollEnd}></ScrollEnd>
          {/* 空提示 */}
          {
            this.state.empty === true &&
            <View className='null-tip'>
              <Image
                className='null-tip__img'
                src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_searchnone1@2x.png'
                mode='scaleToFill'
                lazy-load='false'
              >
              </Image>
              <View className='color-text-regular'>没有找到您想要的</View>
              <View className='btn btn-primary--large null-tip__btn'>
                <a href={presentUrl} style='color:#fff'>去看看</a>
              </View>
            </View>
          }
          {/* 滚动到底部无内容了 */}
          {this.state.isScrollEnd && !!this.state.dataList.length && (
            <View className='ll-divider'>没有更多内容了</View>
          )}

        </ScrollView>


        {/* 底部导航栏 */}
        {
          this.$router.params.tabbarShow !== 'false' &&
          <Tabbar></Tabbar>
        }

        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
