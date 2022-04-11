import Taro from "@tarojs/taro"
/**
 * 获取token值
 */
const TOKEN = 'sid'
export function getToken() {
  try {
    return Taro.getStorageSync(TOKEN)
    // return localStorage.getItem(TOKEN)
  } catch (e) {
    throw e
  }
}

/**
 * 设置token值
 * @param {string} value 
 */
export function setToken(value) {
  try {
    Taro.setStorageSync(TOKEN, value)
    // sessionStorage.setItem(TOKEN, value)
  } catch (e) {
    throw e
  }
}

/**
 * 删除token值
 */
export function removeToken() {
  try {
    Taro.removeStorageSync(TOKEN)
    // sessionStorage.removeItem(TOKEN)

  } catch (e) {
    throw e
  }
}
