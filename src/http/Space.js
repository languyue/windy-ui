import http from '../lib/http'
export default {
  getSpaceList() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/spaces`
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
  getSpaceDetail(spaceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/spaces/${spaceId}`
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
  deleteSpace(spaceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/spaces/${spaceId}`
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
  createSpace(space) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/spaces`
      http
        .post(url, space)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  updateSpace(spaceId, space) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/spaces/${spaceId}`
      http
        .put(url, space)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
}
