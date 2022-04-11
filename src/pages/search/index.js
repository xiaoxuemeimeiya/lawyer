import Taro, { Component } from "@tarojs/taro"
import { View, ScrollView, Image, Navigator, Text,Input } from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator,AtTabs } from "taro-ui"
import { throttle,handleInput } from "../../utils/util"
import {searches,delSearch,search1,record} from '../../api/search'
import './index.scss'

@inject('loginStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "搜索"
  }

  constructor() {
    super(...arguments)
    this.state = {
      keyword: "",
      hotkey: [], // 热门搜索
      recordkey: [], // 搜索历史
      isFirstLoding: true, // 是否首次加载数据
      showResult:false, // 显示搜索结果
      showNull:false, // 显示为空
      scrollTop:0,
      dataList: [], // 分页数据
      type:1, // 搜索类型：1-综合，2-线上音频，3-线下学院
      page: 1, // 页码
      isScrollEnd: false, // scroll-view 是否滚动到底部
      tabIndex:0 // tab下标
    }
  }

  async componentDidMount() {
    await this.getIndex()
    console.log(this.state.keyword,'keyword')
    setTimeout(() => {
      this.getData().finally(()=>{
        setTimeout(() => {
          this.setState({isFirstLoding:false})
        }, 400)
      })
    }, 100)
  }

  /* 获取搜索主页内容 */
  getIndex = () => {
    if(this.$router.params.keyword){
      this.setState({
        keyword:this.$router.params.keyword,
        showResult:true
      },()=>{
        this.hotSearch(this.$router.params.keyword)
      })
    }else{
      searches()
        .then(res => {
          this.setState(
            {
              hotkey: res.data.keyword,
              recordkey: res.data.myrecode
            },
            () => {
              // 取消显示首次loading
              this.state.isFirstLoding && this.setState({ isFirstLoding: false })
            }
          )
        })
        .catch(err => {
          console.error(err)
          Taro.showToast({
            title: err.msg ? err.msg : String(err), //提示的内容,
            icon: "none", //图标,
            duration: 2000, //延迟时间,
            mask: true //显示透明蒙层，防止触摸穿透,
          })
        })
    }
  }

  /* 输入框 */
  handleKeyUp = event => {
    if (event.keyCode === 13) {
      !this.state.showResult && this.setState({ showResult: true })
      this.getDataList()
      this.putRecord()
    }
  }
  /* 上传搜索记录 */
  putRecord() {
    const {isLogin} = this.props.loginStore
    // 验证是否注册
    if (!isLogin || this.state.keyword==='') {
      return
    }
    record(this.state.keyword)
      .then(res => {
        console.log("TCL: 上传搜索记录 -> res", res)
        if (
          this.state.recordkey.findIndex(
            item => item.keyword == this.state.keyword
          ) < 0
        ) {
          this.state.recordkey.push({ keyword: this.state.keyword })
          this.setState({ recordkey: this.state.recordkey })
        }
      })
      .catch(err => {
        console.error(err)
        Taro.showToast({
          title: err.msg ? err.msg : String(err), //提示的内容,
          icon: "none", //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
  }
  /* 删除搜索历史 */
  deletehistory = throttle(function() {
    delSearch()
      .then(() => {
        Taro.showToast({
          title: "清除成功!", //提示的内容,
          icon: "success", //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
        this.setState({ recordkey: [] })
      })
      .catch(err => {
        console.error(err)
        Taro.showToast({
          title: err.msg ? err.msg : err, //提示的内容,
          icon: "none", //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
  }, 2000)
  /* 点击取消 */
  hideResult=()=>{
    this.setState({
      showResult:false,
      page:1,
      isScrollEnd:false,
    })
  }
  /* 点击热门搜索和搜索记录 */
  hotSearch=(keyword)=>{
    console.log("TCL: hotSearch -> keyword", keyword)
    this.setState({
      keyword:keyword,
      type:1,
      tabIndex:0,
    },() => { this.getDataList() })
  }

  /* 获取数据 */
  getDataList = () => {
    this.setState({
      page:1,
      isScrollEnd:false,
      isFirstLoding:true
    },()=>{
        this.getData().finally(()=>{
          setTimeout(() => {
            this.setState({isFirstLoding:false})
          }, 400)
        })
      }
    )
  }

  getData() {
    if (this.state.isScrollEnd) return
    return search1(this.state.type,this.state.keyword,this.state.page)
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
        // this.state.isFirstLoding && this.setState({ isFirstLoding: false })
        !this.state.showResult && this.setState({ showResult: true })
        // 显示空信息
        if(!res.data.courses.length && !res.data.offline.length){
          this.setState({showNull:true})
        }else{
          this.setState({showNull:false})
        }

      })
      .catch(err => {
        console.error(err)
        Taro.showToast({
          title: err.msg ? err.msg : err + "", //提示的内容,
          icon: "none", //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
  }

  /* 切换tab */
  handleClick=(value)=>{
    console.log("TCL: Index -> handleClick -> value", value)
    if(this.state.tabIndex == value) return

    var arr=[1,2,3]
    this.setState({
      tabIndex:value,
      type:arr[value],
      page:1,
      isScrollEnd:false,
      scrollTop:0,
      isFirstLoding:true
    },()=>{
      this.getData().finally(()=>{
        setTimeout(() => {
          this.setState({isFirstLoding:false})
        }, 400)
      })
    })
  }

  /* 查看更多 */
  seeMore=(type)=>{
    this.setState({
      tabIndex:type-1,
      type,
      page:1,
      isScrollEnd:false,
      scrollTop:0,
      isFirstLoding:true
    },()=>{
      this.getData().finally(()=>{
        setTimeout(() => {
          this.setState({isFirstLoding:false})
        }, 400)
      })
    })
  }

  render() {
    const {isLogin} = this.props.loginStore
    const tabList=[{ title: "综合" }, { title: "线上课程" },{ title: "线下学院" }]
    return (
      <View className='Search'>
        {/* 搜索输入框 */}
        <View
          className='ll-cells ll-cell--noborder seacrh-hd'
          style={{ height: Taro.pxTransform(110) }}
        >
          <View className='ll-cell'>
            <View className='ll-cell__bd'>
              <View className='search-input-box'>
                <View className='icon icon-search'></View>
                <Input
                  value={this.state.keyword}
                  onChange={handleInput.bind(this, "keyword")}
                  onKeyUp={this.handleKeyUp}
                  type='text'
                  confirm-type='search'
                  bindconfirm='getDataList'
                  className='ll-input search-input__input'
                  placeholder='搜索专家、知识、资讯'
                />
              </View>
            </View>
            <View className='ll-cell__ft'>
              <View
                className='search-input__tip color-text-primary'
                onClick={this.hideResult}
              >
                取消
              </View>
            </View>
          </View>
        </View>

        {/* 未搜索前区域 */}
        {!this.state.showResult && <View style={{ height: "calc(100% - " + Taro.pxTransform(110) + ")",overflow:'auto' }}>
          {/* 热门搜索 */}
          <View className='ll-cells ll-cell--noborder search-section'>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__hd'>
                <View className='search-section__title color-black'>
                  热门搜索
                </View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__bd'>
                {this.state.hotkey.map((item, index) => (
                  <View
                    key={index}
                    onClick={this.hotSearch.bind(this,item.keyword)}
                    data-keyword='{{item.keyword}}'
                    className='search-section__item color-text-regular'
                  >
                    {item.keyword}
                  </View>
                ))}
              </View>
            </View>
          </View>
          {/* 搜索历史 */}
          {isLogin && <View className='ll-cells ll-cell--noborder search-section'>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__hd'>
                <View className='search-section__title color-black'>
                  搜索历史
                </View>
              </View>
              <View className='ll-cell__bd'></View>
              <View className='ll-cell__ft'>
                <View
                  className='icon icon-delete'
                  onClick={this.deletehistory.bind(this)}
                ></View>
              </View>
            </View>
            <View className='ll-cell ll-cell--noborder'>
              <View className='ll-cell__bd'>
                {this.state.recordkey.map((item, index) => (
                  <View
                    key={index}
                    onClick={this.hotSearch.bind(this,item.keyword)}
                    data-keyword='{{item.keyword}}'
                    className='search-section__item color-text-regular'
                  >
                    {item.keyword}
                  </View>
                ))}
              </View>
            </View>
          </View>}
        </View>}
        
        {/* tab标签栏 */}
        <View className={`tabs ${this.state.showResult ?'':'hide'}`}>
          <AtTabs
            current={this.state.tabIndex}
            tabList={tabList}
            onClick={this.handleClick}
          ></AtTabs>
        </View>
        {/* 滚动区域 */}
        <ScrollView
          className={`scrollview ${this.state.showResult ?'':'hide'}`}
          scrollY
          scrollWithAnimation
          style={{
            height: "calc(100% - " + Taro.pxTransform(206) + ")",
            boxSizing: "border-box",
            position:'relative',
            background:'#f0f1f4',
          }}
          scrollTop={this.state.scrollTop}
        >
          {/* 线上学院 */}
          {this.state.dataList.courses && !!this.state.dataList.courses.length && 
            <View className='item-title'>线上学院</View>}
          {this.state.dataList.courses && !!this.state.dataList.courses.length && 
            (this.state.dataList.courses||this.state.dataList).map(item => (
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
                    {item.cat&&item.cat.map(itemName => (
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
          {
            this.state.dataList.courses && this.state.dataList.courses.length>14 && this.state.type==1 &&
            <View
              onClick={this.seeMore.bind(this,2)}
              className='btn btn-see-more'
              hoverClass='ll-hover'
            >
              查看更多
            </View>
          }

          {/* 线下学院 */}
          { this.state.dataList.offline && !!this.state.dataList.offline.length &&
            <View className='item-title'>线下学院</View>}
          { this.state.dataList.offline && !!this.state.dataList.offline.length && 
            (this.state.dataList.offline||this.state.dataList).map(item => (
            <Navigator
              key={item.id}
              url={
                "/pages/knowledge-offline-detail?id=" +
                item.id
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
                    {item.cat&&item.cat.map(itemName => (
                      <Text key={itemName} className='media__tag'>
                        {itemName}
                      </Text>
                    ))}
                  </View>
                  <View className='media__ft'>
                    <View className='media__price'>
                      ¥ <Text>{item.price || 0}</Text>
                    </View>
                    <View className='media__num'>{item.learn_num}人在学</View>
                  </View>
                </View>
              </View>
            </Navigator>
          ))}
          {
            this.state.dataList.courses && this.state.dataList.courses.length>14 && this.state.type==1 &&
            <View
              onClick={this.seeMore.bind(this,3)}
              className='btn btn-see-more'
              hoverClass='ll-hover'
            >
              查看更多
            </View>
          }

          {/* 提示为空-快捷键`vi.showNull` */}
          {this.state.showNull && (
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
