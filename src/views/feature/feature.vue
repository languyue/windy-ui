<template>
  <div>
    <el-row>
      <el-col :span="5">
        <div class="title">
          <el-page-header @back="goBack">
            <span slot="content">
              <i
                class="el-icon-edit-outline edit-name-icon"
                @click="startEditCase"
              />
              <testview :text="caseName" :len="8"></testview>
            </span>
          </el-page-header>
        </div>
        <!-- 用例列表开始 -->
        <div class="api-list">
          <div class="service-panel">
            <div class="op">
              <div>辅助工具</div>
              <i class="item el-icon-video-play" @click="startDebug"
                >批量调试</i
              >
              <el-tooltip
                effect="dark"
                content="设置当前测试集的全局变量"
                placement="top-start"
              >
                <i class="item el-icon-setting" @click="showGlobalEnv"
                  >全局变量</i
                >
              </el-tooltip>
              <i class="el-icon-tickets" @click="showBatchHistory">历史记录</i>
            </div>
            <div class="search">
              <el-input
                size="mini"
                clearable
                placeholder="输入用例名进行过滤"
                v-model="filterText"
              >
              </el-input>
            </div>
          </div>

          <div class="feature-title">
            <el-row>
              <el-col :span="18">
                <span class="feature-introduce">用例列表</span>
              </el-col>
              <el-col :span="6">
                <span>
                  <el-dropdown @command="clickCommand">
                    <el-button type="text" size="mini" class="feature-add"
                      >操作</el-button
                    >
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="newItem"
                        >新增用例</el-dropdown-item
                      >
                      <el-dropdown-item command="newFolder"
                        >新增目录</el-dropdown-item
                      >
                      <el-dropdown-item command="deleteItems"
                        >批量删除</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </el-dropdown>
                </span>
              </el-col>
            </el-row>
          </div>

          <el-tree
            draggable
            show-checkbox
            node-key="featureId"
            @node-click="treeNodeClick"
            @node-drop="dragNodeEvent"
            :allow-drop="allowDrop"
            :default-expanded-keys="expendList"
            :data="caseFeatures"
            :filter-node-method="filterNode"
            ref="tree"
          >
            <div class="custom-tree-node" slot-scope="{ data }" :key="uuid">
              <span :class="{ 'folder-Text': data.featureType == 2 }"
                ><i
                  :class="{
                    'el-icon-tickets': data.featureType == 1,
                    'el-icon-folder-opened': data.featureType == 2,
                  }"
                />

                <span></span>
                <span :class="{ 'disable-feature': data.status == 2 }">
                  <span v-if="data.status == 2">[已禁用]</span>
                  {{ data.featureName }}</span
                ></span
              >
              <span style="float: right">
                <el-dropdown @command="(val) => clickCommand(val, data)">
                  <el-button type="text">...</el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      command="newItem"
                      v-if="data.featureType == 2"
                      ><i class="el-icon-tickets" />新增用例</el-dropdown-item
                    >
                    <el-dropdown-item
                      command="newFolder"
                      v-if="data.featureType == 2"
                      ><i
                        class="el-icon-folder-opened"
                      />新增目录</el-dropdown-item
                    >
                    <el-dropdown-item command="delete"
                      ><i class="el-icon-delete" />删除</el-dropdown-item
                    >
                    <el-dropdown-item command="copyFeature"
                      ><i class="el-icon-document-copy" />复制</el-dropdown-item
                    >
                    <el-dropdown-item
                      command="disable"
                      v-if="data.status == 1 && data.featureType == 1"
                      ><i
                        class="el-icon-warning-outline"
                      />禁用</el-dropdown-item
                    >
                    <el-dropdown-item
                      command="open"
                      v-if="data.status == 2 && data.featureType == 1"
                      ><i class="el-icon-circle-check" />开启</el-dropdown-item
                    >
                    <el-dropdown-item
                      command="pasteFeature"
                      v-if="data.featureType == 2"
                      ><i
                        class="el-icon-document-checked"
                      />粘贴</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </el-dropdown>
              </span>
            </div>
          </el-tree>
        </div>
        <!-- 用例列表结束 -->
      </el-col>
      <!-- 用例内容开始 -->
      <el-col :span="19">
        <!-- 用例内容开始 -->
        <el-empty
          v-if="!this.infoForm"
          description="请在左侧选择或创建用例"
        ></el-empty>
        <div v-else class="content">
          <el-tabs v-model="activeName" @tab-click="tabChange">
            <el-tab-pane label="用例信息" name="desc">
              <el-descriptions title="用例描述" :column="3" size="small">
                <template slot="extra">
                  <el-button
                    type="primary"
                    @click="startEditFeature"
                    size="mini"
                    >编辑</el-button
                  >
                  <el-button type="danger" @click="deleteFeature" size="mini"
                    >删除</el-button
                  >
                </template>
                <el-descriptions-item label="用例名称：">{{
                  infoForm.featureName
                }}</el-descriptions-item>
                <el-descriptions-item label="用例">{{
                  infoForm.featureId
                }}</el-descriptions-item>
                <el-descriptions-item label="创建人">{{
                  infoForm.author
                }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">
                  <el-tag size="small">{{
                    infoForm.createTime | dateFormat
                  }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="修改时间">
                  <el-tag size="small">{{
                    infoForm.updateTime | dateFormat
                  }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="标签" :span="3">
                  <el-tag :key="tag" v-for="tag in dynamicTags" size="mini">
                    {{ tag }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
              <div v-if="infoForm.featureType == 1">
                <div class="step-title">测试步骤：</div>
                <div class="step-line">
                  <el-steps direction="vertical" size="mini" space="40px">
                    <el-step
                      v-for="(item, index) in formStepList"
                      :title="'步骤' + (index + 1)"
                      :key="index"
                      status="process"
                      :description="item"
                    >
                    </el-step>
                  </el-steps>
                </div>
              </div>
            </el-tab-pane>
            <!-- 用例编写开始 -->
            <el-tab-pane
              label="用例配置"
              name="config"
              v-if="infoForm.featureType == 1"
            >
              <FeatureConfig
                :feature="selectFeatureId"
                :service="serviceId"
                :case="caseId"
                :key="uuid"
              />
            </el-tab-pane>
            <!-- 用例编写结束 -->
            <el-tab-pane
              label="执行历史"
              name="history"
              v-if="infoForm.featureType == 1"
            >
              <history ref="historyComp" :feature="infoForm.featureId" />
            </el-tab-pane>
          </el-tabs>
        </div>
        <!-- 用例内容结束 -->
      </el-col>
      <!-- 用例内容结束 -->
    </el-row>
    <!-- 用例添加开始 -->
    <el-dialog
      :title="featureTitle"
      :visible.sync="showFeatureDialog"
      @close="closeFeatureDialog"
      width="60%"
      :destroy-on-close="true"
    >
      <el-form
        :model="featureForm"
        :rules="featureRule"
        ref="featureForm"
        size="small"
        label-width="80px"
        label-position="top"
      >
        <el-form-item label="名称" prop="featureName">
          <el-input
            v-model="featureForm.featureName"
            placeholder="请输入名称"
          />
        </el-form-item>
        <el-form-item label="用例标签">
          <el-tag
            :key="index"
            v-for="(tag, index) in dynamicTags"
            closable
            size="mini"
            :disable-transitions="false"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="mini"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          >
          </el-input>
          <el-button
            v-else
            class="button-new-tag"
            size="mini"
            @click="showInput"
            >+ 新增标签</el-button
          >
        </el-form-item>
        <el-form-item label="用例步骤描述" v-if="createData.type == 1">
          <el-steps direction="vertical" size="mini" space="40px">
            <el-step
              v-for="(item, index) in stepList"
              :key="index"
              status="process"
              :description="item.content"
            >
              <template slot="title">
                <span
                  @mouseover="item.hover = true"
                  @mouseleave="item.hover = false"
                >
                  <span>{{ '步骤' + (index + 1) }}</span>
                  <i
                    v-if="item.hover"
                    class="el-icon-delete step-delete"
                    @click="removeStep(index)"
                  />
                </span>
              </template>
            </el-step>

            <div class="step-edit">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-input
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 6 }"
                    v-model="stepContent"
                  />
                </el-col>
                <el-col :span="12">
                  <el-button type="primary" @click="addStep"
                    >新增步骤</el-button
                  >
                </el-col>
              </el-row>
            </div>
          </el-steps>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitFeatureForm('featureForm')"
            >确认</el-button
          >
          <el-button type="info" @click="closeFeatureDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 用例添加结束 -->
    <!-- 全局环境变量开始 -->
    <el-dialog
      title="全局环境变量配置"
      :visible.sync="showDebugDialog"
      width="90%"
      :destroy-on-close="true"
    >
      <div class="tips">
        全局环境变量：测试集是由多个用例组合在一起的集合，在当前集合内针对于不同的用例可能需要相同的配置信息(比如http请求的域名等信息)，
        针对相同的配置信息不用在每个用例里面声明，只需要在全局设置然后在每个用例里声明引用即可。
      </div>
      <div class="config-body">
        <el-table
          :data="configData"
          border
          :key="uuid"
          size="small"
          default-expand-all
          row-key="configId"
          @row-dblclick="(row) => startEditParam(row)"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column prop="paramKey" label="参数" width="250">
            <template slot-scope="scope">
              <span v-if="!scope.row.isEdit">{{ scope.row.paramKey }}</span>
              <el-input v-model="scope.row.paramKey" v-else size="mini" />
            </template>
          </el-table-column>
          <el-table-column prop="paramType" label="参数类型" width="180">
            <template slot-scope="scope">
              <span
                v-if="
                  !scope.row.isEdit && scope.$index != configData.length - 1
                "
                >{{ scope.row.paramType }}</span
              >
              <el-select
                v-if="scope.row.isEdit"
                v-model="scope.row.paramType"
                size="mini"
                placeholder="请选择参数类型"
              >
                <el-option
                  v-for="item in paramTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="参数值">
            <template slot-scope="scope">
              <span v-if="!scope.row.isEdit">{{ scope.row.value }}</span>
              <el-input
                v-model="scope.row.value"
                v-if="scope.row.isEdit"
                size="mini"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <div v-if="scope.row.isEdit">
                <el-button size="mini" @click="handleSave(scope.row)"
                  >保存</el-button
                >
                <el-button
                  size="mini"
                  type="info"
                  @click="cancelEditParam(scope.row)"
                  >取消</el-button
                >
              </div>
              <div v-else>
                <el-button size="mini" @click="startEditParam(scope.row)">{{
                  scope.$index == configData.length - 1 ? '新增' : '编辑'
                }}</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  v-if="scope.$index != configData.length - 1"
                  @click="handleDelete(scope.row)"
                  >删除</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <!-- 全局环境变量结束 -->
    <!-- 开始编辑测试集 -->
    <el-dialog title="编辑测试集" :visible.sync="showCaseDialog" width="60%">
      <el-form
        :model="caseDetail"
        ref="caseForm"
        size="mini"
        :rules="caseRule"
        label-width="120px"
      >
        <el-form-item label="测试集名称" prop="testCaseName">
          <el-input
            v-model="caseDetail.testCaseName"
            placeholder="请输入测试集名称"
          />
        </el-form-item>
        <el-form-item label="测试集描述" prop="description">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 10 }"
            v-model="caseDetail.description"
            placeholder="请输入测试描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="showCaseDialog = !showCaseDialog"
          >取 消</el-button
        >
        <el-button size="mini" type="primary" @click="submitCase('caseForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 编辑测试集结束 -->
    <!-- 查看批量执行历史开始 -->
    <el-dialog
      :visible.sync="batchHistoryVisiable"
      width="60%"
      title="批量执行任务"
    >
      <el-table :data="taskRecordList" height="600px">
        <el-table-column label="执行名称" prop="taskName"></el-table-column>
        <el-table-column label="执行状态" prop="status">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusFormat">{{
              scope.row.status | statusName
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行时间">
          <template slot-scope="scope">
            {{ scope.row.createTime | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              @click="queryFeatureHistoryies(scope.row)"
              type="text"
              size="small"
              icon="el-icon-view"
              >查看详情</el-button
            >
            <el-button
              @click="deleteRecord(scope.row)"
              type="text"
              size="small"
              icon="el-icon-delete"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleRecordSizeChange"
        @current-change="handleRecordPageChange"
        :current-page.sync="recordPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="recordSize"
        layout="sizes, prev, pager, next"
        :total="recordTotal"
      >
      </el-pagination>
    </el-dialog>
    <!-- 查看批量执行历史结束 -->
    <!-- 查询任务的用例历史开始 -->
    <el-dialog :visible.sync="historyVisiable" title="用例执行历史">
      <history :task="selectRecordId" />
    </el-dialog>
    <!-- 查询任务的用例历史结束 -->
  </div>
</template>
<script>
import history from './history.vue'
import FeatureConfig from './comp/feature-config.vue'
import testview from '../../components/text-view.vue'
import featureApi from '../../http/Feature'
import taskApi from '../../http/Task'
import testCaseApi from '../../http/TestCase'
export default {
  components: {
    history,
    FeatureConfig,
    testview,
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
  },
  data() {
    return {
      recordTotal: 0,
      recordSize: 10,
      recordPage: 1,
      showCaseDialog: false,
      caseDetail: {},
      infoForm: null,
      activeName: 'desc',
      filterText: '',
      caseFeatures: [],
      showDebugDialog: false,
      isConnect: false,
      serviceId: '',
      showFeatureDialog: false,
      featureForm: {},
      isEditFeature: false,
      featureTitle: '',
      caseId: '',
      stepContent: '',
      stepList: [],
      formStepList: [],
      configData: [],
      paramTypeList: [
        { label: 'String', value: 'String' },
        { label: 'Map', value: 'Map' },
        { label: 'List', value: 'List' },
        { label: 'Integer', value: 'Integer' },
        { label: 'Float', value: 'Float' },
        { label: 'Double', value: 'Double' },
      ],
      uuid: 0,
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',
      createData: {},
      caseName: '',
      selectFeatureId: '',
      featureRule: {
        featureName: [
          { required: true, message: '请输入名称', trigger: 'blur' },
        ],
      },
      expendList: [],
      caseRule: {
        testCaseName: [
          { required: true, message: '请输入测试集名称', trigger: 'blur' },
        ],
        description: [
          { required: true, message: '请输入详细描述', trigger: 'blur' },
        ],
      },
      batchHistoryVisiable: false,
      taskRecordList: [],
      historyList: [],
      historyVisiable: false,
      selectRecordId: '',
    }
  },
  methods: {
    handleRecordSizeChange(size) {
      this.recordSize = size
      this.getCaseBatchHistories()
    },
    handleRecordPageChange(page) {
      this.recordPage = page
      this.getCaseBatchHistories()
    },
    deleteRecord(row) {
      taskApi.deleteTaskRecord(row.recordId).then((res) => {
        if (res.data) {
          this.$notify.success('删除记录成功')
          this.getCaseBatchHistories()
        } else {
          this.$notify.error('删除记录失败')
        }
      })
    },
    queryFeatureHistoryies(row) {
      this.historyVisiable = true
      this.selectRecordId = row.recordId
    },
    showBatchHistory() {
      this.batchHistoryVisiable = true
      this.getCaseBatchHistories()
    },
    getCaseBatchHistories() {
      taskApi
        .getTriggerTaskRecords(this.caseId, this.recordPage, this.recordSize)
        .then((res) => {
          this.taskRecordList = res.data.data
          this.recordTotal = res.data.total
        })
    },
    submitCase(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        testCaseApi.updateTestCase(this.caseDetail).then((res) => {
          if (res.data) {
            this.$notify.success('修改测试集成功')
            this.getCaseDetail()
            this.showCaseDialog = false
            return
          }
          this.$notify.error('修改测试集失败')
        })
      })
    },
    startEditCase() {
      this.showCaseDialog = true
    },
    allowDrop(draggingNode, dropEndNode, type) {
      if (type === 'inner' && dropEndNode.data.featureType == 1) {
        return false
      } else {
        return true
      }
    },
    dragNodeEvent(node, endNode, position, event) {
      console.log('event', node, endNode, position, event)
      if (position == 'inner' && endNode.data.featureType != 1) {
        node.data.parentId = endNode.data.featureId
      }
      if (position != 'inner' && node.data.parentId != endNode.data.parentId) {
        node.data.parentId = endNode.data.parentId
      }
      console.log('all', this.caseFeatures)
      let array = []
      this.loadItemFromTree(this.caseFeatures, array)

      let index = 0
      array.forEach((e) => {
        e.sortOrder = index
        index++
      })
      console.log('drag array ', array, array.length)
      featureApi.batchUpdateFeatures({ featureOrders: array }).then((res) => {
        if (res) {
          this.$notify({
            title: '成功',
            dangerouslyUseHTMLString: true,
            message: `用例<strong>[${node.data.featureName}]</strong>排序成功`,
            type: 'success',
          })
        } else {
          this.$notify({
            title: '失败',
            dangerouslyUseHTMLString: true,
            message: `用例<strong>[${node.data.featureName}]</strong>排序失败`,
            type: 'error',
          })
        }
      })
    },
    loadItemFromTree(list, array) {
      list.forEach((e) => {
        array.push(e)
        if (e.children) {
          this.loadItemFromTree(e.children, array)
        }
      })
    },
    clickCommand(command, data) {
      if (command == 'open') {
        featureApi
          .updateFeature({
            featureId: data.featureId,
            status: 1,
          })
          .then((res) => {
            if (res.data) {
              this.$notify({
                title: '成功',
                message: '用例开启成功!',
                type: 'success',
              })
              this.expendList = [data.featureId]
              this.requestCaseFeatures(this.caseId)
            } else {
              this.$notify({
                title: '失败',
                message: '用例开启失败',
                type: 'danger',
              })
            }
          })
      }
      if (command == 'disable') {
        featureApi
          .updateFeature({
            featureId: data.featureId,
            status: 2,
          })
          .then((res) => {
            if (res.data) {
              this.$notify({
                title: '成功',
                message: '用例禁用成功!',
                type: 'success',
              })
              this.expendList = [data.featureId]
              this.requestCaseFeatures(this.caseId)
            } else {
              this.$notify({
                title: '失败',
                message: '用例禁用失败',
                type: 'danger',
              })
            }
          })
      }
      if (command == 'newItem') {
        this.startAddFeature()
        this.createData.type = 1
        if (data) {
          this.createData.parentId = data.featureId
        }
      }

      if (command == 'newFolder') {
        this.startAddFeature()
        this.createData.type = 2
        this.featureTitle = '添加目录'
        if (data) {
          this.createData.parentId = data.featureId
        }
      }

      if (command == 'deleteItems') {
        let featureIds = this.$refs.tree.getCheckedKeys()
        featureApi.batchDeleteFeature({ features: featureIds }).then(() => {
          this.requestCaseFeatures(this.caseId)
          this.uuid = this.$utils.randomString(20)
        })
      }
      if (command == 'delete') {
        featureApi
          .deleteFeature(data.featureId)
          .then(() => {
            this.requestCaseFeatures(this.caseId)
            this.uuid = this.$utils.randomString(20)
          })
          .catch((e) => {
            this.$notify.error(e.response.data.message)
          })
      }
      if (command == 'copyFeature') {
        let featureIds = []
        if (data.featureType == 2) {
          let checkedFeatures = this.$refs.tree.getCheckedKeys()
          if (checkedFeatures.length < 1) {
            this.$notify({
              title: '未选中用例',
              dangerouslyUseHTMLString: true,
              message: `请先选择用例，才可复制`,
              type: 'error',
            })
            return
          }
          data.children.forEach((e) => {
            let index = checkedFeatures.indexOf(e.featureId)
            if (index != -1 && e.featureType == 1) {
              featureIds.push(e.featureId)
            }
          })
        } else {
          featureIds.push(data.featureId)
        }
        localStorage.setItem(
          'copyFeature',
          JSON.stringify({
            featureIds: featureIds,
            featureType: data.featureType,
          })
        )
        this.$notify({
          title: '成功',
          dangerouslyUseHTMLString: true,
          message: `执行点<strong>[${data.featureName}]</strong>已复制`,
          type: 'success',
        })
      }
      if (command == 'pasteFeature') {
        let copyString = localStorage.getItem('copyFeature')
        if (copyString == null || copyString == '' || copyString == undefined) {
          this.$notify({
            title: '粘贴失败',
            dangerouslyUseHTMLString: true,
            message: `粘贴用例为空，请复制之后重新尝试`,
            type: 'warning',
          })
          return
        }
        let item = JSON.parse(copyString)
        item.targetFeature = data.featureId
        featureApi.pasteFeature(item).then((res) => {
          if (res.data) {
            this.expendList = [data.featureId]
            localStorage.removeItem('copyItem')
            this.requestCaseFeatures(this.caseId)
          }
        })
      }
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      let inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    getTestCaseConfigs() {
      this.configData = []
      testCaseApi.getTestCaseConfigs(this.caseId).then((res) => {
        let array = res.data
        array.push({ paramType: 'String' })
        this.configData = array
        let contextKeys = []
        array.forEach((e) => {
          if (e && e.paramKey) {
            contextKeys.push(e.paramKey)
          }
        })
        this.$store.commit('UPDATE_CASE_CONTEXT', {
          key: this.caseId,
          value: contextKeys,
        })
      })
    },
    startEditParam(row) {
      row.isEdit = true
      this.uuid = this.$utils.randomString(20)
    },
    cancelEditParam(row) {
      this.uuid = this.$utils.randomString(20)
      row.isEdit = false
    },
    handleSave(row) {
      if (row.configId) {
        testCaseApi.updateConfig(row).then(() => {
          this.$notify.success('修改配置成功')
          this.getTestCaseConfigs()
        })
        return
      }

      row.unionId = this.caseId
      testCaseApi.addConfigs([row]).then(() => {
        this.$notify.success('添加配置成功')
        this.getTestCaseConfigs()
      })
    },
    handleDelete(row) {
      testCaseApi.deleteConfig(row.configId).then(() => {
        this.$notify.success('删除配置成功')
        this.getTestCaseConfigs()
      })
    },
    addStep() {
      this.stepList.push({
        content: this.stepContent,
        hover: false,
      })
      this.stepContent = ''
    },
    removeStep(index) {
      this.stepList.splice(index, 1)
    },
    closeFeatureDialog() {
      this.showFeatureDialog = false
      this.featureForm = {}
      this.dynamicTags = []
      this.createData = {}
      if (!this.infoForm) {
        return
      }
      featureApi.getFeatureDetail(this.infoForm.featureId).then((res) => {
        this.infoForm = res.data
        this.formStepList = []
        this.infoForm.testStep.split('|').forEach((e) => {
          this.formStepList.push(e)
        })
      })
    },
    startAddFeature() {
      this.showFeatureDialog = !this.showFeatureDialog
      this.isEditFeature = false
      this.featureForm = {}
      this.featureTitle = '添加用例'
      this.stepList = []
    },
    startEditFeature() {
      this.showFeatureDialog = !this.showFeatureDialog
      this.isEditFeature = true
      this.featureTitle = '修改用例'
      this.featureForm = this.infoForm
      this.stepList = []
      this.infoForm.testStep.split('|').forEach((e) => {
        this.stepList.push({ hover: false, content: e })
      })
    },
    deleteFeature() {
      this.$confirm('用例删除后所有执行点数据都会删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        featureApi.deleteFeature(this.infoForm.featureId).then(() => {
          this.$message('删除用例成功')
          this.requestCaseFeatures(this.caseId)
        })
      })
    },
    submitFeatureForm(featureForm) {
      this.$refs[featureForm].validate((valid) => {
        if (!valid) {
          return false
        }

        let request = JSON.parse(JSON.stringify(this.featureForm))
        request.featureType = 1
        request.testCaseId = this.caseId
        request.testFeatures = []
        let str = ''
        this.stepList.forEach((e) => {
          str += e.content + '|'
        })
        request.testStep = str.substring(0, str.length - 1)
        request.tags = JSON.parse(JSON.stringify(this.dynamicTags))
        request.featureType = this.createData.type
        request.parentId = this.createData.parentId
        if (this.isEditFeature) {
          featureApi.updateFeature(request).then(() => {
            this.$notify.success(`修改成功`)
            this.showFeatureDialog = !this.showFeatureDialog
            this.requestCaseFeatures(this.caseId)
          })
          return
        }

        featureApi.createFeature(request).then(() => {
          this.$notify.error(`添加成功`)
          this.showFeatureDialog = !this.showFeatureDialog
          this.requestCaseFeatures(this.caseId)
        })
      })
    },
    startDebug() {
      let res = this.$refs.tree.getCheckedNodes()
      if (res.length == 0) {
        this.$message.warning('请选择要执行的用例～')
        return
      }

      if (res.length > 10) {
        this.$notify.warning('批量执行的用例个数不能超过10个')
        return
      }

      console.log(res)
      let array = []
      res.forEach((e) => {
        if (e.featureType == 1) {
          array.push(e.featureId)
        }
      })

      testCaseApi
        .startBatchFeatures(this.caseId, {
          featureIds: array,
        })
        .then((res) => {
          if (res.data) {
            this.$notify.success('开始执行，请查看运行日志')
          } else {
            this.$notify.error('执行失败')
          }
        })
    },
    tabChange() {
      if (this.activeName == 'history') {
        this.$refs.historyComp.getFeatureHistory(this.infoForm.featureId)
      }
    },
    treeNodeClick(data) {
      this.activeName = 'desc'
      this.infoForm = data
      this.dynamicTags = []
      this.formStepList = data.testStep.split('|')
      this.selectFeatureId = data.featureId
      this.expendList = [data.featureId]
      featureApi.getFeatureDetail(data.featureId).then((res) => {
        this.dynamicTags = res.data.tags
        this.uuid = this.$utils.randomString(20)
      })
    },
    filterNode(value, data) {
      if (!value) return true
      return data.featureName.indexOf(value) !== -1
    },
    showGlobalEnv() {
      this.showDebugDialog = !this.showDebugDialog
      this.getTestCaseConfigs()
    },
    goBack() {
      this.$router.go(-1)
    },
    requestCaseFeatures(caseId) {
      featureApi.getFeatureTree(caseId).then((res) => {
        this.caseFeatures = res.data
      })
    },
    getCaseDetail() {
      testCaseApi.getTestCaseDetail(this.caseId).then((res) => {
        this.caseName = res.data.testCaseName
        this.serviceId = res.data.serviceId
        this.caseDetail = res.data
      })
    },
  },
  created() {
    console.log(window.location)
    console.log(this.$route)
    this.caseId = this.$route.query.caseId
    this.getTestCaseConfigs()
    this.getCaseDetail()
    this.requestCaseFeatures(this.caseId)
  },
}
</script>

