import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Swiper,
  SwiperItem,
  Image,
  Navigator,
  Text,
  Button
} from "@tarojs/components"

import "./index.scss"
import {decryption} from "../../utils/aes";

class Index extends Component {
  config = {
    navigationBarTitleText: "会员权益"
  }

  // eslint-disable-next-line react/sort-comp
  conditionMap = {
    offline: "线下课程报名",
    payCourse: "线上课程",
    withdraw: "提现",
    clubInviteCode: "成功加入",
    dan:'领取成功'
  }

  constructor() {
    super(...arguments)
    this.state = {
      type: "",
      text_type:''
    }
  }

    componentDidShow() {
        this.getDataList()
    }

    /**
     * 获取内容
     * @tutorial 快捷键 `vi.getDataList`
     */
    getDataList() {
        const type = this.$router.params.index
        const text_type = this.$router.params.type
        console.log(text_type)
        if (type) {
            this.setState({ type :type ,text_type:text_type}, () => {
                // window.document.title = this.conditionMap[type]
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



    /** 返回 */



  //切换权益
    menuChange = (index) => {
        this.setState({ type :index })
    }

  render() {
      const sixPrivilege = [
          { url: 'icon_vip_live@2x.png', text: "直播课6场",text2: "直播课2场" ,status:1,subtitle:'会员免费看直播或回放（我们会按购买会员实际时效、权益计算）。如在会员时效内，平台未安排直播活动，则权益保留至下次继续使用'},
          { url: 'icon_salon@2x.png', text: "线下课程/沙龙",status:0,subtitle:'线下付费课程/沙龙，会员仅享受一次的免费参与机会，全年有效' },
          { url: 'icon_note@2x.png', text: "课堂资料",status:1,subtitle:'会员如何获得课件/笔记？ 添加【客服微信】索取当场课堂（课件PPT/笔记）。扫码添加客服微信，并备注身份和需求' },
          { url: 'icon_pre-classification@2x.png', status:0,text: "在线预归类服务",subtitle:'在线提交归类需求，当天收到咨询反馈信息，为工作减负提效。邮箱查询咨询结果' },
          { url: 'icon_phoneline@2x.png',status:0, text: "连线专家5次" ,subtitle:'电话连线专家，与专家1对1互动，及时解决问题'},
          { url: 'icon_adviser@2x.png', status:0,text: "上门一对一" ,subtitle:'电话预约顾问，上门1对1，服务内容包含工具流程模板、深入诊断、问题分析、实地查看交流。仅限广东'},
          { url: 'icon_course@2x.png',status:0, text: "畅享精选课程" ,subtitle:'精选在线视频、音频课程，仅支持会员免费学习'},
      ]
    return (
      <View className='InfoRightsSucc'>
        {/* 线下课程报名成功 */}
          <View className='section'>
            <ScrollView scrollX>
                <View className='scroll-vip-right'>
                  {
                      sixPrivilege.map((item,index) => (
                          <View className={['vip-right',index != this.state.type && 'opacity-half']} key={item.id} onClick={this.menuChange.bind(this,index)}>
                            <View className='img-box'>
                                <Image className='img-box__img' src={"https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/"+item.url} />
                            </View>
                            <View className='vip-right__title ellipsis-2'>{(this.state.text_type == 1 && index == 0) ? item.text2 : item.text}</View>
                          </View>
                      ))
                  }
                <View className='free-course' style={{ flex: `0 0 ${Taro.pxTransform(24)}`, marginLeft: 0 }}></View>
              </View>
            </ScrollView>
          </View>
        {
          sixPrivilege.map((item ,index)=> (
          <View className={['ll-cells ll-cell--noborder right-detail',index != this.state.type && 'n-display']}>
            {index == 0
                ?
            <View className='title'>{this.state.text_type == 1 ? item.text2 : item.text}</View>
                :
            <View className='title'>{item.text}</View>
            }
            <View className='sub-title'>权益说明</View>
            <View className='desc'>{item.subtitle}</View>
            {item.status == 1
                ?
                <View>
                    <View className='ercode' >
                        < Image className='img' src="https://oss.mylyh.com/miniapp/versionv2.2/pic_kefucode@2x.png" / >
                    </View>
                    { index ==0
                        ?
                    <View className='add-kefu'> 添加客服获取直播兑换码 </View>
                        :
                    <View className='add-kefu'> 添加客服获取 </View>
                     }
                </View>
                :
                ''
            }
          </View>
        ))
        }
      </View>
    )
  }
}

export default Index
