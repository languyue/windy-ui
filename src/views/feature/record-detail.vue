<template>
  <div>
    <div class="title">
      <el-page-header @back="goBack" :content="recordName"> </el-page-header>
    </div>
    <el-row>
      <el-col :span="6">
        <div class="show-config">
          <el-button type="primary" size="mini" @click="showRecordConfig"
            >查看配置</el-button
          >
        </div>
        <div class="search">
          <span class="filter-txt">状态过滤:</span>
          <el-radio-group
            class="status-box"
            v-model="filterStatus"
            @change="chooseStatus"
          >
            <el-radio :label="1">全部</el-radio>
            <el-radio :label="2">失败</el-radio>
            <el-radio :label="3">成功</el-radio>
          </el-radio-group>
          <el-input
            size="mini"
            placeholder="输入用例名进行过滤"
            v-model="filterText"
          >
          </el-input>
        </div>
        <div class="tree-container">
          <el-scrollbar wrap-style="max-height: 600px;">
            <el-tree
              node-key="featureId"
              @node-click="treeNodeClick"
              :default-expanded-keys="errorList"
              :data="recordData"
              :filter-node-method="filterNode"
              :props="{
                children: 'children',
                label: 'featureName',
              }"
              ref="tree"
            >
              <span slot-scope="{ node, data }">
                <span class="custom-tree-node" :style="{ color: data.status }">
                  <i
                    v-if="node.isLeaf"
                    :style="{ color: data.status }"
                    :class="statusClass(data.executeStatus)"
                  />
                  <span v-if="data.skip">[已禁用]</span>
                  <span class="node-text">{{ node.label }}</span>
                </span>
              </span>
            </el-tree>
          </el-scrollbar>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="percent-box">
          <h3>任务执行统计</h3>
          <div class="ui-container">
            <div class="ui-item">
              <div class="ui-value ui-result">
                <el-progress
                  type="circle"
                  :percentage="executePercent"
                ></el-progress>
              </div>
              <div class="ui-label">执行进度</div>
            </div>
            <div class="ui-item">
              <div class="ui-value">{{ totalCount }}</div>
              <div class="ui-label">用例总数</div>
            </div>
            <div class="ui-item">
              <div class="ui-value ui-success">{{ successCount }}</div>
              <div class="ui-label">成功数</div>
            </div>
            <div class="ui-item">
              <div class="ui-value ui-error">{{ errorCount }}</div>
              <div class="ui-label">失败数</div>
            </div>
            <div class="ui-item">
              <div class="ui-value ui-result">{{ resultPercent }}%</div>
              <div class="ui-label">成功率</div>
            </div>
          </div>
        </div>

        <el-empty
          v-if="isShowEmpty"
          description="请在左侧点击详细用例查看详情"
        ></el-empty>
        <div v-else class="drawer-content">
          <div class="record-title">
            【{{ chooseFeature.featureName }}】执行历史记录
          </div>
          <div class="execute-detail">
            <el-tabs v-model="activeName">
              <el-tab-pane name="preset">
                <el-badge
                  slot="label"
                  is-dot
                  class="tab-label"
                  :hidden="!presetError"
                  >预置</el-badge
                >
                <PanelList :list="presetList" />
              </el-tab-pane>
              <el-tab-pane name="execute">
                <el-badge
                  slot="label"
                  is-dot
                  class="tab-label"
                  :hidden="!executeError"
                  >执行</el-badge
                >
                <PanelList :list="executeList" />
              </el-tab-pane>
              <el-tab-pane name="clean">
                <el-badge
                  slot="label"
                  is-dot
                  class="tab-label"
                  :hidden="!cleanError"
                  >清理</el-badge
                >
                <PanelList :list="cleanList" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog :visible.sync="dialogVisible" title="任务执行配置" width="70%">
      <json-viewer
        :value="jsonData"
        :expand-depth="5"
        copyable
        boxed
        sort
      ></json-viewer>
    </el-dialog>
  </div>
