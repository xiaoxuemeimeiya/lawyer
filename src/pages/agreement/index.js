import Taro, { Component } from "@tarojs/taro"
import { View,ScrollView,Text } from "@tarojs/components"

import "./index.scss"
import { confirmAgreement } from "../../api/agreement"
import Login from "../../components/Login"
import Share from "../../components/Share"

@Share()
@Login
class Index extends Component {
  config = {
    navigationBarTitleText: "LINK链链与专栏作者合作协议"
  }
  constructor() {
    super(...arguments)
    this.state = {
      agreed: Number(this.$router.params.agreed) || Number(sessionStorage.getItem('agreed')) || 0
    }
  }

  componentDidMount(){
    setTimeout(() => {
      Share({wx:{
        title: 'LINK链链与专栏作者合作协议', // 分享标题
        desc: '请查阅此协议', // 分享描述
        link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png", // 分享图标
        success: function() {
          // 设置成功
          console.log('ok~~')
        }
      }})
    }, 1500)
  }

  confirmAgreement = () => {
    if(this.state.agreed) return
    confirmAgreement().then(() => {
      this.setState({
        agreed:1
      })
      sessionStorage.setItem('agreed',1)
      Taro.showToast({ 
        title: '已同意', //提示的内容, 
        icon: 'success', //图标, 
        duration: 2000, //延迟时间, 
        mask: true, //显示透明蒙层，防止触摸穿透, 
      })
    })
  }


