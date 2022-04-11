import CryptoJS from 'crypto-js/crypto-js'

var aseKey = "64164609"     //秘钥必须为：8/16/32位

const store = {}

/**aes加密 */ 
export function encrypt(message) {
    let value = JSON.stringify(message)
    // 加密 DES/AES切换只需要修改 CryptoJS.AES <=> CryptoJS.DES
    // eslint-disable-next-line no-shadow
    var encrypt = CryptoJS.AES.encrypt(value, CryptoJS.enc.Utf8.parse(aseKey), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString()
    return encrypt
}

/** aes 解密 */
export function decryption(encryptMessage) {
    // 空的不解密
    if (!encryptMessage) {
        return false
    }
    // 传来了一个userInfo对象也不解密
    if (Object.prototype.toString.call(encryptMessage) === '[object Object]' && encryptMessage.headimgurl) {
        return encryptMessage
    }
    var decrypt = CryptoJS.AES.decrypt(encryptMessage, CryptoJS.enc.Utf8.parse(aseKey), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8)
    decrypt = JSON.parse(decrypt)
    return decrypt
}