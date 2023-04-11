/************** 注意：此文件中的代码，不要做任何修改 ****************/
const config = require('./config')
const axios = require('axios')

// 导入 dayjs 模块
const dayjs = require('dayjs')
// 导入 dayjs 插件
const weekday = require('dayjs/plugin/weekday')
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
// 使用 dayjs 插件
dayjs.extend(weekday)
dayjs.extend(isSameOrAfter)

axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded'

const axiosPost = function (url, params) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, params)
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
const axiosGet = function (url, params) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params,
      })
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

// 获取token
async function getToken() {
  const params = {
    grant_type: 'client_credential',
    appid: config.app_id,
    secret: config.app_secret,
  }
  let res = await axiosGet('https://api.weixin.qq.com/cgi-bin/token', params)
  return res.data.access_token
}
// 获取天气情况
async function get_weather() {
  const params = {
    appid: config.wea_appid,
    appsecret: config.wea_appsecret,
    city: config.city,
    unescape: 1,
    version: 'v91',
  }
  const { data: res } = await axiosGet('https://v0.yiketianqi.com/api', params)
  return res.data[0]
}
get_weather()

// 获取当前时间：格式 2022年8月25日 星期五
function getCurrentDate() {
  let days = ''
  switch (
    dayjs().weekday() // 当前星期几
  ) {
    case 1:
      days = '星期一'
      break
    case 2:
      days = '星期二'
      break
    case 3:
      days = '星期三'
      break
    case 4:
      days = '星期四'
      break
    case 5:
      days = '星期五'
      break
    case 6:
      days = '星期六'
      break
    case 0:
      days = '星期日'
      break
  }
  return dayjs().format('YYYY-MM-DD') + ' ' + days
}

// 计算生日还有多少天
// function brthDate(brth) {
//   return dayjs(brth).diff(dayjs(), 'day')
// }
function brthDate(brth) {
  const nowDate = dayjs().format('YYYY-MM-DD') // 当前日期（格式：年-月-日）
  let birthDays = ''
  // 判断一个日期是否大于等于另一个日期：判断生日 是否大于等于 当前日期（返回布尔值）
  if (dayjs(brth).isSameOrAfter(nowDate)) {
    // 生日还没过
    birthDays = dayjs(brth).diff(dayjs(), 'day') // 获取两个日期相差的天数
    // if (birthDays === 0) console.log("今天是宝贝的生日，生日快乐");
  } else {
    // 生日已过,计算距离下一次生日还有多少天
    let nextBirthYears = dayjs().year() + 1 // 下一次生日年份等于当前年份+1
    let nextBirth = nextBirthYears + '-' + dayjs(brth).format('MM-DD') // 下一次生日年月日
    birthDays = dayjs(nextBirth).diff(dayjs(), 'day') // 获取两个日期相差的天数
  }
  return birthDays
}

// 土味情话
async function sweetNothings() {
  let res = await axiosGet('https://api.1314.cool/words/api.php?return=json')
  let str = ''
  config.loveStr ? (str = config.loveStr) : (str = res.data.word)
  return str.replace(/<br>/g, '\n')
}
sweetNothings()

// 随机颜色
function randomColor() {
  let randomColor =
    '#' +
    parseInt(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, '0')
  return randomColor
}

async function templateMessageSend(user) {
  const token = await getToken()
  const url =
    'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' +
    token
  // 天气信息
  let weatherInfo = await get_weather()
  // 计算在一起的天数
  let together_day = dayjs().diff(config.love_date, 'day')
  // 每日情话
  let loveStr = await sweetNothings()
  // 模板id 配置项
  let params = {
    touser: user,
    template_id: config.template_id,
    url: 'http://weixin.qq.com/download',
    topcolor: '#FF0000',
    data: {
      // 当前日期
      nowDate: {
        value: getCurrentDate(),
        color: randomColor(),
      },
      // 城市
      city: {
        value: config.city,
        color: randomColor(),
      },
      // 天气
      weather: {
        value: weatherInfo.wea,
        color: randomColor(),
      },
      // 当前气温
      temp: {
        value: weatherInfo.tem + '℃',
        color: randomColor(),
      },
      // 最低气温
      low: {
        value: weatherInfo.tem2 + '℃',
        color: randomColor(),
      },
      // 最高气温
      high: {
        value: weatherInfo.tem1 + '℃',
        color: randomColor(),
      },
      // 风向
      wind: {
        value: `${weatherInfo.win[0]} ${weatherInfo.win_meter} ${weatherInfo.win_speed}`,
        color: randomColor(),
      },
      // 空气质量
      airQuality: {
        value: weatherInfo.air_level,
        color: randomColor(),
      },
      // 湿度
      humidity: {
        value: weatherInfo.humidity,
        color: randomColor(),
      },
      // 宝贝的名字
      dearName: {
        value: config.birthday1.name,
        color: randomColor(),
      },
      // 我的名字
      myName: {
        value: config.birthday2.name,
        color: randomColor(),
      },
      // 距离宝贝生日
      dearBrthDays: {
        value: brthDate(config.birthday1.birthday),
        color: randomColor(),
      },
      // 距离我的生日
      myBrthDays: {
        value: brthDate(config.birthday2.birthday),
        color: randomColor(),
      },
      // 在一起的天数
      loveDays: {
        value: together_day,
        color: randomColor(),
      },
      // 每日情话
      loveWords: {
        value: loveStr,
        color: randomColor(),
      },
    },
  }
  let res = await axiosPost(url, params)
  switch (res.data.errcode) {
    case 40001:
      console.log('推送消息失败,请检查 appId/appSecret 是否正确')
      break
    case 40003:
      console.log('推送消息失败,请检查微信号是否正确')
      break
    case 40037:
      console.log('推送消息失败,请检查模板id是否正确')
      break
    case 0:
      console.log('推送消息成功')
      break
  }
}
// 循环用户数组，进行推送
if (config.user.length) {
  for (let index = 0; index < config.user.length; index++) {
    templateMessageSend(config.user[index])
  }
}

// 定时器（Cron）：定时推送消息
const schedule = require('node-schedule')
const scheduleCronstyle = () => {
  // 每天的早8点触发（定时器规则：秒/分/时/日/月/年，*号可理解为"每"的意思，如 0 0 8 * 这个*表示每日）
  schedule.scheduleJob('0 0 8 * * *', () => {
    templateMessageSend()
  })
}
scheduleCronstyle()