</template>
<script>
import taskApi from '../../http/Task'
import caseApi from '../../http/TestCase'
import featureApi from '../../http/Feature'
import PanelList from '../../components/panel-list.vue'
import JsonViewer from 'vue-json-viewer'
export default {
  components: {
    PanelList,
    JsonViewer,
  },
  data() {
    return {
      recordData: [],
      recordId: '',
      recordName: '',
      filterText: '',
      activeName: 'preset',
      resultList: [],
      presetList: [],
      executeList: [],
      cleanList: [],
      jsonData: [],
      dialogVisible: false,
      chooseFeature: {},
      isShowEmpty: true,
      errorList: [],
      presetError: false,
      executeError: false,
      cleanError: false,
      filterStatus: 1,
      totalCount: 0,
      successCount: 0,
      errorCount: 0,
      displayAll: false,
      recordStatus: 0,
    }
  },
  watch: {
    filterText(val) {
      this.displayAll = true
      this.$refs.tree.filter(val)
    },
  },
  computed: {
    resultPercent() {
      var ratio = this.successCount / this.totalCount
      return Math.round(ratio * 100)
    },
    executePercent() {
      if (this.totalCount == 0) {
        return 0
      }
      var ratio = (this.successCount + this.errorCount) / this.totalCount
      return Math.round(ratio * 100)
    },
  },
  methods: {
    statusClass(status) {
      console.log('status', status)
      switch (status) {
        case 1:
          return 'el-icon-success'
        case 2:
          return 'el-icon-error'
        case 3:
          return 'el-icon-warning'
        case 4:
          return 'el-icon-loading'
        default:
          return 'el-icon-info'
      }
    },
    chooseStatus() {
      this.displayAll = this.filterStatus != 1
      this.$refs.tree.filter()
    },
    goBack() {
      this.$router.push({ path: '/task' })
    },
    treeNodeClick(data) {
      this.resultList = []
      this.activeName = 'preset'
      this.chooseFeature = data
      this.isShowEmpty = false
      featureApi.getExecuteRecords(data.historyId).then((res) => {
        this.resultList = res.data
        this.filterRecord()
      })
    },
    filterRecord() {
      this.presetList = []
      this.executeList = []
      this.cleanList = []
      this.resultList.forEach((e) => {
        if (1 == e.testStage) {
          this.presetList.push(e)
          if (e.status != 1) {
            this.presetError = true
          }
        }
        if (2 == e.testStage) {
          this.executeList.push(e)
          if (e.status != 1) {
            this.executeError = true
          }
        }
        if (3 == e.testStage) {
          this.cleanList.push(e)
          if (e.status != 1) {
            this.cleanError = true
          }
        }
      })
    },
    filterNode(value, data) {
      if (
        this.filterStatus == 3 &&
        (!data.executeStatus || data.executeStatus != 1)
      ) {
        return false
      }
      if (
        this.filterStatus == 2 &&
        (!data.executeStatus || data.executeStatus != 2)
      ) {
        return false
      }
      if (!value) return true
      return data.featureName.indexOf(value) !== -1
    },
    getTaskHistories() {
      taskApi.getTaskHistoryTree(this.recordId).then((res) => {
        let list = res.data
        this.errorCount = 0
        this.successCount = 0
        this.displayTreeNode(list)
        this.recordData = list
        if (this.errorCount + this.successCount == this.totalCount) {
          clearInterval(this.queryInterval)
        }
      })
    },
    startInterval() {
      this.queryInterval = setInterval(() => {
        this.getTaskHistories()
      }, 2000)
    },
    displayTreeNode(list) {
      list.forEach((e) => {
        if (e.executeStatus) {
          if (e.executeStatus == 1) {
            this.successCount++
          } else {
            this.errorCount++
            this.errorList.push(e.featureId)
          }

          e.status = '#67C23A'
          if (e.executeStatus == 2) {
            e.status = '#F56C6C'
          } else if (e.executeStatus == 3) {
            e.status = '#E6A23C'
          } else if (e.executeStatus == 4) {
            e.status = '#409EFF'
          }
        }
        if (e.skip) {
          e.status = '#C0C4CC'
        }

        if (e.children && e.children.length > 0) {
          this.displayTreeNode(e.children)
        }
      })
    },
    showRecordConfig() {
      this.dialogVisible = true
      taskApi.getTaskRecordDetail(this.recordId).then((res) => {
        // this.jsonData = {
        //   执行机器列表: JSON.parse(res.data.machines),
        //   执行配置: JSON.parse(res.data.taskConfig),
        // };
        this.jsonData = JSON.parse(res.data.taskConfig)
      })
    },
    getRecordDetail() {
      taskApi.getTaskRecordDetail(this.recordId).then((res) => {
        this.recordName = `任务名称: ${res.data.taskName}`
        this.recordStatus = res.data.status
        this.getCaseFeatures(res.data.testCaseId)
        if (res.data.status == 4) {
          this.startInterval()
        }
      })
    },
    getCaseFeatures(caseId) {
      caseApi.getCaseFeatures(caseId).then((res) => {
        if (this.recordStatus != 4) {
          this.totalCount = this.errorCount + this.successCount
        } else {
          res.data.forEach((e) => {
            if (e.featureType == 1) {
              this.totalCount++
            }
          })
        }
      })
    },
  },
  created() {
    this.recordId = this.$route.query.recordId
    this.getRecordDetail()
    this.getTaskHistories()
  },
  beforeDestroy() {
    if (this.queryInterval) {
      clearInterval(this.queryInterval)
    }
  },
}
</script>
<style scoped>
.title {
  margin: 20px;
}
.search {
  margin: 10px 20px;
}
.show-config {
  margin: 10px 20px;
}
.record-title {
  font-weight: 800;
}
.execute-detail {
  margin-top: 20px;
}
.custom-tree-node {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  font-size: 14px;
}
.tab-label {
  margin-top: 10px;
}

.ui-container {
  width: 60%;
  display: flex;
  justify-content: space-between;
}

.ui-item {
  text-align: center;
}

.ui-value {
  font-size: 35px;
  font-weight: bold;
}
.ui-success {
  color: #67c23a;
}

.ui-error {
  color: #f56c6c;
}
.ui-result {
  color: #409eff;
}

.ui-label {
  font-size: 14px;
  color: #909399;
}
.percent-box {
  margin-bottom: 50px;
}
.filter-txt {
  font-size: 14px;
}
.status-box {
  margin: 10px 20px;
}
.node-text {
  margin-left: 5px;
}
.tree-container {
  max-height: 600px; /* 设置滚动区域最大高度 */
  overflow: hidden;
}
</style>
