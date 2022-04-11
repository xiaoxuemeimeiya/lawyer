import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text,
  Block
} from "@tarojs/components"

import { AtActivityIndicator } from "taro-ui"
import { getKnowledgeNews } from "../../api/knowledge"

import "./index.scss"

class Index extends Component {
  config = {
    navigationBarTitleText: "上新"
  }

  constructor() {
    super(...arguments)
    this.state = {
      date: {
        // year: new Date().getFullYear(),
        month:
          new Date().getMonth() + 1 > 9
            ? new Date().getMonth() + 1
            : "0" + (new Date().getMonth() + 1),
        day:
          new Date().getDate() > 9
            ? new Date().getDate()
            : "0" + new Date().getDate()
      },

      dataList: [],

      isFirstLoding: true,
      showNull: false
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
    return getKnowledgeNews(this.state.page)
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)

        let dataList = res.data.list

        /* 列表数据 */
        dataList = dataList.filter(item=>(item.res && item.res.length > 0))

        if(dataList.length){
          this.setState({
            dataList:dataList
          })
        }else{
          this.setState({
            showNull:true
          })
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

  render() {
    return (
      <View className='New'>
        {/* 头部 */}
        <View className='ll-cells ll-cell--noborder time'>
          <View className='ll-cell time__bd'>
            <View className='ll-cell__bd'>
              <View className=''>
                <Text className='time__day'>{this.state.date.month}/</Text>
                <Text className='time__month'>{this.state.date.day}</Text>
              </View>
              <View className='time__info'>平台会不定期更新各类课程</View>
            </View>
            <View className='ll-cell__ft'>
              <Image
                className='time__icon'
                src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon_new1@3x.png'
              />
            </View>
          </View>
          <View className='time__ft'></View>
        </View>
        {/* 滚动区域 */}
        {/* // className='scrollview'
        // scrollY
        // scrollWithAnimation
        // style={{ height: "calc(100% - " + Taro.pxTransform(310) + ")",marginTop: `-${Taro.pxTransform(30)}` }} */}
        <View className='content--box'>

          {this.state.dataList.map((item, index) => {
            return (
              <Block key={index}>
                <View className='new-titlte'>{`${this.state.date.month}月${item['m']}日`}</View>

                {/* media */}
                {item['res'].map(itemName => (
                  <Navigator
                    url={`/pages/knowledge-online-detail?id=${itemName.id}`}
                    className='ll-cells ll-cell--noborder media'
                    key={itemName.id}
                  >
                    <View className='ll-cell ll-cell--primary media__bd'>
                      <View className='ll-cell__hd'>
                        <Image
                          className='media__img'
                          src={itemName.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                        />
                      </View>
                      <View className='ll-cell__bd'>
                        <View className='media__title ellipsis-2'>
                          {itemName.name}
                        </View>
                        <View className='media__small'>
                          {itemName.category}
                        </View>
                        <View className='media__ft'>
                          <View className='media__name'>
                            {itemName.us_regist_name}
                          </View>
                          <View className='media__num'>
                            {itemName.learn_num}人在学
                          </View>
                        </View>
                      </View>
                    </View>
                  </Navigator>
                ))}
              </Block>
            )
          })}

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
        </View>

        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
