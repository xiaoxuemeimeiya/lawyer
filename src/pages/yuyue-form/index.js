import Taro, { Component } from "@tarojs/taro"
import {
    View,
    Image,
    Text,
    Input, Navigator, Button
} from "@tarojs/components"

import { getExpretDetail, yuyue_detail,yuyue_set } from "@/src/api/expert"

import { observer, inject } from '@tarojs/mobx'
import Title from "@/src/components/Title"
import Share from "@/src/components/Share"
import Gzh from "../../components/Gzh"

import { handleInput, HttpException } from '@/src/utils/util'

import "./index.scss"
import {setCookie} from "../../utils/storage"
import {decryption} from "../../utils/aes"
import {careGzh} from "../../api/expert";

@Title("预约直播")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
    config = {
        navigationBarTitleText: "详情"
    };

    constructor() {
        super(...arguments)
        this.state = {
            /** 信息弹窗 */
            form: {
                name:'',
                company:'',
                phone:'',
                position:''
            },
            type:1,
            yuyueForm:false,
            userInfo: decryption(localStorage.getItem('userInfo')) || {}
        }
    }

    componentDidMount() {

    }


    /**
     * 参数校验器
     * @param(Object) from 数据源
     * @param(Object) rules 校验规则
     * @param(Object) msg 提示语
     */
    validate = (from, rules, msg) => {
        const rulesName = {
            name: '称呼',
            phone: '手机号码',
            company: '您的公司',
            position: '职务',//可不填
        }
        Object.keys(rules).map(v => {
            if (!from[v]) throw new HttpException(`${rulesName[v]}不能为空`)
            if (rules[v] instanceof Object) {
                if (rules[v].min && from[v].length < rules[v].min) {
                    throw new HttpException(`输入的${rulesName[v]}不能少于${rules[v].min}个字符`)
                }
                if (rules[v].max && from[v].length > rules[v].max) {
                    throw new HttpException(`输入的${rulesName[v]}不能超过${rules[v].max}个字符`)
                }
                // 正则
                if (String(rules[v]).indexOf('/') === 0) {
                    if (!from[v].match(rules[v])) throw new HttpException(msg[v])
                }
            }

        })
    }

    service = () => {
        //判断还有次数没
        const from = this.state.form
        console.log(from)
        const rules = {
            name: {
                max: 20,
                min: 1,
            },
            phone: /^1[34578]\d{9}$/,
            company: {
                max: 30,
                min: 1,
            },
        }
        const msg = {
            name: '请输入称呼',
            phone: '请输入正确的手机号码',
            company: '请输入您的公司',
        }
        try {
            this.validate(from, rules, msg)
            Taro.showLoading({ mask: true })
            yuyue_set({alive_id:this.$router.params.id})
                .then(setRes => {
                    if(setRea.count == 0){
                        yuyue_detail(Object.assign(this.state.form, {alive_id: this.$router.params.id})).then(res => {
                            console.log(res.data)
                            Taro.showToast({
                                title: res.msg,
                                icon: 'none', //图标,
                                duration: 1500, //延迟时间,
                                mask: true //显示透明蒙层，防止触摸穿透,
                            })
                        })
                    }else{
                        Taro.showToast({
                            title: '您已经预约',
                            icon: 'none', //图标,
                            duration: 2000, //延迟时间,
                            mask: true //显示透明蒙层，防止触摸穿透,
                        })
                    }
                })
        } catch (err) {
            Taro.showToast({
                title: err.msg,
                icon: 'none', //图标,
                duration: 1500, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
        }

    }

    close = () => {
        //判断从哪传来的
        var type = this.state.type
        if(type == 1){
            //1.首页
            Taro.navigateTo({ url: `/` })
        }else if(type == 2){
            //列表页
            Taro.navigateTo({ url: `/pages/alive-list` })
        }else if(type == 3){
            //会员页面
            Taro.navigateTo({ url: `/pages/videoVip` })
        }

    }

    render() {

        return (

            <View className='single-detail page'>
            {this.state.yuyueForm &&
                <View className='pupop-box'>
                    <View className={['pupopBack']} > </View>
                    <View className='pupop'>
                        <View className='pupop_title'>
                            <View className='title_text'>为了带给您更好的服务</View>
                            <View className='title_text'>请先完善资料</View>
                            {/*<Image className='title_icon1' src={this.props.userStore.imgUrl + 'circle.png'} />
                            <Image className='title_icon2' src={this.props.userStore.imgUrl + 'circle.png'} />
                            */}
                        </View>
                        <View className='form'>
                            <View className='formItem'>
                                <View className='input-box'>
                                    <Input data-lable='name' value={this.state.form.name} onChange={handleInput.bind(this, "form.name")} placeholder='姓名' />
                                </View>
                            </View>
                            <View className='formItem'>
                                <View className='input-box'>
                                    <Input type='tel' data-lable='phone' value={this.state.form.phone} onChange={handleInput.bind(this, "form.phone")} placeholder='手机号码' />
                                </View>
                            </View>
                            <View className='formItem'>
                                <View className='input-box'>
                                    <Input data-lable='company' value={this.state.form.company} onChange={handleInput.bind(this, "form.company")} placeholder='所在公司' />
                                </View>
                            </View>
                            <View className='formItem'>
                                <View className='input-box'>
                                    <Input data-lable='position' value={this.state.form.position} onChange={handleInput.bind(this, "form.position")} placeholder='职位' />
                                </View>
                            </View>
                        </View>
                        <View className='button unique' onClick={this.service}>提交并预约</View>
                        <View className='close-button' onClick={this.close}>取消</View>
                    </View>
                </View>
                }
            </View>

        )
    }
}

export default Index
