import http from '../lib/http'
export default {
  latestPipelineHistory(serviceId, pipelineId) {
    if (!pipelineId || this.serviceId) {
      return
    }
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/${serviceId}/${pipelineId}/latest/history`
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
  getPipelienStatus(pipelineId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/histories/${pipelineId}/status`
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
  getPipelienHistories(pipelineId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/${pipelineId}/histories`
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
  approval(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/node/approval`
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
