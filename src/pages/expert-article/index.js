import Taro, { Component } from "@tarojs/taro"
import {
  View,
  Image,
  Navigator,
  ScrollView,
  RichText
} from "@tarojs/components"
import {  AtActivityIndicator } from "taro-ui"

import { getArticle,getExpertDetail } from "../../api/expert"
import { onScrollToLower } from "../../utils/scroll"
import Share from "../../components/Share"
import Title from "../../components/Title"

import "./index.scss"

@Share()
@Title("文章")
class Index extends Component {
  config = {
    navigationBarTitleText: "文章"
  };

  constructor() {
    super(...arguments)
    this.state = {
      /** 文章id */
      id:'',
      /** 文章详情 */
      article:{}
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
    /** 文章id */
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

  getData(){
    /** 专家id */
    getArticle(this.state.id)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        this.setState({
          article: res.data,
        })
        
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

  render() {
    return (
      <View className='ExpertArticle'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            height: "100%",
            boxSizing: "border-box"
          }}
          onScrollToLower={onScrollToLower.bind(this)} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
        >
          <View className='article-title'>
            {this.state.article.title}
          </View>

          {/* 专家信息 */}
          <View className='expert ll-cell--noborder ll-cells hide'>
            <Navigator
              url={"/pages/expert-detail?id=" + this.state.article.us_id}
              className='ll-cell ll-cell--access'
            >
              <View className='ll-cell__hd'>
                <Image
                  className='avatar avatar-expert'
                  src={
                    this.state.article.header_img ||
                    "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                  }
                />
              </View>
              <View className='ll-cell__bd'>
                <View className='expert__hd'>
                  <View className='expert__name'>
                    {this.state.article.us_regist_name}
                  </View>
                  {this.state.article.us_type == 2 && (
                    <View className='icon icon-expert-authentication'></View>
                  )}
                </View>
                <View className='expert__bd color-text-secondary'>
                  {this.state.article.chainman || ""}
                </View>
              </View>
              <View className='expert__ft ll-cell__ft ll-cell__ft--in-access'>
                TA的履历
              </View>
            </Navigator>
          </View>
          
          {/* 文章内容 */}
          <View className='article-content'>
            <RichText className='rich-text' nodes={this.state.article.content} />
          </View>

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
