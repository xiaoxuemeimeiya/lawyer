import Taro, { Component, useEffect, useLayoutEffect, useReducer, useState, useContext, useRef, useCallback, useMemo } from "@tarojs/taro"
import {
    View,
    Image,
    Text,
    Navigator
} from "@tarojs/components"
import { observer, inject } from '@tarojs/mobx'
import { AtTabs, AtTabsPane, AtActivityIndicator } from 'taro-ui'
import { decryption } from "../../utils/aes"
import Title from "../../components/Title"
import * as videoVipApi from './../../api/videoVip'
import "./index.scss"

// const imgUrl = 'http://192.168.8.95:5500/src/assets/images/'

@Title("优惠券")
@observer
@inject('loginStore', 'userStore')
class Index extends Component {
    constructor() {
        super(...arguments)
        this.state = {
            current: 0,
            couponListAll: null,
            couponListMine: [],
            userInfo: decryption(localStorage.getItem('userInfo')) || {}
        }
    }

    componentDidMount() {
        this.getConponData()
    }

    userGetCounpon = (id) => {
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

    getConponData() {
        videoVipApi.couponList().then(res => {
            if (res.code === 1) {
                this.setState({ couponListAll: res.data })
            }
        })
        videoVipApi.usercouponList().then(res => {
            if (res.code === 1) {
                // 过滤 状态正常的券
                res.data = res.data.filter(v => v.status === 1)
                this.setState({ couponListMine: res.data })
            }
        })
    }

    handleClick(value) {
        this.setState({
            current: value
        })
    }


    render() {
        return (
            <View className='videoVip videoVipBuy-coupon' >
                <View className='header'>
                    <Image className='header__background' src={this.props.userStore.imgUrl + 'pic_con@2x.png'} />
                    <View className='header__title'>优惠券中心</View>
                    <View className='header__subhead'>优惠券属于会员专享权益，需要开通会员才能领取</View>
                </View>
                <AtTabs
                  current={this.state.current}
                  className='videoVip__tabs'
                  scroll
                  swipeable
                  tabList={[
                        { title: '优惠券' },
                        { title: '已领取' },
                    ]}
                  onClick={this.handleClick.bind(this)}
                >
                    <AtTabsPane current={this.state.current} index={0}>
                        {
                            this.state.couponListAll === null && <AtActivityIndicator></AtActivityIndicator>
                        }
                        {
                            this.state.userInfo && this.state.userInfo.lian === 0 &&
                            <Navigator url='/pages/videoVip-buy' className='box-center'>
                                <Image className='videoCardBanner' src={this.props.userStore.imgUrl + 'videoCardBanner.png'} />
                            </Navigator>
                        }
                        <View className='couponList'>
                            {this.state.couponListAll && this.state.couponListAll.map(v =>
                                <View key={v.id} className='main__couponItem'>
                                    <Image className='coupon__background' src={this.props.userStore.imgUrl + 'bg_tik_nor.png'} />
                                    <View className='money'>
                                        <Text className='money__main'>¥{v.amount}</Text>
                                        <Text className='small'>满{v.suit_amount}元使用</Text>
                                    </View>
                                    <View className='coupon__docs'>
                                        <View className='docs__mian'>用于线上课程</View>
                                        <View className='docs__subhead'>每月更新，{v.keep_num}张</View>
                                    </View>
                                    {v.keep_num > 0 ?
                                        <View className='btn' onClick={this.userGetCounpon.bind(this, v.id)}>领取</View>
                                        :
                                        <Image className='coupon--took' src={this.props.userStore.imgUrl + 'coupon--took.png'} />
                                    }
                                </View>
                            )}
                        </View>
                    </AtTabsPane>
                    <AtTabsPane current={this.state.current} index={1}>
                        <View className={['couponNone', this.state.couponListMine.length != 0 && 'hide']}>
                            <Image className='none__img' src={this.props.userStore.imgUrl + 'icon_collectionnone.png'} />
                            <View className='none__text'>您还没有优惠券</View>
                        </View>
                        <View className={['couponList', this.state.couponListMine.length === 0 && 'hide']}>
                            {this.state.couponListMine && this.state.couponListMine.map(v =>
                                <View key={v.id} className='main__couponItem'>
                                    <Image className='coupon__background' src={this.props.userStore.imgUrl + 'bg_tik_nor.png'} />
                                    <View className='money'>
                                        <Text className='money__main'>¥{v.amount}</Text>
                                        <Text className='small'>满{v.suit_amount}元使用</Text>
                                    </View>
                                    <View className='coupon__docs'>
                                        <View className='docs__mian'>用于线上课程</View>
                                        <View className='docs__subhead'>每月更新</View>
                                    </View>
                                    <View className='btn'>使用</View>
                                </View>
                            )}

                        </View>
                    </AtTabsPane>
                </AtTabs>
            </View >
        )
    }
}


// function Index() {
//     // 声明一个新的叫做 “count” 的 state 变量
//     const [current, setCurrent] = useState(0)
//     const [couponListAll, setCouponListAll] = useState(null)
//     const [couponListMine, setCouponListMine] = useState([])

//     const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')))

//     function userGetCounpon(id) {
//         if (!userInfo.lian) {
//             Taro.showToast({
//                 title: '您还没有开通会员',
//                 icon: 'none', //图标,
//                 duration: 2000, //延迟时间,
//                 mask: true //显示透明蒙层，防止触摸穿透,
//             })
//             return
//         }
//         Taro.showLoading({ mask: true })
//         videoVipApi.get_coupon({ id }).then(res => {
//             Taro.hideLoading()
//             Taro.showToast({
//                 title: res.msg,
//                 icon: res.code === 1 ? "success" : 'none', //图标,
//                 duration: 2000, //延迟时间,
//                 mask: true //显示透明蒙层，防止触摸穿透,
//             })
//             if (res.code === 1) getConponData()
//         })
//     }


//     function getConponData() {
//         videoVipApi.couponList().then(res => {
//             if (res.code === 1) {
//                 // this.setState({ couponListAll: res.data })
//                 setCouponListAll(res.data)
//             }
//         })
//         videoVipApi.usercouponList().then(res => {
//             if (res.code === 1) {
//                 // this.setState({ couponListMine: res.data })
//                 setCouponListMine(res.data)
//             }
//         })
//     }

//     /** 获取数据 */
//     useEffect(getConponData, [])


//     return (
//         <View className='videoVip videoVipBuy-coupon' >
//             <View className='header'>
//                 <Image className='header__background' src={imgUrl + 'pic_con@2x.png'} />
//                 <View className='header__title'>优惠券中心</View>
//                 <View className='header__subhead'>优惠券属于会员专享权益，需要开通会员才能领取</View>
//             </View>
//             <AtTabs
//               current={current}
//               className='videoVip__tabs'
//               scroll
//               swipeable
//               tabList={[
//                     { title: '优惠券' },
//                     { title: '已领取' },
//                 ]}
//               onClick={setCurrent}
//             >
//                 <AtTabsPane current={current} index={0}>
//                     {
//                         couponListAll === null && <AtActivityIndicator></AtActivityIndicator>
//                     }
//                     <View className='box-center'>
//                         <Image className='videoCardBanner' src={imgUrl + 'videoCardBanner.png'} />
//                     </View>
//                     <View className='couponList'>
//                         {couponListAll && couponListAll.map(v =>
//                             <View key={v.id} className='main__couponItem'>
//                                 <Image className='coupon__background' src={imgUrl + 'bg_tik_nor.png'} />
//                                 <View className='money'>
//                                     <Text className='money__main'>¥{v.amount}</Text>
//                                     <Text className='small'>满{v.suit_amount}元使用</Text>
//                                 </View>
//                                 <View className='coupon__docs'>
//                                     <View className='docs__mian'>用于线上课程</View>
//                                     <View className='docs__subhead'>每月更新，{v.keep_num}张</View>
//                                 </View>
//                                 {v.keep_num > 0 ?
//                                     <View className='btn' onClick={() => userGetCounpon(v.id)}>领取</View>
//                                     :
//                                     <Image className='coupon--took' src={imgUrl + 'coupon--took.png'} />
//                                 }
//                             </View>
//                         )}
//                     </View>
//                 </AtTabsPane>
//                 <AtTabsPane current={current} index={1}>
//                     <View className={['couponNone', couponListMine.length != 0 && 'hide']}>
//                         <Image className='none__img' src={imgUrl + 'icon_collectionnone.png'} />
//                         <View className='none__text'>您还没有优惠券</View>
//                     </View>
//                     <View className={['couponList', couponListMine.length === 0 && 'hide']} style={{ paddingTop: '20px' }}>
//                         {couponListMine && couponListMine.map(v =>
//                             <View key={v.id} className='main__couponItem'>
//                                 <Image className='coupon__background' src={imgUrl + 'bg_tik_nor.png'} />
//                                 <View className='money'>
//                                     <Text className='money__main'>¥{v.amount}</Text>
//                                     <Text className='small'>满{v.suit_amount}元使用</Text>
//                                 </View>
//                                 <View className='coupon__docs'>
//                                     <View className='docs__mian'>用于线上课程</View>
//                                     <View className='docs__subhead'>每月更新</View>
//                                 </View>
//                                 <View className='btn'>使用</View>
//                             </View>
//                         )}

//                     </View>
//                 </AtTabsPane>
//             </AtTabs>
//         </View>
//     )

// }

export default Index
