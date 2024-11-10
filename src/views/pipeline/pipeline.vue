<template>
  <div>
    <!-- 服务title开始 -->
    <div class="title-line">
      <el-form :inline="true" size="mini" class="demo-form-inline">
        <el-form-item label="服务列表">
          <el-select
            v-model="serviceId"
            size="small"
            reserve-keyword
            @change="selectService"
            placeholder="请输入搜索的服务名"
          >
            <el-option
              v-for="item in serviceList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <!-- 服务title结束 -->

    <!-- 流水线内容开始 -->
    <div class="content">
      <el-row>
        <!-- 流水线列表开始 -->
        <el-col :span="4">
          <div class="left-content">
            <div class="op-line">
              <el-dropdown placement="bottom-end" @command="handleCommand">
                <span class="el-dropdown-link">
                  <i class="el-icon-edit" />管理<i
                    class="el-icon-arrow-down el-icon--right"
                  ></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="new"
                    ><i class="el-icon-circle-plus" />新增</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div class="pipeline-list">
              <el-collapse v-model="activePipelines">
                <el-collapse-item name="1">
                  <template slot="title">
                    <i class="el-icon-s-promotion title-icon" />
                    发布流水线
                  </template>
                  <div
                    v-for="(item, index) in publishList"
                    :key="index"
                    @click="selectPipeline(item)"
                    class="pipeline-item"
                    :class="{ 'selected-line': item.selected }"
                  >
                    <span>{{ item.pipelineName }}</span>
                    <div style="float: right">
                      <el-dropdown @command="operateLine($event, item)">
                        <span class="el-dropdown-link">
                          <i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command="delete"
                            >删除</el-dropdown-item
                          >
                        </el-dropdown-menu>
                      </el-dropdown>
                    </div>
                  </div>
                </el-collapse-item>
                <el-collapse-item name="2">
                  <template slot="title">
                    <i class="el-icon-cpu title-icon" /> 定时流水线
                  </template>
                  <div
                    v-for="(item, index) in buildList"
                    :key="index"
                    @click="selectPipeline(item)"
                    class="pipeline-item"
                    :class="{ 'selected-line': item.selected }"
                  >
                    <span>{{ item.pipelineName }}</span>
                    <div style="float: right">
                      <el-dropdown @command="operateLine($event, item)">
                        <span class="el-dropdown-link">
                          <i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command="delete"
                            >删除</el-dropdown-item
                          >
                        </el-dropdown-menu>
                      </el-dropdown>
                    </div>
                  </div>
                </el-collapse-item>
                <el-collapse-item name="3">
                  <template slot="title">
                    <i class="el-icon-s-custom title-icon" />
                    自定义流水线
                  </template>
                  <div
                    v-for="(item, index) in customList"
                    :key="index"
                    class="pipeline-item"
                    @click="selectPipeline(item)"
                    :class="{ 'selected-line': item.selected }"
                  >
                    <span>{{ item.pipelineName }}</span>
                    <div style="float: right">
                      <el-dropdown @command="operateLine($event, item)">
                        <span class="el-dropdown-link">
                          <i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item command="delete"
                            >删除</el-dropdown-item
                          >
                        </el-dropdown-menu>
                      </el-dropdown>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </el-col>
        <!-- 流水线列表结束 -->

        <!-- 流水线内容开始 -->
        <el-empty
          v-if="
            currentPipeline.pipelineConfig &&
            currentPipeline.pipelineConfig.length <= 0
          "
          description="请在左侧点击流水线查看详情"
        >
          <el-link
            type="primary"
            :underline="false"
            @click="handleCommand('new')"
            >创建流水线?</el-link
          >
        </el-empty>
        <el-col v-else :span="20">
          <!-- 流水线操作按钮开始 -->
          <div class="pipe-op-div">
            <el-button
              type="primary"
              v-if="isRunning"
              icon="el-icon-video-pause"
              size="mini"
              @click="pausePipeline"
              >停止</el-button
            >
            <el-button
              v-else
              type="primary"
              icon="el-icon-video-play"
              size="mini"
              v-clickOnce
              :disabled="currentPipeline.executeType != 1"
              @click="startPipeline"
              >运行</el-button
            >

            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="startEdit"
              >编辑</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-setting"
              v-if="currentPipeline.pipelineType != 1"
              size="mini"
              @click="showGitConfig = !showGitConfig"
              >Git配置</el-button
            >
            <el-button
              type="info"
              icon="el-icon-view"
              size="mini"
              @click="startView"
              >查看</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-upload"
              size="mini"
              v-if="currentPipeline.pipelineType != 1"
              @click="showPushMessageDialog"
              >推送发布</el-button
            >
          </div>
          <!-- 流水线操作按钮结束 -->

          <!-- 流水线运行描述信息开始 -->
          <div class="pipeline-detail">
            <el-descriptions title="流水线日志" :column="3" size="medium">
              <el-descriptions-item label="流水线ID">
                {{ currentPipeline.pipelineId }}</el-descriptions-item
              >
              <el-descriptions-item label="git分支">
                {{ history.branch }}</el-descriptions-item
              >
              <el-descriptions-item label="运行时间">
                {{ history.createTime | dateFormat }}
              </el-descriptions-item>
              <el-descriptions-item label="执行结果">
                <el-tag :type="history.pipelineStatus | statusFormat">{{
                  history.pipelineStatus | statusName
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="执行方式">
                <el-tag type="primary">{{
                  executeWay(currentPipeline.executeType)
                }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <!-- 流水线运行描述信息结束 -->

          <!-- 流水线ui开始 -->
          <div class="pipeline-content">
            <vue-pipeline
              :key="uuid"
              v-if="
                currentPipeline.pipelineConfig &&
                currentPipeline.pipelineConfig.length > 0
              "
              ref="pipeline"
              :x="50"
              :y="55"
              :data="currentPipeline.pipelineConfig"
              :showArrow="true"
              :ystep="70"
              :xstep="120"
              lineStyle="default"
              @select="showNodeLog"
            />
          </div>
          <!-- 流水线ui结束 -->

          <!-- 发布流水线关联分支开始 -->
          <div v-if="currentPipeline.pipelineType == 1">
            <h4 class="republis-info">待发布分支</h4>
            <el-table :data="publishData" style="width: 100%">
              <el-table-column prop="branch" label="分支"> </el-table-column>
              <el-table-column prop="message" label="发布内容">
                <template slot-scope="scope">
                  <textView :text="scope.row.message" :len="20"></textView>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态">
                <template slot-scope="scope">
                  {{ scope.row.status | publisFormat }}
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间">
                <template slot-scope="scope">
                  {{ scope.row.createTime | dateFormat }}
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="操作" width="100">
                <template slot-scope="scope">
                  <el-button
                    :disabled="history.pipelineStatus == 4"
                    @click="removePublish(scope.row)"
                    type="text"
                    size="small"
                    >移除发布</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!-- 发布流水线关联分支结束 -->
        </el-col>
        <!-- 流水线内容结束 -->
      </el-row>
    </div>
    <!-- 流水线内容结束 -->

    <!-- git配置开始 -->
    <el-dialog
      title="Git配置"
      :visible.sync="showGitConfig"
      :destroy-on-close="true"
      :before-close="closeGitDialog"
      width="70%"
    >
      <bind :pipeline="currentPipeline.pipelineId" :service="serviceId" />
    </el-dialog>
    <!-- git配置结束 -->

    <!-- 节点日志开始 -->
    <el-dialog
      title="节点日志"
      :visible.sync="isShowNodeLog"
      :destroy-on-close="true"
      @close="closeNodeLog"
      width="70%"
    >
      <span
        >节点运行状态:
        <el-tag :type="logForm.status | statusFormat">{{
          logForm.status | statusName
        }}</el-tag></span
      >
      <el-divider><i class="el-icon-receiving"></i></el-divider>
      <el-scrollbar>
        <ul class="log-list">
          <li
            class="log-item"
            v-for="(item, index) in logForm.messageList"
            :key="index"
          >
            <span>{{ item }}</span> <br />
          </li>
        </ul>
      </el-scrollbar>

      <div v-if="recordList && recordList.length > 0">
        <el-button type="primary" size="mini" @click="openTaskDetail"
          >查看任务详情</el-button
        >
        <el-table :data="recordList" size="mini" height="400px">
          <el-table-column prop="featureName" label="用例名称">
          </el-table-column>
          <el-table-column
            prop="executeStatus"
            label="用例状态"
            :filters="[
              { text: '成功', value: 1 },
              { text: '失败', value: 2 },
              { text: '超时', value: 3 },
              { text: '运行中', value: 4 },
            ]"
            :filter-method="filterStatus"
          >
            <template slot-scope="scope">
              <el-tag :type="scope.row.executeStatus | statusFormat">{{
                scope.row.executeStatus | statusName
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="执行时间">
            <template slot-scope="scope">
              {{ scope.row.createTime | dateFormat }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <!-- 节点日志结束 -->

    <!-- 创建/编辑流水线开始 -->
    <el-dialog
      :title="titleName"
      :visible.sync="pipelineDialog"
      width="80%"
      :destroy-on-close="true"
      :before-close="cancelCreatePipeline"
    >
      <PipelineConfig
        :operate="piplienOperate"
        :pipeline="pipelineId"
        :service="serviceId"
        @complete="completeNotify"
      />
    </el-dialog>
    <!-- 创建/编辑流水线结束 -->
    <!-- 审批开始 -->
    <el-dialog
      title="卡点审批"
      :visible.sync="showApproval"
      width="40%"
      :before-close="approvalClose"
    >
      <el-form
        :model="approvalForm"
        :rules="approvalRules"
        size="mini"
        ref="approvalForm"
        label-width="120px"
      >
        <el-form-item label="审批是否通过" prop="status">
          <el-radio-group v-model="approvalForm.status">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="2">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="审批是否通过"
          prop="message"
          v-if="approvalForm.status == 2"
        >
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入审批不通过原因"
            v-model="approvalForm.message"
          />
        </el-form-item>
        <el-form-item v-auth="'m10020'">
          <el-button
            size="mini"
            type="primary"
            @click="approvalPipeline('approvalForm')"
            >确认</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 审批结束 -->
    <!-- 发布弹框开始 -->
    <el-dialog
      title="发布确认"
      :visible.sync="showPublishDialog"
      width="50%"
      :before-close="publishDialogClose"
    >
      <el-form
        :model="publishForm"
        ref="publishForm"
        :rules="publishRule"
        size="mini"
        label-width="120px"
      >
        <el-form-item label="发布Tag" prop="tagName">
          <el-input
            v-model="publishForm.tagName"
            placeholder="请输入发布的tag名称"
          />
        </el-form-item>
        <el-form-item label="发布版本号">
          <el-input
            v-model="publishForm.version"
            placeholder="请输入发布的版本号，不配置则使用默认版本规则"
          />
        </el-form-item>
      </el-form>
      <el-table :data="publishData" style="width: 100%" size="mini">
        <el-table-column prop="branch" label="分支" width="200px">
        </el-table-column>
        <el-table-column prop="message" label="发布内容">
          <template slot-scope="scope">
            <textView :text="scope.row.message" :len="50"></textView>
          </template>
        </el-table-column>
      </el-table>

      <span slot="footer">
        <el-button size="mini" type="primary" @click="startRun('publishForm')"
          >开始流水线</el-button
        >
      </span>
    </el-dialog>
    <!-- 发布弹框结束 -->
    <!-- 推送发布消息开始 -->
    <el-dialog
      title="分支发布"
      :visible.sync="showPushMessage"
      width="40%"
      :before-close="closePublishMsg"
    >
      <el-form
        :model="publishMsgForm"
        ref="publishMsgForm"
        :rules="publishRule"
        size="mini"
        label-width="80px"
      >
        <el-form-item label="发布内容" prop="message">
          <el-input
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 20 }"
            v-model="publishMsgForm.message"
            placeholder="请输入发布分支的变更内容"
          />
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button size="mini" type="primary" @click="publish('publishMsgForm')"
          >推送发布分支</el-button
        >
      </span>
    </el-dialog>
    <!-- 推送发布消息结束 -->
  </div>
</template>
<script>
import bind from './bindgit.vue'
import PipelineConfig from './comp/pipeline-config.vue'
import pipelineApi from '../../http/Pipeline'
import publishApi from '../../http/Publish'
import serviceApi from '../../http/Service'
import taskApi from '../../http/Task'
import historyApi from '../../http/PipelineHistory'
import actionApi from '../../http/PipelineAction'
import utils from '../../lib/pipeline'
import nodeApi from '../../http/NodeBind'
import gitBindApi from '../../http/GitBind'
import textView from '../../components/text-view.vue'
export default {
  components: { bind, PipelineConfig, textView },
  data() {
    return {
      nodes: [],
      startIndex: 1,
      formLabelWidth: '80px',
      loading: false,
      activePipelines: ['1', '2', '3'],
      serviceList: [],
      currentPipeline: {
        pipelineConfig: [],
      },
      pipelineId: '',
      history: {},
      publishList: [],
      buildList: [],
      customList: [],
      isRunning: false,
      pipelineDialog: false,
      piplienOperate: 0,
      prenodeId: [],
      serviceId: '',
      titleName: '新增流水线',
      showGitConfig: false,
      uuid: 1,
      isShowNodeLog: false,
      logForm: {},
      publishData: [],
      approvalNode: {},
      showApproval: false,
      bindGit: false,
      recordList: [],
      taskRecordId: '',
      publishForm: {},
      publishRule: {
        tagName: [
          { required: true, message: '请输入tag名称', trigger: 'blur' },
        ],
        message: [
          { required: true, message: '请输入分支发布内容', trigger: 'blur' },
          { max: 256, message: '描述内容最长256', trigger: 'blur' },
        ],
      },
      showPublishDialog: false,
      showPushMessage: false,
      publishMsgForm: {},
      loopQuery: null,
      approvalForm: { status: 1 },
      currentRunningNode: '',
      approvalRules: {
        status: [
          { required: true, message: '请选择审批状态', trigger: 'change' },
        ],
        message: [
          {
            required: true,
            message: '请输入审批不通过原因',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    closePublishMsg() {
      this.showPushMessage = false
      this.publishMsgForm = {}
    },
    startRun(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let config = this.currentPipeline.context
          if (!config) {
            config = {}
          }

          config.paramList = this.publishForm
          let item = {
            pipelineId: this.currentPipeline.pipelineId,
            pipelineConfig: config,
          }
          pipelineApi
            .updatePipeline(this.serviceId, item.pipelineId, item)
            .then((res) => {
              if (res.data) {
                this.executePipeline()
              } else {
                this.$notify.error('添加tag失败，运行流水线失败')
              }
            })
        }
      })
    },
    closeNodeLog() {
      this.recordList = []
      this.taskRecordId = ''
    },
    filterStatus(value, row) {
      return row.executeStatus === value
    },
    executeWay(executeType) {
      let label = '-'
      switch (executeType) {
        case 1:
          label = '手动执行'
          break
        case 2:
          label = '代码提交'
          break
        case 3:
          label = '定时执行'
          break
      }
      return label
    },
    publishDialogClose() {
      this.showPublishDialog = false
      this.publishForm = {}
    },
    approvalClose() {
      this.approvalForm = { status: 1 }
      this.approvalNode = {}
      this.showApproval = false
    },
    approvalPipeline(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return
        }
        let item = {
          historyId: this.history.historyId,
          nodeId: this.approvalNode.nodeId,
          type: this.approvalForm.status,
          message: this.approvalForm.message,
        }
        historyApi.approval(item).then((res) => {
          if (res.data) {
            this.$notify({
              title: '流水线审批',
              message:
                this.approvalForm.status == 1
                  ? '审批通过'
                  : '审批不通过，流水线停止',
              type: this.approvalForm.status == 1 ? 'success' : 'warning',
            })
            this.approvalClose()
          } else {
            this.$notify.error('审批失败，请重试')
            return
          }
        })
      })
    },
    getServicePublishes() {
      this.publishData = []
      publishApi.getPublishes(this.serviceId).then((res) => {
        this.publishData = res.data
      })
    },
    showPushMessageDialog() {
      console.log('sssss')
      this.showPushMessage = true
      this.publishMsgForm = {}
    },
    publish(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let data = {
            pipelineId: this.currentPipeline.pipelineId,
            serviceId: this.serviceId,
            message: this.publishMsgForm.message,
          }
          publishApi.createPublish(data).then((res) => {
            if (res.data) {
              this.$notify.success('推送发布成功，请去发布流水线查看')
              this.closePublishMsg()
            } else {
              this.$notify.error('推送发布失败')
            }
          })
        }
      })
    },
    removePublish(row) {
      publishApi.deletePublish(row.publishId).then((res) => {
        if (res.data) {
          this.$notify.success('删除成功')
          this.getServicePublishes()
        } else {
          this.$notify.error('删除失败')
        }
      })
    },
    completeNotify() {
      this.pipelineDialog = false
      this.getPipelineList()
      if (this.piplienOperate == 1) {
        pipelineApi
          .queryPipeline(this.currentPipeline.pipelineId)
          .then((res) => {
            let config = utils.displayData(res.data.stageList)
            this.currentPipeline.pipelineConfig = config
            this.currentPipeline.pipelineName = res.data.pipelineName
            this.currentPipeline.pipelineType = res.data.pipelineType
            this.currentPipeline.pipelineId = res.data.pipelineId
            this.currentPipeline.pipelineStatus = res.data.pipelineStatus
            this.currentPipeline.context = res.data.pipelineConfig
            this.uuid++
          })
      }
    },
    exchangeStatusMessage(status) {
      let msg = '无'
      if (status == undefined || status == null) {
        return msg
      }

      switch (status) {
        case 4:
          msg = '运行中'
          break
        case 1:
          msg = '运行成功'
          break
        case 2:
          msg = '运行失败'
          break
        case 3:
          msg = '运行超时'
          break
        default:
          msg = '运行失败'
          break
      }
      return msg
    },
    exchangeExecuteStatus(status) {
      let type = 'info'
      if (status == undefined || status == null) {
        return type
      }

      switch (status) {
        case 4:
          type = 'primary'
          break
        case 1:
          type = 'success'
          break
        case 2:
          type = 'danger'
          break
        case 3:
          type = 'warning'
          break
        default:
          type = 'danger'
          break
      }
      return type
    },
    operateLine(command, item) {
      if (command == 'delete') {
        this.deletePipeline(item)
      }
    },
    selectService() {
      this.$store.commit('UPDATE_SERVICE_ID', this.serviceId)
      this.getPipelineList()
      this.currentPipeline = { pipelineConfig: [] }
    },

    showNodeLog(node) {
      if (!node.originData || !node.originData.actionId) {
        return
      }
      actionApi.getAction(node.originData.actionId).then((res) => {
        if (res.data.executeType == 'APPROVAL' && this.isRunning) {
          if (!this.history.historyId) {
            return
          }
          this.approvalNode = node
          this.showApproval = this.currentRunningNode == node.nodeId
          return
        }

        if (!this.history || !this.history.historyId) {
          this.logForm.status = 1
          this.logForm.messageList = ['未执行']
          this.isShowNodeLog = true
          return
        }

        console.log('ddd', res)
        let nodeType = res.data.executeType
        historyApi.getPipelienStatus(this.history.historyId).then((res) => {
          res.data.nodeStatusList.forEach((e) => {
            if (e.nodeId == node.nodeId) {
              this.logForm.nodeId = node.nodeId
              this.logForm.status = e.status
              this.logForm.messageList = e.message
              this.isShowNodeLog = true

              if (nodeType == 'TEST') {
                this.getTaskHistories(e.recordId)
              }
            }
          })
        })
      })
    },
    getTaskHistories(triggerId) {
      taskApi.getTaskRecordByTriggerId(triggerId).then((res) => {
        this.taskRecordId = res.data.recordId
        taskApi.getTaskHistories(this.taskRecordId).then((res) => {
          this.recordList = res.data
        })
      })
    },
    openTaskDetail() {
      let array = window.location.href.split('//')
      let domain = array[1].split('/')[0]
      console.log(
        `${array[0]}//${domain}/#/record/detail?recordId=${this.taskRecordId}`
      )
      window.open(
        `${array[0]}//${domain}/#/record/detail?recordId=${this.taskRecordId}`,
        '_blank'
      )
    },
    getPrenode(arr, index) {
      let tmp = {}
      arr.forEach((e) => {
        if (e.next && e.next.length > 0) {
          e.next.forEach((ele) => {
            if (ele.index == index) {
              tmp = e
            }
          })
        }
      })
      return tmp
    },
    preNodeAddline(array, prenodeId, itemIndexs, groupId) {
      array.forEach((e) => {
        if (e.id == prenodeId) {
          itemIndexs.forEach((ele) => {
            e.next.push({
              index: ele,
              weight: 0,
              groupId: groupId,
            })
          })
        }
      })
    },
    remoteMethod() {
      serviceApi.getServices().then((res) => {
        this.serviceList = []
        res.data.forEach((e) => {
          this.serviceList.push({
            label: e.serviceName,
            value: e.serviceId,
          })
        })
      })
    },
    pausePipeline() {
      if (!this.isRunning) {
        return
      }

      pipelineApi.pausePipeline(this.history.historyId).then((res) => {
        this.isRunning = false
        if (res.data) {
          this.$notify.success('停止流水线成功')
        } else {
          this.$notify.error('停止流水线失败')
        }
      })
    },
    startPipeline() {
      if (!this.currentPipeline.pipelineConfig.length) {
        this.$message.warning('请先选择流水线')
        return
      }

      let isPublish =
        this.currentPipeline.pipelineType == 1 && this.publishData.length < 1
      if (isPublish) {
        this.$message.warning('待发布列表为空，请先推送分支到发布流水线')
        return
      }

      if (this.currentPipeline.pipelineType != 1 && !this.bindGit) {
        let notify = this.$message.warning({
          dangerouslyUseHTMLString: true,
          message:
            '当前流水线未绑定分支，请先绑定 <span style="cursor: pointer;color:#409EFF" @click="showGitConfig = !showGitConfig">去绑定>></span>',
        })

        let that = this
        notify.$el.querySelector('span').onclick = () => {
          that.showGitConfig = !that.showGitConfig
        }
        return
      }

      if (this.currentPipeline.pipelineType == 1) {
        this.showPublishDialog = true
        return
      }

      this.executePipeline()
    },
    executePipeline() {
      pipelineApi.startPipeline(this.currentPipeline.pipelineId).then((res) => {
        if (res.data == '' || res.data == null) {
          this.$notify.error('运行流水线失败')
          return
        }
        this.$notify.success('开始运行流水线')
        this.getLatestHistory(this.currentPipeline.pipelineId)
        this.isRunning = true
        this.showPublishDialog = false
        this.currentPipeline.pipelineConfig.forEach((e) => {
          e.status = 'success'
        })
        this.uuid++
      })
    },
    exchangeStatus(status) {
      switch (status) {
        case 1:
          return 'success'
        case 2:
          return 'failure'
        case 3:
          return 'unstable'
        case 4:
          return 'running'
        case 5:
          return 'unstable'
        case 6:
          return 'paused'
      }
    },
    startEdit() {
      if (!this.currentPipeline.pipelineConfig.length) {
        this.$message.warning('请先选择流水线')
        return
      }
      this.piplienOperate = 1
      this.pipelineDialog = true
    },
    startView() {
      if (!this.currentPipeline.pipelineConfig.length) {
        this.$message.warning('请先选择流水线')
        return
      }
      this.piplienOperate = 2
      this.titleName = '查看流水线'
      this.pipelineDialog = true
    },
    selectPipeline(item) {
      this.publishList.forEach((e) => {
        e.selected = false
      })
      this.buildList.forEach((e) => {
        e.selected = false
      })
      this.customList.forEach((e) => {
        e.selected = false
      })
      item.selected = true
      pipelineApi.queryPipeline(item.pipelineId).then((res) => {
        let config = utils.displayData(res.data.stageList)
        this.currentPipeline.pipelineConfig = config
        this.currentPipeline.pipelineName = res.data.pipelineName
        this.currentPipeline.pipelineType = res.data.pipelineType
        this.currentPipeline.executeType = res.data.executeType
        this.currentPipeline.pipelineId = item.pipelineId
        this.currentPipeline.pipelineStatus = res.data.pipelineStatus
        this.currentPipeline.context = res.data.pipelineConfig
        this.pipelineId = item.pipelineId
        this.uuid++
        console.log('dddd', this.currentPipeline)
        this.checkBindBranch()

        if (this.currentPipeline.pipelineType == 1) {
          this.getServicePublishes()
        }
      })

      historyApi
        .latestPipelineHistory(this.serviceId, item.pipelineId)
        .then((res) => {
          if (!res.data) {
            this.history = {}
            return
          }
          this.history = res.data
          historyApi.getPipelienStatus(this.history.historyId).then((res) => {
            let item = {}
            res.data.nodeStatusList.forEach((e) => {
              item[e.nodeId] = this.exchangeStatus(e.status)
            })

            this.currentPipeline.pipelineConfig.forEach((e) => {
              let status = item[e.nodeId]
              if (status) {
                e.status = status
              } else {
                e.status = 'success'
              }
            })
            this.uuid++
          })
        })
    },
    getLatestHistory(pipelineId) {
      historyApi
        .latestPipelineHistory(this.serviceId, pipelineId)
        .then((res) => {
          if (!res.data) {
            this.history = {}
            return
          }
          this.history = res.data
        })
    },
    handleCommand(command) {
      if (command == 'new') {
        this.piplienOperate = 3
        this.titleName = '创建流水线'
        this.pipelineDialog = true
      }
    },
    deletePipeline(pipeline) {
      this.$confirm(`确认删除流水线【${pipeline.pipelineName}】？`).then(() => {
        pipelineApi
          .deletePipeline(this.serviceId, pipeline.pipelineId)
          .then(() => {
            this.getPipelineList()
          })
      })
    },
    getPipelineList() {
      pipelineApi.pipelineList(this.serviceId).then((res) => {
        this.publishList = []
        this.buildList = []
        this.customList = []
        res.data.forEach((e) => {
          e.selected = false

          if (e.pipelineType == 1) {
            this.publishList.push(e)
          }
          if (e.pipelineType == 2) {
            this.buildList.push(e)
          }
          if (e.pipelineType == 3) {
            this.customList.push(e)
          }
        })
      })
    },
    getConfigNodes() {
      nodeApi.getAllNodes().then((res) => {
        this.stepOptions = res.data
      })
    },
    getDefaultService() {
      serviceApi.getServices().then((res) => {
        this.serviceList = []
        res.data.forEach((e) => {
          this.serviceList.push({
            label: e.serviceName,
            value: e.serviceId,
          })
        })
        if (!this.serviceId) {
          this.serviceId = this.serviceList[0].value
        }
        this.getPipelineList()
      })
    },
    loopQueryStatus() {
      let loopQuery = setInterval(() => {
        if (!this.history.historyId) {
          return
        }
        historyApi.getPipelienStatus(this.history.historyId).then((res) => {
          let item = {}
          res.data.nodeStatusList.forEach((e) => {
            if (e.status == 4) {
              this.currentRunningNode = e.nodeId
            }
            item[e.nodeId] = this.exchangeStatus(e.status)
            if (e.nodeId == this.logForm.nodeId) {
              this.logForm = {
                nodeId: this.logForm.nodeId,
                status: e.status,
                messageList: e.message,
              }
            }
          })

          this.currentPipeline.pipelineConfig.forEach((e) => {
            let status = item[e.nodeId]
            if (status) {
              e.status = status
            }
          })
          if (res.data.pipelineStatus != 4) {
            this.isRunning = false
            this.getLatestHistory(this.currentPipeline.pipelineId)
            return
          }
          this.isRunning = true
        })
      }, 3000)
      this.loopQuery = loopQuery
    },
    cancelCreatePipeline() {
      this.pipelineDialog = false
    },
    closeGitDialog() {
      this.checkBindBranch()
      this.showGitConfig = false
    },
    checkBindBranch() {
      this.bindGit = false
      gitBindApi.gitbindList(this.currentPipeline.pipelineId).then((res) => {
        res.data.forEach((e) => {
          if (e.isChoose) {
            this.bindGit = true
          }
        })
      })
    },
  },
  created() {
    this.serviceId = this.$store.state.serviceId
    this.getConfigNodes()
    this.getDefaultService()
    this.loopQueryStatus()
  },
  beforeDestroy() {
    clearInterval(this.loopQuery)
  },
}
</script>