  render() {
    return (
      <View className='agreementPage'>
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{ height: "100%" }}
          id='agreement'
        >
          <View className='theme'>链链知迅邀请进驻合作协议</View>
            链链知迅愿以所有企业/专栏作者、专家/顾问、产品合作机构、个人兴趣作者，在基于良好的信任， 处于双方长远发展战略上的考虑，链链与所有参与内容、产品建设或提供方，强强联合， 共同携手，就知识、课程/培训、产品上通过链链知迅平台进行推广、销售开展合作。双方均以优秀的企业理念与专业性，本着“互惠、互利、稳定、恒久、 高效、优质”的合作精神，结成深度的战略合作伙伴关系。现经双方友好协商， 达成以下共识：
          <View className='title'>一、 合作纲领</View>
          <View className='bold'>1、合作宗旨</View><View className='br'></View>
          1.1、合作宗旨是通过双方的紧密合作，打造双赢、可持续发展的合作伙伴关系。 <View className='br'></View>
          1.2、合作目标双方相信，通过本次合作，通过链链知迅平台进一步提升音视频课程产品实现市场扩张策略并获得市场份额，为双方创造更大的商业价值。 <View className='br'></View>
           <View className='bold'>2、合作内容</View><View className='br'></View>
           <View className='bold'>音视频课程产品以及在线内容（含音视频、培训课等）上架至链链知迅销售。</View><View className='br'></View>
          1.1、在线内容合作方式以及要求<View className='br'></View>
            上架方式：由链链知迅统一上架产品，合作方需将课程产品（音视频），按要求格式发送链链知迅指定的邮箱即可；<View className='br'></View>
          1.2、关于服务、技术的支持：链链知迅为所有进驻企业/专家提供服务以及技术服务，企业/专家的音视频课程产品上架至链链知迅平台；<View className='br'></View>
          1.3、结算方式：由链链知迅统一提供结算平台服务，合作企业/专家有权要求链链知迅提供必要数据，以备核查。<View className='br'></View>
          1.4、根据微信平台的支付规则，用户通过微信平台发起的支付（包括课程付费及赞赏、私问、赠礼等支付），微信平台将收取支付费用约2%作为手续费，该费用由微信平台收取，并由微信平台自动扣除，实际收取情况以微信平台的政策为准，与链链知迅无关。<View className='br'></View>
          
          <View className='title'>二、链链知迅合作方式（邀请进驻合作）</View>
            *链链知迅平台上的会员产品（链链会员、链链俱乐部达人）是平台运营推出的服务产品，辅助产品的营销、推广、销售。<View className='br'></View>
          <View className='bold'>1、链链知迅合作规则：邀请进驻合作</View><View className='br'></View>
            1.1、通过链链知迅邀请方式进驻合作，由链链知迅对接运营来完成店铺开通、活动、推广参与。<View className='br'></View>
            1.2、企业/专家则需要配合链链知迅完成相关音视频课程产品的推广页、活动页的制作，店铺装修以及音视频产品上架基础操作。但是整个店铺还是企业/专家自己的。<View className='br'></View>
            1.3、链链知迅在保障企业/专家收益的同时，拥有对所有上架的音视频课程产品推出的营销折扣、促销、推广等运营支配权力。链链知迅的会员，有权尊享7.5折购买全场音视频产品和其他权益。如有特殊请先提前申请。<View className='br'></View>
            1.4、链链俱乐部达人，获平台赠送<View className='bold'>1000元的任意学的额度</View>等权益。链链俱乐部是链链知迅专门为企业管理者提供的一次性消费的会员产品，属于链链知迅营销推广的独家权益，所有邀请进驻企业需支持链链知迅这项合作规则。<View className='br'></View>
            1.5、收入<View className='bold'>提现指导：链链知迅（公众号）链学堂的首页在个人中心中收益</View>模块可直接提现，其中，500元以上（含500元）可直接进行提现。<View className='br'></View>
            1.6、链链知迅免除邀请进驻合作（企业/专家）的进驻平台费用，但是在所有音视频课程产品的在线销售额（链链知迅将会收取部分平台技术、推广服务费30%）。<View className='br'></View>
            <View className='bold'>2、链链知迅书城合作规则</View><View className='br'></View>
            2.1、企业/专家/出版社，可以提供自有版权书籍、读物到链链知迅书城进行售卖，（原价商品：链链知迅享受10%-20%的书籍销售分成收益）、（促销商品：链链知迅免除分成收益，所得收益属于书籍提供方）、（鼓励企业/专家提供只有版权书籍与链链知迅联名活动，书籍作为活动增值服务；）<View className='br'></View>
          <View className='bold'>3、直播收益合作规则：</View><View className='br'></View>
            3.1、仅支持链链知迅邀请进驻合作（企业/专家）才有权限参与直播合作分成。<View className='br'></View>
            3.2、链链知迅团队参与负责组织、策划、营销，直播前的辅导和全程直播跟进支撑。<View className='br'></View>
            3.3、直播企业/专家、老师，准备直播内容、准备本次直播需要推荐的产品（含音视频）和专业服务。<View className='br'></View>
            3.4、付费直播，链链知迅和企业/专家双方各提收益得的50%。<View className='br'></View>
          <View className='bold'>备注：（具体修订规则根据实际情况另行通知）</View><View className='br'></View>

          <View className='title'>三、链链知迅合作方式（第三方进驻合作模式）</View>
            *平台开放计划：暂未开放<View className='br'></View>

          <View className='title'>四、知识产权</View>
        1、链链知迅平台的网站、网页应用、软件以及内含的商标、标识、文字、图片、视频、音频、软件等元素，链链知迅享有上述所有内容的知识产权。<View className='br'></View>
        2、您使用链链知迅平台产品及服务只能在本协议以及相应的授权许可协议授权的范围使用链链知迅知识产权，未经授权超范围使用的构成对链链知迅的侵权。<View className='br'></View>
        3、 您不得对平台服务涉及的相关网页、应用、软件等产品进行反向工程、反向汇编、反向编译等行为。<View className='br'></View>
        4、您在链链知迅平台提供直播服务期间产生的成果(包括但不限于直播视频、音频，及与本协议事项相关的任何文字、视频、音频等，以下统称"直播课程")的知识产权由您享有，责任由您承担。<View className='br'></View>
        5、您应确保您所上传至链链知迅平台的知识产品（包括但不限于您所展示的课程内容、课件、音乐、图片、素材、字体、商标、专利等）应为您合法拥有，并且您对该知识产品享有相应的处分权利（包括但不限于信息网络传播权等著作权利以及相应权利的转授权权利），您不得未经他人合法授权将他人的知识产品上传至链链知迅平台，亦不得对他人的表演（包括他人线下演讲的课程或在线传播的演讲内容）进行直播或转播。如您违反本协议的约定对第三方造成侵权的，链链知迅有权立刻下架或删除您上传的侵权知识产品，且您应承担所有的侵权责任；如您的侵权行为导致链链知迅遭受损失，或需承担连带责任，或被行政机关处罚的，链链知迅有权在承担相应的责任后按所承担费用的2倍要求您偿还。<View className='br'></View>
        6、您所发布的信息内容存在被链链知迅及其合作方或者其他使用者进行使用的可能性，因此，您若对该等信息内容不享有相关权利，将可能面临投诉、举报及索赔。相反，若您认为其他用户或第三方发布的信息内容侵犯自己的合法权益，您应自行向该等主体主张权利或向平台反映并提供充分证据，链链知迅对此不承担任何责任，但将给予必要的协助。<View className='br'></View>


  <View className='title'>五、协议附件  </View>
      本协议项下的合作业务以及相关的服务条款如有不完善的部分， 双方将协商另立书面说明，并作为本协议的附件，是本协议不可分割的一部分。如果没有特别说明，本协议各项条款同样适用于协议附件。如果附件中的条款与本协议相抵触，以附件中的说明为准。双方针对某一具体合作内容的具体事宜，包括工作流程、合作时间、结算模式等需要共同商讨之议题等双方一致关心的问题，将经由双方友好协商达成一致后在附件中签署。

  <View className='title'>六、不可抗力 </View>
      如果出现严重阻挠任何一方履行协议义务的不可抗力事件， 或者此等不可抗力事件使得合同目的无法实现， 则该方应当无任何迟延地通知另一方关于其履行 合同义务或者履行部分合同义务受影响的程度，并出具有权机关的证明。
          <View className='title'>七、保密条款</View>
      未经对方书面同意，任何一方不得将本协议内容相关事宜，以任何方式透漏给第三方。本保密条款不因双方合作的终止而无效。在双方合作终止后两年内，本保密条款对双方仍具有约束力。
          <View className='title'>八、违约条款 </View>
      链链知迅与企业/专家应按照合同约定各自履行合同义务。如其中一方违反合同约定，守约方有权要求违约方赔偿损失（包括且不限于实际损失，为维权支出的律师费、诉讼费等合理费用）。

          <View className='title'>九、争议解决</View>
      因执行本协议所发生的或与本协议有关的一切争议，双方应通过友好协商解决，如双方通过协商不能达成协议时，向链链所在地法院提起诉讼，通过诉讼程序解决。

          <View className='theme'>（以上协议内容已经取得官方确认）</View>

          <View onClick={this.confirmAgreement} className={['agreeBtn',this.state.agreed && 'agreed']}>{this.state.agreed?'已同意':'已阅读并同意'}</View>
        </ScrollView>
      </View>
    )
  }
}

export default Index
