import Taro, { Component } from "@tarojs/taro"
import {
    View,
    ScrollView,
    Image,
    Navigator,
    Text,
    Block, Input
} from "@tarojs/components"

import { AtActivityIndicator } from "taro-ui"
import { getKnowledgeNews } from "../../api/knowledge"
import {alive_yuyue, aliveList, careGzh, yuyue_detail, yuyue_set} from "../../api/expert"

import "./index.scss"
import {setCookie} from "../../utils/storage"
import {decryption} from "../../utils/aes"
import { handleInput, HttpException } from '@/src/utils/util'

class Index extends Component {
  config = {
    navigationBarTitleText: "预约列表"
  }

  constructor() {
    super(...arguments)
    this.state = {
        alive_id:'',
        alive_link:'',
        alive_state:'',
        form: {
            name:'',
            company:'',
            phone:'',
            position:''
        },
        yuyueForm:false,
      date: {
        // year: new Date().getFullYear(),
        month:
          new Date().getMonth() + 1 > 9
            ? new Date().getMonth() + 1
            : "0" + (new Date().getMonth() + 1),
        day:
          new Date().getDate() > 9
            ? new Date().getDate()
            : "0" + new Date().getDate()
      },
      userInfo: decryption(localStorage.getItem('userInfo')) || {},

      dataList: [],

      isFirstLoding: true,
      showNull: false,
      yuyue_warn:false,
      gz_yuy_warn:false
    }
  }

  componentDidMount() {
    this.getDataList()
  }

  /**
   * 获取内容
   * @tutorial 快捷键 `vi.getDataList`
   */
  getDataList() {
    this.getData()
  }

