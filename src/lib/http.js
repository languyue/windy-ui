import axios from 'axios'
import { Notification } from 'element-ui'
import cookies from 'js-cookie'

axios.interceptors.request.use(
  (config) => {
    let token = cookies.get('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

let isRedirecting = false
axios.interceptors.response.use(
  (res) => {
    return res
  },
  (error) => {
    if (error.response.data.code == 'Auth.000001') {
      if (isRedirecting) {
        return
      }
      isRedirecting = true
      cookies.remove('token')
      let path = window.location.hash.replace('#/', '')
      var gitWinLocHref = function () {
        var location = window.location.href.split('/')
        var basePath = location[0] + '//' + location[2]
        return basePath
      }
      if (
        window.location.href.indexOf('/feature') != -1 ||
        window.location.href.indexOf('/service/resource') != -1
      ) {
        //如果正在用例编辑那么就保存当前页面，在新的标签页进行登录
        window.open(gitWinLocHref() + '/#/login?redirect=' + path, '_blank')
        setTimeout(() => {
          isRedirecting = false
        }, 1000)
        return
      }
      window.location.href = gitWinLocHref() + '/#/login?redirect=' + path
      setTimeout(() => {
        isRedirecting = false
      }, 1000)
      return
    }
    if (error.response.data.code) {
      Notification.error({
        message: `[${error.response.data.code}] ${error.response.data.message}`,
      })
    } else {
      Notification.error({
        message: `访问服务器失败`,
      })
    }
    return Promise.reject(error)
  }
)

let base = ''
if (process.env.NODE_ENV != 'production') {
  base = '/api'
}
export default {
  get(url) {
    return new Promise((resolve, reject) => {
      axios
        .get(base + url)
        .then((res) => {
          if (res && res.status && res.status == 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  delete(url, data) {
    return new Promise((resolve, reject) => {
      axios
        .delete(base + url, { data: data })
        .then((res) => {
          if (res && res.status == 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  postFile(url, form) {
    return new Promise((resolve, reject) => {
      axios
        .post(base + url, form, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .then((res) => {
          if (res && res.status == 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  post(url, data) {
    return new Promise((resolve, reject) => {
      axios
        .post(base + url, data)
        .then((res) => {
          if (res && res.status == 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  put(url, data) {
    return new Promise((resolve, reject) => {
      axios
        .put(base + url, data)
        .then((res) => {
          if (res && res.status == 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
}
