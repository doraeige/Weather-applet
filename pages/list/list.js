const dayMap = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六"]

Page({
  data: {
    weekWeather: [],
    city: '广州市'
  },

  // 小程序刚刚启动时，会调用启动页面的 onLoad() 函数
  // 一个页面只会调用一次，可以在 onLoad 的参数中获取打开当前页面路径中的参数
  onLoad(options) {
    // console.log(options.city)
    this.setData({
      city: options.city
    })
    this.getWeekWeather()
  },

  onPullDownRefresh() {
    this.getWeekWeather(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 获取动态天气数据
  getWeekWeather(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        time: new Date().getTime(),
        city: this.data.city
      },
      success: (res) => {
        let result = res.data.result
        // console.log(result)
        this.setWeekWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },

  // set weekWeather
  setWeekWeather(result) {
    let weekWeather = []
    for (let i = 0; i < result.length; i++) {
      let date = new Date()
      // 获取未来一周时间
      date.setDate(date.getDate() + i)
      // console.log(date)

      // weekWeather {day: "今天", date: "2018-9-19", temp: "1°-6°", iconPath: "/images/overcast-icon.png"}
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${result[i].minTemp}°-${result[i].maxTemp}°`,
        // '/images/' + result[i].weather + '-icon.png'
        iconPath: `/images/${result[i].weather}-icon.png`
      })
    }

    weekWeather[0].day = '今天'
    this.setData({
      weekWeather
    })
  }
})