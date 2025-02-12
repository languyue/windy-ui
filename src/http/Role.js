import http from '../lib/http'
export default {
  getRoles() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/roles`
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
  getAllRoles() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/role/all`
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
  createRole(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/roles`
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
  bindRole(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/role/bind`
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
  updateRole(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/roles/${data.roleId}`
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
  deleteRole(roleId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/roles/${roleId}`
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
  getRole(roleId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/roles/${roleId}`
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
  getGropRoles(groupId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/groups/${groupId}/roles`
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
