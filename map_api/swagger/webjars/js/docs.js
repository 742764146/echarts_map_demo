$.views.settings.allowCode(true)
$.views.converters('getResponseModelName', function (val) {
  return getResponseModelName(val)
})

let tempBody = $.templates('#temp_body')
let tempBodyRefModel = $.templates('#temp_body_ref_model')
let tempBodyType = $.templates('#temp_body_type')

// 获取context path
let contextPath = getContextPath()
let jsonData
function getContextPath () {
  let pathName = document.location.pathname
  let index = pathName.substr(1).indexOf('/')
  let result = pathName.substr(0, index + 1)
  return result
}

$(function () {
  $.ajax({
    // url: "v2/api-docs",
    // url: 'http://petstore.swagger.io/v2/swagger.json',
    // url: 'http://localhost:3000/swagger.json',
    url: 'http://localhost:3000/swagger-ui',
    dataType: 'json',
    type: 'get',
    async: false,
    success: function (data) {
      // layui init
      layui.use(['layer', 'jquery', 'element'], function () {
        let $ = layui.jquery
        let layer = layui.layer
        let element = layui.element
      })
      jsonData = eval(data)

      $('#title').html(jsonData.info.title)
      $('body').html($('#template').render(jsonData))

      $("[name='a_path']").click(function () {
        let path = $(this).attr('path')
        let method = $(this).attr('method')
        let operationId = $(this).attr('operationId')
        $.each(jsonData.paths[path], function (i, d) {
          if (d.operationId == operationId) {
            d.path = path
            d.method = method
            $('#path-body').html(tempBody.render(d))

            // 如果没有返回值，直接跳过
            if (!d.responses['200'].hasOwnProperty('schema')) {
              // continue
              return true
            }

            // 基本类型
            if (d.responses['200'].schema.hasOwnProperty('type')) {
              let model = { type: d.responses['200'].schema.type }
              $('#path-body-response-model').append(tempBodyType.render(model))
              // continue
              return true
            }

            // 引用类型
            let modelName = getRefName(d.responses['200'].schema.$ref)
            if (d.parameters) {
              $.each(d.parameters, function (i, p) {
                if (p.schema) {
                  let parameterModelName = getRefName(p.schema.$ref)
                  renderRefModel(
                    'path-body-request-model',
                    jsonData,
                    parameterModelName
                  )
                }
              })
            }
            renderRefModel('path-body-response-model', jsonData, modelName)
          }
        })
      })

      // 提交测试按钮
      $("[name='btn_submit']").click(function () {
        let operationId = $(this).attr('operationId')
        let parameterJson = {}
        $("input[operationId='" + operationId + "']").each(function (
          index,
          domEle
        ) {
          let k = $(domEle).attr('name')
          let v = $(domEle).val()
          parameterJson.push({ k: v })
        })
      })
    }
  })
})

/**
 * 渲染ref类型参数
 * @param domId 需要添加的domId
 * @param jsonData
 * @param modelName
 */
function renderRefModel (domId, jsonData, modelName) {
  if (modelName) {
    let model = jsonData.definitions[modelName]
    model.name = modelName
    model.domId = domId
    // 修改有嵌套对象的type
    $.each(model.properties, function (i, v) {
      if (v.items) {
        $.each(v.items, function (j, item) {
          let typeModel = item.startsWith('#') ? getRefName(item) : item
          model.properties[i].type = 'Array[' + typeModel + ']'
        })
      }

      // 自定义对象类型（非Array）
      if (!v.type) {
        model.properties[i].type = getRefName(v.$ref)
      }
    })
    // 如果该对象没有被渲染到页面，则渲染
    if ($('#ref-' + domId + '-' + modelName).length == 0) {
      $('#' + domId).append(tempBodyRefModel.render(model))
    }

    // 递归渲染多层对象嵌套
    $.each(model.properties, function (i, v) {
      // Array
      if (v.items) {
        $.each(v.items, function (j, item) {
          if (item.startsWith('#')) {
            renderRefModel(domId, jsonData, getRefName(item))
          }
        })
      }

      // 单个对象引用
      if (v.hasOwnProperty('$ref')) {
        renderRefModel(domId, jsonData, getRefName(v.$ref))
      }
    })
  }
}

// 获得模型名字
function getRefName (val) {
  if (!val) {
    return null
  }
  return val.substring(val.lastIndexOf('/') + 1, val.length)
}

