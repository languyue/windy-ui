import http from '../lib/http'
export default {
  getServicesPage(page, size, name) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/services/page?page=${page}&size=${size}&name=${name}`
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
  getServiceMembers(serviceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/services/${serviceId}/members`
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
  getBuildVersions() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/build/versions`
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
  getServiceStatics(serviceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/services/${serviceId}/statics`
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

  removeMember(serviceId, userId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/services/${serviceId}/members/${userId}`
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
  addServiceMembers(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/services/${data.serviceId}/members`
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
  getServices() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/services`
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
  createService(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/services`
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
  updateService(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/services`
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
  deleteService(serviceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/${serviceId}`
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
  getApiList(serviceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/${serviceId}/resources`
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
  getApi(apiId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/resources/${apiId}`
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
  deleteApi(apiId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/resources/${apiId}`
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
  batchDeleteApi(apis) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/resources?apis=${apis}`
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
  updateApi(api) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/resources`
      http
        .put(url, api)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  createApi(api) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/resources`
      http
        .post(url, api)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  importApi(api) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/api/import`
      http
        .post(url, api)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  buildGenerate(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/resources/generate`
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
  generateTemplate(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/resource/templates`
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
  getGenerate(serviceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/${serviceId}/generate`
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
  getGenerateLog(serviceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/service/${serviceId}/generate/log`
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
