import Taro, { Component } from '@tarojs/taro'
import {
    View,
} from "@tarojs/components"

import { throttle } from "@/src/utils/util"

function timeToMs(time) {
    let times = Math.ceil(time)
    let m = Math.floor(times / 60) | '0'
    let s = Math.floor(times % 60) | '0'
    m = String(m)
    s = String(s)
    m.length === 1 && (m = '0' + m)
    s.length === 1 && (s = '0' + s)
    return (m + ':' + s)
}

// @inject('loginStore', 'userStore')

class Voice {
    constructor() {
        this.musicPlayer = document.getElementById('musicPlayer')
        this.main__background = document.querySelector('.musicPlayer .main__background')
        this.music = document.getElementById('music')
        this.main__control = document.querySelector('.main__control')
        this.main__musicInfo = document.querySelector('.main__musicInfo')
        this.main__catalog = document.querySelector('.main__catalog')
        this.main__musicInfo__name = document.querySelector('.main__musicInfo__name')
        this.pauseIcon = document.querySelector('.pause')
        this.main__control__background = document.querySelector('.main__control__background')
        this.main__musicInfo__schedule__now = document.querySelector('.main__musicInfo__schedule .now')
        this.main__musicInfo__schedule__count = document.querySelector('.main__musicInfo__schedule .count')
        this.main__open = document.querySelector('.main__open')
        this.main__colse = document.querySelector('.main__colse')
        this.playStatus = JSON.parse(localStorage.getItem('playStatus')) || { index: 0, when: 0 }
        this.buffering = false
        this.top = 0
        this.musicSchecdule = null
    }
    static main__musicInfo__schedule__now() {
        return document.querySelector('.main__musicInfo__schedule .now')
    }

    get playStatusInfo() {
        return this.playStatus
    }

    get isPlayStatus() {
        return this.playStatus.paused
    }

    get bufferStatus() {
        return this.buffering
    }

    getInstance() {
        if (!this.instance) {
            this.instance = new Voice()
        }
        return this.instance
    }

    init() {
        // 定时器为了刷新页面时不展示播放器出来
        setTimeout(() => {
            this.main__control.onclick = () => {
                this.pauseOrPlay()
            }
            this.musicPlayer.style.display = 'block'
            const clickMap = [this.main__musicInfo, this.main__open, this.main__catalog]
            clickMap.map(v => {
                if (v === null) return
                v.addEventListener('click', function () {
                    if (window.location.hash.indexOf('#/pages/videoDetail') > -1) return
                    Taro.navigateTo({ url: '/pages/videoDetail' })
                })
            })
            if (this.playStatus.paused) {
            this.playStatus.paused = false
            this.setPlayStatus()
            this.readMemorySchedule()
            this.main__musicInfo__name.innerHTML = this.playStatus.info.name + '/' + this.playStatus.list[this.playStatus.index].course_per
            }
            this.main__colse.onclick = () => { this.removePlaying() }
            //this.main__colse.onclick = () => { this.hidePlayer() }
        }, 1000)
    }

    removePlaying() {
        this.playStatus = {}
        localStorage.removeItem('playStatus')
        this.music.pause()
        this.musicPlayer.classList.add('musicOut')
        clearInterval(this.musicSchecdule)
    }

    playerWrapper__theme() {
        this.main__control__background.src = this.playStatus.info.cover_img
        this.main__background.src = this.playStatus.info.cover_img
    }

    async play() {
        this.music.src = this.playStatus.src
        await this.pauseOrPlay()
    }

    /**暂停或播放 */
    pauseOrPlay() {
        if (this.music.src.indexOf('wap.mylyh.com') > -1) {
            if (window.location.hash.indexOf('/pages/videoDetail') > 0) {
                this.music.src = this.playStatus.src
            } else {
                this.readMemorySchedule()
                return
            }
        }
        this.music.currentTime === 0 && (this.main__musicInfo__schedule__now.innerText = '00:00')

        this.music.paused ? this.music.play() : this.music.pause()

        if (!this.music.paused) {
            setTimeout(() => {
                this.buffering = true
            }, 1000 * 1)
            setTimeout(() => {
                this.buffering = false
            }, 1000 * 5)
        }

        this.memorySchedule();console.log(this.music.paused)
        // 暂停和播放按钮的控制
        if (this.music.paused) {
            this.pauseIcon.classList.remove('musicPlaying')
            this.pauseIcon.classList.add('icon-icon_play')
        } else {
            this.pauseIcon.classList.add('musicPlaying')
            this.pauseIcon.classList.remove('icon-icon_play')
        }
        !this.music.paused && this.playerWrapper__schecduleInfo__update()
    }