  getData() {
    return aliveList()
      .then(res => {
        console.log("TCL: getExpertsList -> res", res)
        let dataList = res.data.list

        /* 列表数据 */
        dataList = dataList.filter(item=>(item.res && item.res.length > 0))

        if(dataList.length){
          this.setState({
            dataList:dataList
          })
        }else{
          this.setState({
            showNull:true
          })
        }

        // 取消显示首次loading
        this.state.isFirstLoding && this.setState({ isFirstLoding: false })
      })
      .catch(err => {
        Taro.showToast({
          title: err.msg ? err.msg : err + "", //提示的内容,
          icon: "none", //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
  }

    aliveYuyue= (id,state,link,form) => {
        var user = Object.keys(this.state.userInfo).length
        this.setState({alive_id:id,alive_state:state,alive_link:link})
        if(user){
            //用户已经登陆（查看用户是否已经关注我们的公众号）
            careGzh()
                .then(careRes => {
                    //查看用户是否关注
                    if(careRes.state == 1){
                        //用户未关注
                        //判断是否是会员
                        if (this.state.userInfo && this.state.userInfo.lian) {
                            //会员
                            if(state != 0){
                                //已经预约
                                Taro.navigateTo({ url: "/pages/yuyue-success?id="+id })
                                return
                            }
                            //是否需要表单
                            if(form == 1){
                                //Taro.navigateTo({ url: "/pages/yuyue-form?id="+id+"&type=1" })
                                this.setState({yuyueForm:true})
                                return
                            }
                            alive_yuyue(id)
                                .then(res => {
                                    console.log(res)
                                    if(res.code === 1){
                                        this.getDataList()//更新数据
                                        this.setState({ gz_yuy_warn:true})
                                        let that = this
                                        /*
                                        setTimeout(function(){
                                            that.setState({ gz_yuy_warn:false})
                                            Taro.navigateTo({ url: "/pages/yuyue-success?id="+id })
                                        },1500)
                                        */
                                    }else{
                                        Taro.showToast({
                                            title: res.msg,
                                            icon: 'none', //图标,
                                            duration: 2000, //延迟时间,
                                            mask: true //显示透明蒙层，防止触摸穿透,
                                        })
                                    }

                                }).catch(err => {
                                console.log(err)
                                Taro.showToast({
                                    title: err.msg ? err.msg : String(err), //提示的内容,
                                    icon: 'none', //图标,
                                    duration: 2000, //延迟时间,
                                    mask: true, //显示透明蒙层，防止触摸穿透,
                                })
                            })
                        }else if(this.state.userInfo) {
                            //非会员
                            if(state != 0){
                                Taro.navigateTo({ url: link})
                                return false
                            }
                            //是否需要表单
                            if(form == 1){
                                //Taro.navigateTo({ url: "/pages/yuyue-form?id="+id+"&type=1" })
                                this.setState({yuyueForm:true})
                                return
                            }
                            alive_yuyue(id)
                                .then(res => {
                                    console.log(res)
                                    if(res.code === 1){console.log(7853454379)
                                        this.getDataList()//更新数据
                                        this.setState({ gz_yuy_warn:true})
                                        let that = this
                                        /*
                                        setTimeout(function(){
                                            that.setState({ gz_yuy_warn:false})
                                            Taro.navigateTo({ url: link})
                                        },1500)
                                        */
                                    }else{
                                        Taro.showToast({
                                            title: res.msg,
                                            icon: 'none', //图标,
                                            duration: 2000, //延迟时间,
                                            mask: true //显示透明蒙层，防止触摸穿透,
                                        })
                                    }
                                }).catch(err => {
                                console.log(err)
                                Taro.showToast({
                                    title: err.msg ? err.msg : String(err), //提示的内容,
                                    icon: 'none', //图标,
                                    duration: 2000, //延迟时间,
                                    mask: true, //显示透明蒙层，防止触摸穿透,
                                })
                            })
                        }else{
                            setCookie("Prev_URL", window.location.href)
                            Taro.redirectTo({ url: "/pages/author" })
                        }
                    }else{
                        //用户已关注
                        if (this.state.userInfo && this.state.userInfo.lian) {
                            //会员
                            if(state != 0){
                                Taro.navigateTo({ url: "/pages/yuyue-success?id="+id })
                                return
                            }
                            //是否需要表单
                            if(form == 1){
                                //Taro.navigateTo({ url: "/pages/yuyue-form?id="+id+"&type=1" })
                                this.setState({yuyueForm:true})
                                return
                            }
                            alive_yuyue(id)
                                .then(res => {
                                    console.log(res)
                                    if(res.code === 1){
                                        this.getDataList()//更新数据
                                        this.setState({ yuyue_warn:true})
                                        let that = this
                                        setTimeout(function(){
                                            that.setState({ yuyue_warn:false})
                                            Taro.navigateTo({ url: "/pages/yuyue-success?id="+id })
                                        },1000)
                                    }else{
                                        Taro.showToast({
                                            title: res.msg,
                                            icon: 'none', //图标,
                                            duration: 2000, //延迟时间,
                                            mask: true //显示透明蒙层，防止触摸穿透,
                                        })
                                    }

                                }).catch(err => {
                                console.log(err)
                                Taro.showToast({
                                    title: err.msg ? err.msg : String(err), //提示的内容,
                                    icon: 'none', //图标,
                                    duration: 2000, //延迟时间,
                                    mask: true, //显示透明蒙层，防止触摸穿透,
                                })
                            })
                        }else if(this.state.userInfo) {
                            //非会员
                            if(state != 0){
                                Taro.navigateTo({ url: link})
                                return false
                            }
                            //是否需要表单
                            if(form == 1){
                                //Taro.navigateTo({ url: "/pages/yuyue-form?id="+id+"&type=1" })
                                this.setState({yuyueForm:true})
                                return
                            }
                            alive_yuyue(id)
                                .then(res => {
                                    console.log(res)
                                    if(res.code === 1){
                                        this.getDataList()//更新数据
                                        this.setState({ yuyue_warn:true})
                                        let that = this
                                        setTimeout(function(){
                                            that.setState({ yuyue_warn:false})
                                            Taro.navigateTo({ url: link})
                                        },1000)
                                    }else{
                                        Taro.showToast({
                                            title: res.msg,
                                            icon: 'none', //图标,
                                            duration: 2000, //延迟时间,
                                            mask: true //显示透明蒙层，防止触摸穿透,
                                        })
                                    }
                                }).catch(err => {
                                console.log(err)
                                Taro.showToast({
                                    title: err.msg ? err.msg : String(err), //提示的内容,
                                    icon: 'none', //图标,
                                    duration: 2000, //延迟时间,
                                    mask: true, //显示透明蒙层，防止触摸穿透,
                                })
                            })
                        }else{
                            setCookie("Prev_URL", window.location.href)
                            Taro.redirectTo({ url: "/pages/author" })
                        }
                    }
                })
                .catch(err => {
                    console.log(err)
                    Taro.showToast({
                        title: err.msg ? err.msg : String(err), //提示的内容,
                        icon: 'none', //图标,
                        duration: 2000, //延迟时间,
                        mask: true, //显示透明蒙层，防止触摸穿透,
                    })
                })
        }else{
            //用户未登陆
            setCookie("Prev_URL", window.location.href)
            Taro.redirectTo({ url: "/pages/author" })
        }
    }
    close1 = () => {
        this.setState({ gz_yuy_warn:false})
    }

    close = () => {
        this.setState({yuyueForm:false})
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
            //Taro.showLoading({ mask: true })
            yuyue_set({alive_id:this.state.alive_id})
                .then(setRes => {
                    if(setRes.count == 0){
                        yuyue_detail(Object.assign(this.state.form, {alive_id: this.state.alive_id})).then(res => {
                            this.setState({yuyueForm:false})
                            this.aliveYuyue(this.state.alive_id,this.state.alive_state,this.state.alive_link,0)
                        })
                    }else{
                        this.setState({yuyueForm:false})
                        this.aliveYuyue(this.state.alive_id,this.state.alive_state,this.state.alive_link,0)
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


  render() {
    return (
      <View className='New'>
        {/* 头部 */}
        {/* 滚动区域 */}
        {/* // className='scrollview'
        // scrollY
        // scrollWithAnimation
        // style={{ height: "calc(100% - " + Taro.pxTransform(310) + ")",marginTop: `-${Taro.pxTransform(30)}` }} */}
        <View className='content--box'>

          {this.state.dataList.map((item, index) => {
            return (
              <Block key={index}>
                <View className='new-titlte'>{`${item['m']}`}</View>

                {/* media */}
                {item['res'].map((itemName,index) => (
                  <View className='ll-cells ll-cell--noborder' key={itemName.id}  onClick={this.aliveYuyue.bind( this,itemName.id,itemName.status,itemName.link,itemName.form)}>
                    {index !=0 &&(<View className='top-line'></View>)}
                    <View className='media-title'><View className='comma'></View>{itemName.start_time}</View>
                    {index+1 < item['res'].length &&(<View className='line'></View>)}
                    <View className='ll-cell ll-cell--primary media__bd'>
                      <View className='ll-cell__hd alive-list'>
                        <Image
                          className='media__img'
                          src={itemName.desc || 'https://oss.mylyh.com/miniapp/wx_img/share/icon_ll_logo.png'}
                        />
                        {itemName.status == 0 &&(
                        <View className='img-status'> 预告</View>
                        )}
                        {itemName.status == 1 &&(
                        <View className='img-status'>预告</View>
                        )}
                        {itemName.status == 2 &&(
                        <View className='img-status img-state-red'> <View className='icon icon-playing'></View>直播中</View>
                        )}
                        {itemName.status == 3 &&(
                        <View className='img-status img-state-blue'>回放</View>
                        )}
                      </View>
                      <View className='ll-cell__bd'>
                        <View className='media__title ellipsis-2'>
                          {itemName.title}
                        </View>
                        <View className='media__ft'>
                          <View className='media__name'>
                    {/*{itemName.num}人已预约*/}
                          </View>
                          {itemName.status == 0 &&(
                            <View className='media__num'>立即预约</View>
                          )}
                        {itemName.status == 1 &&(
                            <View className='media__num unmedia_num'>已预约</View>
                        )}
                        {itemName.status == 2 &&(
                        <View className='media__num'>直播中</View>
                        )}
                        {itemName.status == 3 &&(
                        <View className='media__num'>查看回放</View>
                        )}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </Block>
            )
          })}

          {/* 提示为空-快捷键`vi.showNull` */}
          {this.state.showNull && (
            <View className='null-tip'>
              <Image
                className='null-tip__img'
                src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/wx_img/pic_searchnone@2x.png'
                mode='scaleToFill'
                lazy-load='false'
              ></Image>
              <View class='color-text-regular'>没有找到您想要的</View>
            </View>
          )}


      { this.state.yuyue_warn &&
      <View className='yuyue-opacity'>
          <View className='yuyue-warn' >
          <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_suc%402x.png' />
          <View className='text--black'>预约成功</View>
          <View className='onebyone'>我们会在开播前提醒您</View>
          {!this.state.userInfo.lian &&
          <View className='onebyone'>3s后跳转到直播间</View>
          }
      </View>
      </View>
      }

      {this.state.gz_yuy_warn &&
      <View className='yuyue-opacity1'>
              <View className='yuyue-warn1' >
                <Image className='img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_suc%402x.png' />
                <View className='text--black'>预约成功</View>
                <View className='onebyone'>为了不错过您预约的直播，请关注我们，我们会在开播前提醒您。</View>
                <View className='ercode'>
                    <Image className='gzh-img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/link_gzh%402x.png" />
                </View>
                <View className='care'>长按关注我们</View>
              </View>
              <View className="close-img" onClick={this.close1.bind()}> <Image src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_close2%402x.png"/></View>

      </View>
      }

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

        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
