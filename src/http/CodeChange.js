import http from "../lib/http";
export default {
  codeChangeList(serviceId, page, size) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/${serviceId}/changes?page=${page}&size=${size}`;
      http
        .get(url)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  },
  relationList(name) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/relations?name=${name}`;
      http
        .get(url)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  },
  saveCodeChange(data) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/change`;
      http
        .post(url, data)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  },
  deleteCodeChange(serviceId, codeChangeId) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/pipeline/${serviceId}/change/${codeChangeId}`;
      http
        .delete(url)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          reject(e);
        });
    });
  },
};
