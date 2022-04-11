/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
    View,
    ScrollView,
    Image,
    Navigator,
    Text, Input, Button,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import store from '../../store'
import { throttle } from '../../utils/util'
import Tabbar from "../../components/Tabbar"
import Title from "../../components/Title"
import Share from "@/src/components/Share"
import { decryption } from "../../utils/aes"
import "./index.scss"
import {alive_detail} from "../../api/expert"

const { loginStore } = store

@Title("领取成功")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
    config = {
        navigationBarTitleText: "领取成功"
    };

    constructor() {
        super(...arguments)
        this.state = {
            bottomBtn: false,
            vipPrice: 0,
            count:60,
            show:false,
            liked:true,
            detail:'',
            data:{
                name:'',
                phone:'',
                company:'',
            },
            userInfo: decryption(localStorage.getItem('userInfo')) || {}
        }
    }

    async componentDidMount() {
        this.detail()
        Share({
            wx: {
                title: '链链会员', // 分享标题
                desc: `邀请您购买链链会员，课程享受7.5折，100元专属优惠券等权益！`, // 分享描述
                link: `${window.location.href}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: `${this.props.userStore.imgUrl}share_experience_img.png`, // 分享图标
                success: function () {
                    // 设置成功
                }
            }
        })
    }

    detail = () =>{
        const id = +this.$router.params.id
        alive_detail(id)
            .then(res => {
                this.setState({ detail: res.data })
            }).catch(err => {
            console.log(err)
            Taro.showToast({
                title: err.msg ? err.msg : String(err), //提示的内容,
                icon: 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true, //显示透明蒙层，防止触摸穿透,
            })
        })
    }

    render() {

        return (
            <View className='goddessSuccess' >
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

            <View className='goddessSuccess'>
            <View className='content'>
            <View className='title'>尊敬的会员</View>
            <View className='subTitle'>为了保证体验到您的会员权益,</View>
            <View className='subTitle'>请添加官方客服微信索取<text>直播兑换码</text></View>
            <View className='ercode'>
            <Image className='img' src="https://oss.mylyh.com/miniapp/versionv2.2/pic_kefucode@2x.png" />
            </View>
            <View className='desc'>官方客服</View>
            <Navigator url={`${this.state.detail.link}`}>
            <View className='redirect-alive'>直接进入直播</View>
            </Navigator>
        </View>
        </View>
        </ScrollView>

        {/* 首次加载 */}
        {this.state.isFirstLoding && (
        <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
    </View>
    )
    }
}

export default Index
