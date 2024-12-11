<template>
  <div>
    <div class="header-container">
      <img class="image-logo" :src="imageUrl" alt="windy" />
      <el-autocomplete
        class="custom-input"
        size="mini"
        clearable
        v-model="queryName"
        :fetch-suggestions="querySearchAsync"
        placeholder="请输入关联的需求、缺陷、任务名称"
        @select="selectData"
      >
        <template slot-scope="{ item }">
          <div class="query-type demand" v-if="item.relationType == 1">
            需求
          </div>
          <div class="query-type bug" v-else-if="item.relationType == 2">
            缺陷
          </div>
          <div class="query-type work" v-else>任务</div>
          <span>{{ item.value }}</span>
        </template>
      </el-autocomplete>
      <!-- 任务总览开始 -->
      <div class="ui-container">
        <el-tooltip
          effect="dark"
          content="未完成缺陷数"
          placement="right-start"
        >
          <div class="ui-item" @click="showTab('bug')">
            <div class="ui-value">{{ bugTotal }}</div>
            <div class="ui-label">缺陷数</div>
          </div>
        </el-tooltip>

        <el-tooltip
          effect="dark"
          content="未完成需求数"
          placement="right-start"
        >
          <div class="ui-item" @click="showTab('demand')">
            <div class="ui-value">{{ demandTotal }}</div>
            <div class="ui-label">需求数</div>
          </div>
        </el-tooltip>

        <el-tooltip
          effect="dark"
          content="未完成任务数"
          placement="right-start"
        >
          <div class="ui-item" @click="showTab('work')">
            <div class="ui-value">{{ taskTotal }}</div>
            <div class="ui-label">工作项</div>
          </div>
        </el-tooltip>
      </div>
      <!-- 任务总览结束 -->
    </div>
    <div class="content">
      <el-tabs type="border-card" v-model="activeName">
        <!-- 缺陷列表开始 -->
        <el-tab-pane label="缺陷" name="bug">
          <span slot="label"><i class="el-icon-aim"></i> 缺陷</span>
          <div class="content-detail">
            <div class="bug-div" v-for="(item, index) in bugData" :key="index">
              <el-row class="bug-row" :gutter="30">
                <el-col :span="1">
                  <el-tag
                    :type="item.status == 1 ? 'info' : 'primary'"
                    size="small"
                    >{{ exchnageBugStatus(item.status).statusName }}</el-tag
                  >
                </el-col>
                <el-col :span="23">
                  <div
                    class="bug-description title"
                    @click="showBugDetail(item)"
                  >
                    <textview :text="item.bugName" :len="100"> </textview>
                  </div>
                </el-col>
              </el-row>
              <div class="bug-bottom">
                <span class="bug-level p1" v-if="item.level == 1"
                  >P{{ item.level }}</span
                >
                <span class="bug-level p2" v-else-if="(item.level = 2)"
                  >P{{ item.level }}</span
                >
                <span class="bug-level p3" v-else>P{{ item.level }}</span>
                <span
                  >缺陷ID: {{ item.bugId }}
                  <i
                    :data-clipboard-text="item.bugId"
                    class="el-icon-document-copy copy-icon"
                /></span>
              </div>
              <div class="time-div">
                创建时间: {{ item.createTime | dayFormat }}
              </div>
            </div>
          </div>
          <div class="pagination">
            <el-pagination
              @size-change="handleSizeChange($event, 'bug')"
              @current-change="handleCurrentChange($event, 'bug')"
              :current-page.sync="bugPage"
              :page-sizes="[10, 20, 50]"
              :page-size="bugSize"
              layout="sizes, prev, pager, next"
              :total="bugTotal"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <!-- 缺陷列表结束 -->

        <!-- 需求列表开始 -->
        <el-tab-pane label="需求" name="demand">
          <span slot="label"><i class="el-icon-s-shop"></i> 需求</span>
          <div class="content-detail">
            <div
              class="bug-div"
              v-for="(item, index) in demandData"
              :key="index"
            >
              <div>
                <div class="title" @click="showDemand(item)">
                  <textview :text="item.demandName" :len="100"> </textview>
                </div>
                <div class="demand-desc">
                  <textview
                    :len="200"
                    :showpop="false"
                    :text="item.demandContent"
                  >
                  </textview>
                </div>
              </div>
              <div class="bug-bottom">
                <span class="bug-level p1" v-if="item.level == 1"
                  >P{{ item.level }}</span
                >
                <span class="bug-level p2" v-else-if="(item.level = 2)"
                  >P{{ item.level }}</span
                >
                <span class="bug-level p3" v-else>P{{ item.level }}</span>
                <span><i class="el-icon-user-solid" /> 古月澜</span>
                <span
                  ><span>需求ID:</span> {{ item.demandId }}
                  <i
                    :data-clipboard-text="item.demandId"
                    class="el-icon-document-copy copy-icon"
                /></span>
              </div>
              <div class="time-div">
                截止时间: {{ item.expectTime | dayFormat }}
              </div>
            </div>
          </div>
          <div class="pagination">
            <el-pagination
              @size-change="handleSizeChange($event, 'demand')"
              @current-change="handleCurrentChange($event, 'demand')"
              :current-page.sync="demandPage"
              :page-sizes="[10, 20, 50]"
              :page-size="demandSize"
              layout="sizes, prev, pager, next"
              :total="demandTotal"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <!-- 需求列表结束 -->
        <!-- 工作项列表开始 -->
        <el-tab-pane label="任务列表" name="work">
          <span slot="label"><i class="el-icon-s-claim"></i> 工作项</span>
          <div class="work-add">
            <el-button
              type="primary"
              size="mini"
              style="z-index: 1000"
              icon="el-icon-plus"
              @click="showTaskView"
              >新增工作项</el-button
            >
          </div>
          <div class="content-detail">
            <div class="bug-div" v-for="(item, index) in taskData" :key="index">
              <div>
                <div class="title">
                  <div @click="showEditWork(item)">
                    <textview :text="item.taskName" :len="100"> </textview>
                  </div>
                </div>
                <div class="demand-desc">
                  <textview
                    :showpop="false"
                    :len="200"
                    :text="item.description"
                  >
                  </textview>
                </div>
              </div>
              <div class="bug-bottom">
                <span
                  ><i class="el-icon-camera-solid bug-icon" /> [{{
                    item.taskId
                  }}] <i class="el-icon-document-copy"
                /></span>
                <span
                  ><i class="el-icon-user-solid" /> 工时:
                  {{ item.workload }} 天</span
                >
                <span
                  ><i class="el-icon-time" /> 结束点:
                  {{ item.completeTime | dayFormat }}</span
                >
              </div>
              <div class="time-div">
                开始时间: {{ item.createTime | dateFormat }}
                <div class="delete-icon" @click="deleteWork(item)">
                  <i class="el-icon-delete-solid" /> 删除
                </div>
              </div>
            </div>
          </div>
          <div class="pagination">
            <el-pagination
              @size-change="handleSizeChange($event, 'work')"
              @current-change="handleCurrentChange($event, 'work')"
              :current-page.sync="taskPage"
              :page-sizes="[10, 20, 50]"
              :page-size="taskSize"
              layout="sizes, prev, pager, next"
              :total="taskTotal"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <!-- 工作项列表结束 -->
      </el-tabs>
    </div>
    <el-dialog
      title="需求详情"
      :visible.sync="showDemandDetail"
      width="90%"
      @close="closeDemand"
    >
      <detail :demand="demandId"></detail>
    </el-dialog>
    <el-dialog title="缺陷详情" :visible.sync="showBugDialog" width="90%">
      <bugDetail :bug="bugId" :edit="true" @cancel="closeBug"></bugDetail>
    </el-dialog>
    <el-dialog
      :title="workTitle"
      :visible.sync="showTaskDialog"
      @close="closeTask"
    >
      <div>
        <el-form
          :model="taskForm"
          ref="taskForm"
          label-width="120px"
          :rules="taskRules"
          size="mini"
        >
          <el-form-item label="工作项名称" prop="taskName">
            <el-input
              v-model="taskForm.taskName"
              placeholder="请输入任务名称"
            />
          </el-form-item>
          <el-form-item label="任务状态" v-if="isEditTask">
            <el-select v-model="taskForm.status" placeholder="请选择">
              <el-option
                v-for="item in taskStatus"
                :key="item.value"
                :label="item.statusName"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工作项描述">
            <el-input
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 20 }"
              v-model="taskForm.description"
              placeholder="请输入任务名称"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="关联ID" prop="relationId">
            <el-autocomplete
              style="width: 100%"
              v-model="selectItem.name"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入关联的需求、缺陷、任务名称"
              @select="handleSelect"
            >
              <template slot-scope="{ item }">
                <div class="query-type demand" v-if="item.relationType == 1">
                  需求
                </div>
                <div class="query-type bug" v-else-if="item.relationType == 2">
                  缺陷
                </div>
                <div class="query-type work" v-else>任务</div>
                <span>{{ item.value }}</span>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="完成时间" prop="completeTime">
            <el-date-picker
              v-model="taskForm.completeTime"
              align="right"
              type="date"
              value-format="timestamp"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button size="mini" type="info" @click="closeTask">取消</el-button>
        <el-button size="mini" type="primary" @click="submitTask('taskForm')"
          >确认</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Clipboard from 'clipboard'
