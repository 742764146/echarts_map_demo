# Koa 的api模板项目

**一体化项目的接口平台：API 项目，技术栈为：Node.js + Koa2（路由、中间件） + webpack + babel +mysql + redis。**

## 开发需要用到的插件(生产环境)

```sh
koa #node框架 koa
@koa/cors # 解决koa框架跨域问题
cron #定时任务
Day.js #类似于momentjs
del #可用于删除文件目录
form-data #处理表单的数据
jsonwebtoken #jsonwebtoken 用于签发、解析 token
@types/jsonwebtoken #ts的jsonwebtoken
koa-body #协议解析
koa-combine-routers #用于组合koa-router 的多个实例的便捷中间件。
koa-compose  #整合koa的总间件
koa-compress #koa的压缩中间件
koa-helmet #header（头）安全
koa-json #漂亮打印响应中间件JSON格式
koa-jwt #用于路由权限控制
koa-log4 #打印管理项目日志
koa-router #koa路由
koa-static #处理静态文件,读取静态文件
make-dir #创建目录
nodemailer #邮件发送
redis #redis 数据存储
svg-captcha #在 node.js 中生成 svg 验证码
uuid #可用于创建随机的uuid
@types/uuid #ts版本
koa-swagger-generator #swagger
```

## 开发需要用到的插件(开发环境)

```sh
@babel/core
@babel/node
@babel/preset-env
babel-loader
eslint
eslint-config-standard
eslint-plugin-import
eslint-plugin-node
eslint-plugin-promise
eslint-plugin-standard
clean-webpack-plugin
cross-env #环境变量
nodemon
nodemon-webpack-plugin
npm-run-all
terser-webpack-plugin
webpack
webpack-cli
webpack-merge
webpack-node-externals
```

## 项目使用swagger做接口文档
开发环境下通过访问http://127.0.0.1/docs.html 访问接口文档


## 项目目录/文件介绍
