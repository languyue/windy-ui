import http from '../lib/http'
export default {
  getGroups() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/groups`
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
  createGroup(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/groups`
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
  updateGroup(groupId, data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/groups/${groupId}`
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
  deleteGroup(groupId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/groups/${groupId}`
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
  getGroup(groupId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/groups/${groupId}`
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
  getGroupUsers(groupId, page, size) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/groups/${groupId}/users?page=${page}&size=${size}`
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
  getGroupUserTree() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/group/user/tree`
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
