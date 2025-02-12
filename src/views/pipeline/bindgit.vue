<template>
  <div>
    <div>
      <div class="git">
        服务GIT地址:
        <el-link
          type="primary"
          :underline="false"
          @click="goRepository(gitUrl)"
          >{{ gitUrl }}</el-link
        >
      </div>
    </div>

    <div>
      <div>
        <el-select
          v-model="selectedBranch"
          filterable
          remote
          size="small"
          @focus="remoteMethod"
          placeholder="请输入绑定的分支"
          loading-text="分支加载中..."
          :remote-method="remoteMethod"
          :loading="isLoadRemote"
        >
          <el-option
            v-for="item in branches"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-button
          type="primary"
          size="small"
          @click="createBind"
          class="search-btn"
          icon="el-icon-paperclip"
          >关联分支</el-button
        >
      </div>
      <div>
        <div class="bind-title">已绑定分支：</div>
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column prop="gitBranch" label="分支名" width="180">
          </el-table-column>
          <el-table-column prop="createTime" label="绑定时间" width="180">
          </el-table-column>
          <el-table-column prop="isChoose" label="是否绑定">
            <template slot-scope="scope">
              <i
                class="el-icon-circle-check choose-item"
                v-if="scope.row.isChoose"
              />
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作">
            <template slot-scope="scope">
              <el-button
                @click="bindBranch(scope.row)"
                icon="el-icon-connection"
                type="text"
                size="small"
                >{{ scope.row.isChoose ? '解绑' : '绑定' }}</el-button
              >
              <el-button
                @click="deleteBind(scope.row)"
                class="delete-icon"
                icon="el-icon-delete"
                type="text"
                size="small"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import gitBindApi from '../../http/GitBind'
export default {
  props: {
    pipeline: String,
    service: String,
  },
  data() {
    return {
      selectedBranch: '',
      branches: [],
      loading: false,
      tableData: [],
      pipelineId: '',
      serviceId: '',
      gitUrl: '',
      isLoadRemote: false,
    }
  },
  watch: {
    service: {
      handler(val) {
        if (val) {
          this.serviceId = val
          this.getService()
          this.getServiceBranch()
        }
      },
    },
    pipeline: {
      handler(val) {
        if (val) {
          this.pipelineId = val
          this.getBindBranches()
        }
      },
    },
  },
  methods: {
    goRepository(gitUrl) {
      window.open(gitUrl, '_blank')
    },
    deleteBind(row) {
      gitBindApi.deleteCodeChange(this.pipelineId, row.bindId).then((res) => {
        if (res.data == 1) {
          this.$notify.success('删除成功')
          this.getBindBranches()
        } else {
          this.$notify.error('删除失败')
        }
      })
    },
    remoteMethod() {
      this.isLoadRemote = true
      this.getServiceBranch()
    },
    bindBranch(item) {
      item.isChoose = !item.isChoose
      gitBindApi.bindBranch(item).then(() => {
        let msg = item.isChoose ? '绑定' : '解绑'
        this.$message({ message: `${msg}成功`, type: 'success' })
        this.getBindBranches()
      })
    },
    createBind() {
      if (!this.selectedBranch || this.selectedBranch == '') {
        this.$message({ message: '请先选择分支', type: 'warning' })
        return
      }

      let data = {
        gitBranch: this.selectedBranch,
        gitUrl: this.gitUrl,
        isChoose: false,
        pipelineId: this.pipelineId,
      }
      gitBindApi.createGitbind(data).then(() => {
        this.$message({ message: '关联成功', type: 'success' })
        this.getBindBranches()
      })
    },
    getBindBranches() {
      gitBindApi.gitbindList(this.pipelineId).then((res) => {
        this.tableData = res.data
      })
    },
    getService() {
      gitBindApi.getService(this.serviceId).then((res) => {
        this.gitUrl = res.data.gitUrl
      })
    },
    getServiceBranch() {
      this.branches = []
      gitBindApi.getServiceBranch(this.serviceId).then((res) => {
        this.isLoadRemote = false
        res.data.forEach((branch) => {
          this.branches.push({ label: branch, value: branch })
        })
      })
    },
  },
  created() {
    this.serviceId = this.service
    this.pipelineId = this.pipeline
    this.getBindBranches()
    this.getService()
  },
}
</script>
<style scoped>
.git {
  max-width: 800px;
  width: 800px;
  height: 20px;
  line-height: 20px;
  vertical-align: middle;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  background-color: #f2f6fc;
  margin: 20px 10px;
  padding: 5px;
  position: relative;
  display: inline-block;
  font-size: 13px;
}
.git a {
  text-decoration: none;
}
.search-btn {
  margin-left: 20px;
}
.bind-title {
  margin: 20px 0;
  font-weight: 900;
}
.choose-item {
  font-size: 20px;
  font-weight: 900;
  color: #67c23a;
}
.delete-icon {
  color: #f56c6c;
}
</style>
