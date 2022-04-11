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
        console.log(this.state.userInfo)
        /*
        if(this.state.userInfo.lian_type == 2){
            this.setState({ num: 6 })
        }else if(this.state.userInfo.lian_type == 3){
            this.setState({ num: 4 })
        }else if(this.state.userInfo.lian_type == 4){
            this.setState({ num: 2 })
        }else{
            this.setState({ num: 9 })
        }
        */
        if (!this.state.userInfo.lian) {
            Taro.redirectTo({ url: '/pages/videoVip' })
        }

        await this.getConponData()
        await this.getTimestamp()
        await this.newCardActive()
        const myFaous = await this.getMyFamous()
        // 当没有领取课程的时候，加载出来课程领取模块
        if (myFaous && myFaous.length === 0) {
            await this.getFamousData()
            this.setState({ current: 0 })
        }

        this.getVipFreeCourseList()
        this.getCourseData()
        this.alive()
        this.getKnowledge()
        this.getExpretListData()
        this.getLive()
        //this.getVipPrice()
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
    /***查看用户是否符合抽盲盒标准**/
    getLive = () => {
        //获取用户是否在活动期购买了可会员，购买会员可参与抽奖
        return vipCheck({type:1}).then(res => {
            if(res.status == 1){
                //有资格
                if(res.scan == 1){
                    this.setState({ showBox:false,showBox1:true })
                }else{
                    this.setState({ showBox:true,showBox1:true })
                }

            }else{
                this.setState({ showBox:false })
                console.log('没资格')
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

    /** 获取线下学院 */
    getKnowledge = () => {
        return getKnowledge()
            .then(res => {
                console.log("TCL: Index -> getSwiper -> res", res)

                this.setState({
                    //swiper: res.data.header, // 轮播图
                    //ques: res.data.everyday, // 每日答疑解惑
                    //liveActive: res.data.radio, // 推荐直播
                    offline: res.data.offline, // 线下学院
                })
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

    }

    /** 专家的服务列表 */
    getExpretListData() {
        getExpretList({ page: 1, us_id: 0 }).then(res => {
            // 限制6个显示
            this.setState({ expretList: res.data.slice(0, 6) })
        })
    }

    alive = () => {
        alive()
            .then(res => {console.log(res)
                this.setState({
                    aliveList: res.data
                })
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

    }

    /**获取优惠时间时间**/
    getTimestamp() { //把时间日期转成时间戳
        //优惠开始时间
        var starttime = (new Date('2020/12/28 00:00:00')).getTime() / 1000
        var endtime = (new Date('2021/01/08 23:59:59')).getTime() / 1000
        var time = (new Date()).getTime() / 1000
        if(time >= starttime && time <= endtime){
            //活动期间
            this.setState({ newyears: 1 })
            this.setState({ vipPrice: 88 })
        }else{
            this.setState({ newyears: 0 })
        }
    }

    /**获取优惠时间时间**/
    newCardActive() { //把时间日期转成时间戳
        //优惠开始时间(2021-01-08 23:59:59)
        var starttime = (new Date('2021/11/08 00:00:00')).getTime() / 1000
        var endtime = (new Date('2021/11/21 23:59:59')).getTime() / 1000
        var time = (new Date()).getTime() / 1000
        if(time >= starttime && time <= endtime){
            //活动期间
            this.setState({ newCardActive: 1 })
        }else{
            this.setState({ newCardActive: 0 })
        }
    }

    /** 获取vip价格 */
    getVipPrice() {
        videoVipApi.get_vipPrice().then(res => {
            this.setState({ vipPrice: Number(res.data) })
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


    /** 续费vip */
    /*
    buyVip = () => {
        Taro.showLoading({ mask: true })
        videoVipApi.get_lian({ total_fee: this.state.vipPrice }).then(res => {
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
    */

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

    /** 用户领取优惠券
     *  @param id 优惠券id
     *  @param isto 是否可以领取
     */
    userGetCounpon = (id, isto) => {
        if (!isto) return
        if (!this.state.userInfo.lian) {
            Taro.showToast({
                title: '您还没有开通会员',
                icon: 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
            return
        }
        Taro.showLoading({ mask: true })
        videoVipApi.get_coupon({ id }).then(res => {
            Taro.hideLoading()
            Taro.showToast({
                title: res.msg,
                icon: res.code === 1 ? "success" : 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
            if (res.code === 1) this.getConponData()
        })
    }

    /** 获取我已经领取的课程 */
    getMyFamous() {
        return videoVipApi.get_my_famous().then(res => {
            this.setState({ myFamous: res.data })
            return res.data
        })
    }

    /** 获取专属会员专区数据 和 名家学堂课程数据 */
    getVipFreeCourseList() {
        videoVipApi.member_reccommend().then(res => {
            this.setState({ vipFreeCourseList: res.data })
        })
        /**获取分享id */
        videoVipApi.get_share_id().then(res => {
            this.setState({ share_id: res.data })
        })
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

    /** 名家学堂课程  */
    getFamousData() {
        return new Promise(resolve => {
            knowledgeApi.getFamous().then(res => {
                // 最多显示10个
                res.data = res.data.splice(0, 10)
                // 加上一个更多按钮和透明按钮
                res.data.push({ id: -1, text: '更多' })
                res.data.push({ id: -2 })
                res.data.push({ id: -3 })
                this.setState({ famousList: res.data }, () => {
                    resolve('ok')
                })
            })
        })
    }


    /** 获取数据 */
    getCourseData() {
        return knowledgeApi.getOnline().then(res => {
            res.data.course = res.data.course.slice(0, 5)
            this.setState({ dataList: res.data.course })
        })
    }

    choiceVip = index => {
        if(this.state.newyears == 1){
            this.setState({ index: index })
            this.setState({ vipPrice: this.state.list[index].perprice })
            this.setState({ num: this.state.list[index].num })
        }else{
            this.setState({ index: index })
            this.setState({ vipPrice: this.state.list[index].price })
            this.setState({ num: this.state.list[index].num })
        }

    }

    closedialog = index =>{
        console.log(this.state.show)
        this.setState({ show: false })
    }

    /** 获取优惠券列表 */
    getConponData() {
        return videoVipApi.couponList().then(res => {
            return this.setState({ couponListAll: res.data })
        })
    }

    sharePop = () => {
        if (!this.state.sharePop) this.handleShare()
        this.setState({ sharePop: !this.state.sharePop })
    }

    vipRight = (id) => {
        console.log(id)
        let type = 0
        if(this.state.userInfo.lian_type == 3){
            type = 1
        }else{
            type = 0
        }
        Taro.navigateTo({ url: "/pages/videoVip-rights?index="+id+"&type="+type })
    }

    aliveYuyue= (id,state,link,form) => {
        var user = Object.keys(this.state.userInfo).length
        this.setState({alive_id:id,alive_state:state,alive_link:link})
        if(user){
            //用户已经登陆（查看用户是否已经关注我们的公众号）
            careGzh()
                .then(careRes => {console.log(careRes)
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
                                        this.alive()//更新数据
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
                        }else if(this.state.userInfo) {
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
                                    if(res.code === 1){console.log(7853454379)
                                        this.alive()//更新数据
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
                                        this.alive()//更新数据
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
                        }else if(this.state.userInfo) {
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
                                        this.alive()//更新数据
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
    close1 = () => {
        this.setState({ gz_yuy_warn:false})
    }

    close = () => {
        this.setState({yuyueForm:false})
    }

    /***关闭盲盒抽盲盒**/
    closeBox = () => {
        this.setState({ showBox:false })
    }
    enter = () => {
        this.setState({ showBox:false })
        boxScan({ }).then(result => {
            if(result.code == 1){
                //记录已经进来过了
                Taro.redirectTo({ url: "/pages/box" })
            }
        }).catch((result) => {
            Taro.showToast({
                title: result.msg,
                icon: result.code === 1 ? "success" : 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
        })
    }
    enter1 = () => {
        Taro.redirectTo({ url: "/pages/box" })
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

        /** 体验的链链会员，将两门课程隐藏 */
        const experience = this.state.userInfo.lian !== 1
/*
        const sixPrivilege = [
            { url: 'icon_75@2x.png', text: "所有产品享受7.5折" },
            { url: 'icon_free@2x.png', text: "享受会员免费专区" },
            { url: 'icon_famous_course@2x.png', text: "名家课免费学两门", experience: experience },
            { url: 'icon_coupon@2x.png', text: "100元专属优惠券" },
            { url: 'icon_card_1@2x.png', text: this.state.num+"张体验卡", experience: experience },
            { url: 'icon_id@2x.png', text: "专属身份标识" },
        ]

        const sixPrivilege = [
            { url: 'icon_discount_1@2x.png', text: "所有产品享受7.5折" },
            { url: 'icon_free_1@2x.png', text: "会员免费专区" },
            { url: 'icon_two_1@2x.png', text: "名家课免费学两门" },
            { url: 'icon_coupon_1@2x.png', text: "100元专属优惠券" },
            { url: 'icon_card1_1@2x.png', text: this.state.userInfo.lian_right+"张体验卡" },
            { url: 'icon_id_1@2x.png', text: "专属身份标识" },
        ]
          const perVip = [
            { type: '2', name: "季卡" ,price:'269',time :'3个月',unit:'季'},
            { type: '1', name: "年卡" ,price:'998',time :'12个月',unit:'年'},
            { type: '3', name: "月卡" ,price:'168',time :'1个月',unit:'月'},
            { type: '4', name: "学生卡" ,price:'99',time :'6个月',unit:'半年'},
        ]
        */
        const perVip = [
            { type: '1', name: "月享卡" ,price:this.state.newCardActive ? '59':'69',time :'1个月',unit:'月',banner:'lian-vip1@2x.png',icon:'card_m@2x.png'},
            { type: '2', name: "季享卡" ,price:this.state.newCardActive ? '118':'139',time :'3个月',unit:'月',banner:'lian-vip2@2x.png',icon:'card_j@2x.png'},
            //{ type: '3', name: "年享卡" ,price:'399',time :'12个月',unit:'月',banner:'lian-vip2@2x.png',icon:'card_j@2x.png'},
        ]

        const sixPrivilege = [
            { url: 'icon_vip_live_1@2x.png', text: "直播课2场",desc:'支持回放'},
            { url: 'icon_salon_1@2x.png', text: "线下课程/沙龙",desc:'1次'},
            { url: 'icon_note_1@2x.png', text: "课堂资料" ,desc:'课件/笔记'},
            { url: 'icon_pre-classification_1@2x.png', text: "在线预归类服务" ,desc:'5次'},
            { url: 'icon_phoneline_1@2x.png', text: "连线专家3次" ,desc:'20分钟/次'},
            { url: 'icon_adviser_1@2x.png', text: "上门一对一" ,desc:'1次'},
            { url: 'icon_course_1@2x.png', text: "畅享精选课程" ,desc:'免费专区'},
        ]
        const sixPrivilege1 = [
            { url: 'icon_vip_live_1@2x.png', text: "直播课6场",desc:'支持回放'},
            { url: 'icon_salon_1@2x.png', text: "线下课程/沙龙",desc:'1次'},
            { url: 'icon_note_1@2x.png', text: "课堂资料" ,desc:'课件/笔记'},
            { url: 'icon_pre-classification_1@2x.png', text: "在线预归类服务" ,desc:'不限次数'},
            { url: 'icon_phoneline_1@2x.png', text: "连线专家5次" ,desc:'20分钟/次'},
            { url: 'icon_adviser_1@2x.png', text: "上门一对一" ,desc:'1次'},
            { url: 'icon_course_1@2x.png', text: "畅享精选课程" ,desc:'免费专区'},
        ]
        const perVip1 = [
            { type: '2', name: "季卡" ,price:'88',time :'3个月',unit:'季'},
            { type: '1', name: "年卡" ,price:'299',time :'12个月',unit:'年'},
            { type: '3', name: "月卡" ,price:'49',time :'1个月',unit:'月'},
            { type: '4', name: "学生卡" ,price:'99',time :'6个月',unit:'半年'},
        ]
        return (
            <View className='videoVip videoVip-index' >
                <View className={['share', !this.state.sharePop && 'hide']} onClick={this.sharePop}>
                    <View className='share__text'>点击右上角分享给朋友吧</View>
                    <Image className='share__img' src={this.props.userStore.imgUrl + 'icon_share.png'} />
                </View>
                <View className='content--box__box'>
                    <View className='header_bg'></View>
                    <View className='header-background'>
                        <View className='header'>
                            {this.state.userInfo.lian_type == 3
                                ?
                            <Image className='header__background' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/lian-vip1@2x.png' />
                                :
                            <Image className='header__background' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/lian-vip2@2x.png' />
                            }
                            {
                                this.state.userInfo.userinfo &&
                                <View className='header--box'>
                                    <Image className='header__head' src={this.state.userInfo.userinfo.headimgurl} />
                                    <View className='header__info'>
                                        <View className='info__name'>
                                            <Text className='info__name--text ellipsis'>{this.state.userInfo.userinfo.nickname}</Text>
                                            {this.state.userInfo.lian_type == 3
                                                ?
                                            <Image className='label__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_2@2x.png' />
                                                :
                                            <Image className='label__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_3@2x.png' />
                                            }
                                        </View>
                                        <View className='info__time'>{this.state.userInfo.lian_endtime ? this.state.userInfo.lian_endtime.substr(0, 10) : ''}到期</View>
                                    </View>
                                    {/*<View className='header__btn' onClick={this.buyVip}>续费</View> */}
                                    <View className='header__btn' onClick={this.xfVip}>续费</View>
                                </View>
                            }
                            {this.state.userInfo.lian_type == 3
                                ?
                            <View className='header--bottom'>
                                <View className='vip-right-count'>
                                    <View className='vip-title'>直播课</View>
                                    <View className='vip-num'>2场</View>
                                </View>
                                <View className='vip-right-count'>
                                    <View className='vip-title'>连线专家</View>
                                    <View className='vip-num'>3次</View>
                                </View>
                            </View>
                                :
                            <View className='header--bottom'>
                                <View className='vip-right-count'>
                                    <View className='vip-title'>直播课</View>
                                    <View className='vip-num'>6场</View>
                                </View>
                                <View className='vip-right-count unvip-right-count'>
                                    <View className='vip-title'>线下课程/沙龙</View>
                                    <View className='vip-num'>1次</View>
                                </View>
                                <View className='vip-right-count'>
                                    <View className='vip-title'>连线专家</View>
                                    <View className='vip-num'>5次</View>
                                </View>
                                <View className='vip-right-count'>
                                    <View className='vip-title'>顾问上门</View>
                                    <View className='vip-num'>1次</View>
                                </View>
                            </View>
                                }
                        </View>
                    </View>
                    {/* 权益 */}
                    <View className="sixPrivilegeTitle">尊享7大权益</View>
                    {this.state.userInfo.lian_type == 3
                        ?
                    <View className='sixPrivilege'>
                        {
                            sixPrivilege.map((v, k) =>
                                <View className={['item', (k==1 || k==5) && this.state.index == 0 &&  'opacity-half']} key={k} onClick={this.vipRight.bind(this,k)}>
                                    <Image className='img' src={'https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/' + v.url} />
                                    <Text className='text'>{v.text}</Text>
                                    <Text className='gray-vip-text'>{v.desc}</Text>
                                </View>
                            )
                        }
                    </View>
                        :
                    <View className='sixPrivilege'>
                        {
                            sixPrivilege1.map((v, k) =>
                                <View className={['item', v.experience && 'gray']} key={k} onClick={this.vipRight.bind(this,k)}>
                                    <Image className='img' src={'https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/' + v.url} />
                                    <Text className='text'>{v.text}</Text>
                                    <Text className='gray-vip-text'>{v.desc}</Text>
                                </View>
                            )
                        }
                    </View>
                     }
        {/*
                    <View className="sixPrivilegeTitle">尊享7大权益</View>
                    <View className="sixPrivilegeDesc">六大权益</View>
                    <View className='sixPrivilege'>
                        {
                            sixPrivilege.map((v, k) =>
                                <View className={['item', v.experience && 'gray']} key={k}>
                                    <Image className='img' src={'https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/' + v.url} />
                                    <Text className='text'>{v.text}</Text>
                                </View>
                            )
                        }
                    </View>
                    {
                        this.state.myFamous && this.state.myFamous.length > 0 &&
                        <View className={['courseFreeselected', this.state.userInfo.lian !== 1 && 'hide']}>
                            <View className='item__left'>
                                <View className='left__main'>名家学堂免费学</View>
                                <View className='left__subhead'>已选两门</View>
                            </View>
                            {
                                this.state.myFamous.map(v =>
                                    <Navigator key={v.id} url={`/pages/knowledge-online-detail?id=${v.id}&famous=1`} >
                                        <Image className='item__img' key={v.id} src={v.cover_img}></Image>
                                    </Navigator>
                                )
                            }
                        </View>
                    }

                    <View className={['banner1', (this.state.userInfo.lian !== 1 ||this.state.userInfo.lian_right < 1) && 'hide']}  onClick={this.sharePop.bind(this, this.state.userInfo.lian_right > 0)}>
                        <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.3/pic_card%402x.png'></Image>
                        <View className='banner1__left'>
                            <Text className='mian__docs'>{this.state.num}张链享体验卡</Text>
                            <Text className='subhead__docs'>还剩{this.state.userInfo.lian_right}张体验卡</Text>
                        </View>
                    </View>

                    <TitleInfo title_mian='优惠券' title__subhead='优惠券与7.5折优惠可以同时使用'></TitleInfo>
                    <ScrollView
                      className='coupon--small--box'
                      scrollX
                      scrollWithAnimation
                      style={{
                            width: "100%",
                            overflow: "auto",
                            boxSizing: "border-box"
                        }}>
                        {
                            this.state.couponListAll && this.state.couponListAll.map(v =>
                                <View className='coupon--small' key={v.id} style={{ backgroundImage: 'url(' + `${this.props.userStore.imgUrl + (v.keep_num < 1 ? 'bg_card_version_off@2x.png' : 'bg_card_s-version2.png')}` + ')' }}>
                                    <View className='coupon__left'>
                                        <View className='money'>¥{v.amount}</View>
                                        <View className='limit'>满{v.suit_amount}可用</View>
                                    </View>
                                    <View className={['coupon__right', v.keep_num < 1 && 'coupon__right--took']} onClick={this.userGetCounpon.bind(this, v.id, v.keep_num > 0)}>{v.keep_num > 0 ? '领取' : '已领取'}</View>
                                </View>
                            )
                        }
                        <Navigator url='/pages/videoVip-coupon?type=free'>
                            <View className='coupon--small__btn-more'>更多</View>
                        </Navigator>
                    </ScrollView>
*/}
                    {this.state.userInfo.lian_type == 3
                        ?
                    <TitleInfo title_mian='热门直播' title__subhead='直播课任意兑换2场'></TitleInfo>
                        :
                    <TitleInfo title_mian='热门直播' title__subhead='直播课任意兑换6场'></TitleInfo>
                        }
                    {
                        !!this.state.aliveList.length && (
                        <View className='hot-alive'>
                            <ScrollView scrollX>
                                <View className='scroll-yuyue-alive'>
                                    {
                                        this.state.aliveList.map(item => (
                                            <View className='yuyue-alive' onClick={this.aliveYuyue.bind( this,item.id,item.status,item.link,item.form )}>
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
                                                {/*
                                                    <View className='img-box__ft'>
                                                        {item.status != 3 && <View className='alive-num'>{item.num} 人已预约</View>}
                                                    </View>
                                                    */}
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

                    {/*在线预归类*/}
                    {this.state.userInfo.lian_type == 3
                        ?
                    <TitleInfo title_mian='在线预归类服务' title__subhead='尊享5次'></TitleInfo>
                        :
                    <TitleInfo title_mian='在线预归类服务' title__subhead='不限次数'></TitleInfo>
                        }
                    <Navigator
                    url='http://devadmin.mylyh.com/weapp/wadvice/advice_vip'
                    className='ll-cells ll-cell--noborder guilei' >
                        <img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_card_gu@2x.png'/>
                    </Navigator>

                    <TitleInfo title_mian='免费专区' title__subhead='畅享精选课程'></TitleInfo>
                    <View className='vipFreeSection'>
                        {this.state.vipFreeCourseList && this.state.vipFreeCourseList.map((item,index) => (
                            <View>
                                {index < 5 &&
                                <Navigator
                                  url={`/pages/knowledge-online-detail?id=${item.id}`}
                                  className='ll-cells ll-cell--noborder media media-padding-top'
                                  key={item.id}
                                >
                                    <View className='ll-cell ll-cell--primary media__bd'>
                                        <View className='ll-cell__hd'>
                                            <Image
                                              className='media__img'
                                              src={
                                                    item.cover_img ||
                                                    "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                                                }
                                            />
                                        </View>
                                        <View className='ll-cell__bd bd__height'>
                                            <View className='media__title ellipsis-2'>{item.name}</View>
                                            <View className='media__small'>{item.us_regist_name + "·" + item.category}</View>
                                            <View className='media__vip'>
                                                <View className='icon-see-list'>
                                                    <Image className='media__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/new_year_festival/icon_see%402x.png'/>
                                                    <text>{item.fake_data}人次</text>
                                                </View>
                                                <View className='media__ft'>
                                                    <View className='price--hot'>¥{item.price || 999}</View>
                                                    <View className='label--freeIcon'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_1%402x.png'/></View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </Navigator>
                                }
                            </View>
                        ))}
                    </View>
                    <Navigator url='/pages/videoVip-vipfree-course'>
                        <View className='btn-more'>查看更多</View>
                    </Navigator>
                     {this.state.userInfo.lian_type != 3 &&(
                     <View>
                        <TitleInfo title_mian='顾问上门一对一' title__subhead='1次,仅限广东'></TitleInfo>
                        <Navigator url='/pages/videoVip-oneByone' className='ll-cells ll-cell--noborder guilei' >
                            <img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_card_go@2x.png'/>
                        </Navigator>
                    </View>
                     )}


                    {/*
                    {
                        this.state.myFamous && this.state.myFamous.length === 0 && this.state.userInfo.lian === 1 &&
                        <View className='courseFreeLearn' style={{ backgroundImage: 'url(' + `${this.props.userStore.imgUrl + 'bg@2x.png'}` + ')' }}>
                            <View className='courseFreeLearn__header'>
                                <TitleInfo title_mian='名家课程免费学' title__subhead='名家课免费学两门'></TitleInfo>
                                <Navigator url='/pages/videoVip-course--select'>
                                    <View className='btn moveSite'>选择课程</View>
                                </Navigator>

                            </View>

                            <Swiper
                              displayMultipleItems={4}
                              className='swiper'
                              current={this.state.current}
                              circular
                            //   skipHiddenItemLayout
                            >
                                {this.state.famousList && this.state.famousList.map(v => {
                                    return (
                                        v.id > 0 ?
                                            <SwiperItem key={v.id}>
                                                <Navigator url={`/pages/knowledge-online-detail?id=${v.id}`} className='swiper-slide'>
                                                    <Image data-id={v.id} className='swiper__img' src={v.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'} />
                                                    <View className='swiper__docs'>
                                                        <View className='docs__name ellipsis-2'>{v.name}</View>
                                                        <View className='docs__label'>{v.chainman + '·' + v.us_regist_name}</View>
                                                    </View>
                                                </Navigator>
                                            </SwiperItem>
                                            :
                                            <SwiperItem key={v.id}>
                                                <Navigator className={['swiper-slide', !v.text && 'lucency']}>
                                                    <Navigator url='/pages/videoVip-course--select'>
                                                        <View data-id={v.id} className='swiper__img--more'>更多</View>
                                                    </Navigator>
                                                </Navigator>
                                            </SwiperItem>
                                    )
                                })}
                            </Swiper>
                        </View>
                    }
                    */}
        {/*

                    <TitleInfo title_mian='线上课程7.5折' title__subhead='所有产品享受7.5折'></TitleInfo>
                    <View className='vipFreeSection'>
                        {this.state.dataList && this.state.dataList.map(item => (
                            <Navigator
                              url={`/pages/knowledge-online-detail?id=${item.id}`}
                              className='ll-cells ll-cell--noborder media'
                              key={item.id}
                            >
                                <View className='ll-cell ll-cell--primary media__bd'>
                                    <View className='ll-cell__hd'>
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
                                        <View className='media__ft'>
                                            <View className='price--hot'>¥{item.price || 999}</View>
                                            <View className='label--freeForVip label--freeForVip--Discount'>会员7.5折</View>
                                        </View>
                                    </View>
                                </View>
                            </Navigator>
                        ))}
                    </View>

                    <Navigator url='/pages/videoVip-freeCourse?type=discount'>
                        <View className='btn-more'>查看更多</View>
                    </Navigator>
                    */}

                {/* 专家服务 */}
                {this.state.userInfo.lian_type == 3
                    ?
                <TitleInfo title_mian='连线专家' title__subhead='3次,20分钟/次'></TitleInfo>
                    :
                <TitleInfo title_mian='连线专家' title__subhead='5次,20分钟/次'></TitleInfo>
                    }
                <View className='section expert'>
                    <View className='tt-cells'>
                        {
                            this.state.expretList && this.state.expretList.map((item,index) => (
                                    <Navigator
                                    key={item.id}
                                    className='tt-cell-box tt-cell-box--half'
                                    url={`/pages/single-detail?id=${item.id}`} >
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
                    <Navigator url='/pages/single-list?type=expert' className='btn-more' style={{ marginTop : '0px' }}>查看更多</Navigator>
                </View>


                {/* 线下学院 */}
                {this.state.userInfo.lian_type !=3 &&(
                <View>
                    <TitleInfo title_mian='线下课程/沙龙' title__subhead='1次，全年有效'></TitleInfo>
                    <View className='section'>
                        {this.state.offline && this.state.offline.map((item,index) => (
                            <View className='media-padding-top'>
                                {index < 3 &&
                                <Navigator
                                url={"/pages/knowledge-offline-detail?id=" +item.id}
                                className='ll-cells ll-cell--noborder media media-offline'
                                key={item.id} >
                                    <View className='ll-cell ll-cell--primary media__bd'>
                                        <View className='ll-cell__hd hdBanner'>
                                            <Image
                                            className='media__img'
                                            src={item.cover_img || "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"}/>
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
                                                <View className='media__price'>
                                                     ¥<Text>{item.price}</Text>
                                                </View>
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
                                }
                            </View>
                        ))}

                        {/* 查看更多 */}
                        <Navigator url='/pages/knowledge-offline-course' className='btn-more'>查看更多</Navigator>
                    </View>
                </View>
                )}

            </View>

                {
                    this.state.couponListAll === null &&
                    <AtActivityIndicator ></AtActivityIndicator>
                }
                <Tabbar></Tabbar>
            <View className="dialog" style={{ display: this.state.show ? 'block' : 'none' }}>
                <View className="header">
                    <View className="title"><label style="margin-left:42px;"></label>续费<text onClick={this.closedialog.bind(this)}>取消</text></View>
                    <View className="img">
                        <Image
                        className='xf__img'
                        src={this.state.userInfo.userinfo.headimgurl}
                        />
                        <View className="xf__name">
                            <text className="nickname">{this.state.userInfo.userinfo.nickname}</text>
                            <text className="time">已开通，{this.state.userInfo.lian_endtime ? this.state.userInfo.lian_endtime.substr(0, 10) : ''}到期</text>
                        </View>
                    </View>
                    <View className="desc">请选择续费的套餐</View>
                    <View className={['list', 1 == this.state.newyears && 'n-display']}>
                            {this.state.list.map((v, k) =>
                                    <View className={['package-view', k == this.state.index && 'active']} onClick={this.choiceVip.bind(this, k)}>
                            <View className="card_name">{v.name}<text>{v.time}</text></View>
                        <View className="card_price">¥<text>{v.price}</text>/{v.unit}</View>
                        {
                            k == 0
                                ?
                        <
                            View
                            className = "card-recommend" > {this.state.newCardActive ? '限时' : '推荐'} < /View>
                        :''
                        }
                    </View>
                    )}
                    </View>
                    <View className="xf-submit" onClick={this.buyVip}>立即续费</View>
                </View>
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
        {this.state.showBox &&
        <View className='getPrize'>
            <View className='ll-cell--noborder content'>
                <View className='prize' onclick={this.enter}>
                    <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/chai.png'></Image>
                </View>
            </View>
            <View className="close-img" onclick={this.closeBox}> <Image src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_close2%402x.png"/></View>
        </View>
         }
        {this.state.showBox1 &&
        <View className='boxEnter'>
            <img className='boxIcon' onClick={this.enter1} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/icon.png'/>
        </View>
            }


        </View >
        )
    }
}

export default Index
