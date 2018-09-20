// 从服务器中拿到的 weather 是英文的，而我希望在页面上显示中文的。因此建立一个对应将英文转化为中文
const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
// 建立一个对应将英文转化为对应的颜色
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

// 创建 QQMapWX 对象,引入SDK核心类
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')
// let qqmapsdk

// 设定状态变量 分别表示 未弹窗(默认)，弹窗拒绝，弹窗同意
const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

// 根据状态变量，设置提示的不同文字，获取位置或打开权限
const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    weatherList: [],
    todayDate: '',
    todayTemp: '',
    city: '广州市',
    locationTipsText: UNPROMPTED_TIPS,
    locationAuthType: UNPROMPTED
  },

  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 小程序刚刚启动时，会调用启动页面的 onLoad() 函数
  // 实例化API核心类
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'SB3BZ-UBU23-7Y53W-YAUUC-7HXWO-XRBRW'
    })

    this.getNow()
  },

  // 在页面出现时，判断当前的权限设置，从而作出对应的赋值
  onShow() {
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        // 只有在 权限从无到有 的情况下，才会调用网络
        if (auth && this.data.locationAuthType !== AUTHORIZED) {
          this.setData({
            locationAuthType: AUTHORIZED,
            locationTipsText: AUTHORIZED_TIPS
          })
          this.getLocation()
        }
      }
    })
  },

  // 系统启动时，并不应该执行 wx.stopPullDownRefresh()，也不知道在没有下拉刷新时，这个函数会产生什么副作用
  // 因此给 getNow() 添加 回调函数callback 参数，在wx.request 的 complete 的回调函数中，执行参数函数。
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      // 网络调用中使用动态变量
      data: {
        city: this.data.city
      },
      success: res => {
        let result = res.data.result
        // set nowWeather
        this.setNow(result)
        // set weatherList
        this.setHourlyWeather(result)
        // setToday
        this.setToday(result)
      },
      //添加 回调函数callback 参数
      complete: () => {
        callback && callback()
      }
    })
  },

  setNow(result) {
    let temp = result.now.temp
    let weather = result.now.weather

    // 直接修改 this.data 而不调用 this.setData 是无法改变页面的状态的，还会造成数据不一致
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })

    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },

  setHourlyWeather(result) {
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (var i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (nowHour + i * 3) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      weatherList: hourlyWeather
    })
  },

  setToday(result) {
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}°- ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },

  onTapDayWeather() {
    // wx.navigateTo 路径后可以带参数
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city
    })
  },

  onTapLocation() {
    // 根据 locationAuthType 状态变量不同而进行 获取位置 或进入设置页面
    // 若是 this.data.locationAuthType === UNAUTHORIZED 也就是说被拒绝了，则调起客户端小程序设置界面;设置界面只会出现小程序已经向用户请求过的权限。否则，调用 wx.getLocation 拿到用户位置信息, 这里有两种情况，一种是未弹窗 或者是 用户已经同意获取位置信息 
    if (this.data.locationAuthType === UNAUTHORIZED) {
      // wx.openSetting({}) 即将废弃，改为 button组件 bindopensetting
      wx.openSetting({})
    } else {
      this.getLocation()
    }
    // this.getLocation()
  },

  //调用 微信小程序JavaScript SDK reverseGeocoder 逆地址解析接口
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          locationAuthType: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
        })
        // console.log(res.latitude, res.longitude)
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: (res) => {
            let city = res.result.address_component.city
            // console.log(city)
            this.setData({
              city: city
              // locationTipsText: AUTHORIZED_TIPS
            })
            // 网络数据返回之后 调用this.getNow() 重新使用新的数据
            this.getNow()
          }
        })
      },

      // 如果拒绝使用位置服务，locationTipsText 将显示'点击开启位置权限',再次点击 location-wrapper 不再出现弹窗，所以函数开头加个判断
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
          locationTipsText: UNAUTHORIZED_TIPS
        })
      }
    })
  }
})