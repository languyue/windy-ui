import http from '../lib/http'
export default {
  login(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/user/login`
      http
        .post(url, data)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  logout() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/user/logout`
      http
        .put(url)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  getUserDetail() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/user/detail`
      http
        .get(url)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  createUser(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/users`
      http
        .post(url, data)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  queryUserByName(name) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/user?name=${name}`
      http
        .get(url)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  updateUser(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/users/${data.userId}`
      http
        .put(url, data)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  updatePassword(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/users/${data.userId}/password`
      http
        .put(url, data)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  resetPassword(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/users/${data.userId}/reset`
      http
        .put(url)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  getUser(userId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/users/${userId}`
      http
        .get(url)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  deleteUser(userId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/users/${userId}`
      http
        .delete(url)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
}
