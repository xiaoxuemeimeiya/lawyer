import Taro, { Component } from "@tarojs/taro"
import {
    View,
    ScrollView,
    Button,
    Image,
    Navigator,
    Text,
    RichText,
    Block, Input, Textarea
} from "@tarojs/components"

import Player from 'xgplayer'
import { observer, inject } from '@tarojs/mobx'
import { AtTabs, AtActivityIndicator } from "taro-ui"
import {articleDetail,focuson,addcomment,commentFocuson} from "../../api/knowledge"
import {throttle, paddingZero, debounce} from "../../utils/util"
import { checkReg } from "../../utils/login"
import { getCookie, setCookie } from "../../utils/storage"
import LL_loading from "../../components/LL_loading/LL_loading"
import { decryption } from "../../utils/aes"
import Title from "../../components/Title"
import Share from "../../components/Share"
import "./index.scss"

const wx = require('../../utils/jweixin-1.4.0')

@Title("资讯详情")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "资讯详情"
  }

  constructor() {
    super(...arguments)
    this.state = {
      tabIndex: 0,
      /** 邀请码 */
      code: '',
      id: "", // 线下详情id
      isFirstLoding: true,
      course: "",
      dataList: [], // 分页数据
      isScrollTop: false, // scroll-view 是否滚动到顶部
      scrollIntoView: "",
      /** 是否置顶 */
      isFixed: false,
      scrolling: false,
      /** 是否隐藏分享提示 */
      hideShareTip: getCookie("HIDE_SHARE_TIP"),
      /** 是否为名家学堂课程 */
      famous: !!this.$router.params.famous,
      /**是否点赞**/
      zan:false,
      zanClass:'icon-zan-article',
      /**是否收藏**/
      collect:false,
      collectClass:'icon-collect-article',
      phone:'',
      comment_num:0,
      count: 0,
      comment:'',
      commentShow:false,
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
    this.getDataList()
    if (this.state.userInfo && this.state.userInfo.my_famous) {

      }else{
          setCookie("Prev_URL", window.location.href)
          Taro.redirectTo({ url: "/pages/author" })
    }
  }

  /**
   * 获取内容 
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    const code = this.$router.params.code
    if (code) {
      this.state.code = code
    }

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

  /** 更新课程数据 */
  updateCourseData() {
    return new Promise(resolve => {
      articleDetail(this.state.id).then(res => {
        this.setState({
          course: res.data,
          dataList: res.data.request,
          collect: res.data.action_collect,
          zan: res.data.action_point,
        }, () => {
          resolve('ok')
        })
      })
    })
  }

  getData() {
    return articleDetail(this.state.id)
      .then(res => {console.log(res)
        // 根据富文本数据确定是否取消父盒子的内边距
        if (res.data && res.data.content) {
          const content = res.data.content
          paddingZero(content)
        }

        /** 个性化分享 */
        Share({
          wx: {
            title: res.data.title, // 分享标题
            desc: res.data.title, // 分享描述
            link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: res.data.article_img || "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png", // 分享图标
            success: function () {
              // 设置成功
              console.log('ok~~')
            }
          }
        })
        this.setState({
          course: res.data,
          dataList: res.data.request,
          collect: res.data.action_collect,
          collectClass: res.data.action_collect ? 'icon-collect2-article':'icon-collect-article',
          zanClass: res.data.action_point ? 'icon-zan2-article':'icon-zan-article',
          zan: res.data.action_point,
          comment_num: res.data.comment_num,
        }, () => {
        })
        console.log(this.state.course)

        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
      })
      .catch(err => {
        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
        if (err.code == 16) {
          Taro.showModal({
            title: "提示", //提示的标题,
            content: "很抱歉,该资讯已下架!", //提示的内容,
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
   * 滚动到顶部/左边时触发
   */
  onScrollToUpper = throttle(() => {
    // H5环境取消下拉刷新
    if (process.env.TARO_ENV !== 'h5') {
      console.log("滚动到顶部/左边时触发")
      this.setState(
        {
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

  // 分享
  share = () => {
    setCookie("HIDE_SHARE_TIP", true)
    this.setState({ hideShareTip: true })
    //Taro.navigateTo({ url: `/pages/article-share?type=last&id=${this.state.id}` })
      Taro.navigateTo({ url: `/pages/article-share?type=last&id=${this.state.id}` })
  }
  collect = () =>{
      //判断是否收藏
      //type:1-收藏，2-点赞，action:false-取消关注，true-关注
      var action = this.state.collect
      if(action){
          action = false
      }else{
          action = true
      }
      return focuson(1,this.state.course.ua_id,action)
          .then(res => {console.log(action)
              this.setState({
                  collect: action,
                  collectClass: action ? 'icon-collect2-article':'icon-collect-article',
              }, () => {
              })
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

  zan = () =>{
        //判断是否点赞
      //判断是否收藏
      //type:1-收藏，2-点赞，action:false-取消关注，true-关注
      var action = this.state.zan
      if(action){
          action = false
      }else{
          action = true
      }
      return focuson(2,this.state.course.ua_id,action)
          .then(res => {console.log(action)
              this.setState({
                  zan: action,
                  zanClass: action ? 'icon-zan2-article':'icon-zan-article',
              }, () => {
              })
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


   userComment = (id,action) => {
       var action = action ? false : true
       var comment_id = id
       return commentFocuson(comment_id,action)
           .then(res => {
               this.getDataList()
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

    valueRecord = (onInputEventDetail) => {
        this.setState({ comment: onInputEventDetail.detail.value })

    }
    /*
    valueChange = debounce((onInputEventDetail) => {console.log(687)
        if (onInputEventDetail && onInputEventDetail.detail.value != undefined) {
            this.setState({ count: onInputEventDetail.detail.value.length })
            document.querySelector('.count').style.position = 'static'
            document.querySelector('.inputPart').style.height = this.state.inputPartHeight + (Math.floor(onInputEventDetail.detail.value.length / 18) * 18 - 1) + 'px'
        }
    }, 100)
    */
    valueChange = (e) => {
        this.setState({ comment: e.detail.value })

    }

    commentbottom = (e) => {
        this.setState({ scrollIntoView: 'toView' })
    }

    //取消
    commentCancel = () => {
      //
        this.setState({ commentShow: false })
    }

    //显示
    commentShow = () => {
        this.setState({ commentShow: true })
    }
    //提交
    commentSubmit = () => {console.log(this.state.comment)
        //
        return addcomment(this.state.course.ua_id,this.state.comment)
            .then(res => {
                this.setState({
                    comment_num:this.state.comment_num+1,
                    commentShow: false,
                    comment:''
                }, () => {

                })
                this.updateCourseData()
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

  render() {
    return (
      <View className='articleDetail'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation={false}
          style={{
            height: `calc(100% - ${Taro.pxTransform(112)})`,
            boxSizing: "border-box",
          }}
          scrollIntoView={this.state.scrollIntoView}
          onScrollToUpper={this.onScrollToUpper} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
          onScroll={this.scrollFn}
        >
          {/* 滚动到顶部加载信息 */}
          {this.state.isScrollTop && <LL_loading></LL_loading>}
          {/* 课程内容 */}
          <View className='ll-cells ll-cell--noborder' style={{ overflow: 'auto' }}>
            <View className='ll-cell article-title'>
              <View className='ll-cell__bd'>{this.state.course.title}</View>
              <View className='ll-cell__ft hide'>
                <View className='collection hide'>
                  <View className='icon icon-collection-selected'></View>
                  <View>已收藏</View>
                </View>
                <View className='collection'>
                  <View className='icon icon-collection-unselect'></View>
                  <View>收藏</View>
                </View>
              </View>
            </View>
          </View>
          {/* 专家信息 */}
          <View className='expert ll-cell--noborder ll-cells'>
            <View className='ll-cell ll-cell--access'>
              <View className='ll-cell__hd'>
                <Image
                  className='avatar avatar-expert'
                  src={
                    this.state.course.user_header_img ||
                    "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                  }
                />
              </View>
              <View className='ll-cell__bd'>
                <View className='expert__hd'>
                  <View className='expert__name'>
                    {this.state.course.name}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={{minHeight: "100%", background: "#fff"}}>
            {/* {this.state.tabIndex == 1 && ( */}
            {this.state && (
              <View className='ll-cells ll-cell--noborder course-catalog'>
                <View className='ll-cell'>
                  <RichText
                    className='rich-text'
                    nodes={this.state.course.content}
                  />
                </View>
              </View>
            )}
            {/* {this.state.tabIndex == 2 && ( */}
            {this.state && (
              <Block>
                <View className='ll-cells ll-cell--noborder course-evaluate'>
                  <View className='ll-cell'>
                    <View className='ll-cell__bd'>
                      <View className='expert-title'>评价</View>
                    </View>
                  </View>
                  {
                    this.state.dataList.map(item => (
                      <View className='ll-cell ll-cell--primary' key={item.id}>
                        <View className='ll-cell__hd course-evaluate__hd'>
                          <Image
                            className='avatar'
                            src={
                              item.headimgurl ||
                              "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                            }
                          />
                        </View>
                        <View className='ll-cell__bd course-evaluate__bd'>
                          <View className='course-evaluate__name clearfix'>
                            <View className='fl'>{item.nickname}</View>
                            <View className='fr'>
                              <View className='num'>{item.action_point_num}</View>
                              <View className={['icon', item.action_point_num  ? 'icon-zan2-article' : 'icon-zan']} onClick={this.userComment.bind(this,item.id,item.action_point)}></View>
                            </View>
                          </View>
                          <View className='course-evaluate__content ellipsis-2'>
                            {item.comment_content}
                          </View>
                          <View className='fl'>{item.addtime}</View>
                        </View>
                      </View>
                    ))}
                </View>
                {/* 查看更多 或者 是空状态 */}
                {!!this.state.dataList.length ? (
                  <View id='toView' className='ll-cells ll-cell--noborder'>
                    <View className='ll-cell'>
                      <View className='ll-cell__bd'>
                        <Navigator url='' className='btn btn-see-more m80 hide'>
                          查看更多
                          <View className='icon icon-more'></View>
                        </Navigator>
                      </View>
                    </View>
                  </View>
                ) : (
                    <View className='course-evaluate__emptyComment'>
                      <Image src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_recallnone%402x.png' />
                      <View className='text'>还没有任何评价</View>
                    </View>
                  )}
              </Block>
            )}
        </View>
        </ScrollView>

        {/* 底部栏 */}
        <View className='ll-cells ll-cell--noborder bottom'>
          <View className='ll-cell bottom__bd'>
            <View className='ll-cell__hd'>
              <Input
                className='ll-input'
                type='text'
                onClick={this.commentShow}
                value={this.state.comment}
                placeholder='说点什么…'
                ></Input>
            </View>
            <View className='ll-cell__hd'>
              <Button className='btn bottom__btn' onClick={this.commentbottom}>
                <View className='icon icon-comment-article'></View>
            {/*--<View className='bottom-btn__text'>评论</View>*/}
              {this.state.comment_num > 0 ?
              <View className='comment-num'>{this.state.comment_num}</View>
                  :
                  ''
              }

              </Button>
            </View>
            <View className='ll-cell__hd'>
              <Button
                className='btn bottom__btn'
                onClick={this.collect}
              >
                <View className={['icon', this.state.collectClass]}  ></View>
            {/*<View className='bottom-btn__text'>收藏</View>*/}
              </Button>
            </View>
            <View className='ll-cell__hd'>
              <Button className='btn bottom__btn' onClick={this.zan}>
                <View className={['icon', this.state.zanClass]}></View>
            {/*<View className='bottom-btn__text'>点赞</View>*/}
              </Button>
            </View>
            <View className='ll-cell__hd'>
              <Button className='btn bottom__btn' onClick={this.share}>
                <View className='icon icon-share'></View>
            {/*<View className='bottom-btn__text'>分享</View>*/}
              </Button>
            </View>
          </View>
          <View className={['commentBanner',!this.state.commentShow && 'n-display']}>
              <View className='commentContent'>
                <View className='commentHeader'>
                    <View onClick={this.commentCancel} className='commentCancel'>取消</View>
                    <View onClick={this.commentSubmit} className='commentSubmit'>发表</View>
                    <View className='content'>
                      <Textarea
                      value={this.state.comment}
                      autoHeight
                      placeholder='说点什么…'
                      autoFocus
                      onInput={this.valueChange}
                      onBlur={this.valueChange.bind(this)}
                      className='inputPart'
                          >
                          </Textarea>
                          <View className='count'>{this.state.count}/200</View>
                    </View>
                </View>
              </View>
          </View>
          <View className='shareBanner n-display'>
              <View className='shareContent'>
                <View className='shareList' onClick={this.shareFriend}>
                  <Image
                  className='shareIcon'
                  src="https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"/>
                  <View className='shareTitle'>分享到朋友圈</View>
                </View>
                <View className='shareList'>
                  <Image
                  className='shareIcon'
                  src="https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"/>
                  <View className='shareTitle'>分享到朋友圈</View>
                </View>
                <View className='shareList'>
                  <Image
                  className='shareIcon'
                  src="https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"/>
                  <View className='shareTitle'>分享到朋友圈</View>
                </View>
              </View>
          </View>
          {/* 分享提示 */}
          {
            !this.state.hideShareTip && <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/share_tip@2x.png' className='share-tip hide'></Image>
          }
        </View>

        {/* 首次加载 */}
        {this.state.isFirstLoding && <AtActivityIndicator size={36}></AtActivityIndicator>}
      </View>
    )
  }
}

export default Index
