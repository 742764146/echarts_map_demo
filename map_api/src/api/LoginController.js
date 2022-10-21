// import moment from 'dayjs'
// import jsonwebtoken from 'jsonwebtoken'
// import config from '@/config'
// import { v4 as uuidv4 } from 'uuid'

class LoginController {
// 用户登录
  async login (ctx) {
    // 接收用户的数据
    // 返回token
    const { body } = ctx.request
    const username = body.username
    const password = body.password
    ctx.body = {
      code: 200,
      data: {
        username,
        password
      },
      msg: '登录成功'
    }
  }
}

export default new LoginController()
