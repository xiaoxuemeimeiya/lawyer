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

    aliveYuyue= (id,state,link,form) => {
        var user = Object.keys(this.state.userInfo).length
        this.setState({alive_id:id,alive_state:state,alive_link:link})
        if(user){
            //用户已经登陆（查看用户是否已经关注我们的公众号）
            careGzh()
                .then(careRes => {
                    //查看用户是否关注
                    if(careRes.state == 1){
                        //用户未关注
                        //判断是否是会员
                        if (this.state.userInfo && this.state.userInfo.lian) {
                            //会员
                            if(state != 0){
                                //已经预约
                                Taro.navigateTo({ url: "/pages/yuyue-success?id="+id })
                                return
                            }
                            //是否需要表单
                            if(form == 1){
                                //Taro.navigateTo({ url: "/pages/yuyue-form?id="+id+"&type=1" })
                                this.setState({yuyueForm:true})
                                return
                            }
                            alive_yuyue(id)
                                .then(res => {
                                    console.log(res)
                                    if(res.code === 1){
                                        this.props.alive()
                                        this.setState({ gz_yuy_warn:true})
                                        let that = this
                                        /*
                                        setTimeout(function(){
                                            that.setState({ gz_yuy_warn:false})
                                            Taro.navigateTo({ url: "/pages/yuyue-success?id="+id })
                                        },1500)
                                        */
                                    }else{
                                        Taro.showToast({
                                            title: res.msg,
                                            icon: 'none', //图标,
                                            duration: 2000, //延迟时间,
                                            mask: true //显示透明蒙层，防止触摸穿透,
                                        })
                                    }

                                }).catch(err => {
                                console.log(err)
                                Taro.showToast({
                                    title: err.msg ? err.msg : String(err), //提示的内容,
                                    icon: 'none', //图标,
                                    duration: 2000, //延迟时间,
                                    mask: true, //显示透明蒙层，防止触摸穿透,
                                })
                            })
                        }else if(this.state.userInfo) {console.log(54355)
                            //非会员
                            if(state != 0){
                                Taro.navigateTo({ url: link})
                                return false
                            }

                            //是否需要表单
                            if(form == 1){
                                //Taro.navigateTo({ url: "/pages/yuyue-form?id="+id+"&type=1" })
                                this.setState({yuyueForm:true})
                                return
                            }

                            alive_yuyue(id)
                                .then(res => {
                                    console.log(res)
                                    if(res.code === 1){
                                        this.props.alive()
                                        this.setState({ gz_yuy_warn:true})
                                        let that = this
                                        /*
                                        setTimeout(function(){
                                            that.setState({ gz_yuy_warn:false})
                                            Taro.navigateTo({ url: link})
                                        },1500)
                                        */
                                    }else{
                                        Taro.showToast({
                                            title: res.msg,
                                            icon: 'none', //图标,
                                            duration: 2000, //延迟时间,
                                            mask: true //显示透明蒙层，防止触摸穿透,
                                        })
                                    }
                                }).catch(err => {
                                console.log(err)
                                Taro.showToast({
                                    title: err.msg ? err.msg : String(err), //提示的内容,
                                    icon: 'none', //图标,
                                    duration: 2000, //延迟时间,
                                    mask: true, //显示透明蒙层，防止触摸穿透,
                                })
                            })
                        }else{
                            setCookie("Prev_URL", window.location.href)
                            Taro.redirectTo({ url: "/pages/author" })
                        }
                    }else{
                        //用户已关注
                        if (this.state.userInfo && this.state.userInfo.lian) {
                            //会员
                            if(state != 0){
                                Taro.navigateTo({ url: "/pages/yuyue-success?id="+id })
                                return
                            }

                            //是否需要表单
                            if(form == 1){
                                //Taro.navigateTo({ url: "/pages/yuyue-form?id="+id+"&type=1" })
                                this.setState({yuyueForm:true})
                                return
                            }
                            alive_yuyue(id)
                                .then(res => {
                                    console.log(res)
                                    if(res.code === 1){
                                        this.props.alive()
                                        this.setState({ yuyue_warn:true})
                                        let that = this
                                        setTimeout(function(){
                                            that.setState({ yuyue_warn:false})
                                            Taro.navigateTo({ url: "/pages/yuyue-success?id="+id })
                                        },1000)
                                    }else{
                                        Taro.showToast({
                                            title: res.msg,
                                            icon: 'none', //图标,
                                            duration: 2000, //延迟时间,
                                            mask: true //显示透明蒙层，防止触摸穿透,
                                        })
                                    }

                                }).catch(err => {
                                console.log(err)
                                Taro.showToast({
                                    title: err.msg ? err.msg : String(err), //提示的内容,
                                    icon: 'none', //图标,
                                    duration: 2000, //延迟时间,
                                    mask: true, //显示透明蒙层，防止触摸穿透,
                                })
                            })
                        }else if(this.state.userInfo) {console.log(54355)
                            //非会员
                            if(state != 0){
                                Taro.navigateTo({ url: link})
                                return false
                            }

                            //是否需要表单
                            if(form == 1){
                                //Taro.navigateTo({ url: "/pages/yuyue-form?id="+id+"&type=1" })
                                this.setState({yuyueForm:true})
                                return
                            }
                            alive_yuyue(id)
                                .then(res => {
                                    console.log(res)
                                    if(res.code === 1){
                                        this.props.alive()
                                        this.setState({ yuyue_warn:true})
                                        let that = this
                                        setTimeout(function(){
                                            that.setState({ yuyue_warn:false})
                                            Taro.navigateTo({ url: link})
                                        },1000)
                                    }else{
                                        Taro.showToast({
                                            title: res.msg,
                                            icon: 'none', //图标,
                                            duration: 2000, //延迟时间,
                                            mask: true //显示透明蒙层，防止触摸穿透,
                                        })
                                    }
                                }).catch(err => {
                                console.log(err)
                                Taro.showToast({
                                    title: err.msg ? err.msg : String(err), //提示的内容,
                                    icon: 'none', //图标,
                                    duration: 2000, //延迟时间,
                                    mask: true, //显示透明蒙层，防止触摸穿透,
                                })
                            })
                        }else{
                            setCookie("Prev_URL", window.location.href)
                            Taro.redirectTo({ url: "/pages/author" })
                        }
                    }
                })
                .catch(err => {
                    console.log(err)
                    Taro.showToast({
                        title: err.msg ? err.msg : String(err), //提示的内容,
                        icon: 'none', //图标,
                        duration: 2000, //延迟时间,
                        mask: true, //显示透明蒙层，防止触摸穿透,
                    })
                })
        }else{
            //用户未登陆
            setCookie("Prev_URL", window.location.href)
            Taro.redirectTo({ url: "/pages/author" })
        }
    }

    liveYuyue= (id,state,link,form) => {
        //跳转预约详情
        Taro.navigateTo({ url: "/pages/live-detail?id="+id })
    }


    close1 = () => {
        this.setState({ gz_yuy_warn:false})
    }
