import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Image,
    ScrollView,
    Navigator,
    Swiper,
    SwiperItem,
    Text, Input,
} from "@tarojs/components"
import { AtActivityIndicator } from "taro-ui"
import { my } from "../../api/my"
import {checkGet, prizeGet, vipCheck,boxScan} from "../../api/expert"
import { observer, inject } from '@tarojs/mobx'
import TitleInfo from './components/title'
import Share from "../../components/Share"
import Tabbar from "../../components/Tabbar"
import Login from "../../components/Login"
import * as videoVipApi from './../../api/videoVip'
import * as knowledgeApi from './../../api/knowledge'
import { loadedImg, imgloads } from './../../utils/util'
import { decryption } from "../../utils/aes"
import dayjs from 'dayjs'

import Title from "../../components/Title"

import "./index.scss"
import {alive, alive_yuyue, careGzh, getExpretList,yuyue_detail,yuyue_set } from "../../api/expert"
import {setCookie} from "../../utils/storage"
import {getKnowledge} from "./../../api/knowledge"
import { handleInput, HttpException } from '@/src/utils/util'
import {allPackage} from "./../../api/videoVip";

@Login
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
            alive_id:'',
            alive_link:'',
            alive_state:'',
            form: {
                name:'',
                company:'',
                phone:'',
                position:''
            },
            yuyueForm:false,
            vipPrice: 69,
            dataList: [],
            vipFreeCourseList: null,
            famousList: null,
            couponListAll: null,
            /** 我领取的名家学堂课程 */
            myFamous: null,
            sharePop: false,
            aliveList:[],
            expretList:[],
            offline:[],
            num:6,
            index:0,
            listvip:{
                0:3,//月卡
                1:2,//季卡
                2:1,//年卡
            },
            list:[
                { type: '1', name: "月享卡" ,price:'59',time :'1个月',unit:'月',banner:'lian-vip1@2x.png',icon:'card_m@2x.png'},
                { type: '2', name: "季享卡" ,price:'118',time :'3个月',unit:'月',banner:'lian-vip2@2x.png',icon:'card_j@2x.png'},
                //{ type: '3', name: "年享卡" ,price:'168',time :'12个月',unit:'月',banner:'lian-vip2@2x.png',icon:'card_j@2x.png'},
            ],
            newyears:1,
            newCardActive:true,
            yuyue_warn:false,
            gz_yuy_warn:false,
            type:1,
            show: false,
            showBox:false,
            showBox1:false,
            userInfo: decryption(localStorage.getItem('userInfo')) || {}
        }
    }

    async componentDidMount() {
        //my()
        this.setState({
            userInfo: await this.props.userStore.getUserInfoAsync()
        })
       /*
        if (!this.state.userInfo.lian) {
            Taro.redirectTo({ url: '/pages/videoVip' })
        }
        */

        await this.getConponData()
        const myFaous = await this.getMyFamous()
        // 当没有领取课程的时候，加载出来课程领取模块
        if (myFaous && myFaous.length === 0) {
            await this.getFamousData()
            this.setState({ current: 0 })
        }

        await this.getAllPrice()
        Share({
            wx: {
                title: '链链知讯会员，让你收获更多！', // 分享标题
                desc: `链接业内大咖，尊享好课免费学、精选免费专区`, // 分享描述
                link: `${window.location.origin}/#/pages/videoVip-index`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: `${this.props.userStore.imgUrl}vip_share.jpg`, // 分享图标
                success: function () {
                    // 设置成功
                }
            }
        })
    }

    getAllPrice = () => {
        return allPackage({type:1}).then(res => {
            for(var i=0; i<this.state.list.length; i++){
                this.state.list[i].name = res.data[i].lian_name
                this.state.list[i].price = res.data[i].price
                this.state.list[i].active = res.data[i].active
            }
            var er = this.state.list
            console.log(er)
            this.setState({ list: er,vipPrice:res.data[0].price })
        })
    }

    //改版,点击续费弹出选框
    xfVip = () => {
        this.setState({ show: true })
    }

    /** 续费vip */
    buyVip = () => {
        Taro.showLoading({ mask: true })
        videoVipApi.new_lian({ total_fee: this.state.vipPrice ,lian_type:this.state.listvip[this.state.index]}).then(res => {
            this.WeixinPay(res.data).then(result => {
                Taro.showToast({
                    title: result.msg,
                    icon: result.code === 1 ? "success" : 'none', //图标,
                    duration: 2000, //延迟时间,
                    mask: true //显示透明蒙层，防止触摸穿透,
                })
                Taro.navigateTo({ url: '/pages/videoVip-buy--success' })
            })

        }).catch((res) => {
            console.log('支付2', res)

            Taro.showToast({
                title: res.msg,
                icon: res.code === 1 ? "success" : 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
            window.location.replace(window.location.origin + '/#/pages/videoVip-index')
        })
    }


    /** 微信支付 */
    WeixinPay(obj) {
        return new Promise((resolve, reject) => {
            function onBridgeReady() {
                WeixinJSBridge.invoke("getBrandWCPayRequest", obj, function (res) {
                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                        // 使用以上方式判断前端返回,微信团队郑重提示：
                        //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
                        // window.location.replace(window.location.origin + '/#/pages/videoVip-buy--success')
                        return resolve('支付成功')
                    } else if (res.err_msg == "get_brand_wcpay_request:cancel") {
                        return reject('已取消支付')
                    } else {
                        return reject('支付失败')
                    }
                })
            }

            if (typeof WeixinJSBridge == "undefined") {
                if (document.addEventListener) {
                    document.addEventListener("WeixinJSBridgeReady", onBridgeReady, false)
                } else if (document.attachEvent) {
                    document.attachEvent("WeixinJSBridgeReady", onBridgeReady)
                    document.attachEvent("onWeixinJSBridgeReady", onBridgeReady)
                }
            } else {
                onBridgeReady()
            }
        })
    }

    toHome = () => {
        Taro.navigateTo({ url: '/pages/knowledge' })
    }

    /** 个性化分享 */
    handleShare() {
        Share({
            wx: {
                title: '链链知迅会员，让你收获更多！', // 分享标题
                desc: `链接业内大咖，尊享好课免费学、精选免费专区`, // 分享描述
                link: `${window.location.origin}/#/pages/videoVip-index`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: `${this.props.userStore.imgUrl}vip_share.jpg`, // 分享图标
                success: function () {
                    // 设置成功
                }
            }
        })
    }

    sharePop = () => {
        if (!this.state.sharePop) this.handleShare()
        this.setState({ sharePop: !this.state.sharePop })
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

    render() {

        return (
            <View className='header-box' >
                <View className={['share', !this.state.sharePop && 'hide']} onClick={this.sharePop}>
                    <View className='share__text'>点击右上角分享给朋友吧</View>
                    <Image className='share__img' src={this.props.userStore.imgUrl + 'icon_share.png'} />
                </View>
                <View className='head'>
                    <View className='content'>
                        <Image className='head-img' src=''></Image>
                        <View className="head-detail">
                            <View className='title'><open-data type="userNickName"></open-data></View>
                            <View className='sign'>
                                <Image
                                className='icon'
                                src='https://m.mylyh.com/wx_img/icon/icon_vip_tag@2x.png'
                                alt='图标'>
                                </Image>
                            </View>
                            <View className='sign'>
                                <Image
                                className='icon'
                                src='/images/person-list1-1.png'>
                                </Image>
                            </View>
                        </View>
                        <View className="sign-time">2019.9.19到期</View>
                    </View>
                    <View className='members'>
                    </View>
                </View>

                <View className="vip-border">
                    <View className="vip-border-list">
                        <View className="vip-active">
                            <image className='head-img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_crown@2x.png'></image>
                            VIP会员权益
                        </View>
                        <View className="vip-active-desc">
                            <View className="vip-active-desc_item"><Image className='head-img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_1@2x.png'></Image><View>在线课程免费畅听</View></View>
                            <View className="vip-active-desc_item"><Image className='head-img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_2@2x.png'></Image>新政解读全开放 </View>
                            <View className="vip-active-desc_item"><Image className='head-img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_3@2x.png'></Image>即时语音专家获帮助 </View>
                            <View className="vip-active-desc_item"><Image className='head-img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_4@2x.png'></Image>线下知识沙龙免费参加 </View>
                            <View className="vip-active-desc_item"><Image className='head-img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/icon_5@2x.png'></Image>对接专家找资源1天回复 </View>
                        </View>
                    </View>
                </View>

                <View className="bottom ll-cells ll-cell--noborder">
                    <View className="ll-cell">
                        <View className="ll-cell__bd color-record">
                            <View className="" onClick={this.upPay} > 升级会员> </View>
                        </View>
                    </View>
                    <View className="ll-cell ll-cell--noborder">
                        <View className="ll-cell__bd">
                            <View className="btn" onClick={this.goPay}> 会员续费 </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

export default Index
