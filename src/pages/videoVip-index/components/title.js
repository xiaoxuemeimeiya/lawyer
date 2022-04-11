import Taro, { Component } from "@tarojs/taro"
import {
    View,
    ScrollView,
    Button,
    Image,
    Navigator,
    Text,
} from "@tarojs/components"
import { observer, inject } from '@tarojs/mobx'
import "./../index.scss"

@inject('loginStore', 'userStore')
class Index extends Component {
    render() {
        return (
            <View className='title_xzv'>
                <View className='title__main'>
                    <Text className='text'>{this.props.title_mian}</Text>
                </View>
                <View className='title__subhead'>
                    {this.props.title__subhead}
                </View>
            </View>
        )
    }
}

export default Index