/*
    OneByOne = () => { console.log(this.state.userInfo)
        if (this.state.userInfo) {
            if(this.state.userInfo.lian_type == 1 || this.state.userInfo.lian_type == 2){
                Taro.redirectTo({ url: "/pages/VideoVip-oneByone" })
            }else{

            }
            //判断是否是季卡会员
        }else{
            setCookie("Prev_URL", window.location.href)
            Taro.redirectTo({ url: "/pages/author" })
        }
    }
    */
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

        {/* 入口 */}
        <View className='ll-cells ll-cell--noborder sort'>
          <View className='ll-cell'>
          {/*}
            <Navigator
              url='/pages/leader-list'
              className='ll-cell__bd'
            >
              <View className='icon icon-leader'></View>
              <View className='color-text-regular'>领袖专题</View>
            </Navigator>
            */}
            <Navigator
              url='/pages/free-list'
              className='ll-cell__bd'
            >
              <View className='icon icon-online-2'></View>
              <View className='color-text-regular'>免费听课</View>
            </Navigator>
            <Navigator
              url='/pages/live-list'
              className='ll-cell__bd'
            >
              <View className='icon icon-live-2'></View>
              <View className='color-text-regular'>直播</View>
            </Navigator>
            <Navigator
              url='/pages/knowledge-offline-course'
              className='ll-cell__bd'
            >
              <View className='icon icon-offline-2'></View>
              <View className='color-text-regular'>线下学院</View>
            </Navigator>
            <Navigator
              url='http://devadmin.mylyh.com/weapp/wadvice/advice_vip'
              className='ll-cell__bd'
            >
              <View className='icon icon-online-classify'></View>
              <View className='color-text-regular'>在线预归类</View>
             </Navigator>
            <Navigator
               url='https://weidian.com/?userid=1806178420'
               className='ll-cell__bd'
            >
              <View className='icon icon-expert-recommend'></View>
              <View className='color-text-regular'>专家荐书</View>
            </Navigator>
           {/*
            <Navigator
              url='https://vzan.com/live/livedetail-669901308'
              className='ll-cell__bd'
            >
              <View className='icon icon-live-2'></View>
              <View className='color-text-regular'>直播</View>
            </Navigator>
            <Navigator
              url='/pages/videoVip-coupon'
              className='ll-cell__bd'
            >
              <View className='icon icon-coupon-2'></View>
              <View className='color-text-regular'>领券中心</View>
            </Navigator>
            */}
          </View>
        </View>
        <Navigator url='/pages/single-list' className='vipBanner adviser'>
          <Image className='adviser_img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/pic_card@2x.png' />
        </Navigator>
        {/* 跨年活动 */}
        {
          this.state.newyears == 1 &&
          <Navigator url='/pages/new-year-festival' className='vipBanner newyears-active'>
            <Image className='banner_img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/new_year_festival/pic_new_year@2x.png' />
            <Image className='newyears_icon_img move-img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/new_year_festival/btn_first_feeling@2x(1).png' />
            <View className='active-time'>活动时间：1.28-2.17</View>
          </Navigator>
         }
        {/* 会员卡开通入口 0是体验会员 2体验会员 */}
      {/*
        {
          (this.props.userInfo.lian === 0 || this.props.userInfo.lian === 2) && this.state.newyears == 0 &&
          <Navigator url='/pages/videoVip' className='vipBanner'>
            <Image className='banner_img' src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_card%403x.png' />
          </Navigator>
        }
        */}
      {/*疫情入口*/}
      {/*}
        <Navigator url='https://news.qq.com//zt2020/page/feiyan.htm' className='diseaseDetail'>
          <View className='diseaseHeader'>
            <View className='diseaseTitle'>抗击新冠肺炎</View>
            <View className='diseaseTime'>更新于{this.props.diseaseList.lastUpdateTime}</View>
          </View>
          <View className='numDetail'>
            <View className='varyNum'>
                <View className='Num red'>{this.props.diseaseList.prov_increase}</View>
                <View className='newTitle'>{this.props.diseaseList.name}新增</View>
            </View>
            <View className='varyNum'>
              <View className='Num yellow'>{this.props.diseaseList.china_increase}</View>
              <View className='newTitle'>国内新增</View>
            </View>
            <View className='varyNum specialNum'>
              <View className='Num blue'>{this.props.diseaseList.out_increase}</View>
              <View className='newTitle'>境外输入新增</View>
            </View>
            <View className='varyNum'>
              <View className='Num orange'>{this.props.diseaseList.now_increase}</View>
              <View className='newTitle'>现存确诊</View>
            </View>
          </View>
        </Navigator>
        */}

        {/* 每日答疑解惑 */}
      {/*}
        {
          this.props.ques && (
            <Navigator className='ll-cells ques' url={this.props.ques.url ? this.props.ques.url : `/pages/expert-article?id=${this.props.ques.ua_id}`}>
              <View className='ll-cell'>
                <View className='ll-cell__bd'>
                  <View className='ques-h1'>每日答疑解惑</View>
                  <View className='ques-title ellipsis-2'>{this.props.ques.title}</View>
                  <View className='ques-author'>
                    <Image className='avatar' src={this.props.ques.header_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}></Image>
                    <View className='info'>{this.props.ques.us_regist_name} {this.props.ques.chainman && "|"} {this.props.ques.chainman}</View>
                  </View>
                </View>
                <View className='ll-cell__ft'>
                  <View className='ques-date'>{month}</View>
                  <View className='ques-year'>Nov. {year}</View>
                  <View style='line-height:1;margin-top:-4px;'><View className='ques-dot'></View></View>
                </View>
              </View>
            </Navigator>
          )
        }
        */}

        {/* 免费听课 */}
      {/*
        {
          !!this.props.free.length && (
            <View className='section'>
              <View className='section__hd'>
                <View className='title'>免费听课</View>
              </View>
              <ScrollView scrollX>
                <View className='scroll-free-course'>
                  {
                    this.props.free.map(item => (
                      <Navigator className='free-course' key={item.id} url={`/pages/knowledge-online-detail?id=${item.id}`}>
                        <View className='img-box'>
                          <Image className='img-box__img' src={item.index_img || item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
                          <View className='img-box__ft'>
                            <View className='icon icon-paly-2'></View>
                            <View>{item.view_total}+</View>
                          </View>
                        </View>
                        <View className='free-course__title ellipsis-2'>{item.name}</View>
                      </Navigator>
                    ))
                  }
                  <View className='free-course' style={{ flex: `0 0 ${Taro.pxTransform(24)}`, marginLeft: 0 }}></View>
                </View>
              </ScrollView>
            </View>
          )
        }
        */}

        {/* 推荐直播*/}
      {/*
          {
           !!this.props.aliveList.length && (
              <View id='hotAlive' className='section' onload={this.aliveLoad}>
                <Navigator url='/pages/alive-list' className='section__hd'>
                  <View className='title'>热门直播</View>
                  <View className='new-more'> 更多<View className='icon icon-more-3'></View></View>
                </Navigator>
                <ScrollView scrollX>
                  <View className='scroll-yuyue-alive'>
                      {
                          this.props.aliveList.map(item => (
                          <View className='yuyue-alive' onClick={this.aliveYuyue.bind( this,item.id,item.status,item.link,item.form)}>
                          <View className='img-box'>
                          <Image className='img-box__img' src={item.desc || item.desc || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
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
                    <View className='free-course__title ellipsis-2'>{item.title}</View>
                      {item.status != 3 && <View className='open-time'>{item.start_time} 开播</View>}
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


        <View className='section'>
          <Navigator url='/pages/free-list' className='section__hd'>
            <View className='title'>免费听课</View>
            <View className='new-more'> 更多<View className='icon icon-more-3'></View> </View>
          </Navigator>

            <View className='course-banner'>
            {this.props.free1.map((item, index) => (
               <Navigator
                url={`/pages/knowledge-online-detail?id=${item.id}`}>

                {/*
                <View className='ll-cell ll-cell--primary media__bd' onClick={() => voice.saveVoiceInfo(this.props.free1[0], this.props.free1[0].part_list, index)}>
                */}
                <View className='ll-cell ll-cell--primary media__bd'>

                  <View className='ll-cell__hd player-banner'>
                    <Image className='media__img'src={item.cover_img || item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}/>
                    <View className='icon icon-play-bb cover-player'></View>
                  </View>
                  <View className='ll-cell__bd'>
                      <View className='media__title ellipsis-2'>{item.name}</View>
                      <View className='media__small'>{item.us_regist_name}·{item.chainman}</View>
                      <View className="course_price">
          {/*<View className='price--hot'> 时长 9:30</View>*/}
                      </View>
                  </View>
              </View>
                </Navigator>
              )
              )
              }
              <View className='course_list'>
                {this.props.free2.map(item => (
                  <Navigator url={`/pages/knowledge-online-detail?id=${item.id}`} >
                  <View className='course_part'>
                    <View className='course_name ellipsis-2-only'>{item.name}</View>
                    <View className='course_player'>
                       <View className='icon icon-play-s'></View>
                    </View>
                    <View className="clear"></View>
                  </View>
                  </Navigator>
                ))}

                </View>
            </View>
        </View>
      {/* 本月上线 */}
      <View className='section new'>
        {/*<Navigator url='/pages/knowledge-new-list' className='section__hd'>*/}
         <Navigator url='/pages/knowledge-list' className='section__hd'>
           <View className='title'>上新推荐</View>
           <View className='new-more'> 更多<View className='icon icon-more-3'></View> </View>
         </Navigator>
         <View className='ll-cells ll-cell--noborder new__bd'>
          <View className='ll-cell'>
            <View className='ll-cell__bd'>
            {
              this.props.month[0] ? (
                <Navigator url={`/pages/knowledge-online-detail?id=${this.props.month[0]['id']}`}>
                    <Image className='new-img-frist' src={this.props.month[0] ? (this.props.month[0]['new_img']) : "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"}></Image>
                </Navigator>
            ) : (
                <Image className='new-img-frist' src='https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'></Image>
            )
            }
          </View>
          <View className='ll-cell__ft'>
              {
                  this.props.month[1] ? (
                    <Navigator url={`/pages/knowledge-online-detail?id=${this.props.month[1]['id']}`}>
                        <Image className='new-img-sec' src={this.props.month[1] ? (this.props.month[1]['cover_img']) : "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"}></Image>
                    </Navigator>
                  ) : (
                      <Image className='new-img-sec' src='https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'></Image>
                  )
              }
              {
                  this.props.month[2] ? (
                    <Navigator url={`/pages/knowledge-online-detail?id=${this.props.month[2]['id']}`}>
                        <Image className='new-img-sec' src={this.props.month[2] ? (this.props.month[2]['cover_img']) : "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"}></Image>
                    </Navigator>
                  ) : (
                    <Image className='new-img-sec' src='https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'></Image>
                  )
              }
            </View>
          </View>
          </View>
      </View>

      {/* 推荐专栏*/}
      {
        !!this.props.free.length && (
          <View className='section'>
              <View className='section__hd'>
                <View className='title'>推荐专栏</View>
              </View>
              <ScrollView scrollX>
                <View className='scroll-recommend'>
                  {this.props.cat_course.map((item,index) => (
                      <Navigator className="recommend-li" url={`/pages/knowledge-recommend?index=`+index}>
                         <View className='recommend-list'>
                          <View className='section__hd'>
                            <View className='recommend-title'>{item.keyword}</View>
                            <View className='recommend-new-more'> 更多<View className='icon icon-more-4'></View> </View>
                          </View>
                         {item.list && item.list.map(item1 => (
                          <View className='ll-cell ll-cell--noborder'>
                               <View className='ll-cell__hd img-box'>
                                  <Image className='img-box__img' src={item1.index_img || item1.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
                               </View>
                               <View className='ll-cell__bd recommend-desc'>
                                  <View className='free-course__title ellipsis-2'>{item1.name}</View>
                                  <View className='view-num'><View className='icon icon-see'></View><text>{item1.fake_data}</text></View>
                               </View>
                          </View>
                         )
                         )
                         }
                        </View>
                      </Navigator>
                  ))
                  }
                </View>
              </ScrollView>
          </View>
      )}

      {/*
        {
          this.props.liveActive && (
            <View className='section'>
              <View className='section__hd'>
                <View className='title'>推荐直播</View>
              </View>
              <Navigator className='ll-cells ll-cell-noborder recommend-live' url={this.props.liveActive.link}>
                <View className='ll-cell'>
                  <View className='ll-cell__bd recommend-live__bd'>
                    <Image className='recommend-live__img' src={this.props.liveActive.desc || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}></Image>
                    <View className='recommend-live__mask'>
                      <View className='icon icon-live-3'></View>
                      <View className='recommend-live__title ellipsis-2'>{this.props.liveActive.title}</View>
                      <View className='recommend-live__time'>
                        {this.props.liveActive.start_time && dayjs(this.props.liveActive.start_time * 1000).format(
                          "YYYY年MM月DD日 HH:mm"
                        )}
                        开播
                      </View>
                    </View>
                  </View>
                </View>
              </Navigator>
            </View>
          )
        }
        */}

      {/* 精品课程 */}
        <View className='section'>
          <View className='section__hd'>
            <View className='title'>精品课程</View>
          </View>
          {this.props.famous && this.props.famous.map((item,index) => (
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

        {/* 名家学堂 */}
      {/*
        <View className='section'>
          <View className='section__hd'>
            <View className='title'>名家学堂</View>
          </View>

          {
            this.props.famous && this.props.famous.map(item => (
              <Navigator
                key={item.id}
                className='ll-cells ll-cell--noborder media school'
                url={`/pages/knowledge-online-detail?id=${item.id}&famous=1`}
              >
                <View className='ll-cell ll-cell--primary media__bd'>
                  <View className='ll-cell__hd'>
                    <Image
                      className='media__img'
                      src={item.index_img || item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                    />
                  </View>
                  <View className='ll-cell__bd'>
                    <View className='media__title ellipsis-2-only'>{item.name}</View>
                    <View className='media__small'>{item.us_regist_name + '·' + item.chainman}</View>
                    <View className='icon-see'>
                      <Image className='media__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/new_year_festival/icon_see%402x.png'/>
                      <Text>{item.learn_num >= 9 ? Math.floor(item.learn_num+1/10)+'万' : (item.learn_num+1)+'千' }人次</Text>
                    </View>
                    <View className='school__ft'>
                      { 1 == this.state.newyears && item.is_active ==1
                        ?
                        <View>
                            <View className='price--active'>会员专享 ¥16.8</View> <View className='label--freeForVip--active'>原价¥{item.price}</View>
                        </View>
                        :
                        <View className='price'>¥{item.price} <View className={['label--freeForVip',!item.type && 'n-display']}>会员免费</View></View>

                      }
                    </View>
                  </View>
                </View>
              </Navigator>
            ))
          }
          <Navigator url='/pages/knowledge-famouse' className='btn btn-more'>查看更多</Navigator>
        </View>
        */}

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
            <View className='title'>线下学院</View>
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

          {/* 查看更多 */}
          <Navigator url='/pages/knowledge-offline-course' className='btn btn-more'>查看更多</Navigator>
        </View>

        {/* 热门推荐 */}
        <View className='section'>
          <View className='section__hd'>
            <View className='title'>热门推荐</View>
          </View>

          {this.props.dataList && this.props.dataList.map(item => (
            <Navigator
              url={`/pages/knowledge-online-detail?id=${item.id}`}
              className='ll-cells ll-cell--noborder media'
              key={item.id}
            >
              <View className='ll-cell ll-cell--primary media__bd'>
                <View className='ll-cell__hd'>
              {/*
                  <Image className='icon_audio' src='https://oss.mylyh.com/miniapp/versionv3.0/icon_audio1%402x.png'></Image>
                  */}
                  <Image className='icon_audio' src={item.video == 2 ? 'https://oss.mylyh.com/miniapp/versionv3.0/icon_audio%402x.png' : 'https://oss.mylyh.com/miniapp/versionv3.0/icon_audio1%402x.png'}></Image>
                  <Image
                    className='media__img'
                    src={
                      item.cover_img ||
                      "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                    }
                  />
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
                          {/*<View className='label--freeForVip label--freeForVip--Discount'>会员免费</View>*/}
                      </View>
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
          { this.state.yuyue_warn &&
          <View className='yuyue-opacity'>
              <View className='yuyue-warn' >
                  <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_suc%402x.png' />
                  <View className='text--black'>预约成功</View>
                  <View className='onebyone'>我们会在开播前提醒您</View>
                  {!this.state.userInfo.lian &&
                  <View className='onebyone'>3s后跳转到直播间</View>
                  }
              </View>
          </View>
           }
      {this.state.gz_yuy_warn &&
      <View className='yuyue-opacity1'>
          <View className='yuyue-warn1' >
          <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_suc%402x.png' />
          <View className='text--black'>预约成功</View>
          <View className='onebyone'>为了不错过您预约的直播，请关注我们，我们会在开播前提醒您。</View>
          <View className='ercode'>
            <Image className='gzh-img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/link_gzh%402x.png" />
          </View>
          <View className='care'>长按关注我们</View>
          </View>
          <View className="close-img" onClick={this.close1.bind()}> <Image src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_close2%402x.png"/></View>
      </View>
      }

      {this.state.yuyueForm &&
      <View className='pupop-box'>
          <View className={['pupopBack']} > </View>
          <View className='pupop'>
          <View className='pupop_title'>
          <View className='title_text'>为了带给您更好的服务</View>
          <View className='title_text'>请先完善资料</View>
          {/*<Image className='title_icon1' src={this.props.userStore.imgUrl + 'circle.png'} />
                            <Image className='title_icon2' src={this.props.userStore.imgUrl + 'circle.png'} />
                            */}
      </View>
      <View className='form'>
          <View className='formItem'>
          <View className='input-box'>
          <Input data-lable='name' value={this.state.form.name} onChange={handleInput.bind(this, "form.name")} placeholder='姓名' />
          </View>
          </View>
          <View className='formItem'>
          <View className='input-box'>
          <Input type='tel' data-lable='phone' value={this.state.form.phone} onChange={handleInput.bind(this, "form.phone")} placeholder='手机号码' />
          </View>
          </View>
          <View className='formItem'>
          <View className='input-box'>
          <Input data-lable='company' value={this.state.form.company} onChange={handleInput.bind(this, "form.company")} placeholder='所在公司' />
          </View>
          </View>
          <View className='formItem'>
          <View className='input-box'>
          <Input data-lable='position' value={this.state.form.position} onChange={handleInput.bind(this, "form.position")} placeholder='职位' />
          </View>
          </View>
          </View>
          <View className='button unique' onClick={this.service}>提交并预约</View>
          <View className='close-button' onClick={this.close}>取消</View>
          </View>
          </View>
      }

      </View>



    )
  }
}

export default Index
