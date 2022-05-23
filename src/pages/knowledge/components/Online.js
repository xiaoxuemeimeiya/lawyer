import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Navigator,
    Image, Text
} from "@tarojs/components"

import "../index.scss"
import {decryption} from "../../../utils/aes"
import {getOnline} from "../../../api/knowledge"

/** 热门推荐 */
class Index extends Component {
    constructor() {
        super(...arguments)
        this.state = {
            courseList:[],
            /** 是否首次加载数据 */
            isFirstLoding: true,
            /** 页码 */
            page: 1,
            /** scroll-view 是否滚动到底部 */
            isScrollEnd: false,
            loading: false, // 加载中,
        }
    }
    async componentDidMount() {
        this.getDataList()
    }

    getDataList() {
        if (this.state.isScrollEnd) return
        return getOnline(this.state.page)
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
                        courseList: res.data.course,
                        page: 2 // 默认为1,这里 1+1
                    })
                } else {
                    // 非首次请求
                    this.setState(
                        {
                            courseList: [...this.state.courseList, ...res.data.course],
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

    scrollFn1 = () => {
        //voice.isShowMusicPlayer()
        // 滚动到底时加载更多
        const $end = document.querySelector('.loadingio-spinner-spin-8dz5htwyiau')
        const $tabbar = document.querySelector('.tabbar')
        if ($end) {
            if (!this.state.loading && document.body.clientHeight - $tabbar.offsetHeight - $end.offsetHeight + 10 > $end.getBoundingClientRect().top) {
                this.setState({ loading: true }, () => { this.getDataList() })
            }
        }
    }
  render() {
    //const dataList=this.props.dataList
    
    return (
      <View className='section' onScroll={this.scrollFn1}>

        {this.state.courseList && this.state.courseList.map(item => (
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
                        <View>
                          <View className='price--hot'> {'¥'+(item.price || 999)}</View>
                          { item.type==1 &&
                          <View className='label--freeIcon'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_1%402x.png'/></View>
                          }
                        </View>
                   </View>
                </View>

              </View>
            </View>
          </Navigator>
        ))}

      </View>
    )
  }
}

export default Index
