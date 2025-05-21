import http from '../lib/http'
export default {
  getUserDemands(page, size, name="") {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/user/demands?page=${page}&size=${size}&name=${name}`
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
  getIterationDemandList(iterationId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/iterations/${iterationId}/demands`
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
  getCustomerValue(){
     return new Promise((resolve, reject) => {
      let url = `/v1/devops/demand/customer/values`
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
  getDemandList(
    page,
    size,
    name,
    status,
    spaceId,
    iterationId,
    type,
    acceptor
  ) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/demands?page=${page}&size=${size}&name=${name}&status=${status}&spaceId=${spaceId}&iterationId=${iterationId}&type=${type}&acceptor=${acceptor}`
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
  getDemandDetail(demandId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/demands/${demandId}`
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
  deleteDemand(demandId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/demands/${demandId}`
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
  getDemandTags() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/demand/tags`
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
  getDemandStatuses() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/demand/statuses`
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
  createDemand(demand) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/demands`
      http
        .post(url, demand)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  updateDemand(demand) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/demand`
      http
        .put(url, demand)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
}
