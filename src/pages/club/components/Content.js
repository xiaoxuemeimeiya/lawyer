import Taro, { Component } from "@tarojs/taro"
import { View, Image, ScrollView ,Navigator} from "@tarojs/components"

import {getMemberRight} from '../../../api/club'

import "../index.scss"

class Index extends Component {

  constructor(){
    super(...arguments)
    this.state={
      dataList:{},
    }
  }

  componentDidMount() {
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
     getMemberRight()
      .then(res => {
        console.log("TCL: Index -> getData -> res", res)

        // 首次请求
        this.setState({
          dataList: res.data,
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
    const {recommend=[],adv=[],big_close=[],industry_go=[]} = this.state.dataList

    return (
      <View>
        {/* 移动卡片-推荐课程 */}
        <View className='section'>
          <Navigator url='/pages/clubvip-recommend-list' className='ll-cell ll-cell--noborder ll-cell--access section__hd'>
            <View className='ll-cell__bd'>
              <View className='section-title'>推荐课程</View>
              <View className='section-title--sm'>
                1000元学习储值卡可用来抵扣
              </View>
            </View>
            <View className='ll-cell__ft ll-cell__ft--in-access section--in-access'>
              更多
            </View>
          </Navigator>
          {/* 移动卡片主体 */}
          <ScrollView
            className='section-scrollview'
            scrollX
            scrollWithAnimation
            style={{
              padding: "0 0 15px 15px",
              width: "100%",
              overflow: "auto",
              boxSizing: "border-box"
            }}
          >
            <View className='course'>
              {
                recommend.map(item=>(
                  <Navigator
                    className='course-item' 
                    key={item.id}
                    url={`/pages/knowledge-online-detail?id=${item.id}`}
                  >
                    <Image
                      className='course-item__img'
                      src={item.cover_img||'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                    />
                    <View className='course-item__bd'>
                      <View className='course-item__title ellipsis-2'>
                        {item.name}
                      </View>
                      <View className='course-item__title--sm'>
                        {/* 辛童·采购与供应链专家 */}
                      </View>
                      {/* <View className='course-item__block'></View> */}
                      <View className='course-item__subhead'>{(item.us_regist_name || '') + '·'+ (item.chainman || '')}</View>
                      <View className='course-item__tip'>使用储值卡免费学</View>
                    </View>
                  </Navigator>
                ))
              }
            </View>
          </ScrollView>
        </View>

        {/* 移动卡片-直播 */}
        <View className='section'>
          <Navigator
            className='ll-cell ll-cell--noborder ll-cell--access section__hd'
            url='/pages/clubvip-live-list'
          >
            <View className='ll-cell__bd'>
              <View className='section-title'>直播</View>
              <View className='section-title--sm'>
                链链直播付费话题，达人享有免费观看权限
              </View>
            </View>
            <View className='ll-cell__ft ll-cell__ft--in-access section--in-access'>
              更多
            </View>
          </Navigator>
          {/* 移动卡片主体 */}
          <ScrollView
            className='section-scrollview'
            scrollX
            scrollWithAnimation
            style={{
              padding: "0 0 15px 15px",
              width: "100%",
              overflow: "auto",
              boxSizing: "border-box"
            }}
          >
            <View className='section-box'>
              {
                adv.map((item,key)=>(
                  <Navigator 
                    className='section-item' 
                    key={key}
                    url={item.link}
                  >
                    <Image
                      style={{
                        width: Taro.pxTransform(568),
                        height: Taro.pxTransform(260)
                      }}
                      className='section-item__img'
                      src={item.desc||'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                    />
                    <View className='section-item__mask'></View>
                    <View className='section-item__text ellipsis-2'>
                      {item.title}
                    </View>
                  </Navigator>
                ))
              }
            </View>
          </ScrollView>
        </View>

        {/* 移动卡片-大咖闭门会 */}
        <View className='section'>
          <Navigator url='/pages/clubvip-bigclose-list' className='ll-cell ll-cell--noborder ll-cell--access section__hd'>
            <View className='ll-cell__bd'>
              <View className='section-title'>大咖闭门会</View>
              <View className='section-title--sm'>
                达人享有每季度一次大咖闭门线下私享会
              </View>
            </View>
            <View className='ll-cell__ft ll-cell__ft--in-access section--in-access'>
              更多
            </View>
          </Navigator>
          {/* 移动卡片主体 */}
          <ScrollView
            className='section-scrollview'
            scrollX
            scrollWithAnimation
            style={{
              padding: "0 0 15px 15px",
              width: "100%",
              overflow: "auto",
              boxSizing: "border-box"
            }}
          >
            <View className='section-box'>
              {
                big_close.map((item,key)=>(
                  <Navigator 
                    className='section-item'
                    key={key}
                    url={item.url?item.url:`/pages/expert-article?id=${item.ua_id}`}
                  >
                    <Image
                      style={{
                        width: Taro.pxTransform(568),
                        height: Taro.pxTransform(260)
                      }}
                      className='section-item__img'
                      src={item.article_img||'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                    />
                    <View className='section-item__mask'></View>
                    <View className='section-item__text ellipsis-2'>
                      {item.title}
                    </View>
                  </Navigator>
                ))
              }

            </View>
          </ScrollView>
        </View>

        {/* 移动卡片-高端行业走访活动 */}
        <View className='section'>
          <Navigator url='/pages/clubvip-go-list' className='ll-cell ll-cell--noborder ll-cell--access section__hd'>
            <View className='ll-cell__bd'>
              <View className='section-title'>高端行业走访活动</View>
              <View className='section-title--sm'>
                至少每年2次，优先邀请达人参与
              </View>
            </View>
            <View className='ll-cell__ft ll-cell__ft--in-access section--in-access'>
              更多
            </View>
          </Navigator>
          {/* 移动卡片主体 */}
          <ScrollView
            className='section-scrollview'
            scrollX
            scrollWithAnimation
            style={{
              padding: "0 0 15px 15px",
              width: "100%",
              overflow: "auto",
              boxSizing: "border-box"
            }}
          >
            <View className='section-box'>
              {
                industry_go.map((item,key)=>(
                  <Navigator 
                    className='section-item' 
                    key={key}
                    url={item.url?item.url:`/pages/expert-article?id=${item.ua_id}`}
                  >
                    <Image
                      style={{
                        width: Taro.pxTransform(568),
                        height: Taro.pxTransform(260)
                      }}
                      className='section-item__img'
                      src={item.article_img||'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                    />
                    <View className='section-item__mask'></View>
                    <View className='section-item__text ellipsis-2'>
                      {item.title}
                    </View>
                  </Navigator>
                ))
              }
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }
}

export default Index
