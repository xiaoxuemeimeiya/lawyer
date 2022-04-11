/* eslint-disable import/first */
import Taro, { Component } from "@tarojs/taro"
import {
  View,
  ScrollView,
  Image,
  Navigator,
  Text, Input, Button,
} from "@tarojs/components"

import { observer, inject } from '@tarojs/mobx'
import { AtActivityIndicator } from "taro-ui"
import Swiper from '@/src/lib/swiper'
import store from '../../store'
import { verity_code, free_lian,goddess_free,goddess_free_get, get_sms,goddess_check } from "../../api/videoVip"
import { throttle,handleInput } from '../../utils/util'
import {boxCheck,prize,box,checkGet,checkCare,vipCheck,prizeGet} from "../../api/expert"
import Title from "../../components/Title"
import Share from "@/src/components/Share"
import { decryption } from "../../utils/aes"
import { setCookie } from './../../utils/storage.js'
import "./index.scss"

const { loginStore } = store

@Title("盲盒抽奖")
@inject('loginStore', 'userStore')
@observer
class Index extends Component {
  config = {
    navigationBarTitleText: "盲盒抽奖"
  };

  constructor() {
    super(...arguments)
    this.state = {
      bottomBtn: false,
      show:false,
      detail:'',
      type:false,
      box_id:0,
      data:{
        name:'',
        phone:'',
        position:'',
        company:'',
        address:''
      },
      showaddress:false,
      showPrize:false,
      active: true ,
      gz:false,
      start_num :0,
      num:0,
      boxSuccess:false,
      timeEnd:'活动还未开始',
      userInfo: decryption(localStorage.getItem('userInfo')) || {}
    }
  }

