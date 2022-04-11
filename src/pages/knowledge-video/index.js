import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
} from "@tarojs/components"

import Player from 'xgplayer'
import { AtActivityIndicator } from "taro-ui"
import { getOnlineCourseDetail } from "../../api/knowledge"
import Login from "../../components/Login"

import "./index.scss"

@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "课程播放"
  }

  constructor() {
    super(...arguments)
    this.state = {
      id: "", // 课程id
      course: {},
      dataList: [], // 分页数据
      isFirstLoding: true,
      video: {
        playingName: ''
      },
      playid:'',
      playing:false
    }
  }

  async componentDidMount() {
    this.getDataList()
    document.querySelector("#mse_qazxz").classList.remove('xgplayer-pause')
  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    const id = +this.$router.params.id
    if (id) {
      this.setState({ id }, () => {
        this.getData()
      })
    } else {
      Taro.showModal({
        title: "提示", //提示的标题,
        content: "该详情不存在,请返回上一页", //提示的内容,
        showCancel: false, //是否显示取消按钮,
        confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
        confirmColor: "#D62419", //确定按钮的文字颜色,
        success: () => {
          Taro.navigateBack({
            delta: 1 //返回的页面数，如果 delta 大于现有页面数，则返回到首页,
          })
        }
      })
    }
  }

  getData() {
    return getOnlineCourseDetail(this.state.id)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        this.setState({
          course: res.data,
          dataList: res.data.part_list,
        }, () => {
          try {
            // 获取上一页的点击视频id，作为进入页面自动播放视频
            const videoId = Number(this.$router.params.videoId)
            this.getVideo(videoId || res.data.part_list[0]['id'], false)
          } catch (err) { }
        })
        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
      })
      .catch(err => {
        if (err.code == 16) {
          Taro.showModal({
            title: "提示", //提示的标题,
            content: "很抱歉,该课程已下架!", //提示的内容,
            showCancel: false, //是否显示取消按钮,
            confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
            confirmColor: "#d62419", //确定按钮的文字颜色,
            success: () => {
              Taro.navigateBack({
                delta: 1 //返回的页面数，如果 delta 大于现有页面数，则返回到首页,
              })
            }
          })
        } else {
          Taro.showToast({
            title: err.msg ? err.msg : err + "", //提示的内容,
            icon: "none", //图标,
            duration: 2000, //延迟时间,
            mask: true //显示透明蒙层，防止触摸穿透,
          })
        }
      })
  }

  /**
   * 课程播放
   * 
   * @param {number} partId 章节id
   * @param {boolean} autoPlay 是否自动播放
   *
   */
  getVideo = (partId, autoplay = true) => {

    /** 滚动到顶部 */
    const moveToTop = () => {
      var $scrView = document.querySelector(".KnowledgeVideo").querySelector(".scrollview")
      const scrollLength = Math.floor($scrView.scrollTop - ($scrView.scrollTop / 30))
      $scrView.scrollTo(0, scrollLength)
      if (scrollLength) {
        window.requestAnimationFrame(moveToTop)
      }
    }

    const re = this.state.dataList.filter(item => item.id === partId)[0]
    this.setState({
      video: {
        playingName: re.course_per
      },
      playid:re.id
    })

      // 设置播放
      if (this.player) this.player.destroy()

      setTimeout(() => {
        this.player = null
        this.player = new Player({
          id: 'mse_qazxz',
          width: '100%',
          height: '100%',
          playsinline: true, // 开启ios和微信的内联模式
          closeVideoTouch: true,
          autoplay: autoplay, // 自动播放
          url: re.music_url,
          'x5-video-player-fullscreen': true, // 微信全屏播放
          poster: this.state.course.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'
        })
        document.querySelector("#mse_qazxz").classList.remove('xgplayer-pause')
        // 设置播放loading时的背景图
        this.player.once('ready', () => {
          document.querySelector('.xgplayer-enter').setAttribute('style', `background:url(${this.state.course.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'});background-position: center;background-size: cover;`)
          // 当时音频的时候，将封面设置上去
          //if (re.music_url && re.music_url.match(/mp3$/)) {
          if (re.music_url && re.video== 2) {
            document.querySelector('.xgplayer').setAttribute('style', `background:url(${this.state.course.cover_img});background-position: center;background-size: cover;`)
          }
        })
        moveToTop()
      }, 200)
  }

  // 分享
  share = () => {
    Taro.showModal({
      title: "提示",
      showCancel: false, //是否显示取消按钮,
      confirmColor: "#D62419", //确定按钮的文字颜色,
      content: "请点击页面右上角复制链接分享"
    })
  }

  render() {
    return (
      <View className='KnowledgeVideo'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation={false}
          style={{
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* 视频 */}
          <View className='video-box'>
            <View id='mse_qazxz'></View>
          </View>

          {/* 课程标题 */}
          <View className='ll-cells ll-cell--noborder'>
            <View className='ll-cell ll-cell--primary'>
              <View className='ll-cell__bd video-title ellipsis-2'>
                {this.state.video.playingName}
              </View>
              <View className='ll-cell__ft'>
                <View className='share-btn' onClick={this.share}>
                  <View className='icon icon-share'></View>
                  <View className='share-btn__text'>分享</View>
                </View>
              </View>
            </View>
            <View className='video-num'>{this.state.course.part_num}集</View>
          </View>

          {/* 课程目录 */}
          <View className='video-catalog'>
            {this.state.dataList.map((item, index) => (
              <View hoverClass='ll-hover' className='ll-cell' key={item.id} onClick={this.getVideo.bind(this, item.id)}>
                <View className='ll-cell__hd course-catalog__hd'>
                  {index + 1}
                </View>
                <View className='ll-cell__bd course-catalog__bd ellipsis-2'>
                  {item.course_per}
                </View>
                <View className='ll-cell__ft'>
                  { (this.state.playing == true && this.state.playid == item.id)
                   ? <View className='icon icon-playing'></View>
                  :<View className='icon icon-play-lists'></View>
                  }
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 首次加载 */}
        {this.state.isFirstLoding && <AtActivityIndicator size={36}></AtActivityIndicator>}
      </View>
    )
  }
}

export default Index
