import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Image,
    Text,
    Input, Navigator, Button
} from "@tarojs/components"

import { getExpretDetail, getSevice_calling } from "@/src/api/expert"

import { observer, inject } from '@tarojs/mobx'
import Title from "@/src/components/Title"
import Share from "@/src/components/Share"
import Gzh from "../../components/Gzh"

import { handleInput, HttpException } from '@/src/utils/util'

import "./index.scss"
import {setCookie} from "../../utils/storage"
import {decryption} from "../../utils/aes"

@Title("详情")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
    config = {
        navigationBarTitleText: "详情"
    };

    constructor() {
        super(...arguments)
        this.state = {
            img: null,
            /** 信息弹窗 */
            show: false,
            form: {},
            coverUser:false,
            total:0,
            num:0,
            close:false,
            methodType:false,
            wechat:false,
            userInfo: decryption(localStorage.getItem('userInfo')) || {}
        }
    }

    componentDidMount() {
        Taro.showLoading({ mask: true })
        const id = this.$router.params.id
        getExpretDetail({ id }).then(res => {
            this.setState({ img: res.data.desc_img ,total:res.total,num:res.count})
            /** 个性化分享 */
            Share({
                wx: {
                    title: res.data.title, // 分享标题
                    desc: '20年+资深顾问，助力贸易合规管理', // 分享描述
                    link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: "http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.2/expert_shair_logo.png", // 分享图标
                    success: function () {
                        // 设置成功
                        console.log('ok~~')
                    }
                }
            })
        })
    }

    // 拨打客服电话
    pupopHandle = (e) => {
        e.stopPropagation()
        this.setState(prevState => ({ show: !prevState.show }))
    }

    pupopHandle1 = (e) => {
        e.stopPropagation()
        //this.setState(prevState => ({ show: !prevState.show }))
        this.setState({methodType:true})
    }
    methodCancel = () => {
        this.setState({methodType:false})
    }
    wechatCancel = () => {
        this.setState({wechat:false})
    }
    //拨打手机
    phone = (e) => {
        e.stopPropagation()
        if (this.state.userInfo.lian && (this.state.total > this.state.num)) {
            this.setState({close: false})
            this.setState({ show: true})
        } else {
            this.setState({close: true})
            this.setState(prevState => ({ show: false }))
        }
    }

    //拨打微信
    wechat = (e) => {
        e.stopPropagation()
        if (this.state.userInfo.lian && (this.state.total > this.state.num)) {
            this.setState({wechat:true})
        } else {
            this.setState({close: true,wechat:false})
        }
    }

    xiazaiclose = () => {
        this.setState({ close: false})
    }
    stopxiazaiclose = (e) => {
        e.stopPropagation()
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
        if(this.state.userInfo.lian && (this.state.total <= this.state.num)){
            Taro.showToast({
                title: '您的套餐次数已用完',
                icon: 'none', //图标,
                duration: 1500, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
            return false
        }else if(this.state.num == 1){
            Taro.showToast({
                title: '您的体验次数已用完',
                icon: 'none', //图标,
                duration: 1500, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
            return false
        }
        const from = this.state.form
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
            Taro.showLoading({ mask: true })
            getSevice_calling(Object.assign(this.state.form, { id: this.$router.params.id })).then(res => {
                //console.log(res.data);return
                Taro.makePhoneCall({
                    phoneNumber: res.data
                })
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
    // 拨打客服电话

    customerService = () => {
        Taro.makePhoneCall({
            //phoneNumber: "18664503307" //仅为示例，并非真实的电话号码
            phoneNumber: "13632288343" //仅为示例，并非真实的电话号码
        })
    }

    // 分享
    share = () => {
        //setCookie("HIDE_SHARE_TIP", true)
        //Taro.navigateTo({ url: `/pages/knowledge-share?type=on&id=${this.state.id}` })
        Taro.showModal({
            title: "提示",
            showCancel: false, //是否显示取消按钮,
            confirmColor: "#D62419", //确定按钮的文字颜色,
            content: "请点击页面右上角复制链接分享"
        })
    }

    coverUser = () => {
        this.setState({show:false})
    }

    showBottom = () =>{
        this.setState({show:true})
    }
    render() {
        let buttonTip1 = ''
        let buttonTip1show = false
        let big = false
        const buttonTip = (() => {
            /*
            if ((this.state.userInfo.isClubVIP || this.state.userInfo.lian || this.state.userInfo.isVIP)) {
                return '会员免费学'
            } else {
                return '￥199立即购买'
            }
            */
            if (this.state.userInfo.lian && (this.state.total > this.state.num)) {
                big = true
                return '会员免费'
            } else {
                //return '￥199立即购买'
                buttonTip1 = '免费体验一次'
                buttonTip1show = true
                return '会员免费'
            }
        })()

        return (
            <View className='single-detail page'>
                <View className='content--box'>
                    <Image className='fullImg' src={this.state.img}></Image>
                </View>
                <View className={['pupop-box', !this.state.show && 'hide']}>
                    <View className={['pupopBack']} >
                    </View>
                    <View className='pupop'>
                        <Image className='closeIcon' onClick={this.pupopHandle} src={this.props.userStore.imgUrl + 'icon_close@2x.png'} />
                        <View className='pupop_title'>
                            <View className='title_text'>为了带给您更好的服务</View>
                            <View className='title_text'>请先完善资料</View>
                            <Image className='title_icon1' src={this.props.userStore.imgUrl + 'circle.png'} />
                            <Image className='title_icon2' src={this.props.userStore.imgUrl + 'circle.png'} />
                        </View>
                        <View className='form'>
                            <View className='formItem'>
                                <View className='input-box'>
                                    <Input data-lable='name' value={this.state.form.name} onChange={handleInput.bind(this, "form.name")} placeholder='怎么称呼您' />
                                </View>
                            </View>
                            <View className='formItem'>
                                <View className='input-box'>
                                    <Input type='tel' data-lable='phone' value={this.state.form.phone} onChange={handleInput.bind(this, "form.phone")} placeholder='手机号码' />
                                </View>
                            </View>
                            <View className='formItem'>
                                <View className='input-box'>
                                    <Input data-lable='company' value={this.state.form.company} onChange={handleInput.bind(this, "form.company")} placeholder='您所在的公司' />
                                </View>
                            </View>
                        </View>
                        <View className='button unique' onClick={this.service}>提交并拨打电话</View>
                    </View>
                </View>
        {/* 底部栏 */}
                <View className='ll-cells ll-cell--noborder bottom'>
                    <View className='ll-cell bottom__bd'>
                        <Navigator url='/' >
                            <View className='ll-cell__hd'>
                                <Button className='btn bottom__btn'>
                                    <View className='icon icon-index1'></View>
                                    <View className='bottom-btn__text'>首页</View>
                                </Button>
                            </View>
                        </Navigator>
                    <View className='ll-cell__hd'>
                        <Button className='btn bottom__btn' onClick={this.share}>
                            <View className='icon icon-share1'></View>
                            <View className='bottom-btn__text'>分享</View>
                        </Button>
                    </View>
                    <View className='ll-cell__hd'>
                    <Button className='btn bottom__btn'onClick={this.customerService} >
                        <View className='icon icon-kefu1'></View>
                        <View className='bottom-btn__text'>平台客服</View>
                    </Button>
                </View>
                {buttonTip1 &&
                <View className='ll-cell__bd'>
                    <Button className='btn btn-primary--large btn-learn-now' onClick={this.pupopHandle} >
                    {
                        buttonTip1
                    }
                    </Button>
                </View>
                }

                <View className='ll-cell__bd'>
                    {big
                        ?
                    <Button className='btn btn-primary--large btn-learn-free btn-learn-big' onClick={this.pupopHandle1} >
                    {
                        buttonTip
                    }
                    <text>连线3次</text>
                    </Button>
                    :
                    <Button className='btn btn-primary--large btn-learn-free' onClick={this.pupopHandle1} >
                        {
                            buttonTip
                        }
                        <text>连线3次</text>
                    </Button>
                    }
                </View>
            </View>
        </View>
        <View className={['select-method',!this.state.methodType && 'n-display']}>
            <View className='select-method-content'>
                <View className='title'>请选择联系方式</View>
                <View className='method'>
                    <View className='method-type'onClick={this.phone}>
                        <View className='icon icon-phone'></View>
                        <View className='text'>电话联系</View>
                    </View>
                    <View className='method-type'onClick={this.wechat}>
                        <View className='icon icon-wechat'></View>
                        <View className='text'>微信联系</View>
                    </View>
                </View>
                <View className='cancel' onClick={this.methodCancel}>取消</View>
            </View>
        </View>
        <View className={['select-wechat',!this.state.wechat && 'n-display']}>
            <View className='select-method-content'>
                <Image className='wechat-add' src='https://oss.mylyh.com/miniapp/versionv2.2/pic_kefucode@2x.png' />
                <View className='title'>长按识别添加</View>
                <View className='cancel' onClick={this.wechatCancel}>取消</View>
            </View>
        </View>

        <View className={['xiazai',this.state.close && 'display']} onClick={this.xiazaiclose}>
            <View className='xiazai-content' onClick={(e)=>this.stopxiazaiclose(e)}>
                <View className='xiazai-rights'>开通会员即可体验此权益</View>
                <View className='xiazai-submit' onClick={this.openvip}>立即开通</View>
            </View>
        </View>
        <Gzh></Gzh>
        {/*
         <View className={['cover-user',!this.state.coverUser && 'n-display']}>
            <View className='content'>
                <View className='content-form'>
                    <View className='cover-user-banner'>
                        <View className='title-img1'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/img1.png'/></View>
                        <View className='cancel' onClick={this.coverUser}><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_close%402x.png'/></View>
                        <View className='title'>为了带给您更好的服务请先完善资料</View>
                        <View className='title-img2'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/img1.png'/></View>
                    </View>
                    <View className='ll-cells ll-cell--noborder buySubmit-phone'>
                        <View className='ll-cell content__bd'>
                            <Input
                            className='ll-input'
                            type='text'
                            onChange={handleInput.bind(this, "data.name")}
                            placeholder='怎么称呼您'
                            ></Input>
                        </View>
                        <View className='ll-cell ll-cell--noborder content__bd'>
                            <Input
                            className='ll-input'
                            type='text'
                            onChange={handleInput.bind(this, "data.phone")}
                            placeholder='手机号码'
                            ></Input>
                        </View>
                        <View className='ll-cell ll-cell--noborder content__bd'>
                            <Input
                            className='ll-input'
                            type='text'
                            onChange={handleInput.bind(this, "data.company")}
                            placeholder='您所在的公司'
                            ></Input>
                        </View>
                        <View className='onebyone-submit'>支付¥xx并拨打电话</View>
                    </View>
                </View>
            </View>
         </View>
         */}
     </View>


        )
    }
}

export default Index
