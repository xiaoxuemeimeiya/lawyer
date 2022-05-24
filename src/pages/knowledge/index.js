import Taro, { Component } from "@tarojs/taro"
import {
  View,
  Input,
  Image,
  Navigator,
  Text,
  Button,
  ScrollView
} from "@tarojs/components"
import { AtTabs, AtActivityIndicator } from 'taro-ui'
import { inject } from '@tarojs/mobx'
//import voice from '@/src/components/musicPlayer'

import { getKnowledge, getOnline, getMonths, getFamous,getOffline } from "../../api/knowledge"
import { getCategory, getExpretList,alive,course_cat,careGzh,live,scan } from "../../api/expert"
import { handleInput } from "../../utils/util"
import { onScrollToLower } from "../../utils/scroll"
import Share from "../../components/Share"
import Title from "../../components/Title"
import ScrollEnd from "../../components/ScrollEnd"
import VideoVipCard from "../../components/videoVipCard"
import Tabbar from "../../components/Tabbar"
import Gzh from "../../components/Gzh"
import Tg from "../../components/Tg"
import { decryption } from "../../utils/aes"
import { Recommend, Online } from "./components"


import "./index.scss"

@Share()
@inject('userStore')
@Title("智汇圈")
class Index extends Component {
  config = {
    navigationBarTitleText: "LINK.链学堂"
  }

