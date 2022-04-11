import Taro, { Component } from "@tarojs/taro"
import {
    View,
    ScrollView,
    Image,
    Navigator,
    Text,
    Block, Input
} from "@tarojs/components"

import { AtActivityIndicator } from "taro-ui"
import { getKnowledgeNews } from "../../api/knowledge"
import {alive_yuyue, aliveList, careGzh, yuyue_detail, yuyue_set,liveList} from "../../api/expert"

import "./index.scss"
import {setCookie} from "../../utils/storage"
import {decryption} from "../../utils/aes"
import { handleInput, HttpException } from '@/src/utils/util'

class Index extends Component {
  config = {
    navigationBarTitleText: "直播列表"
  }

  constructor() {
    super(...arguments)
    this.state = {
      userInfo: decryption(localStorage.getItem('userInfo')) || {},
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
    return liveList()
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

    aliveYuyue= (id,state,link,form) => {
      //跳转导详情
        Taro.navigateTo({ url: "/pages/live-detail?id="+id })

    }
    close1 = () => {
        this.setState({ gz_yuy_warn:false})
    }

  render() {
    return (
      <View className='New'>
        {/* 头部 */}
        {/* 滚动区域 */}
        {/* // className='scrollview'
        // scrollY
        // scrollWithAnimation
        // style={{ height: "calc(100% - " + Taro.pxTransform(310) + ")",marginTop: `-${Taro.pxTransform(30)}` }} */}
        <View className='content--box'>

          {this.state.dataList.map((item, index) => {
            return (
              <Block key={index}>
                <View className='new-titlte'>{`${item['m']}`}</View>

                {/* media */}
                {item['res'].map((itemName,index) => (
                  <View className='ll-cells ll-cell--noborder' key={itemName.id}  onClick={this.aliveYuyue.bind( this,itemName.id)}>
                    {index !=0 &&(<View className='top-line'></View>)}
                    <View className='media-title'><View className='comma'></View>{itemName.opentime}</View>
                    {index+1 < item['res'].length &&(<View className='line'></View>)}
                    <View className='ll-cell ll-cell--primary media__bd'>
                      <View className='ll-cell__hd alive-list'>
                        <Image
                          className='media__img'
                          src={itemName.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                        />
                        {itemName.status == 0 &&(
                        <View className='img-status'> 预告</View>
                        )}
                        {itemName.status == 1 &&(
                        <View className='img-status'>预告</View>
                        )}
                        {itemName.status == 2 &&(
                        <View className='img-status img-state-red'> <View className='icon icon-playing'></View>直播中</View>
                        )}
                        {itemName.status == 3 &&(
                        <View className='img-status img-state-blue'>回放</View>
                        )}
                      </View>
                      <View className='ll-cell__bd'>
                        <View className='media__title ellipsis-2'>
                          {itemName.name}
                        </View>
                        <View className='media__ft'>
                          <View className='media__name'>
                    {/*{itemName.num}人已预约*/}
                          </View>
                          {itemName.status == 0 &&(
                            <View className='media__num'>立即预约</View>
                          )}
                        {itemName.status == 1 &&(
                            <View className='media__num unmedia_num'>已预约</View>
                        )}
                        {itemName.status == 2 &&(
                        <View className='media__num'>直播中</View>
                        )}
                        {itemName.status == 3 &&(
                        <View className='media__num'>查看回放</View>
                        )}
                        </View>
                      </View>
                    </View>
                  </View>
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
