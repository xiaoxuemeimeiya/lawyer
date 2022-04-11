import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Navigator,
    Image, Text
} from "@tarojs/components"

import "../index.scss"

/** 热门推荐 */
class Index extends Component {
  render() {
    const dataList=this.props.dataList
    
    return (
      <View className='section'>

        {dataList && dataList.map(item => (
          <Navigator
            url={`/pages/knowledge-online-detail?id=${item.id}`}
            className='ll-cells ll-cell--noborder media'
            key={item.id}
          >
            <View className='ll-cell ll-cell--primary media__bd'>
              <View className='ll-cell__hd'>
                <Image
                  className='media__img'
                  src={
                    item.cover_img ||
                    "https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png"
                  }
                />
              </View>
              <View className='ll-cell__bd'>
                <View className='media__title ellipsis-2'>{item.name}</View>

                <View className='media__small'>{item.us_regist_name + "·" + item.category}</View>
                <View className='icon-see'>
                  <Image className='media__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/new_year_festival/icon_see%402x.png'/>
                  <Text>{item.fake_data}人次</Text>
                  <View className='media__ft'>
                    <View>
                      <View className='price--hot'> {'¥'+(item.price || 999)}</View>
                      { item.type==1 &&
                       <View className='label--freeIcon'><img src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/pic_vip_1%402x.png'/></View>
                      }
                    </View>
                  </View>
                </View>

              </View>
            </View>
          </Navigator>
        ))}

      </View>
    )
  }
}

export default Index