  constructor() {
    super(...arguments)
    this.state = {
      /** 轮播图 */
      swiper: [],
      /** 推荐直播 */
      liveActive: {},
      /** 本月上线 */
      month: [],
      /** 名家学院 */
      famous: [],
      /** 线下学院 */
      offline: [],
      /** 线上课程 */
      dataList: [],
      courseList:[],
      keyword: "",
      aliveList:[],
      liveList:[],
      /** 菜单 */
      categories: {
        list: [],
        index: 0,
        showFooter: false,
      },

      /** 是否首次加载数据 */
      isFirstLoding: true,
      /** 页码 */
      page: 1,
      page1: 1,
      /** scroll-view 是否滚动到底部 */
      isScrollEnd: false,
      loading: false, // 加载中,
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
    this.getDataList()
  }




  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  async getDataList() {
    this.getCategory()
    await this.getSwiper()
    this.getData()
    this.getoffline()
    this.getExpretListData()
    this.live()
    // 取消显示首次loading
      this.state.isFirstLoding && this.setState({ isFirstLoding: false })
  }

  /** 获取轮播图和线下学院 */
  getSwiper = () => {
    return getKnowledge()
      .then(res => {
        console.log("TCL: Index -> getSwiper -> res", res)
        this.setState({
          swiper: res.data.header, // 轮播图
          dataList: res.data.courses, // 精品课程
        })
      })
      .catch(err => {
        console.log(err)
        Taro.showToast({
          title: err.msg ? err.msg : String(err), //提示的内容, 
          icon: 'none', //图标, 
          duration: 2000, //延迟时间, 
          mask: true, //显示透明蒙层，防止触摸穿透, 
        })
      })

  }

    /** 热门直播 */
    live = () => {
        live()
            .then(res => {console.log(res)
                this.setState({
                    liveList: res.data
                })
            })
            .catch(err => {
                console.log(err)
                Taro.showToast({
                    title: err.msg ? err.msg : String(err), //提示的内容,
                    icon: 'none', //图标,
                    duration: 2000, //延迟时间,
                    mask: true, //显示透明蒙层，防止触摸穿透,
                })
            })

    }

  /** 专家的服务列表 */
  getExpretListData() {
    getExpretList({ page: 1, us_id: 0 }).then(res => {
      // 限制6个显示
      this.setState({ expretList: res.data.slice(0, 6) })
    })
  }

  /** 获取专家分类 */
  getCategory() {
    return getCategory()
      .then(res => {
        let list = res.data.reduce((prev, cur) => {
          prev.push({ ...cur, title: cur.keyword })
          return prev
        }, [{ title: '推荐', id: '' }])

        this.setState({
          categories: { ...this.state.categories, list }
        })
      })
      .catch(err => {
        console.log(err)
        Taro.showToast({
          title: err.msg ? err.msg : err, //提示的内容, 
          icon: 'none', //图标, 
          duration: 2000, //延迟时间, 
          mask: true, //显示透明蒙层，防止触摸穿透, 
        })
        throw new Error("获取专家分类失败~~")
      })
  }


  getoffline() {
    if (this.state.isScrollEnd) return
    return getOffline(this.state.page)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        // 判断是否到底
        if (res.data.offschool && res.data.offschool.length >= 15) {
          this.setState({ isScrollEnd: false,loading: false })
        } else {
          this.setState({ isScrollEnd: true,loading: true })
        }

        // 专家列表数据
        if (this.state.page == 1) {
          // 首次请求
          this.setState({
            offline: res.data.offschool,
            page: 2 // 默认为1,这里 1+1
          })
        } else {
          // 非首次请求
          this.setState(
            {
              offline: [...this.state.offline, ...res.data.offschool],
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

    getData() {console.log(this.state.isScrollEnd)
        if (this.state.isScrollEnd) return
        return getOnline(this.state.page1,1,this.state.categories.index)
            .then(res => {
                console.log("TCL: getExpertsList -> res", res)

                // 判断是否到底
                if (res.data.course && res.data.course.length >= 15) {
                    this.setState({ isScrollEnd: false,loading: false })
                } else {
                    this.setState({ isScrollEnd: true,loading: true })
                }

                // 专家列表数据
                if (this.state.page1 == 1) {
                    // 首次请求
                    this.setState({
                        courseList: res.data.course,
                        page1: 2 // 默认为1,这里 1+1
                    })
                } else {
                    // 非首次请求
                    this.setState(
                        {
                            courseList: [...this.state.courseList, ...res.data.course],
                            page1: this.state.page1 + 1
                        },
                        () => {console.log(this.state.courseList)
                            console.log(
                                "TCL: getExpertsList -> this.state.page",
                                this.state.page1
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

  /** 专家课程 */
  /*
  getData = () => {
    getOnline()
      .then(res => {
        this.setState({
          courseList: res.data.course
        })
      })
      .catch(err => {
        console.log(err)
        Taro.showToast({
          title: err.msg ? err.msg : String(err),
          icon: 'none',
          duration: 2000,
          mask: true,
        })
      })
  }
  */


  /** 显示/隐藏底部菜单 */
  showFooter = (flag = true) => {
    this.setState({ categories: { ...this.state.categories, showFooter: flag } })
  }

  /** 选择菜单 */
  onChangeMenu = (value) => {console.log(value)
    if (value === this.state.categories.index) return

    this.setState({
      categories: { ...this.state.categories, index: value, showFooter: false,loading: false },
      page1: 1,
      page: 1,
      isScrollEnd: false,
    }, () => {
      this.getData()
      document.querySelector(".scrollview").scrollTo(0, 0)
    })

  }

  /* 输入框 */
  handleKeyUp = event => {
    if (event.keyCode === 13) {
      Taro.navigateTo({
        url: `/pages/search?keyword=${this.state.keyword}`
      })
    }
  }
  scrollFn = () => {
       //voice.isShowMusicPlayer()
    // 滚动到底时加载更多
    const $end = document.querySelector('.loadingio-spinner-spin-8dz5htwyiau')
    const $tabbar = document.querySelector('.tabbar')
    if ($end) {
      if (!this.state.loading && document.body.clientHeight - $tabbar.offsetHeight - $end.offsetHeight + 10 > $end.getBoundingClientRect().top) {
        this.setState({ loading: true }, () => {
            if(this.state.categories.index != 0){

                this.getData()
            }else{
                this.getoffline()
            }
        })
      }
    }
  }

  render() {
    return (
      <View className='Index'>

        <View style='flex:1;overflow-y:scroll;' onScroll={this.scrollFn}>
          {/* 滚动区域 */}
          <ScrollView
            className='scrollview'
            scrollY
            scrollWithAnimation
            style={{
              // height: "100%",
              boxSizing: "border-box",
            }}
            onScrollToLower={onScrollToLower.bind(this)}
          >
            {/* 遮罩 */}
            {
              this.state.categories.showFooter && <View className='mask' style='z-index:998;' onClick={this.showFooter.bind(this, false)}></View>
            }
            <View style='position: relative;z-index:999;' className={this.state.categories.index !== 0 ? 'fixed' : ''}>
              {/* 搜索框 */}
              <View className='ll-cells ll-cell--noborder search-input-box'>
                <View className='ll-cell search-input'>
                  <View className='ll-cell__hd'>
                    <View className='icon icon-search2'></View>
                  </View>
                  <View className='ll-cell__bd'>
                    <Input
                      className='ll-input'
                      type='text'
                      onChange={handleInput.bind(this, "keyword")}
                      onKeyUp={this.handleKeyUp}
                      placeholder='搜索课程'
                    ></Input>
                  </View>
                </View>
              </View>
              {/* 菜单栏 */}
              <View className='header'>
                <View className='header__bd' style={{ paddingRight: this.state.categories.list.length < 4 ? Taro.pxTransform(200) : Taro.pxTransform(50) }}>
                  <AtTabs
                    scroll
                    current={this.state.categories.index}
                    tabList={this.state.categories.list}
                    onClick={this.onChangeMenu}
                  ></AtTabs>
                  {/* 更多 */}
                  <View className='header-more'>
                    <View className='icon icon-more-2' onClick={this.showFooter}></View>
                  </View>
                </View>
                <View className={`header__ft ${this.state.categories.showFooter ? '' : 'hide'}`}>
                  <View className='ll-cells ll-cell--noborder'>
                    <View className='ll-cell header-ft__title'>
                      <View className='ll-cell__hd'>
                        全部分类
                      </View>
                    </View>
                    <View className='ll-cell header-ft__content'>
                      <View className='ll-cell__bd'>
                        {
                          this.state.categories.list.map((item, index) => (
                            <Button key={index} className={`header-ft__item ${index === this.state.categories.index ? 'active' : 'border-1px'}`} onClick={this.onChangeMenu.bind(this, index)}>{item.title}</Button>
                          ))
                        }
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {/* 占位 */}
            {this.state.categories.index !== 0 && <View style={{ height: Taro.pxTransform(190) }}></View>}

            {/* 推荐 */}
            {
              this.state.categories.index === 0 && (
                <Recommend
                alive={this.alive}
                  swiper={this.state.swiper}
                  liveList={this.state.liveList}
                  expretList={this.state.expretList}
                  month={this.state.month}
                  famous={this.state.famous}
                  offline={this.state.offline}
                  dataList={this.state.dataList}
                  userInfo={this.state.userInfo}
                ></Recommend>
              )
            }

            {/* 线上课程 */}
            {
              this.state.categories.index !== 0 && (
                <Online
                  dataList={this.state.courseList}
                ></Online>
              )
            }

            {/* 上拉加载显示 */}
            <ScrollEnd isScrollEnd={this.state.isScrollEnd}></ScrollEnd>
            {/* 滚动到底部无内容了 */}
            {this.state.isScrollEnd && !!this.state.dataList.length && (
              <View className='ll-divider'>链接知识领袖，助力全球贸易</View>
            )}
            {/* 提示为空-快捷键`vi.showNull` */}
            {!this.state.offline.length && (
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
        </View>
        <Tg></Tg>
        {/* 底部导航栏 */}
        <Tabbar></Tabbar>
        {/* 链享卡弹窗 */}
        {!!(this.state.userInfo &&
          this.state.userInfo.lian === 0 &&
          this.state.userInfo.lian_endtime) &&
          <VideoVipCard></VideoVipCard>
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
