import Vue from 'vue'

Vue.filter('dateFormat', function (timestamp) {
  if (!timestamp) {
    return ''
  }
  var today = new Date(timestamp)

  //日期
  var DD = String(today.getDate()).padStart(2, '0') // 获取日
  var MM = String(today.getMonth() + 1).padStart(2, '0') //获取月份，1 月为 0
  var yyyy = today.getFullYear() // 获取年

  // 时间
  let hh = String(today.getHours()).padStart(2, '0') //获取当前小时数(0-23)
  let mm = String(today.getMinutes()).padStart(2, '0') //获取当前分钟数(0-59)
  let ss = String(today.getSeconds()).padStart(2, '0') //获取当前秒数(0-59)
  return yyyy + '-' + MM + '-' + DD + ' ' + hh + ':' + mm + ':' + ss
})

Vue.filter('dayFormat', function (timestamp) {
  if (!timestamp) {
    return ''
  }
  var today = new Date(timestamp)

  //日期
  var DD = String(today.getDate()).padStart(2, '0') // 获取日
  var MM = String(today.getMonth() + 1).padStart(2, '0') //获取月份，1 月为 0
  var yyyy = today.getFullYear() // 获取年
  return yyyy + '-' + MM + '-' + DD
})

Vue.filter('statusFormat', function (status) {
  if (!status) {
    return ''
  }
  switch (status) {
    case 1:
      return 'success'
    case 2:
      return 'danger'
    case 3:
      return 'info'
    case 4:
      return 'primary'
    case 5:
      return 'warning'
    case 6:
      return 'info'
  }
  return 'info'
})

Vue.filter('publisFormat', function (status) {
  if (!status) {
    return '-'
  }
  switch (status) {
    case 1:
      return '待发布'
    case 2:
      return '发布中'
  }
  return '-'
})

Vue.filter('deployType', function (status) {
  if (!status) {
    return '-'
  }
  switch (status) {
    case 1:
      return 'ssh部署'
    case 2:
      return 'K8S部署'
    case 3:
      return 'Docker部署'
  }
  return '-'
})

Vue.filter('deployFormat', function (status) {
  if (!status) {
    return '-'
  }
  switch (status) {
    case 1:
      return '可用'
    case 2:
      return '不可用'
  }
  return '-'
})

Vue.filter('statusName', function (status) {
  if (!status) {
    return '无'
  }
  switch (status) {
    case 1:
      return '处理成功'
    case 2:
      return '处理失败'
    case 3:
      return '处理超时'
    case 4:
      return '运行中'
    case 5:
      return '跳过失败'
    case 6:
      return '停止运行'
  }
  return '无'
})