    /** 播放进度 */
    playerWrapper__schecduleInfo__update() {
        clearInterval(this.musicSchecdule)

        // const currentTime = this.music.currentTime
        // // 未能正常播放的重新播放
        // setTimeout(() => {
        //     if (currentTime === this.music.currentTime) {
        //         this.pauseOrPlay()
        //     }
        // }, 2100)
        const todo = () => {
            this.main__musicInfo__name.innerHTML = this.playStatus.info.name + '/' + this.playStatus.list[this.playStatus.index].course_per
            const a = timeToMs(this.music.currentTime)
            const v = timeToMs(this.music.duration)
            // 判断是否缓存中
            if (this.main__musicInfo__schedule__now.innerText !== a) this.buffering = false
            this.main__musicInfo__schedule__now.innerText = a
            this.main__musicInfo__schedule__count.innerText = v
            this.playStatus.when = this.music.currentTime
        }
        //todo()
        this.musicSchecdule = setInterval(() => {
            todo()
        }, 1000)
    }

    memorySchedule() {
        this.playStatus.when = this.music.currentTime
        this.playStatus.totalTime = this.music.duration
        this.playStatus.paused = !this.music.paused
        this.setPlayStatus()
    }

    readMemorySchedule() {
        if (this.music.src !== this.playStatus.src) this.music.src = this.playStatus.src
        this.music.currentTime = this.playStatus.when
        const a = timeToMs(this.music.currentTime || this.playStatus.when)
        const v = timeToMs(this.music.duration || this.playStatus.totalTime)
        this.main__musicInfo__schedule__now.innerText = a
        this.main__musicInfo__schedule__count.innerText = v
        this.playerWrapper__theme()
        this.isShowPlayer()
    }

    /** 保存播放信息
     * @param musicInfo 音频详情
     * @param musicList 音频列表 
     * @param index 第几个音频 
     *  */
    saveVoiceInfo(musicInfo, musicList, index = 0) {
        /*
        if (musicList[index].music_url === this.playStatus.src) {
            this.readMemorySchedule()
            this.music.paused && this.pauseOrPlay()
            Taro.navigateTo({ url: '/pages/videoDetail' })
            return
        }
        */
        this.playStatus.list = musicList
        this.playStatus.src = musicList[index].music_url
        this.playStatus.info = musicInfo
        this.playStatus.when = 0
        this.playStatus.totalTime = 0
        this.playStatus.index = index
        this.setPlayStatus(this.playStatus)
        this.play()
        this.isShowPlayer()
        this.playerWrapper__theme()
    }

    getScheduleInfo = () => {
        const currentTime = timeToMs(this.music.currentTime || this.playStatus.when)
        const remain = timeToMs(this.music.duration - this.music.currentTime)
        const schedule = Math.floor((this.music.currentTime || this.playStatus.when) / this.music.duration * 100)
        return { currentTime, remain, schedule }
    }

    changeSchedule = (present) => {
        if (present < 0) return
        const now = Math.floor(this.music.duration * present / 100)
        this.music.currentTime = now
        this.memorySchedule()
    }

