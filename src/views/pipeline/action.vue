<template>
  <div>
    <el-tabs v-model="activeTab" class="content">
      <el-tab-pane label="节点列表" name="node">
        <!-- 表单查询开始 -->
        <div class="query-div">
          <el-form :inline="true" size="mini" @submit.native.prevent>
            <el-form-item label="节点名称">
              <el-input
                clearable
                v-model="queryNodeName"
                placeholder="请输入节点名称"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="startQueryNode"
                >查询</el-button
              >
              <el-button
                type="primary"
                icon="el-icon-circle-plus-outline"
                @click="createNode"
                >新增节点</el-button
              >
            </el-form-item>
          </el-form>
        </div>
        <!-- 表单查询结束 -->
        <!-- 节点表格显示开始 -->
        <div>
          <el-table :data="nodeList" stripe size="mini" style="width: 100%">
            <el-table-column prop="nodeName" label="节点名称">
            </el-table-column>
            <el-table-column prop="description" label="描述"> </el-table-column>
            <el-table-column prop="createTime" label="创建时间">
              <template slot-scope="scope">
                {{ scope.row.createTime | dateFormat }}
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作">
              <template slot-scope="scope">
                <el-button
                  @click="editNode(scope.row)"
                  slot="reference"
                  type="primary"
                  size="mini"
                  >编辑</el-button
                >
                <el-button
                  @click="removeNode(scope.row)"
                  slot="reference"
                  type="danger"
                  size="mini"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            layout="prev, pager, next"
            :current-page="currentNodePage"
            @current-change="changeNodePage"
            :total="nodeTotalSize"
          >
          </el-pagination>
        </div>
        <!-- 节点表格显示结束 -->
      </el-tab-pane>
      <el-tab-pane label="执行点" name="execute">
        <!-- 表单查询开始 -->
        <div class="query-div">
          <el-form :inline="true" size="mini" @submit.native.prevent>
            <el-form-item label="执行点名称">
              <el-input
                clearable
                v-model="queryName"
                placeholder="请输入执行点名称"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="startQuery"
                >查询</el-button
              >
              <el-button
                type="primary"
                icon="el-icon-circle-plus-outline"
                @click="createTemplet"
                >新增执行点</el-button
              >
            </el-form-item>
          </el-form>
        </div>
        <!-- 表单查询结束 -->
        <!-- 执行点表格显示开始 -->
        <div>
          <el-table :data="actionList" stripe size="mini" style="width: 100%">
            <el-table-column prop="actionName" label="执行点名称">
            </el-table-column>
            <el-table-column prop="description" label="描述"> </el-table-column>
            <el-table-column prop="updateTime" label="创建时间">
              <template slot-scope="scope">
                {{ scope.row.updateTime | dateFormat }}
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作">
              <template slot-scope="scope">
                <el-button
                  @click="editAction(scope.row)"
                  slot="reference"
                  type="primary"
                  size="mini"
                  >编辑</el-button
                >
                <el-button
                  v-if="scope.row.executeType == 'HTTP'"
                  @click="removeAction(scope.row)"
                  slot="reference"
                  type="danger"
                  size="mini"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            layout="prev, pager, next"
            :current-page="currentPage"
            @current-change="changePage"
            :total="totalSize"
          >
          </el-pagination>
        </div>
        <!-- 执行点表格显示结束 -->
      </el-tab-pane>
    </el-tabs>

    <!-- 节点弹框开始 -->
    <el-dialog
      :title="nodeTitle"
      :visible.sync="showCreateNode"
      width="80%"
      :before-close="closeNodeDialog"
    >
      <el-form
        :model="nodeForm"
        ref="nodeForm"
        :rules="nodeRule"
        size="mini"
        label-width="120px"
      >
        <el-form-item label="节点名称" prop="nodeName">
          <el-input placeholder="请输入节点名称" v-model="nodeForm.nodeName" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入执行点描述"
            v-model="nodeForm.description"
          />
        </el-form-item>
        <el-form-item label="关联执行点" prop="executors">
          <el-select
            v-model="nodeForm.executors"
            multiple
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in executeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeNodeDialog" size="mini">取 消</el-button>
        <el-button type="primary" @click="addNode('nodeForm')" size="mini"
          >确 定</el-button
        >
      </div>
    </el-dialog>
    <!-- 节点弹框结束 -->

    <!-- 执行点弹框开始 -->
    <el-dialog
      :title="title"
      :visible.sync="showCreateExecuter"
      :before-close="closeDialog"
      width="80%"
    >
      <el-form
        :model="actionForm"
        ref="actionForm"
        :rules="actionRule"
        size="small"
        label-width="150px"
      >
        <el-form-item label="执行点名称" prop="actionName">
          <el-input
            placeholder="请输入执行点名称"
            v-model="actionForm.actionName"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入执行点描述"
            v-model="actionForm.description"
          />
        </el-form-item>
        <el-form-item label="执行类型" prop="executeType">
          <el-radio-group v-model="executeType" @change="chooseExecuteType">
            <el-radio label="HTTP" :disabled="isEditAction">默认</el-radio>
            <el-radio label="BUILD" disabled>构建</el-radio>
            <el-radio label="WAIT" disabled>等待</el-radio>
            <el-radio label="DEPLOY" disabled>部署</el-radio>
            <el-radio label="TEST" disabled>用例测试</el-radio>
            <el-radio label="APPROVAL" disabled>人工卡点</el-radio>
            <el-radio label="MERGE" disabled>合并master</el-radio>
          </el-radio-group>
        </el-form-item>
        <HttpAct
          v-if="executeType == 'HTTP'"
          :form="actionForm"
          @notifyParam="notifyParam"
        />
        <ApprovalAct
          v-if="executeType == 'APPROVAL'"
          :form="actionForm"
          @notifyParam="notifyParam"
        />
        <BuildAct
          v-if="executeType == 'BUILD'"
          :form="actionForm"
          @notifyParam="notifyParam"
        />
        <DeployAct
          v-if="executeType == 'DEPLOY'"
          :form="actionForm"
          @notifyParam="notifyParam"
        />
        <FeatureAct
          v-if="executeType == 'TEST'"
          :form="actionForm"
          @notifyParam="notifyParam"
        />
        <WaitAct
          v-if="executeType == 'WAIT'"
          :form="actionForm"
          @notifyParam="notifyParam"
        />
        <MergeAct
          v-if="executeType == 'MERGE'"
          :form="actionForm"
          @notifyParam="notifyParam"
        />
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog" size="mini">取 消</el-button>
        <el-button type="primary" @click="addAction('actionForm')" size="mini"
          >确 定</el-button
        >
      </div>
    </el-dialog>
    <!-- 执行点弹框结束 -->
  </div>
