import http from '../lib/http'
export default {
  getUserMenuList() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/auth/menus`
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
  getResources(page, size) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/resources?page=${page}&size=${size}`
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
  getAllResources() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/resource/all`
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
  getRoleResources(roleId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/roles/${roleId}/resources`
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
  bindResource(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/resource/bind`
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
  createResource(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/resources`
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
  updateResource(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/resources/${data.resourceId}`
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
  deleteResource(resourceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/resources/${resourceId}`
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
  getResource(resourceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/resources/${resourceId}`
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
  getGropResources(groupId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/groups/${groupId}/resources`
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
}