<style scoped>
.service-tip {
  cursor: pointer;
}
.item-list ul {
  list-style: none;
  padding: 3px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  margin: 0px;
  min-height: 300px;
}
.item {
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
  cursor: pointer;
  color: #606266;
}
.item:hover {
  background-color: #67c23a;
  color: #fff;
}
.step-title {
  margin: 5px 5px;
  font-weight: 800;
}

.select-pipeline {
  margin: 10px;
}
.pipeline-list {
  margin-top: 20px;
}
.left-content {
  border-right: 1px solid #dcdfe6;
  height: 100vh;
}
.pipeline-item {
  cursor: pointer;
  border: 1px dashed #dcdfe6;
  margin: 5px 10px;
  height: 20px;
  line-height: 20px;
  vertical-align: middle;
  border-radius: 3px;
  padding: 5px 10px;
  background: #f2f6fc;
}

.pipeline-item:hover {
  background: rgb(102, 177, 255);
  color: #fff;
}

.selected-line {
  background: rgb(102, 177, 255);
  color: #fff;
}

.title-icon {
  margin-right: 10px;
}
.content {
  margin: 10px;
}
.service-name {
  font-size: 20px;
  font-weight: bold;
  height: 30px;
  line-height: 30px;
  margin: 10px;
}
.pipeline-detail {
  border: 1px dashed #dcdfe6;
  border-radius: 3px;
  padding: 5px 10px;
  min-height: 100px;
}
.pipeline-content {
  margin: 20px 10px 10px 10px;
}
.pipeline-detail-item {
  min-width: 200px;
}
.pipe-op-div {
  margin: 10px;
}
.pipe-op-btn {
  margin: 10px;
}
.op-line {
  font-size: 12px;
  margin: 0px 10px;
  cursor: pointer;
}
.title-line {
  margin: 10px;
}
ul {
  list-style: none;
  padding: 0px;
}
.republis-info {
  margin: 10px;
}
.banch-name {
  color: #409eff;
  font-size: 900;
}

.log-list {
  background-color: #1e1f22;
  padding: 10px;
  border-radius: 5px;
  color: #bcbec4;
  height: 500px;
  overflow-y: scroll;
}
</style>