</template>
<script>
import ActionApi from '../../http/PipelineAction'
import NodeApi from '../../http/NodeBind'
import HttpAct from './comp/http-action.vue'
import ApprovalAct from './comp/approval-action.vue'
import BuildAct from './comp/build-action.vue'
import DeployAct from './comp/deploy-action.vue'
import FeatureAct from './comp/feature-action.vue'
import WaitAct from './comp/wait-action.vue'
import MergeAct from './comp/merge-action.vue'
export default {
  components: {
    HttpAct,
    ApprovalAct,
    BuildAct,
    DeployAct,
    FeatureAct,
    WaitAct,
    MergeAct,
  },
  data() {
    return {
      queryName: '',
      actionList: [],
      showCreateExecuter: false,
      actionForm: {},
      currentPage: 1,
      totalSize: 0,
      title: '创建执行点',
      isEditAction: false,

      //----节点参数配置-----
      activeTab: 'node',
      nodeList: [],
      showCreateNode: false,
      nodeTitle: '创建节点',
      executeList: [],
      nodeForm: {},
      selectActions: [],
      currentNodePage: 1,
      nodeTotalSize: 0,
      queryNodeName: '',
      isEditNode: false,
      executeType: 'HTTP',
      configList: [],
      compareList: [],
      nodeRule: {
        nodeName: [
          { required: true, message: '请输入节点名称', trigger: 'blur' },
        ],
        executors: [
          { required: true, message: '请选择执行点', trigger: 'change' },
        ],
      },
      actionRule: {
        actionName: [
          { required: true, message: '请输入执行点名称', trigger: 'blur' },
        ],
        executeType: [
          { required: true, message: '请选择执行类型', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    chooseExecuteType() {
      this.configList = []
      this.compareList = []
    },
    addNewCondition() {
      this.compareList.push({})
    },
    startQueryNode() {
      this.getNodes()
    },
    editNode(row) {
      this.isEditNode = true
      this.nodeTitle = '编辑节点'
      this.showCreateNode = true
      this.nodeForm = row
      this.nodeForm.executors = []
      this.getAllActions()
      NodeApi.getNodeActions(row.nodeId).then((res) => {
        res.data.forEach((e) => {
          this.nodeForm.executors.push(e.actionId)
        })
      })
    },
    notifyParam(notifyData) {
      this.configList = notifyData.paramList
      this.compareList = notifyData.compareList
    },
    closeNodeDialog() {
      this.isEditNode = false
      this.showCreateNode = false
      this.nodeForm = { executors: [] }
      this.selectActions = []
    },
    removeNode(row) {
      this.$confirm(`确认删除节点【${row.nodeName}】？`).then(() => {
        NodeApi.deleteNode(row.nodeId).then((res) => {
          if (res.data) {
            this.$notify.success('删除节点成功')
            this.getNodes()
          } else {
            this.$notify.error('删除节点失败')
          }
        })
      })
    },
    changeNodePage() {
      this.getNodes()
    },
    createNode() {
      this.nodeTitle = '创建节点'
      this.showCreateNode = true
      this.nodeForm = { executors: [] }
      this.getAllActions()
    },
    addNode(nodeForm) {
      this.$refs[nodeForm].validate((valid) => {
        if (!valid) {
          return false
        }

        if (this.isEditNode) {
          NodeApi.updateNode(this.nodeForm).then((res) => {
            if (res.data) {
              this.$notify.success('修改节点成功')
              this.getNodes()
              this.closeNodeDialog()
            } else {
              this.$notify.error('修改节点失败')
            }
          })
          return
        }
        NodeApi.createNode(this.nodeForm).then((res) => {
          if (res.data) {
            this.$notify.success('添加节点成功')
            this.getNodes()
            this.closeNodeDialog()
          } else {
            this.$notify.error('添加节点失败')
          }
        })
      })
    },
    getNodes() {
      NodeApi.getNodePage(this.currentNodePage, 10, this.queryNodeName).then(
        (res) => {
          this.nodeTotalSize = res.total
          this.nodeList = res.data
        }
      )
    },
    //-----节点方法结束------
    startQuery() {
      this.currentPage = 1
      this.getActions()
    },
    changePage() {
      this.getActions()
    },
    createTemplet() {
      this.showCreateExecuter = true
      this.title = '创建执行点'
      this.actionForm.executeType = 'HTTP'
    },
    editAction(row) {
      this.isEditAction = true
      this.title = '编辑执行点'
      this.showCreateExecuter = true
      this.actionForm = row
      this.executeType = row.executeType
    },
    removeAction(row) {
      this.$confirm(`确认删除执行点【${row.actionName}】？`).then(() => {
        ActionApi.deleteAction(row.actionId).then((res) => {
          if (res.data) {
            this.$notify.success('删除执行点成功')
            this.getActions()
          } else {
            this.$notify.error('删除执行点失败')
          }
        })
      })
    },
    closeDialog() {
      this.showCreateExecuter = false
      this.configList = []
      this.compareList = []
      this.actionForm = {}
      this.isEditAction = false
      this.executeType = 'HTTP'
    },
    addAction(actionForm) {
      this.$refs[actionForm].validate((valid) => {
        if (!valid) {
          return false
        }
        let data = this.actionForm
        data.paramList = []
        this.configList.forEach((e) => {
          if (this.executeType == 'TEST') {
            e.type = 'select'
          }

          if (e.description && e.name) {
            data.paramList.push(e)
          }
        })
        data.compareResults = []
        this.compareList.forEach((e) => {
          if (e.value && e.compareKey) {
            data.compareResults.push(e)
          }
        })
        data.executeType = this.executeType
        if (this.isEditAction) {
          ActionApi.updateAction(data).then((res) => {
            if (res.data) {
              this.$notify.success('修改执行点成功')
              this.closeDialog()
              this.getActions()
            } else {
              this.$notify.error('修改执行点失败')
            }
          })
          return
        }

        ActionApi.createAction(data).then((res) => {
          if (res.data) {
            this.$notify.success('创建执行点成功')
            this.closeDialog()
            this.getActions()
          } else {
            this.$notify.error('创建执行点失败')
          }
        })
      })
    },
    addNewItem() {
      this.configList.push({})
    },
    getActions() {
      ActionApi.getActionPage(this.currentPage, 10, this.queryName).then(
        (res) => {
          this.totalSize = res.total
          this.actionList = res.data
        }
      )
    },
    getAllActions() {
      ActionApi.getActionPage(1, 100, '').then((res) => {
        this.executeList = []
        res.data.forEach((e) => {
          this.executeList.push({ label: e.actionName, value: e.actionId })
        })
      })
    },
  },
  created() {
    this.getActions()
    this.getNodes()
  },
}
</script>
<style scoped>
.query-div {
  margin: 10px;
}
.content {
  margin: 10px;
}
</style>
