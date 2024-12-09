<template>
  <div class="content">
    <!-- 表单查询开始 -->
    <el-form
      :inline="true"
      :model="queryForm"
      size="mini"
      @submit.native.prevent
    >
      <el-form-item label="任务名称">
        <el-input
          @input="startQuery"
          clearable
          v-model="queryForm.name"
          placeholder="请输入任务名称"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="startQuery"
          >查询</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-circle-plus-outline"
          @click="startCreate"
          >新增任务</el-button
        >
      </el-form-item>
    </el-form>
    <!-- 表单查询结束 -->

    <el-tabs v-model="activeName" @tab-click="selectTab">
      <el-tab-pane label="任务管理" name="first">
        <!-- 任务列表开始 -->
        <el-table :data="taskData" size="mini" style="width: 100%">
          <el-table-column prop="taskId" label="任务Id"> </el-table-column>
          <el-table-column prop="taskName" label="任务名称"> </el-table-column>
          <el-table-column prop="description" label="任务状态">
            <template slot-scope="scope">
              <i
                v-if="scope.row.isRunning"
                class="el-icon-loading loading-status"
              />
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间">
            <template slot-scope="scope">
              {{ scope.row.createTime | dateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-video-play"
                @click="startRun(scope.row)"
                plain
                >执行</el-button
              >
              <el-button size="mini" @click="editTask(scope.row)" plain
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                plain
                @click="deleteTask(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div>
          <el-pagination
            :page-size="10"
            :current-page="taskCurrentPage"
            @current-change="taskPageChange"
            layout="prev, pager, next"
            :total="taskTotal"
          >
          </el-pagination>
        </div>
        <!-- 任务列表结束 -->
      </el-tab-pane>
      <el-tab-pane label="任务记录" name="second">
        <!-- 执行记录表格开始 -->
        <el-table :data="recordData" size="mini" style="width: 100%">
          <el-table-column prop="taskName" label="任务名称"> </el-table-column>
          <el-table-column prop="statusName" label="状态">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status | statusFormat">{{
                scope.row.statusName
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="userId" label="执行人"> </el-table-column>
          <el-table-column label="执行时间">
            <template slot-scope="scope">
              <span> {{ dateFormat(scope.row.updateTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot="header">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-refresh"
                @click="getTaskRecords(1)"
                >刷新</el-button
              >
            </template>
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                v-if="scope.row.status == 4"
                icon="el-icon-video-pause"
                @click="stopRun(scope.row)"
                plain
                >停止</el-button
              >
              <el-button size="mini" @click="showRecord(scope.row)" plain
                >查看</el-button
              >
              <el-button
                size="mini"
                plain
                type="danger"
                @click="deleteTaskRecord(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- 执行记录表格结束 -->
        <div>
          <el-pagination
            :page-size="10"
            :current-page="recordCurrentPage"
            @current-change="recordPageChange"
            layout="prev, pager, next"
            :total="recordTotal"
          >
          </el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建任务开始 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="showDialog"
      @close="closeDialog"
      width="70%"
    >
      <el-form
        :model="taskForm"
        ref="taskForm"
        :rules="taskRule"
        size="small"
        label-width="120px"
      >
        <el-form-item label="任务名称" prop="taskName">
          <el-input
            v-model="taskForm.taskName"
            placeholder="请输入任务名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="taskForm.description"
            placeholder="请输入任务描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="测试集类型">
          <el-radio-group v-model="caseType" @change="chooseType">
            <el-radio :label="1">功能测试集</el-radio>
            <el-radio :label="2">e2e测试集</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择服务" v-if="caseType == 1" prop="serviceId">
          <el-select
            v-model="taskForm.serviceId"
            @change="selectService"
            placeholder="请选择"
          >
            <el-option
              v-for="item in services"
              :key="item.serviceId"
              :label="item.serviceName"
              :value="item.serviceId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择任务集" prop="testCaseId">
          <el-select
            v-model="taskForm.testCaseId"
            @change="selectTestCase"
            placeholder="请选择"
          >
            <el-option
              v-for="item in testCases"
              :key="item.testCaseId"
              :label="item.testCaseName"
              :value="item.testCaseId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务配置">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            size="mini"
            class="sync-btn"
            @click="refreshConfig"
            >同步测试集配置</el-button
          >
          <codeeditor
            ref="editer"
            :codes="jsonStr"
            @change="dataChange"
            :readonly="false"
          ></codeeditor>
        </el-form-item>

        <!-- <el-form-item label="执行机器">
          <div style="text-align: center">
            <el-transfer
              style="text-align: left; display: inline-block"
              v-model="executeList"
              filterable
              :render-content="renderFunc"
              :titles="['执行机列表', '选中列表']"
              :button-texts="['移除', '添加']"
              @change="handleChange"
              :format="{
                noChecked: '${total}',
                hasChecked: '${checked}/${total}',
              }"
              :data="machineList"
            >
            </el-transfer>
          </div>
        </el-form-item> -->

        <el-form-item>
          <el-button type="primary" @click="submit('taskForm')">确认</el-button>

          <el-button type="info" @click="closeDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 创建任务结束 -->
  </div>
</template>
<script>
import codeeditor from '../../components/CodeEditor.vue'
import serviceApi from '../../http/Service'
import testCaseApi from '../../http/TestCase'
import taskApi from '../../http/Task'
export default {
  components: { codeeditor },
  data() {
    return {
      recordData: [],
      taskData: [],
      queryForm: {},
      taskForm: {},
      showDialog: false,
      dialogTitle: '添加任务',
      isEdit: false,
      activeName: 'first',
      machineList: [],
      executeList: [],
      testCases: [],
      services: [],
      jsonStr: ``,
      taskCurrentPage: 1,
      taskTotal: 0,
      recordCurrentPage: 1,
      recordTotal: 0,
      caseType: 1,
      taskRule: {
        taskName: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
        ],
        serviceId: [
          { required: true, message: '请选择关联的服务', trigger: 'select' },
        ],
        testCaseId: [
          { required: true, message: '请选择关联的测试集', trigger: 'select' },
        ],
      },
    }
  },
  methods: {
    chooseType(type) {
      if (type == 2) {
        this.testCases = []
        testCaseApi.getE2EList().then((res) => {
          this.testCases = res.data
        })
      }
    },
    refreshConfig() {
      this.selectTestCase(this.taskForm.testCaseId)
    },
    dataChange(info) {
      this.jsonStr = info
    },
    selectService(service) {
      this.testCases = []
      testCaseApi.getTestCaseList(service, 1, 100).then((res) => {
        this.testCases = res.data.data
      })
    },
    selectTestCase(testCaseId) {
      let array = {}
      testCaseApi.getTestCaseConfigs(testCaseId).then((res) => {
        if (res.data) {
          res.data.forEach((element) => {
            array[element.paramKey] = this.exchangeType(
              element.paramType,
              element.value
            )
          })

          this.jsonStr = JSON.stringify(array, null, 3)
        }
      })
    },
    exchangeType(paramType, value) {
      switch (paramType) {
        case 'String':
          return value
        case 'List':
          return JSON.parse(value)
        case 'Map':
          return JSON.parse(value)
        case 'Integer':
          return parseInt(value)
        case 'Float':
          return parseFloat(value)
        case 'Double':
          return parseFloat(value)
      }
      return value
    },
    startRun(row) {
      taskApi.runTask(row.taskId).then((res) => {
        if (res.data) {
          this.$notify.success('执行成功,请查看执行记录')
        } else {
          this.$notify.error('任务执行失败')
        }
      })
      this.getTasks(this.taskCurrentPage, this.queryForm.name)
    },
    stopRun(row) {
      taskApi.stopTask(row.recordId).then(() => {
        this.$notify.success('执行成功,请查看执行记录')
      })
      this.getTasks(this.taskCurrentPage, this.queryForm.name)
      this.getTaskRecords(this.recordCurrentPage)
    },
    startQuery() {
      this.getTasks(1, this.queryForm.name)
    },
    startCreate() {
      this.showDialog = true
      this.taskForm = {}
      this.isEdit = false
    },
    editTask(row) {
      this.isEdit = true
      this.taskForm = row
      this.showDialog = true
      this.selectService(row.serviceId)
      this.jsonStr = JSON.stringify(JSON.parse(row.taskConfig), null, 3)
      if (row.machines) {
        this.executeList = JSON.parse(row.machines)
      }
    },
    deleteTask(row) {
      this.$confirm(`确认删除任务【${row.taskName}】?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        taskApi.deleteTask(row.taskId).then((res) => {
          if (res.data) {
            this.$notify.success('删除成功')
            this.getTasks(this.taskCurrentPage, this.queryForm.name)
          } else {
            this.$notify.error('删除失败')
          }
        })
      })
    },
    closeDialog() {
      this.showDialog = false
      this.taskForm = {}
    },
    submit(taskForm) {
      this.$refs[taskForm].validate((valid) => {
        if (!valid) {
          return false
        }

        this.taskForm.machines = JSON.stringify(this.executeList)
        this.taskForm.taskConfig = this.jsonStr
        if (this.isEdit) {
          taskApi.updateTask(this.taskForm).then((res) => {
            this.closeDialog()
            this.getTasks(1)
            if (res.data == 1) {
              this.$notify.success('修改成功')
              return
            }

            this.$message.warning('修改失败')
          })
          return
        }

        taskApi.createTask(this.taskForm).then((res) => {
          this.closeDialog()
          this.getTasks(1)
          if (res.data == 1) {
            this.$notify.success('添加成功')
            return
          }

          this.$message.warning('添加失败')
        })
      })
    },
    getServices() {
      this.services = []
      serviceApi.getServices().then((res) => {
        this.services = res.data
      })
    },
    getTasks(page, name) {
      if (!name) {
        name = ''
      }
      taskApi.getTaskList(page, 10, name).then((res) => {
        this.taskTotal = res.data.total
        this.taskCurrentPage = 1
        this.taskData = res.data.data
      })
    },
    getTaskRecords(page) {
      taskApi.getTaskRecords(page, 10).then((res) => {
        this.recordTotal = res.data.total
        this.recordCurrentPage = page
        this.recordData = res.data.data
      })
    },
    selectTab() {
      if (this.activeName == 'first') {
        this.getTasks(1, this.queryForm.name)
      }

      if (this.activeName == 'second') {
        this.getTaskRecords(1)
      }
    },
    taskPageChange(page) {
      this.getTasks(page, this.queryForm.name)
    },
    recordPageChange(page) {
      this.getTaskRecords(page)
    },
    showRecord(row) {
      this.$router.push({
        path: '/record/detail',
        query: {
          recordId: row.recordId,
        },
      })
    },
    deleteTaskRecord(row) {
      taskApi.deleteTaskRecord(row.recordId).then(() => {
        this.$notify.success('删除成功')
        this.getTaskRecords(this.recordCurrentPage)
      })
    },
    dateFormat(time) {
      var date = new Date(time) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
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
    this.getServices()
    this.getTasks(1, '')
  },
}
</script>
<style scoped>
.content {
  margin: 5px;
}
.header-line {
  text-align: center;
}
.delete-icon {
  font-size: 20px;
  cursor: pointer;
}
.op-icon {
  margin-left: 10px;
}
.loading-status {
  font-size: 20px;
}
.sync-btn {
  margin: 10px 10px;
}
</style>
