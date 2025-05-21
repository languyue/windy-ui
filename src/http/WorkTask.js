import http from '../lib/http'
export default {
  getTaskPage(page, size, name="") {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/work/tasks?page=${page}&size=${size}&name=${name}`
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
  getTaskDetail(taskId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/work/tasks/${taskId}`
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
  deleteTask(taskId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/work/tasks/${taskId}`
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
  getTaskStatuses() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/work/task/statuses`
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
  createTask(task) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/work/tasks`
      http
        .post(url, task)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
  updateTask(task) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/work/task`
      http
        .put(url, task)
        .then((res) => {
          resolve(res)
        })
        .catch((e) => {
          reject(e)
        })
    })
  },
}
