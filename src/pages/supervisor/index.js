import Taro, { Component } from "@tarojs/taro"
import { View, ScrollView, Image, Navigator, Textarea,Input,Button } from "@tarojs/components"

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
            <View>发布需求</View>
            <View className="ll-cells ll-cell--noborder">
                <View className="ll-cell">
                    <View className="ll-cell__bd">
                        <View className="demand-title color-black">平台为您定制服务</View>
                    </View>
                </View>
                <View className="ll-cell ll-cell--noborder demand-input demand-textarea">
                    <Textarea
                    bindblur="handleInput"
                    bindinput="handleInput"
                    data-inputkey="content"
                    value="{{content}}"
                    className="ll-input"
                    placeholder="需求描述"
                    maxlength="500"
                    />
                </View>
                <View className="ll-cell ll-cell--noborder demand-input">
                    <View className="ll-cell__hd">
                        <View className="demand-input__label">手机号码</View>
                    </View>
                    <View className="ll-cell__bd">
                        <Input
                        bindblur="handleInput"
                        bindinput="handleInput"
                        data-inputkey="phone"
                        value="{{phone}}"
                        type="number"
                        className="ll-input"
                        placeholder="请输入您的手机号" />
                    </View>
                </View>
                <View wx:if="{{showCode}}" className="ll-cell ll-cell--noborder demand-input">
                    <View className="ll-cell__hd">
                        <View className="demand-input__label">验证码</View>
                    </View>
                    <View className="ll-cell__bd">
                        <Input
                        bindblur="handleInput"
                        bindinput="handleInput"
                        data-inputkey="code"
                        value="{{code}}"
                        type="text"
                        className="ll-input"
                        placeholder="请输入验证码" />
                    </View>
                    <View className="ll-cell__ft">
                        <Button disabled="disable" className="code-tip color-primary" onClick={this.getCode}>'tip'</Button>
                    </View>
                </View>
                <View className="ll-cell ll-cell--noborder">
                    <View className="ll-cell__bd">
                        <Button className="btn btn-primary--large btn-sure" onClick={this.submit}>
                        马上发布
                        </Button>
                        <View className="color-small">链英汇执行秘书24小时内与您联系。</View>
                    </View>
                </View>
            </View>
        </View>)}
}

export default Index