import img from '../../../public/logo.svg'
import textview from '../../components/text-view.vue'
import demandApi from '../../http/DemandApi'
import bugApi from '../../http/BugApi'
import workTask from '../../http/WorkTask'
import detail from './detail.vue'
import bugDetail from './bug-detail.vue'
import requestApi from '../../http/CodeChange'
export default {
  components: {
    textview,
    detail,
    bugDetail,
  },
  data() {
    return {
      imageUrl: img,
      searchText: '',
      activeName: 'bug',
      total: 30,
      currentPage: 1,
      demandTotal: 0,
      demandPage: 1,
      demandSize: 10,
      demandData: [],
      bugTotal: 0,
      bugPage: 1,
      bugSize: 10,
      bugData: [],
      showDemandDetail: false,
      showBugDialog: false,
      demandId: '',
      bugId: '',
      bugStatus: [],
      demandStatus: [],
      showTaskDialog: false,
      taskRules: {
        taskName: [
          { required: true, message: '请输入工作项名称', trigger: 'blur' },
        ],
        relationId: [
          {
            required: true,
            message: '请选择关联的需求、缺陷',
            trigger: 'change',
          },
        ],
        expectTime: [
          {
            required: true,
            message: '请选择工作项完成时间',
            trigger: 'change',
          },
        ],
      },
      taskForm: {},
      relatedType: 1,
      taskTotal: 0,
      taskPage: 1,
      taskSize: 10,
      taskData: [],
      isEditTask: false,
      taskStatus: [],
      workTitle: '',
      selectItem: {},
      allData: [],
      queryName: '',
    }
  },
  methods: {
    deleteWork(item) {
      this.$confirm('删除工作项, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        workTask.deleteTask(item.taskId).then((res) => {
          if (res.data) {
            this.$notify.success('删除成功')
            this.getTasks()
          } else {
            this.$notify.error('删除失败')
          }
        })
      })
    },
    showTab(tabName) {
      this.activeName = tabName
    },
    querySearchAsync(queryString, cb) {
      var results = queryString
        ? this.allData.filter(this.createFilter(queryString))
        : this.allData
      cb(results)
    },
    createFilter(queryString) {
      return (item) => {
        return (
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
          item.relationId.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
      }
    },
    getAllData(cb) {
      requestApi.relationList('').then((res) => {
        this.allData = []
        res.data.forEach((e) => {
          e.value = e.name
          this.allData.push(e)
        })
        if (cb) {
          cb()
        }
      })
    },
    selectData(item) {
      if (item.relationType == 1) {
        this.demandId = item.relationId
        this.showDemandDetail = true
      }

      if (item.relationType == 2) {
        this.showBugDialog = true
        this.bugId = item.relationId
      }

      if (item.relationType == 3) {
        workTask.getTaskDetail(item.relationId).then((res) => {
          this.showEditWork(res.data)
        })
      }
    },
    handleSelect(item) {
      this.selectItem = item
      this.taskForm.relationId = item.relationId
    },
    showEditWork(row) {
      this.getAllData(() => {
        this.allData.forEach((e) => {
          if (e.relationId == row.relatedId) {
            this.selectItem = e
          }
        })
      })
      this.workTitle = '编辑工作项'
      this.showTaskDialog = true
      this.isEditTask = true
      this.taskForm = JSON.parse(JSON.stringify(row))
    },
    submitTask(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        this.taskForm.relatedId = this.selectItem.relationId
        this.taskForm.relatedType = this.selectItem.relationType
        if (this.isEditTask) {
          workTask.updateTask(this.taskForm).then((res) => {
            if (res.data) {
              this.$notify.success('修改任务成功')
              this.getTasks()
              this.closeTask()
            } else {
              this.$notify.error('修改任务失败')
            }
          })
          return
        }
        workTask.createTask(this.taskForm).then((res) => {
          if (res.data) {
            this.$notify.success('添加任务成功')
            this.getTasks()
            this.closeTask()
          } else {
            this.$notify.error('添加任务失败')
          }
        })
      })
    },
    closeTask() {
      this.selectItem = {}
      this.taskForm = {}
      this.showTaskDialog = false
      this.getTasks()
    },
    showTaskView() {
      this.workTitle = '创建工作项'
      this.showTaskDialog = true
      this.isEditTask = false
      this.getAllData()
    },
    closeBug() {
      this.showBugDialog = false
      this.bugId = ''
      this.getBugs()
    },
    closeDemand() {
      this.demandId = ''
      this.getDemands()
    },
    showBugDetail(row) {
      this.bugId = row.bugId
      this.showBugDialog = true
    },
    exchnageBugStatus(status) {
      let data = {}
      this.bugStatus.forEach((e) => {
        if (e.value == status) {
          data = e
        }
      })
      return data
    },
    demandStatusName(status) {
      let statusName = '-'
      this.demandStatus.forEach((e) => {
        if (e.value == status) {
          statusName = e.statusName
        }
      })
      return statusName
    },
    showDemand(row) {
      this.demandId = row.demandId
      this.showDemandDetail = true
    },
    handleSizeChange(size, type) {
      if (type == 'demand') {
        this.demandSize = size
        this.getDemands()
      }
      if (type == 'bug') {
        this.bugSize = size
        this.getBugs()
      }
    },
    handleCurrentChange(page, type) {
      if (type == 'demand') {
        this.demandPage = page
        this.getDemands()
      }
      if (type == 'bug') {
        this.bugPage = page
        this.getBugs()
      }
    },
    getDemands() {
      demandApi.getUserDemands(this.demandPage, this.demandSize).then((res) => {
        this.demandTotal = res.data.total
        this.demandData = res.data.data
      })
    },
    getBugs() {
      bugApi.getUserbugs(this.bugPage, this.bugSize).then((res) => {
        this.bugTotal = res.data.total
        this.bugData = res.data.data
      })
    },
    getTasks() {
      workTask.getTaskPaage(this.taskPage, this.taskSize).then((res) => {
        this.taskTotal = res.data.total
        this.taskData = res.data.data
      })
    },
    getStatusList() {
      demandApi.getDemandStatuses().then((res) => {
        this.demandStatus = res.data
        this.getDemands()
      })
      bugApi.getBugStatuses().then((res) => {
        this.bugStatus = res.data
        this.getBugs()
      })

      workTask.getTaskStatuses().then((res) => {
        this.taskStatus = res.data
        this.getTasks()
      })
    },
    initCopy() {
      let _this = this
      let clipboard = new Clipboard('.copy-icon')

      clipboard.on('success', function () {
        _this.$notify.success('复制成功')
      })
      clipboard.on('error', function () {
        _this.$notify.error('复制失败')
      })
    },
  },
  created() {
    this.getStatusList()
    this.getAllData()
  },
  mounted() {
    this.initCopy()
  },
}
</script>
<style lang="less" scoped>
.image-logo {
  width: 60px;
  height: 60px;
  border-radius: 60px;
  margin-right: 10px; /* 根据需要调整间距 */
}

