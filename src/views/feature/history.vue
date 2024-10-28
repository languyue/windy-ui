<template>
  <div>
    <div class="debug-div">
      <el-table
        :data="historyData"
        size="mini"
        style="width: 100%"
        height="500"
      >
        <el-table-column prop="featureName" label="用例">
          <template slot-scope="scope">
            <textview :text="scope.row.featureName" :len="15" />
          </template>
        </el-table-column>
        <el-table-column prop="historyId" label="执行ID"> </el-table-column>

        <el-table-column
          prop="createTime"
          label="执行时间"
          :formatter="dateFormat"
        >
        </el-table-column>
        <el-table-column prop="executeStatus" label="结果" width="100px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.executeStatus == 1" type="success"
              >成功</el-tag
            >
            <el-tag v-if="scope.row.executeStatus == 3" type="danger"
              >超时</el-tag
            >
            <el-tag v-if="scope.row.executeStatus == 4" type="primary"
              >执行中</el-tag
            >
            <el-tag v-if="scope.row.executeStatus == 2" type="danger"
              >失败</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot="header">
            <el-button
              type="primary"
              size="mini"
              @click="refreshRecords"
              icon="el-icon-refresh"
              >刷新</el-button
            >
            <el-button
              type="primary"
              size="mini"
              v-if="feature"
              @click="startDebug"
              icon="el-icon-video-play"
              >调试</el-button
            >
          </template>
          <template slot-scope="scope">
            <el-button type="text" @click="showRecord(scope.row)" size="small"
              >查看</el-button
            >
            <el-button
              type="text"
              @click="deleteHistory(scope.row)"
              size="small"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-drawer
      title="历史列表"
      :visible.sync="showDrawer"
      :with-header="false"
      :append-to-body="true"
      :destroy-on-close="true"
      @close="closeDetail"
      size="40%"
      :modal-append-to-body="false"
    >
      <div class="drawer-content">
        <div class="drawer-title">
          详情列表
          <el-button
            class="refresh-btn"
            type="primary"
            @click="refreshHistory"
            icon="el-icon-refresh"
            size="mini"
            circle
          ></el-button>
        </div>
        <el-tabs v-model="activeName">
          <el-tab-pane name="preset">
            <div slot="label">
              <el-badge
                :value="presetError"
                class="tab-label"
                :hidden="presetError <= 0"
              >
                <el-button type="text">预置</el-button>
              </el-badge>
            </div>
            <PanelList :list="presetList" />
          </el-tab-pane>
          <el-tab-pane label="执行" name="execute">
            <div slot="label">
              <el-badge
                :value="executeError"
                class="tab-label"
                :hidden="executeError <= 0"
              >
                <el-button type="text">执行</el-button>
              </el-badge>
            </div>
            <PanelList :list="executeList" />
          </el-tab-pane>
          <el-tab-pane label="清理" name="clean">
            <div slot="label">
              <el-badge
                :value="cleanError"
                class="tab-label"
                :hidden="cleanError <= 0"
              >
                <el-button type="text">清理</el-button>
              </el-badge>
            </div>
            <PanelList :list="cleanList" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import featureApi from '../../http/Feature'
import taskApi from '../../http/Task'
import PanelList from '../../components/panel-list.vue'
import textview from '../../components/text-view.vue'

export default {
  components: {
    PanelList,
    textview,
  },
  props: {
    feature: String,
    task: String,
  },
  watch: {
    feature: {
      handler(val) {
        this.featureId = val
        this.getFeatureHistory(val)
      },
      deep: true,
      immediate: true,
    },
    task: {
      handler(val) {
        this.taskId = val
        this.getTaskHistories(val)
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      historyData: [],
      resultList: [],
      featureId: '',
      showDrawer: false,
      activeName: 'preset',
      presetList: [],
      executeList: [],
      cleanList: [],
      presetError: 0,
      executeError: 0,
      cleanError: 0,
      selectHistoryId: '',
      taskId: '',
    }
  },
  methods: {
    getTaskHistories(recordId) {
      taskApi.getTaskHistories(recordId).then((res) => {
        this.historyData = res.data
      })
    },
    startDebug() {
      featureApi.startFeature(this.featureId).then((res) => {
        if (res.data) {
          this.$notify.success('开始执行，请查看运行日志')
          this.refreshRecords()
        } else {
          this.$notify.error('执行失败')
        }
      })
    },
    refreshRecords() {
      if (this.taskId) {
        this.getTaskHistories(this.taskId)
        return
      }
      this.getFeatureHistory(this.featureId)
    },
    filterRecord() {
      this.presetList = []
      this.executeList = []
      this.cleanList = []
      this.resultList.forEach((e) => {
        if (1 == e.testStage) {
          this.presetList.push(e)
          if (e.status != 1) {
            this.presetError++
          }
        }
        if (2 == e.testStage) {
          this.executeList.push(e)
          if (e.status != 1) {
            this.executeError++
          }
        }
        if (3 == e.testStage) {
          this.cleanList.push(e)
          if (e.status != 1) {
            this.cleanError++
          }
        }
      })
    },
    refreshHistory() {
      this.getExecuteRecords(this.selectHistoryId)
    },
    getFeatureHistory(featureId) {
      this.historyData = []
      featureApi.getFeatureHistory(featureId).then((res) => {
        res.data.forEach((e) => {
          this.historyData.push(e)
        })
      })
    },
    getExecuteRecords(historyId) {
      this.resultList = []
      featureApi.getExecuteRecords(historyId).then((res) => {
        this.resultList = res.data
        this.filterRecord()
      })
    },
    closeDetail() {
      this.resultList = []
      this.presetList = []
      this.executeList = []
      this.cleanList = []
      this.activeName = 'preset'
      this.presetError = 0
      this.executeError = 0
      this.cleanError = 0
    },
    showRecord(row) {
      this.getExecuteRecords(row.historyId)
      this.showDrawer = true
      this.selectHistoryId = row.historyId
    },
    deleteHistory(row) {
      featureApi.deleteHistory(row.historyId).then(() => {
        this.getFeatureHistory(this.featureId)
      })
    },
    changeUser() {},
    dateFormat(row) {
      var date = new Date(row.createTime) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var Y = date.getFullYear() + '-'
      var M =
        (date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1) + '-'
      var D = date.getDate() + ' '
      var h = date.getHours() + ':'
      var m = date.getMinutes() + ':'
      var s = date.getSeconds()
      return Y + M + D + h + m + s
    },
  },
  created() {
    this.featureId = this.feature
  },
}
</script>
<style scoped>
.debug-div {
  min-height: 300px;
}
.icon-tag {
  font-size: 16px;
  color: #409eff;
}
.error-title {
  font-size: 20px;
  font-weight: 9000;
}
.drawer-content {
  margin: 20px 10px;
}
.drawer-title {
  margin: 20px 0px;
}
.tab-label {
  margin-top: 10px;
}
.refresh-btn {
  float: right;
  margin-right: 10px;
}
</style>
