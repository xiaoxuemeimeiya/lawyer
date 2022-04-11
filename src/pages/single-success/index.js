import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Image,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import Title from "../../components/Title"

import "./index.scss"

@Title("会员")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
    config = {
        navigationBarTitleText: "会员"
    };

    constructor() {
        super(...arguments)
    }

    componentDidMount() {
        this.props.userStore.getUserInfoAsync()
    }

    toHome = () => {
        setTimeout(() => {
            window.location.replace(window.location.origin + '/#/pages/videoVip-index')
        }, 100)
    }

    render() {

        return (
            <View className='single-success' >
                <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_suc%402x.png' />
                <View className='text--black'>支付成功</View>
                <View className='onebyone' onClick={this.toHome}>连线专家</View>
            </View>
        )
    }
}

export default Index
