/** 版本更新时，清除所有的缓存 */
function versionUpdate() {
    let appVersion = localStorage.getItem('appVersion')
    appVersion = Number(appVersion) || 0
    let nowVersion = 5
    if (appVersion < nowVersion) {
        localStorage.clear()
        sessionStorage.clear()
        localStorage.setItem('appVersion', nowVersion)
    }
}

versionUpdate()