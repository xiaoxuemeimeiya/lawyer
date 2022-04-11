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
            <View className='videoVip videoVipBuy-success' >
                <Image className='img' src={this.props.userStore.imgUrl + 'icon_id@2x.png'} />
                <View className='text--black'>恭喜您，成为链链会员</View>
                <View className='btn--black' onClick={this.toHome}>开启会员体验之旅</View>
            </View>
        )
    }
}

export default Index
