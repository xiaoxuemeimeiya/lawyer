import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Image,
    Navigator,
    ScrollView
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import { onScrollToLower } from "../../utils/scroll"
import Title from "../../components/Title"
import * as knowledgeApi from './../../api/knowledge'
import * as videoVipApi from './../../api/videoVip'

import "./index.scss"

@Title("选择课程")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
    config = {
        navigationBarTitleText: "选择课程"
    };

    constructor() {
        super(...arguments)
        this.state = {
            famousList: null,
            selectedData: [],
            page: 1
        }
    }

    componentDidMount() {
        this.getData()
    }

    getData() {
        if (this.state.page === 'full') return
        knowledgeApi.getFamous(this.state.page++).then(res => {
            if (res.data.length < 15) this.setState({ page: 'full' })
            // 除去掉get === 1 已购买的
            res.data = res.data.filter(v => v.get !== 1)
            const oldData = this.state.famousList || []
            this.setState({ famousList: [...oldData, ...res.data] })
        })
    }

    chooseCourse = (id) => {
        const famousList = this.state.famousList
        const selectedData = this.state.selectedData
        famousList.find(v => {
            if (v.id === id) {
                if (!v.choose) {
                    if (selectedData.length > 1) {
                        Taro.showToast({
                            title: '最多只能选择两门',
                            icon: 'none', //图标,
                            duration: 2000, //延迟时间,
                            mask: true //显示透明蒙层，防止触摸穿透,
                        })
                        return
                    }
                }
                v.choose = !v.choose
                v.choose ? selectedData.push(v) : this.delectSelectData(id)
            }
        })

        this.setState({ famousList: famousList })
    }

    /** 删除已选的课程 */
    delectSelectData = (id) => {
        const data = this.state.selectedData
        const handledData = data.filter(v => v.id !== id)
        this.setState({ selectedData: handledData })
    }

    /** 提交选择 */
    submitSelect = () => {
        const data = this.state.selectedData
        if (data.length !== 2) {
            Taro.showToast({
                title: '请选择两门课程',
                icon: 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
            return
        }
        Taro.showLoading({ mask: true })
        const param = data.map(v => v.id)
        videoVipApi.get_FamousCourse({ course_id: param }).then(res => {
            Taro.showToast({
                title: '领取成功',
                icon: 'success', //图标,
                duration: 1000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
            setTimeout(async () => {
                await this.props.userStore.getUserInfoAsync()
                window.location.replace(`${window.location.origin}/#/pages/videoVip-index`)
            }, 1000)
        }).catch(err => {
            Taro.showToast({
                title: err.data.msg,
                icon: 'none', //图标,
                duration: 1000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
        })
    }


    render() {

        return (
            <View className='videoVip videoVip-course--select' >
                {
                    this.state.famousList === null && <AtActivityIndicator content='加载中...'></AtActivityIndicator>
                }
                <ScrollView
                  className='scrollview'
                  scrollY
                  scrollWithAnimation
                  style={{ boxSizing: 'border-box', flex: 1, backgroundColor: '#f0f1f4' }}
                  onScrollToLower={onScrollToLower.bind(this)} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
                >
                    {
                        this.state.famousList && this.state.famousList.map(item => (
                            <Navigator
                              key={item.id}
                              className='ll-cells ll-cell--noborder media school'
                            >
                                <View className='ll-cell ll-cell--primary media__bd' onClick={this.chooseCourse.bind(this, item.id)}>
                                    <View className='ll-cell__hd' style={{ margin: 'auto' }}>
                                        <Image className='switch' src={this.props.userStore.imgUrl + (item.choose ? 'radio_on.png' : 'radio_off.png')} />
                                    </View>
                                    <View className='ll-cell__hd'>
                                        <Image
                                          className='media__img'
                                          src={item.index_img || item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                                        />
                                    </View>
                                    <View className='ll-cell__bd'>
                                        <View className='media__title ellipsis-2'>{item.name}</View>
                                        <View className='media__small'>{item.us_regist_name + '·' + item.chainman}</View>
                                        <View className='school__ft'>
                                            <View className='label--freeForVip'>会员免费</View>
                                            <View className='price'>¥{item.price}</View>
                                        </View>
                                    </View>
                                </View>
                            </Navigator>
                        ))
                    }
                    <View style={{ height: '20px' }}></View>
                </ScrollView>
                <View className='footer'>
                    <View className='footer__selectSum'>
                        <View className='label'>已选</View>
                        <View className='selectSum__sum'>{this.state.selectedData.length === 2 ? '选好2门' : `还差${2 - this.state.selectedData.length}门`}
                        </View>
                    </View>
                    <Image onClick={this.chooseCourse.bind(this, this.state.selectedData[0] && this.state.selectedData[0].id)} className={['footer__slelctCourse', this.state.selectedData[0] ? 'delectIcon' : 'back']} src={this.state.selectedData[0] ? this.state.selectedData[0].cover_img : ''}></Image>
                    <Image onClick={this.chooseCourse.bind(this, this.state.selectedData[1] && this.state.selectedData[1].id)} className={['footer__slelctCourse', this.state.selectedData[1] ? 'delectIcon' : 'back']} src={this.state.selectedData[1] ? this.state.selectedData[1].cover_img : ''}></Image>
                    <View className='ll-cell__bd'></View>
                    <View className='footer__btn' onClick={this.submitSelect}>确定</View>
                </View>
            </View>
        )
    }
}

export default Index
