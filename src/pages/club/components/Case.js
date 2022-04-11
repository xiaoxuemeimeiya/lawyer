import Taro, { Component } from "@tarojs/taro"
import { View, Image } from "@tarojs/components"

import "../index.scss"

class Index extends Component {
  render() {
    return (
      <View className='ll-cells ll-cell--noborder case'>
        <View className='ll-cell case__hd'>
          <View className='ll-cell__hd'>达人声音</View>
        </View>
        <View className='ll-cell ll-cell--noborder ll-cell--primary case-item'>
          <View className='ll-cell__hd'>
            <Image
              className='case-item__img'
              src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/pic_star_1%402x.png'
            />
          </View>
          <View className='ll-cell__bd'>
            <View className='case-item__hd'>
              <View className='case-item__title'>罗洋</View>
              <View className='case-item__title--sm'>
                我在链链俱乐部：1个月08天
              </View>
            </View>
            <View className='case-item__text'>
              在认识到货运人也需要往上提升专业化时，我在这里我能学习，把自己知识经验输出得到更多货主的认可。
            </View>
          </View>
        </View>
        <View className='ll-cell ll-cell--noborder ll-cell--primary case-item'>
          <View className='ll-cell__hd'>
            <Image
              className='case-item__img'
              src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/pic_star_2%402x.png'
            />
          </View>
          <View className='ll-cell__bd'>
            <View className='case-item__hd'>
              <View className='case-item__title'>徐纬</View>
              <View className='case-item__title--sm'>
                我在链链俱乐部：2个月12天
              </View>
            </View>
            <View className='case-item__text'>
              原先是奔着这上面有许多同行实操业务能手，在我也逐渐成为一个实操达人后，没想到我平时分享的经验，竟然给我创造了收入。
            </View>
          </View>
        </View>
        <View className='ll-cell ll-cell--noborder ll-cell--primary case-item'>
          <View className='ll-cell__hd'>
            <Image
              className='case-item__img'
              src='http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/icon/191226/pic_star_3%402x.png'
            />
          </View>
          <View className='ll-cell__bd'>
            <View className='case-item__hd'>
              <View className='case-item__title'>李伟斌</View>
              <View className='case-item__title--sm'>我在链链俱乐部：24天</View>
            </View>
            <View className='case-item__text'>
              是公司的一个货代推荐的，在这里我能全面的获取各国地区的贸易内容，也有许多海关实务类的律师，真的为我繁复的工作提供了许多便利。
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
