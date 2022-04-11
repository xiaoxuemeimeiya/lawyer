import Taro from "@tarojs/taro"
/**
 * 模仿获取cookie值
 * @param {string} key cookie的key值
 */
export function getCookie(key){
  try {
    return Taro.getStorageSync(key)
  } catch (e) {
    console.error(e)
  }
}

/**
 * 模仿设置cookie值
 * @param {string} key 
 * @param {string} value 
 */
export function setCookie(key,value){
  try {
    Taro.setStorageSync(key, value)
  } catch (e) {
    console.error(e)
  }
}

/**
 * 模仿删除cookie值
 * @param {string} key 
 */
export function removeCookie(key){
  try {
    Taro.removeStorageSync(key)
  } catch (e) {
    console.error(e)
  }
}
