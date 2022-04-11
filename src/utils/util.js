// eslint-disable-next-line import/no-commonjs
var mergeWith = require('./lodash.mergewith')

/**
 * 防抖函数
 */
export function debounce(fn, wait) {
  var last
  return function () {
    var ctx = this,
      args = arguments
    clearTimeout(last)
    last = setTimeout(function () {
      fn.apply(ctx, args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle(func, delay) {
  var prev = 0
  return function () {
    var context = this
    var args = arguments
    var now = Date.now()
    if (now - prev >= delay) {
      func.apply(context, args)
      prev = now
    }
  }
}

/**
 * JS获取url参数
 *
 * @export
 * @param {*} variable
 * @returns [string | '']
 */
export function getQueryVariable(variable) {
  var query = window.location.search.substring(1)
  var vars = query.split("&")
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=")
    if (pair[0] == variable) {
      return pair[1]
    }
  }
  return ""
}

/**
 * input绑定事件
 *
 * @example
 * `onChange={handleInput.bind(this, "a.b.c")}`
 *
 * @tutorial https://github.com/NervJS/taro/issues/2642
 */
export function handleInput(keyName, event) {
  let value = event.detail.value

  let arr = keyName.split(".")
  let key = arr.shift()
  let obj = this.state[key]

  if (!arr.length) {
    this.setState({ [key]: value })
    return value
  }

  let reverseArr = arr.reverse()
  let sourceObj = {}
  let tmp = {}
  for (let i = 0; i < reverseArr.length; i++) {
    if (i == 0) {
      tmp[arr[i]] = value
      sourceObj = tmp
    } else {
      sourceObj = {}
      sourceObj[arr[i]] = tmp
      tmp = sourceObj
    }
  }

  /**
   * @see
   * https://www.lodashjs.com/docs/latest#_mergewithobject-sources-customizer
   * 
   */
  function customizer(objValue, srcValue) {
    if (Array.isArray(objValue)) {
      return srcValue
    }
  }
  let re = mergeWith({}, obj, sourceObj, customizer)

  this.setState({ [key]: re })

  return value
}

/**
 * 图片转base64格式
 *
 * @export
 * @param {string} url
 * @param {boolean} crossOrigin 是否跨域
 * @returns {Promise} base64图片
 */
export function img2base64(url, crossOrigin) {
  return new Promise(function (resolve, reject) {
    var img = new Image()

    img.onload = function () {
      var c = document.createElement("canvas")

      c.width = img.naturalWidth
      c.height = img.naturalHeight

      var cxt = c.getContext("2d")

      cxt.drawImage(img, 0, 0)
      // 得到图片的base64编码数据
      resolve(c.toDataURL("image/png"))
    }

    img.onerror = function () {
      img.onerror = null //控制不要一直跳动 
      reject()
    }

    crossOrigin && img.setAttribute("crossOrigin", "Anonymous")
    img.src = url
  })
}

/**
 * 根据富文本数据确定是否取消父盒子的内边距
 * @content 文本内存
 */
export function paddingZero(content) {
  try {
    // 判断当前课程介绍是不是海报的形式，是的话就取消父盒子的边距
    let reg1 = /<\/section>/g // 最多含有1
    let reg2 = /\<\/p>/g // 最多含有1
    let reg3 = /\<img/g // 最多含有1
    // console.log('content.match(reg1)',content.match(reg1))
    // console.log('content.match(reg1)',content.match(reg2))
    // console.log('content.match(reg1)',content.match(reg3))

    if (
      (!content.match(reg2) || content.match(reg2).length < 2) &&
      (!content.match(reg3) || content.match(reg3).length < 2) &&
      (!content.match(reg1) || content.match(reg1).length < 2)
    ) {
      document.querySelector('.rich-text').parentNode.classList.add('padding0')
    }
  } catch (err) {

  }
}

/**
 * 给数据前面加上0
 * @param {num} num 需要在前面加上0的参数
 */
export function addZero(num) {
  let a = String(num)
  if (a.length === 1) {
    a = '0' + a
  }
  return a
}

/**
 * 图片加载玩之后执行, 12s 之后也执行
 * @param {String} select 图片的父盒子选择器
 * @param {boolean} overtime 是否需要超时 默认 true
 */
export function loadedImg(select, overtime = true, late = 12) {
  const imgs = document.querySelectorAll(`${select} img`)
  let loadSum = 0
  return new Promise(resolve => {
    for (let i = 0; i < imgs.length; i++) {
      imgs[i].onload = function () {
        loadSum++
        if (loadSum === imgs.length) {
          resolve('ok')
        }
      }

      imgs[i].onerror = function () {
        loadSum++
        if (loadSum === imgs.length) {
          resolve('ok')
        }
      }
    }
    // 超时
    if (overtime) {
      setTimeout(() => {
        resolve('overtime')
      }, late * 1000)
    }
  })

}

/**
 * 判断图片是否已加载完毕
 * 
 */
export function imgloads(select, size = 40) {
  return new Promise(resolve => {
    const imgs = document.querySelectorAll(`${select} img`)
    console.log('imgs', imgs)
    let isover = false//true加载完毕，false还有未加载的
    let add = 0//循环当前次数
    let jdtime = setInterval(function () {
      isover = true
      add++
      for (let i = 0; i < imgs.length; i++) {
        if (!imgs[i].complete) {//还有没加载的图片
          isover = false
        }
      }
      if (isover || add >= size) {//加载完成，or超时
        clearInterval(jdtime)
        console.log("图片加载完成！用时" + (add * 250) + '毫秒')
        resolve('ok')
      }
    }, 250)
  })
}

/**
 * 图片加载玩之后执行, 12s 之后也执行
 * @param {String} select 图片的父盒子选择器
 * @param {boolean} overtime 是否需要超时 默认 true
 */

export function validate() {

}


export class HttpException extends Error {
  constructor(msg = '') {
    super()
    this.msg = msg
  }
}
