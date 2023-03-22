import http from '../lib/http'
export default {
    latestPipelineHistory(serviceId,pipelineId) {
        return new Promise((resolve, reject) => {
            let url = `/v1/devops/pipeline/${serviceId}/${pipelineId}/latest/history`
            http.get(url).then(res =>{
                resolve(res)
            }).catch(e =>{
                reject(e)
            })
        })
    },
}