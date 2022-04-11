import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Image,
    Navigator
} from "@tarojs/components"


import { getExpretList } from "@/src/api/expert"
import { debounce } from "@/src/utils/util"
import Share from "@/src/components/Share"
import ScrollEnd from "@/src/components/ScrollEnd"
import { observer, inject } from '@tarojs/mobx'
import Title from "@/src/components/Title"

import "./index.scss"




@Title("连线专家")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
    config = {
        navigationBarTitleText: "连线专家"
    };

    constructor() {
        super(...arguments)
        this.state = {
            famous: null,
            pages: 1
        }
    }

    componentDidMount() {
        this.getExpretListData()

        /** 个性化分享 */
        Share({
            wx: {
                title: '昊链咨询 - 合规贸易管理', // 分享标题
                desc: 'AEO认证辅导丨商品预归类丨关务合规服务 20年 + 资深顾问，助力贸易合规管理', // 分享描述
                link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: "http://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv1.2/expert_shair_logo.png", // 分享图标
                success: function () {
                    // 设置成功
                    console.log('ok~~')
                }
            }
        })
    }

    /** 名家学堂 */
    getExpretListData = () => {
        this.setState({ loading: true })
        getExpretList()
            .then(res => {
                this.setState({
                    famous: [...(this.state.famous || []), ...res.data],
                    loading: false,
                    pages: res.data.length >= 15 ? this.state.pages + 1 : 'full'
                })
            })
            .catch(err => {
                console.log(err)
                Taro.showToast({
                    title: err.msg ? err.msg : String(err),
                    icon: 'none',
                    duration: 2000,
                    mask: true,
                })
            })
    }

    scrollFn = debounce(() => {
        // 滚动到底时加载更多
        const $end = document.querySelector('.loadingio-spinner-spin-8dz5htwyiau')
        console.log($end.getBoundingClientRect().top)

        if ($end) {
            if (!this.state.loading && document.body.clientHeight > $end.getBoundingClientRect().top) {
                this.getFamous()
            }
        }

    }, 500)


    render() {
        return (
            <View className='single-list'>
                <View className='tt-cells' onScroll={this.scrollFn}>
                    {
                        this.state.famous && this.state.famous.map(item => (
                            <Navigator
                              key={item.id}
                              className='tt-cell-box tt-cell-box--half'
                              url={`/pages/single-detail?id=${item.id}`}
                            >
                                <View className='tt-cell tt-cell--circle'>
                                    <Image
                                      className='tt-cell__img'
                                      src={item.index_img || item.cover_img || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                                    />
                                    <View className='tt-cell__info'>
                                        <View className='ellipsis-2'>{item.title}</View>
                                    </View>
                                </View>
                            </Navigator>
                        ))
                    }
                </View>
                {/* 上拉加载显示 */}
                {
                    this.state.pages === 'full' ?
                        <View className='ll-divider'>没有更多内容了</View>
                        :
                        <ScrollEnd></ScrollEnd>

                }
            </View>
        )
    }
}

export default Index
