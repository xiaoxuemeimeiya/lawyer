import { observable, autorun } from 'mobx'
import Taro from '@tarojs/taro'
import { my } from '../api/my'
import { get_my_famous } from './../api/videoVip'
import { isClubVIP } from './login'
import { encrypt, decryption } from './../utils/aes'

const userStore = observable({
  /** 用户信息 */
  userInfo: {},
  imgUrl: process.env.NODE_ENV === 'development11' ? 'http://192.168.8.146:5500/src/assets/images/' : 'http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.2/',
  setUserInfo(info) {
    this.userInfo = info
  },
  removeUserInfo() {
    this.userInfo = {}
  },

  /** 是否为视频VIP会员 */
  get lian() {
    return !!this.userInfo.lian
  },

  /**
   * 获取用户信息
   */
  async getUserInfoAsync() {
    const my_famous = await get_my_famous()
    return new Promise((resolve, reject) => {
      my()
        .then(res => {
          localStorage.removeItem('userInfo')
          res.data.my_famous = []
          res.data.my_famous.push(...my_famous.data)
          res.data.isClubVIP = isClubVIP(res.data)
          // 和后台沟通，这个需要除以100
          res.data.club_account = (res.data.club_account / 100).toFixed(2)
          /** 加密数据 */
          const a = encrypt(res.data)
          localStorage.setItem('userInfo', a)
          resolve(res.data)
        })
        .catch(err => {
          Taro.showToast({
            title: err.msg ? err.msg : String(err), //提示的内容, 
            icon: 'none', //图标, 
            duration: 2000, //延迟时间, 
            mask: true, //显示透明蒙层，防止触摸穿透, 
          })
          this.removeUserInfo()
          reject(err)
        })
    })
  },
  /**
   * 检查是否存在用户信息
   */
  checkUserInfoAsync() {
    return new Promise((resolve) => {
      if (JSON.stringify(this.userInfo) !== "{}") {
        return resolve(this.userInfo)
      } else {
        return this.getUserInfoAsync()
      }
    })
  }
})

export default userStore