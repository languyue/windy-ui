import http from '../lib/http'
export default {
  getTestCaseList(serviceId, page, size) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/${serviceId}/cases?page=${page}&pageSize=${size}`
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
  getE2EPage(page, size) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/e2e/page?page=${page}&pageSize=${size}`
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
  getE2EList() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/e2e/cases`
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
  createTestCase(testCase) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case`
      http
        .post(url, testCase)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  startBatchFeatures(caseId, data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/cases/${caseId}/batch`
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
  updateTestCase(testCase) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case`
      http
        .put(url, testCase)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  getTestCaseDetail(testCaseId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case/${testCaseId}`
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
  deleteTestCase(testCaseId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case/${testCaseId}`
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
  getTestCaseConfigs(testCaseId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case/${testCaseId}/configs`
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
  addConfigs(configs) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case/config`
      http
        .post(url, configs)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  updateConfig(config) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case/config`
      http
        .put(url, config)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  deleteConfig(configId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case/config/${configId}`
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
  getConfig(configId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case/config/${configId}`
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
  getCaseFeatures(caseId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/${caseId}/features`
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
