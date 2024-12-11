import http from '../lib/http'
export default {
  getUserbugs(page, size) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/user/bugs?page=${page}&size=${size}`
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
  getBugList(page, size, name, status, spaceId, iterationId, type, acceptor) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/bugs?page=${page}&size=${size}&name=${name}&status=${status}&spaceId=${spaceId}&iterationId=${iterationId}&type=${type}&acceptor=${acceptor}`
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
  getIterationBugs(iterationId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/iterations/${iterationId}/bugs`
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
  getBugDetail(bugId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/bugs/${bugId}`
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
  getBugTags() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/bug/tags`
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
  deleteBug(bugId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/bugs/${bugId}`
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
  getBugStatuses() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/bug/statuses`
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
  createBug(bug) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/bugs`
      http
        .post(url, bug)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  updateBug(bug) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/bug`
      http
        .put(url, bug)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
}
