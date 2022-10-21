// import path from 'path'
// JWT加密
const JWT_SECRET = 'long-random-password'
// 项目运行端口
const port = 3000
const isDevMode = process.env.NODE_ENV !== 'production'
export default {
  JWT_SECRET,
  port,
  isDevMode
}
