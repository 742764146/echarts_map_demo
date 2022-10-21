import Koa from 'koa'
import JWT from 'koa-jwt'
import path from 'path'
import helmet from 'koa-helmet'
import statics from 'koa-static'
import router from './routes/routes'
import koaBody from 'koa-body'
import jsonutil from 'koa-json'
import cors from '@koa/cors'
import compose from 'koa-compose'
import compress from 'koa-compress'
import config from './config/index'
import log4js from '@/config/Log4j'
import errorHandle from './common/ErrorHandle'
import monitorLogger from '@/common/Logger'
// import Router from 'koa-router'

// const router2 = new Router()
const app = new Koa()
// const koaSwagger = require('koa-swagger-generator')(app)
// 定义公共路径，不需要jwt鉴权
const jwt = JWT({ secret: config.JWT_SECRET, passthrough: true }).unless({
  path: [/^\/public/, /^\/login/]
})

// let options = {
//   swaggerDefinition: {
//     info: {
//       description: 'This is a sample server',
//       title: 'Swagger',
//       version: '1.0.0'
//     },
//     host: 'localhost:3000/q',
//     basePath: '/v1',
//     produces: ['application/json', 'application/xml'],
//     schemes: ['http', 'https'],
//     securityDefinitions: {
//       JWT: {
//         type: 'apiKey',
//         in: 'header',
//         name: 'Authorization',
//         description: ''
//       }
//     }
//   },
//   route: {
//     docs: '/swagger.json', // swagger文件 api
//     url: '/swagger'
//   },
//   basedir: __dirname, // app absolute path
//   // files: ['./routes/api/*.js'] // Path to the API handle folder
//   files: ['./routes/modules/*.js']
// }
/**
 * 使用koa-compose 集成中间件
 */
const middleware = compose([
  monitorLogger,
  koaBody({
    multipart: true,
    formidable: {
      keepExtensions: true,
      maxFieldsSize: 5 * 1024 * 1024
    },
    onError: (err) => {
      console.log('koabody TCL: err', err)
    }
  }),
  statics(path.join(__dirname, '../public')),
  statics(path.join(__dirname, '../swagger')),
  cors(),
  jsonutil({ pretty: false, param: 'pretty' }),
  helmet(),
  jwt,
  errorHandle,
  config.isDevMode
    ? log4js.koaLogger(log4js.getLogger('http'), {
      level: 'auto'
    })
    : log4js.koaLogger(log4js.getLogger('access'), {
      level: 'auto'
    })
])

if (!config.isDevMode) {
  app.use(compress())
}
// console.log(config.baseUrl)
app.use(middleware)
app.use(router())
// let data = koaSwagger(options)
// router2.get('/swagger-ui', ctx => {
//   // ctx.body = options.swaggerDefinition
//   ctx.body = data
// })
app.use(router())
// app.use(router2.routes())
app.listen(config.port, () => {
  const logger = log4js.getLogger('out')
  logger.info('app is runing at ' + config.port)
})