.header-container {
  display: flex;
  align-items: center;
  margin: 20px;
  position: relative;
}
.input-div {
  display: flex;
  align-items: center;
}
.content {
  margin: 20px;
  margin-top: 40px;
}

.ui-container {
  width: 300px;
  position: absolute;
  top: 10px;
  right: 60px;
  display: flex;
  justify-content: space-between;
}

.ui-item {
  text-align: center;
  cursor: pointer;

  &:hover {
    color: #409eff;
  }
}
.p1 {
  background-color: #f56c6c;
}
.p2 {
  background-color: #409eff;
}
.p3 {
  background-color: #67c23a;
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

.content-detail {
  height: 500px;
  overflow-y: scroll;
}

.bug-div {
  position: relative;
  color: #303133;
  font-size: 13px !important;
  border-bottom: 1px solid #e4e7ed;
  padding: 15px;
  transition: background-color 0.3s;

  .time-div {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 13px;
    color: #909399;

    .delete-icon {
      margin: 20px;
      font-size: 13px;
      display: none;

      &:hover {
        color: #f56c6c;
      }
    }
  }

  &:hover {
    background-color: rgb(244, 244, 245);
    cursor: pointer;

    .delete-icon {
      display: block;
    }
  }
}

.bug-description {
  flex: 1;
  display: flex;
  align-items: center;
  word-break: break-all;
}
.bug-level {
  width: 25px;
  height: 15px;
  font-size: 12px;
  border-radius: 5px;
  margin-right: 10px;
  display: flex;
  color: #fff;
  justify-content: center;
  align-items: center;
}
.bug-bottom {
  margin-top: 10px;
  display: flex;
  color: #909399;
}
.bug-bottom span {
  margin-right: 10px;
}
.bug-icon {
  color: #f56c6c;
}
.pagination {
  margin-top: 10px;
}
.title {
  font-size: 15px;
  font-weight: 800;
  color: #606266;
  cursor: pointer;
  z-index: 1000;
  padding-left: 10px;
}
.title:hover {
  color: #409eff;
}
.demand-desc {
  font-size: 12px;
  margin-top: 5px;
  color: #909399;
}
.copy-icon {
  cursor: pointer;
}
.work-add {
  margin: 10px;
  margin-bottom: 20px;
}

.query-type {
  margin-top: 10px;
  margin-right: 10px;
  display: inline-block;
  height: 20px;
  padding: 0 5px;
  line-height: 20px;
  font-size: 12px;
  color: #fff;
  border-radius: 4px;
  box-sizing: border-box;
  white-space: nowrap;
}

.demand {
  background-color: #409eff;
}
.bug {
  background-color: #f56c6c;
}
.work {
  background-color: #909399;
}
</style>
<style>
.custom-input {
  width: 400px;
  box-sizing: border-box; /* 确保 padding 不会影响元素的总尺寸 */
}
</style>
