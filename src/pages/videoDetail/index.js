import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Image,
    Text,
    ScrollView,
    Slider
} from "@tarojs/components"

import { getOnlineDetail } from "@/src/api/knowledge"
import { likeAndCollect } from "@/src/api/videoHandle"
import { checkReg } from "@/src/utils/login"

import { observer, inject } from '@tarojs/mobx'
import Title from "@/src/components/Title"
import Share from "@/src/components/Share"
import voice from "@/src/components/musicPlayer"

import "./index.scss"

@Share()
@Title("详情")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
    config = {
        navigationBarTitleText: "详情"
    };

    constructor() {
        super(...arguments)
        this.state = {
            schedule: 0,
            courseInfo: null
        }
    }

    componentDidMount() {
        voice.hidePlayer()
        this.getMusicSchedule('once')
        this.getOnlineCourseDetail()
        setTimeout(() => {
            this.setState({ pause: voice.playStatusInfo.paused })
        }, 1000)
        document.querySelector('body').ontouchmove = function (params) {
            if (params.target.className !== 'audio__schedule') {
                params.preventDefault()
            }
        }
    }

    componentWillUnmount() {
        document.querySelector('body').ontouchmove = null
        console.log(voice.playStatusInfo.paused )
        if(voice.playStatusInfo.paused){
            //开启的
            voice.isShowPlayer()
        }
    }

    getOnlineCourseDetail() {
        getOnlineDetail(voice.playStatusInfo.info.id).then(res => {
            this.setState({ courseInfo: res.data })
            sessionStorage.setItem('comment', JSON.stringify(res.data.comment))
        })
    }

    /** 点赞收藏 */
    tolikeAndCollect(type) {
        const { isLogin } = this.props.loginStore
        if (!isLogin) {
            checkReg()
            return
        }
        try {
            /** 是否收藏 或者 是否点赞 */
            const types = {
                collect: 1,
                like: 2,
            }
            /** 是否收藏 或者 是否点赞 */
            const type2 = {
                collect: 'is_collect',
                like: 'is_give',
            }
            /** turn false or ture */
            function turnText(text) {
                const newText = text
                if (newText === false) {
                    return true
                }
                if (newText === true) {
                    return false
                }
            }
            const type4 = {
                like: 'give_count',
                collect: 'collect_count'
            }
            const courseInfo = this.state.courseInfo
            const detail = courseInfo.detail
            detail[type2[type]] = turnText(detail[type2[type]])
            likeAndCollect({ course_id: voice.playStatusInfo.info.id, action: detail[type2[type]], type: types[type] }).then(res => {
                if (res.code === 1) {
                    Taro.showToast({
                        title: `${detail[type2[type]] == 'true' ? (['', '收藏', '点赞'][types[type]]) : (['', '收藏', '点赞'][types[type]])}${detail[type2[type]] ? '成功!' : '取消!'}`, //提示的内容, 
                        icon: 'success', //图标, 
                        duration: 2000, //延迟时间, 
                        mask: true, //显示透明蒙层，防止触摸穿透, 
                    })
                    detail[type2[type]] === true ? detail[type4[type]]++ : detail[type4[type]]--
                    this.setState({ courseInfo: { ...courseInfo } }, () => console.log(this.state.courseInfo, 111))
                }
            })
        } catch (err) { console.log() }
    }

    /** 获取播放进度 */
    getMusicSchedule(times) {
        clearInterval(this.musicSchedule)
        const getTime = () => {
            const { currentTime, remain, schedule } = voice.getScheduleInfo()
            this.setState({
                now: currentTime,
                count: remain,
                schedule: schedule
            })
        }
        this.musicSchedule = setInterval(() => { getTime() }, 1000)
    }

    /** 是否展示播放列表 */
    showList = (type) => {
        const videoDetail__audioList = document.querySelector('.videoDetail__audioList')
        if (type === 'down') {
            videoDetail__audioList.classList.remove('showList')
            return
        }
        videoDetail__audioList.classList.contains('showList') ?
            videoDetail__audioList.classList.remove('showList') :
            videoDetail__audioList.classList.add('showList')
    }

    /** 暂停 */
    pause = () => {
        voice.pauseOrPlay()
        if (voice.playStatusInfo.paused) clearInterval()
        else this.getMusicSchedule()

        this.setState({ pause: voice.playStatusInfo.paused })
    }

    /** 滑动中 */
    onChanging = (onChangeEventDetail) => {
        clearInterval(this.musicSchedule)
    }

    scheduleChange = (onChangeEventDetail) => {
        voice.changeSchedule(onChangeEventDetail.detail.value)
        this.setState({ schedule: onChangeEventDetail.detail.value })
        this.getMusicSchedule()
    }

    toLink(path) {
        Taro.navigateTo({ url: path })
    }

    render() {
        return (
            <View className='videoDetail'>
                <View className='videoDetail__main bg bg-blur'>
                    <Image className='audio__banner' src={voice.playStatusInfo.info.cover_img} />
                    <Image className='audio__blur' src={voice.playStatusInfo.info.cover_img} />
                    <View className='audio__info'>
                        <View className='audio__title ellipsis'>{voice.playStatusInfo.info.name}</View>
                        <View className='audio__author'>{voice.playStatusInfo.info.us_regist_name}</View>
                    </View>
                    <View className='audio__schedule'>
                        <View className='components-page'>
                            <Slider value={this.state.schedule} color='#fff' selectedColor='#fff' activeColor='#fff' onChanging={this.onChanging} onChange={this.scheduleChange} />
                        </View>
                        <View className='audio__schedule__info'>
                            <Text>{this.state.now}</Text>
                            <Text>-{this.state.count}</Text>
                        </View>
                    </View>
                    <View className='audio__control'>
                        <View className={`prev iconfont icon-Lastshangyiqu ${voice.playStatusInfo.index === 0 && 'ban'}`} onClick={() => voice.changeMusicIndex(voice.playStatusInfo.index - 1)}></View>
                        <Image className={`pause ${voice.bufferStatus && 'pause--loading'}`} src={this.props.userStore.imgUrl + ((this.state.pause || voice.playStatusInfo.paused) ? 'icon_pause.png' : 'icon_play.png')} onClick={this.pause} />
                        <View className={`next iconfont icon-Lastshangyiqu ${voice.playStatusInfo.index === voice.playStatusInfo.list.length - 1 && 'ban'}`} onClick={() => voice.changeMusicIndex(voice.playStatusInfo.index + 1)}></View>
                    </View>
                    {
                        this.state.courseInfo &&
                        <View className='audio__handle'>
                            <View className='handle__item'>
                                <View className='handle__icon'>
                                    <Image className='img' src={`${this.props.userStore.imgUrl}icon_share@2x.png`} />
                                </View>
                                <Text>分享</Text>
                            </View>
                            <View className='handle__item' onClick={this.toLink.bind(this, '/pages/single-comment', 'xxx')}>
                                <View className='handle__icon'>
                                    <Image className='img' src={`${this.props.userStore.imgUrl}icon_comment.png`} />
                                </View>
                                <Text>评论·{this.state.courseInfo.comment_num}</Text>
                            </View>
                            <View className='handle__item' onClick={this.tolikeAndCollect.bind(this, 'collect')}>
                                <View className='handle__icon'>
                                    <Image className='img' src={`${this.props.userStore.imgUrl}${this.state.courseInfo.detail.is_collect ? 'icon_collected' : 'icon_collect'}.png`} />
                                </View>
                                <Text>收藏·{this.state.courseInfo.detail.collect_count}</Text>
                            </View>
                            <View className='handle__item' onClick={this.tolikeAndCollect.bind(this, 'like')}>
                                <View className='handle__icon'>
                                    <Image className='img' src={`${this.props.userStore.imgUrl}${this.state.courseInfo.detail.is_give ? 'icon_liked' : 'icon_like'}.png`} />
                                </View>
                                <Text>点赞·{this.state.courseInfo.detail.give_count}</Text>
                            </View>
                        </View>
                    }
                </View>
                <View className='videoDetail__audioList'>
            {/*
                    <View className='list__top' onTouchEnd={this.showList}></View>
                    <View className='list__title' onTouchEnd={this.showList}>
                    */}
                    <View className='list__top' onClick={this.showList}></View>
                    <View className='list__title' onClick={this.showList}>
                        <View className='list__title__name'>播放列表</View>
                    </View>
        {/*
                    <View className='list__content' onTouchEnd={this.showList.bind(this, 'down')}>
                    */}
                    <View className='list__content' onClick={this.showList.bind(this, 'down')}>
                        {voice.playStatusInfo.list.map((item, index) => (
                            <View className={voice.playStatusInfo.index === index && this.state.pause ? 'll-cell active' : 'll-cell'} key={item} onClick={() => voice.changeMusicIndex(index)}>
                                <View className='ll-cell__hd course-catalog__hd'>
                                    {index + 1}
                                </View>
                                <View className='ll-cell__bd course-catalog__bd ellipsis-2'>
                                    {item.course_per}
                                </View>
                                <View className='ll-cell__ft'>
                                    {
                                        index === voice.playStatusInfo.index && voice.playStatusInfo.paused ?
                                            <Image className='musicPlaying' src={`${this.props.userStore.imgUrl}musicPlaying-red.gif`} />
                                            : <View className={`icon iconfont icon-bofang1 ${index === voice.playStatusInfo.index && 'red'}`}></View>
                                    }
                                    {/* <View className={`${index === voice.playStatusInfo.index ? 'iconfont icon-ziyuanldpi' : 'icon icon-play-lists'}`}></View> */}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View >
        )
    }
}

export default Index
