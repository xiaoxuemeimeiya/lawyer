import Taro, { Component } from "@tarojs/taro"
import { View, ScrollView, Image, Navigator, Text } from "@tarojs/components"

import { AtActivityIndicator } from "taro-ui"
import {getFamous, getOnline} from "../../api/knowledge"
import {member_reccommend} from "../../api/videoVip"
import { onScrollToLower } from "../../utils/scroll"
import ScrollEnd from "../../components/ScrollEnd"
import Share from "../../components/Share"
import Title from "../../components/Title"
// import Login from "../../components/Login"

import "./index.scss"

@Share()
@Title("关税保证保险")
class Index extends Component {
    config = {
        navigationBarTitleText: "关税保证保险"
    }

    constructor() {
        super(...arguments)
        this.state = {

        }
    }

    render() {
        return (
        <View className='New_year_festival_sipervisor'>
            {/* media */}
            <View className='New_year_festival__top'>
                <Image className='top__background' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/new_year_festival/1@2x.png'></Image>
                <Image className='top__background' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/new_year_festival/2@2x.png'></Image>
                <Image className='top__background' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/new_year_festival/3@2x.png'></Image>
            </View>
    </View>)}
}

export default Index
