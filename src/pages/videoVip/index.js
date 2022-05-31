/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
    View,
    ScrollView,
    Image,
    Navigator,
    Text, Input,Button,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import store from '../../store'
import { checkReg } from '../../utils/login'

import { get_lian, vipDiscountCourse, member_reccommend, get_vipPrice ,getFamous,allPackage} from "../../api/videoVip"
import Tabbar from "../../components/Tabbar"
import Title from "../../components/Title"
import Share from "@/src/components/Share"
import { decryption } from "../../utils/aes"
import "./index.scss"
import {alive, getExpretList,yuyue_detail,yuyue_set } from "../../api/expert"
import {getKnowledge} from "../../api/knowledge";
import { my } from "../../api/my"
import dayjs from 'dayjs'
import { handleInput, HttpException } from '@/src/utils/util'

const { loginStore } = store

@Title("会员")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "会员"
  };

  constructor() {
    super(...arguments)
    this.state = {
      bottomBtn: false,
      data:{
          name:'',
          phone:'',
          company:'',
          position:'',
      },
      famousDataShow: null,
      vipPrice: 69,
      priceList:[
          { type: '1', name: "月享卡" ,price:'?',time :'365',unit:'月',banner:'lian-vip1@2x.png',icon:'card_m@2x.png',num:5},
          { type: '2', name: "季享卡" ,price:'?',time :'365',unit:'季',banner:'lian-vip2@2x.png',icon:'card_j@2x.png',num:7},
      ],
      index:1,
      num:0,
      img:'icon_coupon@2x.png',
        /** 是否首次加载数据 */
      isFirstLoding: true,
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
      /** 信息更新 */
      my()
    
      if (this.state.userInfo && this.state.userInfo.headimgurl) {
          const data = await this.props.userStore.getUserInfoAsync()
          this.setState({
              userInfo: data
          }, () => {
              if (this.state.userInfo.lian) {
                  Taro.redirectTo({ url: '/pages/videoVip-index' })
              }
          })
      }else{
          const data = await this.props.userStore.getUserInfoAsync()
          this.setState({
              userInfo: data
          })
      }
      await this.getAllPrice()
      this.state.isFirstLoding && this.setState({ isFirstLoding: false })

    Share({
        wx: {
            title: '智汇圈会员，让你收获更多！', // 分享标题
            desc: `链接业内大咖，尊享好课免费学、精选免费专区`, // 分享描述
            link: `${window.location.origin}/#/pages/videoVip`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: `${this.props.userStore.imgUrl}vip_share.jpg`, // 分享图标
            success: function () {
                // 设置成功
            }
        }
    })
  }

  getAllPrice = () => {
    return allPackage({type:1}).then(res => {
        for(var i=0; i<this.state.priceList.length; i++){
            this.state.priceList[i].name = res.data[i].lian_name
            this.state.priceList[i].price = res.data[i].price
            this.state.priceList[i].active = res.data[i].active
        }
        var er = this.state.priceList
        console.log(er)
        this.setState({ priceList: er })
    })
  }

    payVIP = () => {
      var type = 1
      if(this.state.index == 1){
          //个人会员
          type = 1
      }else if(this.state.index == 2){
          //企业会员
          type = 2
      }else{
          //其他
          type = 3
      }
      Taro.navigateTo({ url: '/pages/videoVip-new-submit?type='+type})
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
    toggle = (index) =>{
      this.setState({index:index})
    }


    render() {
     
    return (
      <View className='vip' >
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            boxSizing: "border-box",
            flex: 1,
          }}
          onScroll={this.scrollFn}
        >
          {this.state.index == 1 &&
          <View className="content">
              <View className="content__hd">
                  <View className="btn-group">
                      <View className="btn-group-border">
                          <View className="btn btn-active">个人版</View>
                          <View className={["btn", this.state.index == 2 && "btn-active"]} onClick={this.toggle.bind(this,2)}>企业版</View>
                      </View>
                  </View>
              </View>
              <View className="content__bd" >
                  <View className="ll-cells ll-cell--noborder introduce">
                      <View className="ll-cell">
                          <View className="ll-cell__bd">
                              <View className="introduce__title">
                                  <View className="icon icon-crown"></View>
                                  <Text className="">VIP会员服务</Text>
                              </View>
                              <View className="introduce__small">
                              {this.state.priceList[0].price}元/{this.state.priceList[0].time}天
                              </View>
                          </View>
                      </View>
                      <View className="ll-cell ll-cell--noborder">
                          <View className="ll-cell__bd">
                              <View className="introduce__item">
                                  <Image className='introduce__icon' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_2@2x.png'></Image><Text>文章、课件阅读全开放</Text>
                              </View>
                              <View className="introduce__item">
                                  <Image className='introduce__icon' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_3@2x.png'></Image><Text>发起活动、获得协办</Text>
                              </View>
                              <View className="introduce__item">
                                  <Image className='introduce__icon' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_4@2x.png'></Image><Text>线下知识沙龙免费参加</Text>
                              </View>
                              <View className="introduce__item">
                                  <Image className='introduce__icon' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_5@2x.png'></Image><Text>对接专家找资源1天回复</Text>
                              </View>
                          </View>
                      </View>
                  </View>
                  <View className="form-vip">
                      <View className="title">会员限时免费</View>
                      <View className="ll-cell__bd">
                          <Input
                              onChange={handleInput.bind(this, "data.name")}
                              type="text"
                              placeholder="姓名" />
                      </View>
                      <View className="ll-cell__bd">
                          <Input
                          onChange={handleInput.bind(this, "data.phone")}
                          type="text"
                          placeholder="电话" />
                      </View>
                      <View className="ll-cell__bd">
                          <Input
                          onChange={handleInput.bind(this, "data.company")}
                          type="text"
                          placeholder="公司" />
                      </View>
                      <View className="ll-cell__bd">
                          <Input
                          onChange={handleInput.bind(this, "data.position")}
                          type="text"
                          placeholder="职务" />
                      </View>
                  </View>
              </View>
          </View>
          }
         {this.state.index == 2 &&
          <View className="content-business">
              <View className="btn-group">
                  <View className="btn-group-border">
                      <View className={["btn", this.state.index == 1 && "btn-active"]} onClick={this.toggle.bind(this,1)}>个人版</View>
                      <View className="btn btn-active">企业版</View>
                  </View>
              </View>
          </View>
          }
        
          <View className="ll-cells ll-cell--noborder bottom">
              <View className="ll-cell" >
                  <View className="ll-cell__bd">
                      <View className="price-change">
                          <View className="price color-primary">
                              ¥<Text className='price-bold'>
                              <Text className={[this.state.index == 2 && "hide"]}>{this.state.priceList[0].price}</Text>
                              <Text className={[this.state.index == 1 && "hide"]}>{this.state.priceList[1].price}</Text>
                              </Text>/年
                          </View>
                          <View className="price color-primary price-change-rights">
                              原价<Text>
                              <Text className={[this.state.index == 2 && "hide"]}>{this.state.priceList[0].price}</Text>
                              <Text className={[this.state.index == 1 && "hide"]}>{this.state.priceList[1].price}</Text>
                              </Text>/年
                              <Image className='center-img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/line.png'></Image>
                          </View>
                      </View>
                      <View className="bottom__tip color-black">
                          购买即代表同意
                          <Navigator
                              className="link"
                              url="/pages/vip-agreement/vip-agreement">
                                《会员购买协议》

                          </Navigator>
                      </View>
                  </View>
                  <View className="ll-cell__ft">
                      <View className="btn btn-buy" onClick={this.payVIP}>立即开通</View>
                  </View>
              </View>
          </View>
          

        </ScrollView>

        <Tabbar></Tabbar>
        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