// 测试按钮，获取数据
function getData (operationId) {
  let path =
    contextPath + $("[m_operationId='" + operationId + "']").attr('path')
  // path 参数
  $("[p_operationId='" + operationId + "'][in='path']").each(function (
    index,
    domEle
  ) {
    let k = $(domEle).attr('name')
    let v = $(domEle).val()
    if (v) {
      path = path.replace('{' + k + '}', v)
    }
  })

  // header参数
  let headerJson = {}
  $("[p_operationId='" + operationId + "'][in='header']").each(function (
    index,
    domEle
  ) {
    let k = $(domEle).attr('name')
    let v = $(domEle).val()
    if (v) {
      headerJson[k] = v
    }
  })

  // 请求方式
  let parameterType = $('#content_type_' + operationId).val()

  // query 参数
  let parameterJson = {}
  if (parameterType == 'form') {
    $("[p_operationId='" + operationId + "'][in='query']").each(function (
      index,
      domEle
    ) {
      let k = $(domEle).attr('name')
      let v = $(domEle).val()
      if (v) {
        parameterJson[k] = v
      }
    })
  } else if (parameterType == 'json') {
    let str = $('#text_tp_' + operationId).val()
    try {
      parameterJson = JSON.parse(str)
    } catch (error) {
      layer.msg('' + error, { icon: 5 })
      return false
    }
  }

  // 发送请求
  send(path, operationId, headerJson, parameterJson)
}

/**
 * 请求类型
 */
function changeParameterType (el) {
  let operationId = $(el).attr('operationId')
  let type = $(el).attr('type')
  $('#content_type_' + operationId).val(type)
  $(el).addClass('layui-btn-normal').removeClass('layui-btn-primary')
  if (type == 'form') {
    $('#text_tp_' + operationId).hide()
    $('#table_tp_' + operationId).show()
    $('#pt_json_' + operationId)
      .addClass('layui-btn-primary')
      .removeClass('layui-btn-normal')
  } else if (type == 'json') {
    $('#text_tp_' + operationId).show()
    $('#table_tp_' + operationId).hide()
    $('#pt_form_' + operationId)
      .addClass('layui-btn-primary')
      .removeClass('layui-btn-normal')
  }
}

/**
 * 发送请求
 * @param url 地址
 * @param operationId   operationId
 * @param header    header参数
 * @param data  data数据
 */
function send (url, operationId, header, data) {
  let type = $("[m_operationId='" + operationId + "']").attr('method')

  // 是否有formData类型数据
  let hasFormData =
    $("[p_operationId='" + operationId + "'][in='formData']").length >= 1

  // 是否有body类型数据
  let hasBody =
    $("[p_operationId='" + operationId + "'][in='body']").length >= 1

  let options = { withQuotes: true }

  // 发送请求
  if (hasFormData) {
    let formData = new FormData($('#form_' + operationId)[0])
    $.ajax({
      type: type,
      url: url,
      headers: header,
      data: formData,
      dataType: 'json',
      cache: false,
      processData: false,
      contentType: false,
      success: function (data) {
        $('#json-response').jsonViewer(data, options)
      },
      error: function (e) {
        $('#json-response').html('')
        layer.msg('' + JSON.stringify(e), { icon: 5 })
      }
    })
    return
  }

  // querystring ,将参数加在url后面
  url = appendParameterToUrl(url, data)

  // requestBody 请求
  let bodyData
  if (hasBody) {
    let dom = $("[p_operationId='" + operationId + "'][in='body']")[0]
    bodyData = $(dom).val()
  }
  let contentType = $('#consumes_' + operationId).text()

  $.ajax({
    type: type,
    url: url,
    headers: header,
    data: bodyData,
    dataType: 'json',
    contentType: contentType,
    success: function (data) {
      $('#json-response').jsonViewer(data, options)
    },
    error: function (e) {
      $('#json-response').html('')
      layer.msg('' + JSON.stringify(e), { icon: 5 })
    }
  })
}

/**
 * 给url拼装参数
 * @param url
 * @param parameter
 */
function appendParameterToUrl (url, parameter) {
  if ($.isEmptyObject(parameter)) {
    return url
  }
  $.each(parameter, function (k, v) {
    if (url.indexOf('?') == -1) {
      url += '?'
    }
    url += k
    url += '='
    url += v
    url += '&'
  })
  return url.substring(0, url.length - 1)
}
function openObj (obj) {
  let k = jsonData.definitions[obj].properties
  let data = []
  for (let i in k) {
    data.push({
      properties: i,
      type: k[i].type,
      description: k[i].description
    })
  }
  let html = `<table class="layui-table">
        <thead>
          <tr>
            <th>Properties</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody id="tbody">
        </tbody>
      </table>`
  layer.open({
    title: `${obj}参数`,
    area: '500px',
    content: html,
    btn: ''
  })
  let tbody = document.querySelector('#tbody')
  let element = ''
  data.forEach((ele) => {
    element += `<tr>
         <td>${ele.properties}</td>
         <td>${ele.type}</td>
         <td>${ele.description}</td>
       </tr>`
  })
  tbody.innerHTML = element
}
