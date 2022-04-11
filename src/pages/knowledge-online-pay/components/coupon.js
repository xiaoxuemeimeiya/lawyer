import Taro, { Component } from "@tarojs/taro"
import { View, Image } from "@tarojs/components"
import { inject } from '@tarojs/mobx'


@inject('userStore')
class Index extends Component {

    constructor(props) {
        super(props)
        this.state = {
            list: props.couponList,
        }
    }

    // componentDidMount() {
    //     const list = this.props.couponList || []
    //     this.setState({
    //         list
    //     })
    // }

    choose(id, allow) {
        if (!allow) return
        const list = this.state.list
        list.map(v => {
            v.choose = false
        })
        list.find(v => {
            if (v.id === id) {
                v.choose = true
            }
        })
        this.setState({
            list
        })
    }

    submit = () => {
        this.props.couponShowHandle.bind(this, false, this.state.list)
    }

    render() {
        return (
            <View className={['couponDialog', !this.props.couponShow ? 'out' : 'in']}>
                <View className={['coupon']}>
                    <View className='header'>
                        <View className='title'>优惠券</View>
                        <View className='cancel' onClick={this.props.couponShowHandle.bind(this, false)}>取消</View>
                    </View>
                    <View className='main'>
                        <View className='mainScroll'>
                            {this.state.list && this.state.list.map((v, k) =>
                                <View key={Math.random()} className='main__couponItem' onClick={this.choose.bind(this, v.id, v.limit < this.props.total_fee)}>
                                    <Image className='coupon__background' src={this.props.userStore.imgUrl + (v.limit < this.props.total_fee ? 'bg_tik_nor.png' : 'bg_tik_dis.png')} />
                                    <View className='money'>¥{v.money}</View>
                                    <View className='coupon__docs'>
                                        <View className='docs__mian'>{v.docs}</View>
                                        <View className='docs__subhead'>满{v.limit}元使用</View>
                                    </View>
                                    <Image className='switch' src={this.props.userStore.imgUrl + (v.choose ? 'radio_on.png' : 'radio_off.png')} />
                                </View>
                            )}
                        </View>
                    </View>
                    <View onClick={this.submit} className='btn'>确定</View>
                </View>
            </View>
        )
    }
}

export default Index
