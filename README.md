# 项目 Weather-applet
天气预报微信小程序

## 项目浏览
#### 用户拒绝授权位置信息,调用微信开发接口,弹出授权设置页面,设置后更新位置与天气,支持下拉刷新，横向滑动列表
![gif](https://github.com/doraeige/Weather-applet/blob/master/images/arrow.png/01.gif)

#### 用户同意授权位置信息，更新位置信息与天气
![gif](https://github.com/doraeige/Weather-applet/blob/master/images/arrow.png/02.gif)

## 项目思路
- 构建基本页面视图，展示天气信息
- 在未来24小时天气预测列表中，支持横向滑动列表，列表项为：时刻、天气图标和气温
- 调用天气API获取动态数据，从JSON数据中提取并渲染气温、天气名称等动态变量
- 点击按钮跳转到第二个页面，显示未来几天的天气预报，支持下拉刷新
- 获取用户当前位置的经纬度，使用腾讯位置服务(微信小程序JavaScript SDK)，reverseGeocoder逆地址解析得到城市名，并显示在页面上
- 传递城市名称给第二个页面，更新位置的同时，更新天气数据
- 设定状态变量，处理位置权限被拒绝的情况
- 处理从设置页面返回后，通过 wx.getSetting 回调函数获取设置信息，同步更新城市和天气

## 项目API
[天气 API 介绍](https://github.com/udacity/cn-wechat-weather/blob/default-1-1/weather_api.md)

## 存在问题
- 点击第二页时状态栏会出现一段白色栏的中断
- 打开授权设置页面标题栏不清晰，白色按钮以及黑色状态栏

## 如何运行
- 下载并解压此项目 或 将此项目克隆到你选择的路径下
- 打开微信开发者工具，输入自己的AppID，导入此项目
- 在微信公众平台，点击设置 - 开发设置 - 服务器域名 - request合法域名中添加 apis.map.qq.com 与 test-miniprogram.com
- 注册 腾讯位置服务(微信小程序JavaScript SDK)，获取自己的Key，设置Key开启webservice功能，授权IP 0.0.0.0-255.255.255.255
- 在 index.js 中 onLoad() 函数替换自己刚刚申请的key
- 刷新页面，完成

