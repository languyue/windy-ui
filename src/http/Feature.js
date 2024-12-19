import http from '../lib/http'
export default {
  getFeatures(testCaseId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/case/${testCaseId}/features?page=1&size=10`
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
  getFeatureDetail(featureId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/${featureId}`
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
  createFeature(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature`
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
  deleteFeature(featureId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/${featureId}`
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
  updateFeature(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature`
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
  getFeatureByUser(userId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/user/${userId}/features`
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
  getExecutePoints(featureId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/${featureId}/execute/points`
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
  getExecutePoint(executePointId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/execute/point/${executePointId}`
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
  getExecutePointTemplate(executePointId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/points/${executePointId}/template`
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
  deleteExecutePoint(executePointId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/execute/point/${executePointId}`
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
  getAllTemplates() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/templates`
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
  getServiceTemplates(serviceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/${serviceId}/related/templates`
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
  addRelatedService(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/related/templates`
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
  startFeature(featureId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/start/${featureId}`
      http
        .post(url)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  getFeatureHistory(featureId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/${featureId}/histories`
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
  getExecuteRecords(historyId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/${historyId}/records`
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
  getExecuteOperators() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/execute/operators`
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
  deleteHistory(historyId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/history/${historyId}`
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
  filterFeatureByTag(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/tag/filter`
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
  getFeatureTree(testCaseId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/${testCaseId}/tree/features`
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
  copyCaseFeature(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/case/copy`
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
  pasteFeature(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/feature/paste`
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
  batchDeleteFeature(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/delete/features`
      http
        .delete(url, data)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  batchUpdateFeatures(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/batch/features`
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
}
