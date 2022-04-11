import Taro from "@tarojs/taro"

import { setCookie } from "./storage"

/**
 * 检测是否登录,如未登录则拒绝跳转链接
 */
function checkReg() {
  Taro.showModal({
    title: "提示", //提示的标题,
    content: "您还未登录,是否登录体验更多功能", //提示的内容,
    showCancel: true, //是否显示取消按钮,
    cancelText: "取消", //取消按钮的文字，默认为取消，最多 4 个字符,
    cancelColor: "#000000", //取消按钮的文字颜色,
    confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
    confirmColor: "#D62419", //确定按钮的文字颜色,
    success: res => {
      if (res.confirm) {
        setCookie("Prev_URL", window.location.href)
        Taro.redirectTo({ url: "/pages/author" })
      }
    }
  })
}

export {
  checkReg
}