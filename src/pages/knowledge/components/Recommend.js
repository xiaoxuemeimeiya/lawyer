import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Navigator,
    Swiper,
    SwiperItem,
    Image,
    ScrollView,
    Button,
    Text, Input
} from "@tarojs/components"

import dayjs from 'dayjs'


import "../index.scss"
import {decryption} from "../../../utils/aes"
import {alive_yuyue, careGzh, yuyue_detail,yuyue_set } from "../../../api/expert"
import {setCookie} from "../../../utils/storage"
import {getDisease, getOnline} from "../../../api/knowledge"
import {index} from "../index.js"
import { handleInput, HttpException } from '@/src/utils/util'

class Index extends Component {
    constructor() {
        super(...arguments)
        this.state = {
            loading: false, // 加载中,
            userInfo: decryption(localStorage.getItem('userInfo')) || {}
        }
    }
    async componentDidMount() {
        var anchorElement = document.querySelector("#hotAlive")
        console.log(anchorElement)
        // 如果对应id的锚点存在，就跳转到锚点
        if(anchorElement) { anchorElement.scrollIntoView({block: 'start', behavior: 'smooth'}) }

    }

    kefuPhone = () => {
        Taro.makePhoneCall({
            phoneNumber: '13632288343'
        })
    }

  render() {
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1 + '').padStart(2, '0')
    return (
      <View>
        {/* 轮播图 */}
        <Swiper
          className='swiper'
          indicatorColor='rgba(0, 0, 0, .5)'
          indicatorActiveColor='#fff'
          indicatorDots
          circular
          autoplay
        >
          {this.props.swiper.map(item => {
            return (
              <SwiperItem key={item.id}>
                <Navigator url={item.link || ''} className='swiper-item'>
                  <Image className='swiper-item__img' src={item.desc} />
                </Navigator>
              </SwiperItem>
            )
          })}
        </Swiper>

        {/* 入口 */}
        <View className='ll-cells ll-cell--noborder sort'>
          <View className='ll-cell'>
            <Navigator
              url='/pages/knowledge-list'
              className='ll-cell__bd'
            >
              <View className='icon icon-online-2'></View>
              <View className='color-text-regular'>在线课程</View>
            </Navigator>
            <Navigator
              url='/pages/alive-list'
              className='ll-cell__bd'
            >
              <View className='icon icon-live-2'></View>
              <View className='color-text-regular'>大咖直播</View>
            </Navigator>
            <Navigator
              url='/pages/knowledge-offline-course'
              className='ll-cell__bd'
            >
              <View className='icon icon-offline-2'></View>
              <View className='color-text-regular'>线下活动</View>
            </Navigator>
            <Navigator
              url='/pages/social-list'
              className='ll-cell__bd'
            >
              <View className='icon icon-online-classify'></View>
              <View className='color-text-regular'>行业社群</View>
             </Navigator>
            <Navigator
               url='/pages/expert-list'
               className='ll-cell__bd'
            >
              <View className='icon icon-expert-recommend'></View>
              <View className='color-text-regular'>找专家</View>
            </Navigator>
          </View>
        </View>

      {/* 专家课程 */}
        <View className='section'>
          <View className='section__hd'>
            <View className='title'>专家课程</View>
          </View>
          {this.props.dataList && this.props.dataList.map((item,index) => (
            <View className='media-index'>
              {index < 5 &&
            <Navigator
              url={`/pages/knowledge-online-detail?id=${item.id}`}
              className='ll-cells ll-cell--noborder media'
              key={item.id}>
              <View className='ll-cell ll-cell--primary media__bd'>
                <View className='ll-cell__hd'>
                <Image className='icon_audio' src={item.video == 2 ? 'https://oss.mylyh.com/miniapp/versionv3.0/icon_audio%402x.png' : 'https://oss.mylyh.com/miniapp/versionv3.0/icon_audio1%402x.png'}></Image>
                <Image className='media__img' src={item.cover_img || "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"}/>
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
          }
         </View>
          ))}
        <Navigator url='/pages/knowledge-list' className='btn btn-more'>查看更多</Navigator>
      </View>

        {/* 专家服务 */}
        <View className='section expert'>
          <View className='section__hd'>
            <View className='title'>企业服务</View>
          </View>

          <View className='tt-cells'>
            {
              this.props.expretList && this.props.expretList.map(item => (
                <Navigator
                  key={item.id}
                  className='tt-cell-box tt-cell-box--half'
                  url={`/pages/single-detail?id=${item.id}`}
                >
                  <View className='tt-cell tt-cell--circle'>
                    <Image
                      className='tt-cell__img'
                      src={item.index_img || item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                    />
                    <View className='tt-cell__info'>
                      <View className='ellipsis-2'>{item.title}</View>
                    </View>
                  </View>
                </Navigator>
              ))
            }
          </View>

          {/* 查看更多 */}
          <Navigator url='/pages/single-list?type=expert' className='btn btn-more mt0' style={{ marginTop : '0px' }}>查看更多</Navigator>
        </View>

        {/* 线下学院 */}
        <View className='section'>
          <View className='section__hd'>
            <View className='title'>线下活动 </View>
          </View>

          {this.props.offline && this.props.offline.map(item => (
            <Navigator
              url={
                "/pages/knowledge-offline-detail?id=" +
                item.id
              }
              className='ll-cells ll-cell--noborder media media-offline'
              key={item.id}
            >
              <View className='ll-cell ll-cell--primary media__bd'>
                <View className='ll-cell__hd hdBanner'>
                  <Image
                    className='media__img'
                    src={
                      item.cover_img ||
                      "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                    }
                  />
              {/*
                  <View className='applyList'>
                    <View className='headList'>
                      {
                        item.list && item.list.length > 0 &&
                        item.list.map((b, k) => (
                          <Image key={k} className='headImg' src={b.headimgurl} />
                        ))
                      }
                    </View>
                    {
                      item.list && item.list.length > 0 &&
                      <Text>{item.join_num || 0}人已报名</Text>
                    }
                  </View>
                  */}
                </View>
                <View className='ll-cell__bd'>
                  <View className='media__title ellipsis'>{item.name}</View>
                  {/* <View className='media__small'>中美贸易·贸易风险·企业</View> */}
                  <View className='media__ft'>
                    {item.price == 0
                            ?
                      <View className='media__price'>
                      免费
                      </View>
                            :
                    (item.type == 0 && item.vip_price
                        ?
                    <View className='media__price'>
                        ¥<Text className='normal_price'>{item.price}</Text>
                        <Text className='vip_price'>¥{item.vip_price}</Text>
                        <View className='label--freeIcon-vip vip_icon'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_price%402x.png'/></View>
                    </View>
                       :
                      <View className='media__price'>
                          ¥<Text className='normal_price'>{item.price}</Text>
                          <View className='label--freeIcon-vip'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_1%402x.png'/></View>
                      </View>

                     )

                    }
                    <View className='media__num'>
                      {
                        dayjs(item.course_timein).format(
                          "MM月DD日 HH:mm"
                        )
                      }
                      {/* {item.join_num}人在学 */}
                    </View>
                  </View>
                </View>
              </View>
            </Navigator>
          ))}
        </View>

        <View className='kefu'>
          <img className='kefu-phone' onClick={this.kefuPhone} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_kefu_home@2x.png'/>
        </View>   
      </View>
    )
  }
}

export default Index
