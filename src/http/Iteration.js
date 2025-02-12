import http from '../lib/http'
export default {
  deleteMembers(iterationId, userId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops//iterations/${iterationId}/members/${userId}`
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
  addMembers(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/iterations/${data.resourceId}/members`
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
  getMembers(iterationId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops//iterations/${iterationId}/members`
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
  getIterationStatuses() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/iteration/statuses`
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
  getIterationList(spaceId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/${spaceId}/iterations`
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
  getIterationStatistic(iterationId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/iterations/${iterationId}/statistic`
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
  getIterationDetail(iterationId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/iterations/${iterationId}`
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
  deleteIteration(iterationId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/iterations/${iterationId}`
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
  createIteration(iteration) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/iterations`
      http
        .post(url, iteration)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  updateIteration(iterationId, iteration) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/iterations/${iterationId}`
      http
        .put(url, iteration)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
}