  async componentDidMount() {
      this.end_time()//倒计时
      //this.clickPrize()
      if(!this.state.active){
          Taro.showToast({
              title: '您不符合我们的抽奖条件,敬请谅解!',
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true //显示透明蒙层，防止触摸穿透,
          })
          return false
      }
    //查看用户是否有资格
    vipCheck({ }).then(result => {
        if(result.status == 1){
            this.setState({
                active: true ,//设置用户有资格
            })
            //有资格(判断是否关注公众号)
            checkCare({}).then(res => {
                if(res.state == 0){
                    //已经关注(去抽奖)

                }else{
                    //未关注
                    this.setState({
                        gz: true ,//公众号二维码显示
                    })
                    const timer = setInterval(() => {
                        checkCare({}).then(care_res => {
                            if (care_res.state === 0) {
                                clearInterval(timer)
                                this.setState({
                                    gz: false ,//公众号二维码隐藏
                                })
                                //已经关注（去抽奖）
                                //this.userPrize()
                            }
                        })
                    }, 1000)
                }
            }).catch((res) => {
                Taro.showToast({
                    title: res.msg,
                    icon: res.code === 1 ? "success" : 'none', //图标,
                    duration: 2000, //延迟时间,
                    mask: true //显示透明蒙层，防止触摸穿透,
                })
            })
        }else{
            //用户没有在活动期间购买会员
            this.setState({
                active: false ,//设置用户没资格
            })
            Taro.showToast({
                title: '您不符合我们的抽奖条件,敬请谅解!',
                icon: 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
        }
    }).catch((result) => {
        Taro.showToast({
            title: result.msg,
            icon: result.code === 1 ? "success" : 'none', //图标,
            duration: 2000, //延迟时间,
            mask: true //显示透明蒙层，防止触摸穿透,
        })
    })
    this.box()
  }

    //倒计时
    end_time = () => {
        var starttime = (new Date('2022/01/27 00:00:00')).getTime() / 1000
        var endtime = (new Date('2022/02/07 00:00:00')).getTime() / 1000
        var time = (new Date()).getTime() / 1000
        //判断时间
        if(time < starttime){
            //活动还未开始
            this.setState({ timeEnd: '活动还未开始'})
        }else if(time > endtime){
            //活动已结束
            this.setState({ timeEnd: '活动已结束'})
        }else{
            //计算时间
            const timeEnd = setInterval(() => {
                time = (new Date()).getTime() / 1000
                var day = Math.floor((endtime-time)/86400)  //天数
                var res_num1 = endtime-time-(day*86400)
                var hour = Math.floor(res_num1/3600)         //小时
                var res_num2 = res_num1-(hour*3600)
                var min = Math.floor(res_num2/60)         //分钟
                var second = Math.floor(res_num2-(min*60))      //秒
                var str = '活动倒计时：'+(day ? day+'天 ': '')+(hour >= 10 ? hour: '0'+hour)+':'+(min >= 10 ? min: '0'+min)+':'+(second >= 10 ? second: '0'+second)+'s'

                this.setState({ timeEnd: str}, () => {
                    if(time < starttime){
                        //活动还未开始
                        clearInterval(timeEnd)
                        this.setState({ timeEnd: '活动还未开始'})
                    }else if(time > endtime){
                        //活动已结束
                        clearInterval(timeEnd)
                        this.setState({ timeEnd: '活动已结束'})
                    }
                })
            }, 1000)
        }

    }

    //抽奖
    clickPrize = () => {
        //写一个定时器
        var min = 12
        var max= 18
        var res_num = Math.floor(min+Math.random()*(max-min))
        console.log(res_num)
        let start_num = this.state.start_num
        let num = this.state.num
        const timePrize = setInterval(() => {
            this.setState({ start_num: (num%9),num:num++}, () => {
                if (num == res_num) {
                    clearInterval(timePrize)
                    //抽奖
                    prizeGet({ }).then(result => {
                        if(result.code == 1){
                            //中抽奖
                            this.setState({
                                //showaddress: true ,//开启领取奖品的资料弹框
                                type:result.type,
                                box_id:result.id,
                                showPrize:true,
                            })
                        }else{
                            Taro.showToast({
                                title: result.msg,
                                icon: 'none', //图标,
                                duration: 2000, //延迟时间,
                                mask: true //显示透明蒙层，防止触摸穿透,
                            })
                        }
                    }).catch((result) => {
                        Taro.showToast({
                            title: result.msg,
                            icon: result.code === 1 ? "success" : 'none', //图标,
                            duration: 2000, //延迟时间,
                            mask: true //显示透明蒙层，防止触摸穿透,
                        })
                    })
                }
            })

        }, 100)
        //获取18到30的随机数
        /*
        var min = 12
        var max= 18
        var num = Math.floor(min+Math.random()*(max-min))
        console.log(num)
        let start_num = this.state.start_num
        const timePrize = setInterval(() => {
            this.setState({ start_num: (start_num++)}, () => {
                if (start_num == num) {
                    clearInterval(timePrize)
                    this.setState({
                        start_num: start_num,
                    })
                }
            })
            console.log(start_num)
        }, 300)
        */
    }

    //用户抽奖
    userPrize = () => {
        //查看用户是否有资格
        vipCheck({ }).then(result => {
            if(result.status == 1){
                this.setState({
                    active: true ,//设置用户有资格
                })
                //有资格(判断是否关注公众号)
                checkCare({}).then(res => {
                    if(res.state == 0){
                        //已经关注(去抽奖)
                        //查看用户是否近期购买过会员，参与过抽奖
                        boxCheck({ }).then(res1 => {
                            if(res1.code == 1){
                                //符合抽奖
                                this.clickPrize()
                            }else{
                                Taro.showToast({
                                    title: result.msg,
                                    icon: 'none', //图标,
                                    duration: 2000, //延迟时间,
                                    mask: true //显示透明蒙层，防止触摸穿透,
                                })
                            }
                        }).catch((res1) => {
                            Taro.showToast({
                                title: res1.msg,
                                icon: res1.code === 1 ? "success" : 'none', //图标,
                                duration: 2000, //延迟时间,
                                mask: true //显示透明蒙层，防止触摸穿透,
                            })
                        })
                    }else{
                        //未关注
                        this.setState({
                            gz: true ,//公众号二维码显示
                        })
                        const timer = setInterval(() => {
                            checkCare({}).then(care_res => {
                                if (care_res.state === 0) {
                                    clearInterval(timer)
                                    this.setState({
                                        gz: false ,//公众号二维码隐藏
                                    })
                                    //已经关注（去抽奖）
                                    //this.userPrize()
                                }
                            })
                        }, 1000)
                    }
                }).catch((res) => {
                    Taro.showToast({
                        title: res.msg,
                        icon: res.code === 1 ? "success" : 'none', //图标,
                        duration: 2000, //延迟时间,
                        mask: true //显示透明蒙层，防止触摸穿透,
                    })
                })
            }else{
                //用户没有在活动期间购买会员
                this.setState({
                    active: false ,//设置用户没资格
                })
                Taro.showToast({
                    title: '您不符合我们的抽奖条件,敬请谅解!',
                    icon: 'none', //图标,
                    duration: 2000, //延迟时间,
                    mask: true //显示透明蒙层，防止触摸穿透,
                })
            }
        }).catch((result) => {
            Taro.showToast({
                title: result.msg,
                icon: result.code === 1 ? "success" : 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
        })

    }

    /***点击选我**/
    clickMe = () => {
        prizeGet({ }).then(result => {
            if(result.code == 1){
                //中抽奖
                this.setState({
                    //showaddress: true ,//开启领取奖品的资料弹框
                    type:result.type,
                    box_id:result.id,
                    showPrize:true,
                })
            }else{
                Taro.showToast({
                    title: result.msg,
                    icon: 'none', //图标,
                    duration: 2000, //延迟时间,
                    mask: true //显示透明蒙层，防止触摸穿透,
                })
            }
        }).catch((result) => {
            Taro.showToast({
                title: result.msg,
                icon: result.code === 1 ? "success" : 'none', //图标,
                duration: 2000, //延迟时间,
                mask: true //显示透明蒙层，防止触摸穿透,
            })
        })
    }

  /**中奖详情**/
  box = () => {
      box({}).then(result => {
          this.setState({
              detail: result.data ,//奖品详情
              type:result.data.type,
              box_id:result.data.id,
          })
      }).catch((result) => {
          Taro.showToast({
              title: result.msg,
              icon: result.code === 1 ? "success" : 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true //显示透明蒙层，防止触摸穿透,
          })
      })
  }
  /**关闭领取奖品详情**/
  closeForm = () => {
      this.setState({
          showaddress: false ,//关闭
      })
  }

  /**关闭领取奖品**/
  closePrize =() => {
      this.setState({
          showPrize: false ,//关闭
      })
  }

  /**关闭公众号二维码**/
  closeWx = () => {
      this.setState({
          gz: false ,//关闭
      })
  }

  /**打开奖品**/
  openPrize = () => {
      //this.box()
      console.log(this.state.active)
      if(!this.state.active){
          Taro.showToast({
              title: '暂无中奖信息!',
              icon: 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true //显示透明蒙层，防止触摸穿透,
          })
          return false
      }
      box({}).then(result => {
          if(!result.data.id){
              Taro.showToast({
                  title: '暂无中奖信息!',
                  icon: 'none', //图标,
                  duration: 2000, //延迟时间,
                  mask: true //显示透明蒙层，防止触摸穿透,
              })
          }else{
              this.setState({
                  showPrize: true ,//开启
              })
              this.setState({
                  detail: result.data ,//奖品详情
                  type:result.data.type,
                  box_id:result.data.id,
              })
          }
      }).catch((result) => {
          Taro.showToast({
              title: result.msg,
              icon: result.code === 1 ? "success" : 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true //显示透明蒙层，防止触摸穿透,
          })
      })

  }

  /***关闭客服**/
  closeKf = () => {
      this.setState({
          boxSuccess: false ,//关闭
      })
  }

  /**领取奖品***/
  checkGet = () => {
      checkGet({}).then(result => {
          if(result.state == 1){
              //已领取
              this.setState({
                  showaddress: false ,//关闭领取奖品的资料弹框
                  showPrize: false ,//关闭
              })
              Taro.showToast({
                  title: '您已经领取成功，无需在重复操作！',
                  icon: 'none', //图标,
                  duration: 2000, //延迟时间,
                  mask: true //显示透明蒙层，防止触摸穿透,
              })
          }else{
              //未领取（弹出领奖的）
              this.setState({
                  showaddress: true ,//开启领取奖品的资料弹框
                  showPrize: false ,//关闭
              })
          }
      }).catch((result) => {
          Taro.showToast({
              title: result.msg,
              icon: result.code === 1 ? "success" : 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true //显示透明蒙层，防止触摸穿透,
          })
      })
  }


  address = () => {
    // 确认是否登陆
    if (this.state.userInfo && this.state.userInfo.my_famous) {
      prize({ box_id: this.state.box_id,name:this.state.data.name,company:this.state.data.company,position:this.state.data.position,address:this.state.data.address,phone:this.state.data.phone }).then(res => {
          /*
          Taro.showToast({
              title: '领取成功',
              icon: res.code === 1 ? "success" : 'none', //图标,
              duration: 2000, //延迟时间,
              mask: true //显示透明蒙层，防止触摸穿透,
          })
          */
          this.setState({
              showaddress: false ,//关闭
              boxSuccess: true ,//开启客服窗口
          })
      }).catch((res) => {
        Taro.showToast({
          title: res.msg,
          icon: res.code === 1 ? "success" : 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true //显示透明蒙层，防止触摸穿透,
        })
      })
    } else {
      setCookie("Prev_URL", window.location.href)
      Taro.redirectTo({ url: "/pages/author" })
    }
  }

  render() {

    return (
      <View className='boxContent' >
        {/* 滚动区域 */}
        <ScrollView
          className='scrollview'
          scrollY
          scrollWithAnimation
          style={{
            boxSizing: "border-box",
            flex: 1,
          }}
          onScroll={this.scrollFn}
        >
        <View>
          <View className='goddessBanner'>
            <View className='banner'>
              <Image className='boxTitle' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/send_box.png'></Image>
            </View>
          <View className='prizeDetail' onclick={this.openPrize}><View className='title'>中奖记录</View></View>
          </View>
        {/* 盲盒盒子 */}
        <View className='bigBox'>
            <Image className='boxImg' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box.png'></Image>
            <View className='time'>{this.state.timeEnd}</View>
            <View className='nine-box'>
              <View className='box'>
                <Image className='img' src={(this.state.start_num == 0) ? "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box2.png" : "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box1.png"} />
                <Image className='choice-me' onclick={this.clickMe} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/choice_me.png'></Image>
              </View>
              <View className='box'>
                <Image className='img' src={(this.state.start_num == 1) ? "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box2.png" : "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box1.png"} />
                <Image className='choice-me' onclick={this.clickMe} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/choice_me.png'></Image>
              </View>
              <View className='box'>
                <Image className='img' src={(this.state.start_num == 2) ? "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box2.png" : "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box1.png"} />
                <Image className='choice-me' onclick={this.clickMe} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/choice_me.png'></Image>
              </View>
              <View className='box'>
                <Image className='img' src={(this.state.start_num == 3) ? "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box2.png" : "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box1.png"} />
                <Image className='choice-me' onclick={this.clickMe} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/choice_me.png'></Image>
              </View>
              <View className='box'>
                <Image className='img' src={(this.state.start_num == 4) ? "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box2.png" : "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box1.png"} />
                <Image className='choice-me' onclick={this.clickMe} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/choice_me.png'></Image>
              </View>
              <View className='box'>
                <Image className='img' src={(this.state.start_num == 5) ? "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box2.png" : "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box1.png"} />
                <Image className='choice-me'onclick={this.clickMe} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/choice_me.png'></Image>
              </View>
              <View className='box'>
                <Image className='img' src={(this.state.start_num == 6) ? "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box2.png" : "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box1.png"} />
                <Image className='choice-me'onclick={this.clickMe} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/choice_me.png'></Image>
              </View>
              <View className='box'>
                <Image className='img' src={(this.state.start_num == 7) ? "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box2.png" : "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box1.png"} />
                <Image className='choice-me'onclick={this.clickMe} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/choice_me.png'></Image>
              </View>
              <View className='box'>
                <Image className='img' src={(this.state.start_num == 8) ? "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box2.png" : "https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/box1.png"} />
                <Image className='choice-me'onclick={this.clickMe} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/choice_me.png'></Image>
              </View>
              <View className='float-none'>
              </View>
            </View>
            {/*抽奖按钮*/}
            <Image className='buttonImage' onclick={this.userPrize} src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button%402x.png'></Image>
            {/*奖品*/}
            <View id='prize' className='section' onload={this.aliveLoad}>
              <View className='title'>盲盒可能开出的奖品</View>
              <ScrollView scrollX className='control-prize'>
                <View className='scroll-live'>
                  <View className='yuyue-alive'>
                    <View className='img-box'>
                      <Image className='img-box__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/month.png' />
                    </View>
                    <View className='free-course__title ellipsis-2'>月卡会员</View>
                  </View>
                  <View className='yuyue-alive'>
                    <View className='img-box'>
                      <Image className='img-box__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/querter.png' />
                    </View>
                    <View className='free-course__title ellipsis-2'>季卡会员</View>
                  </View>
                  <View className='yuyue-alive'>
                    <View className='img-box'>
                      <Image className='img-box__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/tgzn.png' />
                    </View>
                    <View className='free-course__title ellipsis-2'>FTA通关指南</View>
                  </View>
                  <View className='yuyue-alive'>
                    <View className='img-box'>
                      <Image className='img-box__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/kjds.png' />
                    </View>
                    <View className='free-course__title ellipsis-2'>跨境电商法律书籍</View>
                  </View>
                  <View className='yuyue-alive'>
                    <View className='img-box'>
                        <Image className='img-box__img' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/calendar.png' />
                    </View>
                  <View className='free-course__title ellipsis-2'>精美台历</View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>

      {/* 姓名和手机号码 */}
      {this.state.showaddress &&
      <View className='formPrize'>
        <View className='ll-cells ll-cell--noborder content buySubmit-phone'>
          <Text className='text'>请填写领取资料</Text>
          <View className='ll-cell content__bd'>
             <View className='ll-cell__bd'>
              <Input
              className='ll-input'
              type='text'
              onChange={handleInput.bind(this, "data.name")}
              placeholder='姓名'
              ></Input>
            </View>
          </View>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__bd'>
              <Input
              className='ll-input'
              type='text'
              onChange={handleInput.bind(this, "data.phone")}
              placeholder='电话'
                  ></Input>
            </View>
          </View>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__bd'>
            <Input
            className='ll-input'
            type='text'
            onChange={handleInput.bind(this, "data.company")}
            placeholder='公司'
            ></Input>
          </View>
        </View>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__bd'>
              <Input
                className='ll-input'
                type='text'
                onChange={handleInput.bind(this, "data.position")}
                placeholder='职位'
                    ></Input>
            </View>
          </View>
          <View className='ll-cell content__bd'>
            <View className='ll-cell__bd'>
              <Input
              className='ll-input'
              type='text'
              onChange={handleInput.bind(this, "data.address")}
              placeholder='地址'
              ></Input>
            </View>
          </View>
          <View className='free_card' onclick={this.address}>提交</View>
        </View>
          <View className="close-img" onclick={this.closeForm}> <Image src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_close2%402x.png"/></View>
      </View>
      }
      {/*中奖的奖品*/}
      {this.state.showPrize &&
      <View className='getPrize'>
          {this.state.type && this.state.type == 1 &&
          <View className='ll-cell--noborder content'>
            <Image className='titleImage' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/prize_title.png'></Image>
            <View className='text'>链链会员月卡</View>
            <View className='prize'>
                <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/month1.png'></Image>
            </View>
          {this.state.detail.get == 1
              ?
            <View className='free_card'>
                <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button2.png'></Image>
            </View>
              :
            <View className='free_card' onclick={this.checkGet}>
              <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button1.png'></Image>
            </View>
          }
          </View>
          }
          {this.state.type && this.state.type == 2 &&
          <View className='ll-cell--noborder content'>
              <Image className='titleImage' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/prize_title.png'></Image>
              <View className='text'>链链会员季卡</View>
              <View className='prize'>
              <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/querter1.png'></Image>
              </View>
              {this.state.detail.get == 1
                  ?
              <View className='free_card'>
                  <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button2.png'></Image>
                  </View>
              :
              <View className='free_card' onclick={this.checkGet}>
                <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button1.png'></Image>
              </View>
               }
              </View>
          }

          {this.state.type && this.state.type == 3 &&
          <View className='ll-cell--noborder content'>
              <Image className='titleImage' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/prize_title.png'></Image>
              <View className='text'>精美台历</View>
              <View className='prize'>
              <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/calendar1.png'></Image>
              </View>
              {this.state.detail.get == 1
                  ?
              <View className='free_card'>
                  <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button2.png'></Image>
                  </View>
              :
              <View className='free_card' onclick={this.checkGet}>
                  <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button1.png'></Image>
                  </View>
              }
              </View>
          }

          {this.state.type && this.state.type == 4 &&
          <View className='ll-cell--noborder content'>
              <Image className='titleImage' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/prize_title.png'></Image>
              <View className='text'>FTA通关指南</View>
              <View className='prize'>
              <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/tgzn1.png'></Image>
              </View>
              {this.state.detail.get == 1
                  ?
              <View className='free_card'>
                  <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button2.png'></Image>
                  </View>
              :
              <View className='free_card' onclick={this.checkGet}>
                  <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button1.png'></Image>
                  </View>
              }
              </View>
          }

          {this.state.type && this.state.type == 5 &&
          <View className='ll-cell--noborder content'>
              <Image className='titleImage' src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/prize_title.png'></Image>
              <View className='text'>跨境电商法律书籍</View>
              <View className='prize'>
              <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/kjds1.png'></Image>
              </View>
              {this.state.detail.get == 1
                  ?
              <View className='free_card'>
                  <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button2.png'></Image>
                  </View>
              :
              <View className='free_card' onclick={this.checkGet}>
                  <Image src='https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/box/button1.png'></Image>
                  </View>
              }
              </View>
          }
          <View className="close-img" onclick={this.closePrize}> <Image src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_close2%402x.png"/></View>
       </View>
      }
      <View className='rule'>
          {/*<View className='goddessLine goddessLineLeft'></View>*/}
          <View className='title'>- 活动规则 -</View>
      {/*<View className='goddessLine goddessLineRight'></View>*/}
          <View className='content'>
            <View className='detail'>活动时间：2022年1月27号—2022年2月7号</View>
            <View className='detail'>参与方式：活动期间购买链链会员可获赠盲盒一个，100%中奖 </View>
            <View className='detail'>领取方式：虚拟物品领取后直接发放至账号，实物将邮寄发出。</View>
            <View className='detail'>* 1月29日之后抽取的实物奖品将在2月7日陆续发出，敬请见谅！</View>
         </View>
      </View>
    </View>
  </ScrollView>
      {this.state.gz &&
        <View className='box-care'>
            <View className='yuyue-warn1' >
              <View className='text--black'></View>
          {/*--<View className='onebyone'>为了不错过您关注的直播，请关注我们，我们会在开播前提醒您。</View>--*/}
              <View className='ercode'>
                <Image className='gzh-img' src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/link_gzh%402x.png" />
              </View>
              <View className='care'>长按关注我们</View>
            </View>
          <View className="close-img" onClick={this.closeWx}> <Image src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_close2%402x.png"/></View>
        </View>
      }

      {this.state.boxSuccess &&
        <View className='box-success'>
          <View className='yuyue-warn1' >
          <View className='text--black'>提交成功</View>
          {/*--<View className='onebyone'>为了不错过您关注的直播，请关注我们，我们会在开播前提醒您。</View>--*/}
        <View className='ercode'>
          <Image className='gzh-img' src="https://oss.mylyh.com/miniapp/versionv2.2/pic_kefucode@2x.png" />
          </View>
          <View className='care'>如有疑问，请扫码联系客服</View>
          </View>
          <View className="close-img" onClick={this.closeKf}> <Image src="https://lyhoss.oss-cn-qingdao.aliyuncs.com/miniapp/versionv2.2/icon_close2%402x.png"/></View>
        </View>
      }

        {/* 首次加载 */}
        {this.state.isFirstLoding && (
          <AtActivityIndicator size={36}></AtActivityIndicator>
        )}
      </View>
    )
  }
}

export default Index