    changeMusicIndex = (index) => {
        if (index > -1 && index < this.playStatus.list.length && index !== this.playStatus.index) {
            this.playStatus.src = this.playStatus.list[index].music_url
            this.playStatus.when = 0
            this.playStatus.index = index
            this.setPlayStatus(this.playStatus)
            this.play()
            this.isShowPlayer()
        }else if (index > -1 && index < this.playStatus.list.length && index == this.playStatus.index) {
            //停止播放
            if (this.music.src.indexOf('wap.mylyh.com') > -1) {
                if (window.location.hash.indexOf('/pages/videoDetail') > 0) {
                    this.music.src = this.playStatus.src
                } else {
                    this.readMemorySchedule()
                    return
                }
            }
            this.music.currentTime === 0 && (this.main__musicInfo__schedule__now.innerText = '00:00')
            console.log(this.music.paused)
            this.music.paused ? this.music.play() : this.music.pause()

            if (!this.music.paused) {
                setTimeout(() => {
                    this.buffering = true
                }, 1000)
                setTimeout(() => {
                    this.buffering = false
                }, 5000)
            }

            this.memorySchedule();console.log(this.music.paused)
            // 暂停和播放按钮的控制
            if (this.music.paused) {
                this.pauseIcon.classList.remove('musicPlaying')
                this.pauseIcon.classList.add('icon-icon_play')
            } else {
                this.pauseIcon.classList.add('musicPlaying')
                this.pauseIcon.classList.remove('icon-icon_play')
            }
            !this.music.paused && this.playerWrapper__schecduleInfo__update()
        }
    }

    setPlayStatus() {
        localStorage.setItem('playStatus', JSON.stringify(this.playStatus))
    }

    isShowPlayer = () => {
        if (window.location.hash.indexOf('/pages/videoDetail') > -1) return
        this.musicPlayer.classList.remove('musicOut')
    }

    hidePlayer = () => {
        this.musicPlayer.classList.add('musicOut')
    }


    /**暂停火播放（首页上）**/
    indexpause() {
        // 暂停和播放按钮的控制
        setTimeout(() => {console.log(5543)
            this.pauseOrPlay()
            this.musicPlayer.style.display = 'block'
            const clickMap = [this.main__musicInfo, this.main__open, this.main__catalog]
            clickMap.map(v => {
                if (v === null) return
                v.addEventListener('click', function () {
                    if (window.location.hash.indexOf('#/pages/videoDetail') > -1) return
                    Taro.navigateTo({ url: '/pages/videoDetail' })
                })
            })
            // if (this.playStatus.paused) {
            this.playStatus.paused = false
            this.setPlayStatus()
            this.readMemorySchedule()
            this.main__musicInfo__name.innerHTML = this.playStatus.info.name + '/' + this.playStatus.list[this.playStatus.index].course_per
            // }
            this.main__colse.onclick = () => { this.removePlaying() }
        }, 100)
    }

    isShowMusicPlayerTypeTwo(that) {
        const todo = () => {
            if (this.main__musicInfo__schedule__now.innerHTML === '') return
            console.log(this.playStatus.paused)
            if (that.detail.scrollTop < this.top && this.playStatus.paused) {
                this.isShowPlayer()
            } else {
                this.hidePlayer()
            }
            this.top = that.detail.scrollTop
        }
        todo()
    }

    isShowMusicPlayer() {
        const pages = document.querySelectorAll('.taro_page')
        let that = null
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].style.display !== 'none') {
                that = pages[i]
            }
        }
        if (!that) return
        try {
            const startDom = that.children[0].children
            let target = null

            function findTargetDom(dom) {
                for (let i = 0; i < dom.length; i++) {
                    if (target) return
                    if (dom[i].offsetHeight > document.body.clientHeight) {
                        target = dom[i]
                    } else if (dom[i].offsetHeight > 400) {
                        findTargetDom(dom[i].children)
                    }
                }
            }
            findTargetDom(startDom)
            if (!target) {
                target = that.children[0].querySelector('.scrollview')
            }
            const todo = () => {
                if (this.main__musicInfo__schedule__now.innerHTML === '') return
                console.log(this.playStatus.paused)
                /*
                if (target.getBoundingClientRect().top > this.top) {
                    if(this.playStatus.paused == true){
                        this.isShowPlayer()
                    }
                } else {
                    this.hidePlayer()
                }
                */

                if(this.playStatus.paused == true){
                    this.isShowPlayer()
                } else {
                    this.hidePlayer()
                }
                this.top = target.getBoundingClientRect().top
            }
            target.parentNode.addEventListener('scroll', throttle(todo, 200))
        } catch (err) { }
    }
}

const voico = new Voice().getInstance()
voico.init()

// if (("onhashchange" in window) && ((typeof document.documentMode === "undefined") || document.documentMode == 8)) {
//     // 浏览器支持onhashchange事件
//     window.onhashchange = () => { voico.isShowMusicPlayer() }
// }

export default voico