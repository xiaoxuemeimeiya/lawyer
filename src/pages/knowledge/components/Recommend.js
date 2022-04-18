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
            alive_id:'',
            alive_link:'',
            alive_state:'',
            form: {
                name:'',
                company:'',
                phone:'',
                position:''
            },
            newyears:1,
            yuy_warn:false,
            gz_yuy_warn:false,
            yuyueForm:false,
            loading: false, // 加载中,
            userInfo: decryption(localStorage.getItem('userInfo')) || {}
        }
    }
    async componentDidMount() {
        await this.getTimestamp()
        var anchorElement = document.querySelector("#hotAlive")
        console.log(anchorElement)
        // 如果对应id的锚点存在，就跳转到锚点
        if(anchorElement) { anchorElement.scrollIntoView({block: 'start', behavior: 'smooth'}) }

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

    kefuPhone = () => {
        Taro.makePhoneCall({
            phoneNumber: '13632288343'
        })
    }

    liveYuyue= (id,state,link,form) => {
        //跳转预约详情
        Taro.navigateTo({ url: "/pages/live-detail?id="+id })
    }


    close1 = () => {
        this.setState({ gz_yuy_warn:false})
    }
    close = () => {
        this.setState({yuyueForm:false})
    }

    /**
     * 参数校验器
     * @param(Object) from 数据源
     * @param(Object) rules 校验规则
     * @param(Object) msg 提示语
     */
    validate = (from, rules, msg) => {
        const rulesName = {
            name: '称呼',
            phone: '手机号码',
            company: '您的公司',
            position: '职务',//可不填
        }
        Object.keys(rules).map(v => {
            if (!from[v]) throw new HttpException(`${rulesName[v]}不能为空`)
            if (rules[v] instanceof Object) {
                if (rules[v].min && from[v].length < rules[v].min) {
                    throw new HttpException(`输入的${rulesName[v]}不能少于${rules[v].min}个字符`)
                }
                if (rules[v].max && from[v].length > rules[v].max) {
                    throw new HttpException(`输入的${rulesName[v]}不能超过${rules[v].max}个字符`)
                }
                // 正则
                if (String(rules[v]).indexOf('/') === 0) {
                    if (!from[v].match(rules[v])) throw new HttpException(msg[v])
                }
            }

        })
    }

    service = () => {
        //判断还有次数没
        const from = this.state.form
        console.log(from)
        const rules = {
            name: {
                max: 20,
                min: 1,
            },
            phone: /^1[34578]\d{9}$/,
            company: {
                max: 30,
                min: 1,
            },
        }
        const msg = {
            name: '请输入称呼',
            phone: '请输入正确的手机号码',
            company: '请输入您的公司',
        }
        try {
            this.validate(from, rules, msg)
            //Taro.showLoading({ mask: true })
            yuyue_set({alive_id:this.state.alive_id})
                .then(setRes => {
                    if(setRes.count == 0){
                        yuyue_detail(Object.assign(this.state.form, {alive_id: this.state.alive_id})).then(res => {
                            this.setState({yuyueForm:false})
                           this.aliveYuyue(this.state.alive_id,this.state.alive_state,this.state.alive_link,0)
                        })
                    }else{
                        this.setState({yuyueForm:false})
                        this.aliveYuyue(this.state.alive_id,this.state.alive_state,this.state.alive_link,0)
                    }
                })
        } catch (err) {
            Taro.showToast({
                title: err.msg,
                icon: 'none', //图标,
                duration: 1500, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
        }

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
{/*
        <View className='logo-desc ll-cell'>
          <View className='logo-left ll-cell'>
            <Image className='logo_banner_img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/icon_logo@2x.png'/>
            <View className='title'>全球贸易合规知识服务平台</View>
          </View>
          <View className='logo-right ll-cell'>
            <Image className='logo_icon' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/icon_s@2x.png'/>
            <View className='quelity'>品质保证</View>
          </View>
        </View>
        */}

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
              url='/pages/live-list'
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
        <Navigator url='/pages/single-list' className='vipBanner adviser'>
          <Image className='adviser_img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/pic_card@2x.png' />
        </Navigator>
{/*
      {
          !!this.props.liveList.length && (
          <View id='hotAlive' className='section' onload={this.aliveLoad}>
            <Navigator url='/pages/live-list' className='section__hd'>
                <View className='title'>热门直播</View>
                <View className='new-more'> 更多<View className='icon icon-more-3'></View></View>
            </Navigator>
            <ScrollView scrollX>
                <View className='scroll-yuyue-alive'>
                  {
                      this.props.liveList.map(item => (
                          <View className='yuyue-alive' onClick={this.liveYuyue.bind( this,item.id,item.status,item.link,item.form)}>
                      <View className='img-box'>
                      <Image className='img-box__img' src={item.cover_img || item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
                  {item.status == 0 &&(
                  <View className='img-status'>预告</View>
                  )}
                  {item.status == 1 &&(
                  <View className='img-status'>预告</View>
                  )}
                  {item.status == 2 &&(
                  <View className='img-status img-state-red'><View className='icon icon-playing'></View>直播中</View>
                  )}
                  {item.status == 3 &&(
                  <View className='img-status img-state-blue'>回放</View>
                  )}
                </View>
                <View className='free-course__title ellipsis-2'>{item.name}</View>
                  {item.status != 3 && <View className='open-time'>{item.opentime} 开播</View>}
                      {item.status == 0 &&(
                      <View className='unyuyue-button'>立即预约</View>
                      )}
                      {item.status == 1 &&(
                      <View className='yuyue-button'>已预约</View>
                      )}
                      {item.status == 2 &&(
                      <View className='unyuyue-button'>直播中</View>
                      )}
                      {item.status == 3 &&(
                      <View className='unyuyue-button'>查看回放</View>
                      )}
                  </View>
                  ))
                    }
                </View>
            </ScrollView>
        </View>
      )
      }
    */}
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
        <Navigator url='/pages/knowledge-famouse' className='btn btn-more'>查看更多</Navigator>
      </View>

        {/* 专家服务 */}
        <View className='section expert'>
          <View className='section__hd'>
            <View className='title'>连线专家</View>
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
