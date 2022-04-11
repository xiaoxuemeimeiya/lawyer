import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Image,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import Title from "../../components/Title"

import "./index.scss"

@Title("预约成功")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
    config = {
        navigationBarTitleText: "预约成功"
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
            <View className='yuyue-warn' >
                <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_suc%402x.png' />
                <View className='text--black'>预约成功</View>
                <View className='onebyone'>我们会在开播前提醒您</View>
                <View className='onebyone'>3s后跳转到直播间</View>
            </View>
        )
    }
}

export default Index
