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

import { getKnowledge, getOnline, getFreeCourse, getMonths, getFamous,getDisease } from "../../api/knowledge"
import { getCategory, getExpretList,alive,course_cat } from "../../api/expert"
import { handleInput } from "../../utils/util"
import { onScrollToLower } from "../../utils/scroll"
import Share from "../../components/Share"
import Title from "../../components/Title"
import ScrollEnd from "../../components/ScrollEnd"
import VideoVipCard from "../../components/videoVipCard"
import Tabbar from "../../components/Tabbar"
import { decryption } from "../../utils/aes"
import { Online } from "./components"

import "./index.scss"

@Share()
@inject('userStore')
@Title("LINK.链学堂")
class Index extends Component {
  config = {
    navigationBarTitleText: "LINK.链学堂"
  }

  constructor() {
    super(...arguments)
    this.state = {
      keyword: "",
      /** 线上课程 */
      dataList: [],
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
    this.getData()

    // 取消显示首次loading
    this.state.isFirstLoding && this.setState({ isFirstLoding: false })
  }

    /** 线上学院 */
    getData() {
        if (this.state.isScrollEnd) return

        let keyId = this.state.categories.list[this.state.categories.index] ? this.state.categories.list[this.state.categories.index]['id'] : ''
        return getOnline(this.state.page, 1, keyId)
            .then(res => {
                console.log("TCL: getExpertsList -> res", res)
                this.setState({ loading: false })
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

                // // 取消显示首次loading
                // this.state.isFirstLoding && this.setState({ isFirstLoding: false })
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


    /** 获取专家分类 */
  getCategory() {
    return getCategory()
      .then(res => {/*
        let list = res.data.reduce((prev, cur) => {
          prev.push({ ...cur, title: cur.keyword })
          return prev
        }, [{ title: '推荐', id: '' }])

        this.setState({
          categories: { ...this.state.categories, list }
        })*/
          let list = res.data.reduce((prev, cur) => {
              prev.push({ ...cur, title: cur.keyword })
              return prev
          }, [])
          this.setState({
              categories: { ...this.state.categories,list}
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

  /** 显示/隐藏底部菜单 */
  showFooter = (flag = true) => {
    this.setState({ categories: { ...this.state.categories, showFooter: flag } })
  }

  /** 选择菜单 */
  onChangeMenu = (value) => {
    if (value === this.state.categories.index) return

    this.setState({
      categories: { ...this.state.categories, index: value, showFooter: false },
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

  scrollFn = () => {console.log(788)
    // 滚动到底时加载更多
    const $end = document.querySelector('.loadingio-spinner-spin-8dz5htwyiau')
    const $tabbar = document.querySelector('.tabbar')
    if ($end) {
      if (!this.state.loading && document.body.clientHeight - $tabbar.offsetHeight - $end.offsetHeight + 10 > $end.getBoundingClientRect().top) {
        this.setState({ loading: true }, () => { this.getData() })
      }
    }
  }

  render() {
    return (
      <View className='knowledge-recommend'>

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

            {/* 线上课程 */}
            {
                <Online
                    dataList={this.state.dataList}
                ></Online>
            }
                {/*
            {
              this.state.categories.index !== 0 && (
                <Online
                  dataList={this.state.dataList}
                ></Online>
              )
            }
            */}

            {/* 上拉加载显示 */}
            <ScrollEnd isScrollEnd={this.state.isScrollEnd}></ScrollEnd>
            {/* 滚动到底部无内容了 */}
            {this.state.isScrollEnd && !!this.state.dataList.length && (
              <View className='ll-divider'>链接知识领袖，助力全球贸易</View>
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
        </View>
        {/* 底部导航栏 */}
        <Tabbar></Tabbar>
        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
