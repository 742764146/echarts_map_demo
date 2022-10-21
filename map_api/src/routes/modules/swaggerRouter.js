import Router from 'koa-router'
import Koa from 'koa'
const app = new Koa()
const koaSwagger = require('koa-swagger-generator')(app)
const router = new Router()
let options = {
  swaggerDefinition: {
    info: {
      description: 'This is a sample server',
      title: 'Swagger',
      version: '1.0.0'
    },
    host: 'localhost:3000/q',
    basePath: '/v1',
    produces: ['application/json', 'application/xml'],
    schemes: ['http', 'https'],
    securityDefinitions: {
      JWT: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: ''
      }
    }
  },
  route: {
    docs: '/swagger.json', // swagger文件 api
    url: '/swagger'
  },
  basedir: __dirname, // app absolute path
  // files: ['./routes/api/*.js'] // Path to the API handle folder
  files: ['../../routes/modules/*.js']
}
let data = koaSwagger(options)
router.get('/swagger-ui', ctx => {
  // ctx.body = options.swaggerDefinition
  ctx.body = data
})

export default router
