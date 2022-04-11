# 开发须知

本项目主要用于H5开发,主要技术栈`Taro`,项目中已加入`Vscode`通用配置及常见代码段(根目录`.vscode`文件夹)

- 线上地址 [https://wap.mylyh.com](https://wap.mylyh.com)
- 测试地址 [http://devwap.mylyh.com](http://devwap.mylyh.com)

## 1 开发安装

### 1.1 安装

- `@tarojs/cli@1.3.22` (全局安装,且通过管理员权限打开命令行窗口安装)
- 微信开发者工具
- 修改`Host`文件,增加 `127.0.0.1  wap.mylyh.com`,指向线上开发环境
- `Vscode`项目配置及代码段见`/.vscode`文件夹
- 安装依赖请用`yarn`安装(网络安装缓慢请自行科学上网)

### 1.2 OSS图床上传工具

下载地址: [图形化管理工具ossbrowser](https://help.aliyun.com/document_detail/61872.html?spm=a2c4g.11174283.2.25.a3337da2iIoFro)

登录:
```
* Endpoint:默认
* AccessKeyId:[请跟同事索取]
* AccessKeySecret:[请跟同事索取]
```
默认素材上传地址: `oss://lyhoss/miniapp/wx_img/`

## 2 webpack部分

正常打包开发过程跟`Taro`文档一样,项目多配置了[测试环境](http://devwap.mylyh.com)打包

```
开发环境     npm run dev:h5
测试环境打包  npm run test:h5
正式环境打包  npm run build:h5
```

> 测试环境增加的代码见`/config/test.js`
> ```
>  ...
>  env: {
>    NODE_ENV: '"test"',
>    API:'"//devuser.mylyh.com"'
>  },
>  ...
> ```

## 3 CSS部分

### 3.1 Flex布局

本项目基本布局都用`CSS3`弹性布局,并已加入`Vsocde`项目代码段,请查看`/.vscode/xx.code-snippets`3个文件

![删除sm.ms图床地址(慎用):https://sm.ms/delete/toDRpjN8Ih5qUCdWYb7fwa3uiK](https://i.loli.net/2020/02/16/dOr7wcVLnTZGfm1.gif)

### 3.2 SCSS+BEM命名

1. 通常页面布局最外框的`view`标签以开头大写字母,其余都是小写单词,并且遵从`BEM`命名规范
2. `/styles`里已放入通用样式
3. 请查看`/styles/var.scss`,常见字体大小以及颜色以加入`scss`变量,对应写入`vscode`代码提示

![Remove Link
https://sm.ms/delete/aAtXeDyhNO5unCUV7qk3KvocxG](https://i.loli.net/2020/02/17/usFv2qBmfgWAJnw.gif)

### 3.3 REM

设计效果图请遵循`750px`宽度

## 4 JS部分

### 4.1 网络请求

#### 4.1.1 request.js

封装文件地址 `/src/utils/request.js`,使用可查看 `/src/api` 文件夹

在请求服务的时候会自动在`header`头里加入`sid`参数
![Remove Link
https://sm.ms/delete/AnrY9KuEe4DSbyF5pkaOWcmLBT](https://i.loli.net/2020/02/20/NUp36ehPWtIO8lg.png)

关于`sid`参数值由`Mobx`提供,并已做`storage`缓存,详情请查看`/src/store/login.js`

#### 4.1.2 对应域名

开发环境对应域名请查看 `/config` 文件夹
- 测试环境及开发环境 API 域名都是 `"//devuser.mylyh.com"`  
- 正式环境 API 域名 `"//devadmin.mylyh.com"`


### 4.2 权限验证

登录验证组件见`/src/components/Login`组件

使用方法
```
import Login from "../../components/Login"

@Login
class Index extends Component{...}
```

## 5 Jenkins部署

> 已迁移到`coding`仓库自带的`Jenkins`服务

### 5.1 概要

![Remove Link
https://sm.ms/delete/BcXuSw5pGTfYedRj4Ch9qJxIPg](https://i.loli.net/2020/02/24/RdfsZyenrFOp5Lk.png)

- `master`构建: 构建完成的资源会上传到`prod`分支上，然后登录服务器拉取更新`prod`分支即可更新正式环境。登录正式服务器请跟后端同事索取账号以及项目地址

- `dev`构建: 上传到远程后,`Jenkins`自动构建,构建完成即可查看 [http://devwap.lyh.com](http://devwap.lyh.com)

### 5.2 查看设置

![Page Link https://sm.ms/image/Bza7yTe8DiA6NjP](https://i.loli.net/2020/02/24/Bza7yTe8DiA6NjP.png)

> 如果master分支并未更新,点击构建可能会导致构建中止,属正常情况
>![Remove Link
https://sm.ms/delete/lQBFK6XyvJzsIp8jEPY21LUAb7](https://i.loli.net/2020/02/24/W5IxK4Eomc3vJsX.png)

> `prod`分支主要由`Jenkins`自动化上传,必要时请在这里寻找回溯版本 
> `miniProgram`为本人业务时间的代码尝试,可不用理会

> 参考笔记 
> [Taro 开发微信 H5 记录](https://juejin.im/post/5dbac00ee51d455b332d4212)

