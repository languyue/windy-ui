import http from "../lib/http";
export default {
  getDemandStatistics() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/metric/demand/statistics`;
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
  getDemandStatusStatistics() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/metric/demand/status/statistics`;
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
  getSystemHealthy() {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/metric/system/healthy`;
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
  getDemandDelayWorkload(startTime) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/metric/demand/workload?startTime=${startTime}`;
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
  getBugStatusStatistics(startTime) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/metric/bug/statistics?startTime=${startTime}`;
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
  getHealthyStatistics(startTime) {
    return new Promise((resolve, reject) => {
      let url = `/v1/devops/metric/healthy/statistics?startTime=${startTime}`;
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
};