<style scoped>
.step-line {
  font-size: 14px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
<style scoped>
.name {
  margin-left: 20px;
}
.api-list {
  height: 80vh;
  font-size: 14px;
}
.search {
  margin: 10px;
}
.content {
  margin: 5px;
  position: relative;
}
.info-line {
  margin: 20px 10px;
}
.step-line {
  margin-top: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  padding: 10px;
  max-height: 300px;
  min-height: 200px;
  font-size: 14px;
  overflow: scroll;
}
.step-title {
  margin-top: 40px;
}
.menu-type {
  width: 200px;
  margin-left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px;
}

.op {
  margin-top: 10px;
  font-size: 14px;
}

.op i {
  margin-left: 10px;
  margin-top: 10px;
  cursor: pointer;
}
.item {
  margin-left: 5px;
  cursor: pointer;
}

.delete-icon {
  margin-left: 10px;
  font-size: 16px;
  color: #f56c6c;
}
.delete-icon i {
  cursor: pointer;
}
.feature-config-list {
  background-color: #ffffff;
  height: 80vh;
  padding: 10px 5px;
}

.service-panel {
  margin: 5px 10px;
}
.title {
  margin: 20px 10px;
}
.feature-title {
  height: 30px;
  line-height: 30px;
  margin-bottom: 10px;
}
.feature-add {
  cursor: pointer;
  color: #409eff;
  font-size: 14px;
}
.step-edit {
  margin-top: 20px;
}
.step-delete {
  cursor: pointer;
  margin-left: 10px;
}

.step-delete:hover {
  color: #f56c6c;
}
.tips {
  color: #909399;
  margin-bottom: 20px;
}
.config-body {
  position: relative;
}

.delete-point {
  font-size: 16px;
  margin-left: 20px;
}
.feature-introduce {
  margin-left: 10px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  width: 100%;
  height: 40px;
}
.folder-Text i {
  color: #70c745;
  font-size: 16px;
}
.edit-name-icon {
  margin-right: 10px;
  cursor: pointer;
}
.disable-feature {
  color: #c0c4cc;
}
</style>
