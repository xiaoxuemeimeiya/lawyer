import Taro, { Component } from "@tarojs/taro"
import { View, ScrollView, Image, Navigator, Text } from "@tarojs/components"

import { AtActivityIndicator } from "taro-ui"
import {getFamous, getFreeCourse, getMonths} from "../../api/knowledge"
import {member_reccommend,ActiveList} from "../../api/videoVip"
import { onScrollToLower } from "../../utils/scroll"
import ScrollEnd from "../../components/ScrollEnd"
import Share from "../../components/Share"
import Title from "../../components/Title"
// import Login from "../../components/Login"

import "./index.scss"

@Share()
@Title("本月上线")
class Index extends Component {
    config = {
        navigationBarTitleText: "本月上线"
    }

    constructor() {
        super(...arguments)
        this.state = {
            /** 是否首次加载数据 */
            isFirstLoding: true,
            /** 分页数据 */
            dataList: [],
            /** 页码 */
            page: 1,
            /** scroll-view 是否滚动到底部 */
            isScrollEnd: false,
            newyears:1,
        }
    }

    componentDidMount() {
        this.getDataList()
        this.getTimestamp()
    }
    /**获取优惠时间时间**/
    getTimestamp() { //把时间日期转成时间戳
        //优惠开始时间(2021-01-08 23:59:59)
        var starttime = (new Date('2021/01/28 10:00:00')).getTime() / 1000
        var endtime = (new Date('2021/02/17 23:59:59')).getTime() / 1000
        var time = (new Date()).getTime() / 1000
        if(time >= starttime && time <= endtime){
            //活动期间
            this.setState({ newyears: 1 })
        }else{
            this.setState({ newyears: 0 })
        }
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
        const type = this.$router.params.type ? this.$router.params.type : ''
        console.log(type)

        if(type == 2){
            return ActiveList(this.state.page, this.state.type)
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
                        console.log(777777)
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
                        console.log(88888)
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
        }else{
            return getMonths(this.state.page, this.state.type)
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
                        console.log(777777)
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
                        console.log(88888)
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
        <View className='KnowledgeOnlineCourse'>
            {/* 滚动区域 */}
            <ScrollView
            className='scrollview'
            scrollY
            scrollWithAnimation
            style={{height: "100%",}}
             onScrollToLower={onScrollToLower.bind(this)}
            >
            {/* media */}

        {this.state.dataList && this.state.dataList.map(item => (
        <Navigator
              url={`/pages/knowledge-online-detail?id=${item.id}`}
              className='ll-cells ll-cell--noborder media'
              key={item.id}
            >
              <View className='ll-cell ll-cell--primary media__bd'>
                <View className='ll-cell__hd'>
                  <Image className='icon_audio' src={item.video == 2 ? 'https://oss.mylyh.com/miniapp/versionv3.0/icon_audio%402x.png' : 'https://oss.mylyh.com/miniapp/versionv3.0/icon_audio1%402x.png'}></Image>
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
                  <View className='media__small'>{item.us_regist_name + "·" + item.category}</View>
                  <View className='icon-see'>
                    <Image className='media__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/new_year_festival/icon_see%402x.png'/>
                    <Text>{item.fake_data}人次</Text>
                    <View className='media__ft'>
                        <View className='price--hot'>{'¥'+(item.price || 999)}</View>
                        { item.type==1 &&
                        <View className='label--freeIcon'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_1%402x.png'/></View>
                        }
                     </View>
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
    )}
}

export default Index
