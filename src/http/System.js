import http from '../lib/http'
export default {
  getSystemVersion() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/system/version`
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
  updateGitConfig(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/system/config/git`
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
  updateMavenConfig(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/system/config/maven`
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
  updateRepository(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/system/config/repository`
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
  requestGitConfig() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/system/config/git`
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
  requestMavenConfig() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/system/config/maven`
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
  getDefaultPipeline() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/system/config/pipe`
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
  getImageRepository() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/system/config/repository`
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
  getMonitor() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/system/monitor`
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
  createTool(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/system/builds`
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
  updateTool(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/system/build`
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
  createSecret() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/system/git/push/secret`
      http
        .post(url, '')
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },

  deleteTool(toolId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/system/builds/${toolId}`
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
  getBuildTools() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/system/build/versions`
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
