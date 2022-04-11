import Taro, { Component } from "@tarojs/taro"
import {
    View,
    ScrollView,
    Image,
    Navigator,
    Text, Swiper, SwiperItem
} from "@tarojs/components"
import { AtTabs, AtActivityIndicator } from "taro-ui"
import { onScrollToLower } from "../../utils/scroll"
// import {Tabbar} from './components'
import { getKnowledge, getArticle, live, getMonths, getFamous,getDisease } from "../../api/knowledge"
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
      conditionMap: [ getArticle,getArticle,getArticle],
      swiper:[],
      ques:[],
      first:[],
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
      this.getSwiper()
      this.getQues()
  }

    /** 获取轮播图 */
    getSwiper = () => {
        return live(4,1)
            .then(res => {
                console.log("TCL: Index -> getSwiper -> res", res)

                this.setState({
                    swiper: res.data, // 轮播图
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

    /** 获取每日答疑解惑*/
    getQues = () => {
        return getKnowledge()
            .then(res => {
                console.log("TCL: Index -> getSwiper -> res", res)

                this.setState({
                    ques: res.data.everyday, // 每日答疑解惑
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

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    this.getData()
  }

  getData() {
    if (this.state.isScrollEnd) return
      //判断
    var article_type = this.state.tabIndex == 0 ? '' : this.state.tabIndex
    var recommend = this.state.tabIndex == 0 ? 1 : 0
    return this.state.conditionMap[this.state.tabIndex](this.state.page,1,article_type,recommend)
      .then(res => {console.log(res.data[0])
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
            empty: [...this.state.dataList, ...res.data].length < 1,
          })
            console.log([...this.state.dataList, ...res.data].length < 1)
            console.log(this.state.dataList)
        } catch (err) { }

        // 专家列表数据
        if (this.state.page == 1) {
          // 首次请求
          var first = res.data[0]
          this.setState({
            dataList: res.data,
            first:first,
            page: 2, // 默认为1,这里 1+1
          })
        } else {
          // 非首次请求
          this.setState(
            {
              dataList: [...this.state.dataList, ...res.data],
              first:res.data[0],
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
    const tabList = [{ title: "推荐" }, { title: "行业资讯" },{ title: "综合资讯" }]
    const presentUrl = window.location.origin
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1 + '').padStart(2, '0')
    return (
      <View className='MyArticle'>

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


          {/* 轮播图 */}
      {
          this.state.tabIndex == 0 &&
          < Swiper
          className = 'swiper'
          indicatorColor = 'rgba(0, 0, 0, .5)'
          indicatorActiveColor = '#fff'
          indicatorDots
          circular
          autoplay
          >
          {
              this.state.swiper.map(item => {
                  return (
                      < SwiperItem
                  key = {item.id} >
                      < Navigator
                  url = {item.link || ''}
                  className = 'swiper-item' >
                      < Image
                  className = 'swiper-item__img'
                  src = {item.desc}
                  />
                  < /Navigator>
                  < /SwiperItem>
              )
              })
          }
          < /Swiper>
            }

          {/* 每日答疑解惑 */}
          {
          this.state.tabIndex == 0 && this.state.ques && (
          <Navigator className='ll-cells ques' url={this.state.ques.url ? this.state.ques.url : `/pages/expert-article?id=${this.state.ques.ua_id}`}>
            <View className='ll-cell quesDetail'>
              <View className='ll-cell__bd'>
                <View className='ques-h1'>每日答疑解惑</View>
                <View className='ques-title ellipsis-2'>{this.state.ques.title}</View>
                  <View className='ques-author'>
                    <Image className='avatar' src={this.state.ques.header_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}></Image>
                    <View className='info'>{this.state.ques.us_regist_name} {this.state.ques.chainman && "|"} {this.state.ques.chainman}</View>
                  </View>
                </View>
                <View className='ll-cell__ft'>
                  <View className='ques-date'>{month}</View>
                  <View className='ques-year'>Nov. {year}</View>
                  <View style='line-height:1;margin-top:-4px;'><View className='ques-dot'></View></View>
                </View>
              </View>
          </Navigator>
          )
          }

      {this.state.tabIndex != 0 && this.state.first && (
          <Navigator
          url={"/pages/article-detail?id=" + this.state.first.ua_id}
          className='ll-cells ll-cell--noborder bannarArticle'
          key={this.state.first.ua_id} >
              <View className='ll-cell ll-cell--primary article__bd'>
                <View className='ll-cell__bd article__title'>
                    <View className='article__name title-ellipsis-2'>{this.state.first.title}</View>
                </View>
                <View className='ll-cell__hd'>
                    <Image
                    className='article__img'
                    src={this.state.first.article_img || "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"}/>
                </View>
                <View className='ll-cell__bd article__title'>
                  <View className='media__ft'>
                      <View className='article__num'>{this.state.first.view_num}阅读</View>
                  </View>
                </View>

              </View>
          </Navigator>
      )
      }

          {this.state.tabIndex == 0 && this.state.dataList.map(item => (
            <Navigator
              url={"/pages/article-detail?id=" +item.ua_id}
              className='ll-cells ll-cell--noborder article'
              key={item.ua_id}
            >
              <View className='ll-cell ll-cell--primary media__bd'>
                <View className='ll-cell__bd article__title'>
                  <View className='article__name ellipsis-2'>{item.title}</View>
                  <View className='media__ft'>
                      <View className='article__num'>{item.view_num}阅读</View>
                  </View>
                </View>
                <View className='ll-cell__hd'>
                  <Image
                    className='article__img'
                    src={
                      item.article_img ||
                      "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                    }
                  />
                </View>

              </View>
            </Navigator>
          ))}

        {this.state.tabIndex == 1 && this.state.dataList.map((item,key) => (

          <Navigator
          url={"/pages/article-detail?id=" +item.ua_id}
          className={['ll-cells ll-cell--noborder article',!key && 'n-display']}
          key={item.ua_id} >
            <View className='ll-cell ll-cell--primary media__bd'>
              <View className='ll-cell__bd article__title'>
                <View className='article__name ellipsis-2'>{item.title}</View>
                <View className='media__ft'>
                  <View className='article__num'>{item.view_num}阅读{key}</View>
                </View>
              </View>
              <View className='ll-cell__hd'>
                <Image
                className='article__img'
                src={item.article_img || "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"}/>
              </View>
            </View>
          </Navigator>

      ))}

      {this.state.tabIndex == 2 && this.state.dataList.map((item,key) => (
          <Navigator
          url={"/pages/article-detail?id=" +item.ua_id}
          className={['ll-cells ll-cell--noborder article', !key && 'n-display']}
          key={item.ua_id} >
             <View className='ll-cell ll-cell--primary media__bd'>
                <View className='ll-cell__bd article__title'>
                    <View className='article__name ellipsis-2'>{item.title}</View>
                    <View className='media__ft'>
                        <View className='article__num'>{item.view_num}阅读</View>
                    </View>
                </View>
             <View className='ll-cell__hd'>
                <Image
                className='article__img'
                src={item.article_img || "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"}/>
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
                src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_searchnone@2x.png'
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
