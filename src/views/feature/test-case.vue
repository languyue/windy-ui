<template>
  <div>
    <div class="service">
      <el-row>
        <el-col :span="22">
          <el-form
            :inline="true"
            :model="queryForm"
            size="mini"
            class="demo-form-inline"
            @submit.native.prevent
          >
            <el-form-item label="服务列表">
              <el-select
                v-model="service"
                size="small"
                @change="selectService"
                placeholder="选择服务"
              >
                <el-option
                  v-for="(item, index) in serviceList"
                  :key="index"
                  :label="item.serviceName"
                  :value="item.serviceId"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                icon="el-icon-circle-plus-outline"
                @click="startCreate"
                >新增测试集</el-button
              >
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>
    <!-- 服务统计开始 -->
    <div class="container">
      <div class="logo-text">{{ logoName }}</div>
      <div class="num-row">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic
              group-separator=","
              :precision="0"
              :value="statics.apiCount"
              :value-style="{ fontSize: '40px', fontWeight: 900 }"
              title="服务API总数"
            ></el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic
              :value="statics.apiCoverage"
              :value-style="{
                fontSize: '40px',
                fontWeight: 900,
                color: statics.apiCoverage >= 90 ? '#67C23A' : '#F56C6C',
              }"
              :precision="0"
              title="用例覆盖率"
              suffix="%"
            >
              <span slot="suffix">
                <span> {{ statics.apiCoverage ? '%' : '' }}</span>
              </span>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic
              group-separator=","
              :precision="0"
              :value="statics.uncoverSize"
              :value-style="{
                fontSize: '40px',
                fontWeight: 900,
                color: statics.uncoverSize >= 0 ? '#E6A23C' : '#909399',
              }"
              title="未覆盖接口"
            >
              <span slot="suffix">
                <el-popover placement="right" width="400" trigger="hover">
                  <el-alert
                    :closable="false"
                    title="接口覆盖率统计"
                    type="info"
                    show-icon
                    description="覆盖率是根据当前服务关联的所有测试用例所使用的模版(模版会关联API)和服务对应的API列表来计算百分比,计算公式如下: 覆盖率 = 模版中使用API个数 / 服务API总数 * 100"
                  >
                  </el-alert>
                  <h4>未覆盖API列表</h4>
                  <el-table
                    size="mini"
                    :row-style="{ cursor: 'pointer' }"
                    :data="statics.notCoveredApi"
                    height="400"
                    @row-click="clickApiRow"
                  >
                    <el-table-column
                      width="150"
                      property="apiName"
                      label="API名称"
                    ></el-table-column>
                    <el-table-column
                      property="resource"
                      label="APi路由"
                    ></el-table-column>
                    <el-table-column
                      width="100"
                      property="method"
                      label="请求方法"
                    ></el-table-column>
                  </el-table>
                  <div slot="reference">
                    <span>
                      <el-link
                        style="
                          margin-left: 5px;
                          cursor: pointer;
                          font-size: 12px;
                          color: 409EFF;
                        "
                        >查看<i class="el-icon-view el-icon--right"></i>
                      </el-link>
                    </span>
                  </div>
                </el-popover>
              </span>
            </el-statistic>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- 服务统计结束 -->
    <!-- 测试集表格开始 -->
    <div class="content">
      <el-table :data="featureData" size="mini">
        <el-table-column prop="testCaseName" label="测试集"> </el-table-column>
        <!-- <el-table-column prop="author" label="创建人"> </el-table-column> -->
        <el-table-column prop="description" label="描述"> </el-table-column>
        <el-table-column prop="updateTime" label="最近编辑时间">
          <template slot-scope="scope">
            {{ scope.row.updateTime | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="startEdit(scope.row)"
              plain
              size="mini"
              >编辑</el-button
            >
            <el-button
              type="danger"
              @click="startDelete(scope.row)"
              plain
              size="mini"
              >删除</el-button
            >
            <el-button
              type="info"
              @click="startCopy(scope.row)"
              plain
              icon="el-icon-document-copy"
              size="mini"
              >复制</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div>
        <el-pagination
          :page-size="10"
          :current-page="currentPage"
          @current-change="pageChange"
          layout="prev, pager, next"
          :total="totalSize"
        >
        </el-pagination>
      </div>
    </div>
    <!-- 测试集表格结束 -->
    <!-- 创建测试集开始 -->
    <el-dialog
      title="创建测试集"
      :visible.sync="showDialog"
      @close="closeDialog"
      width="70%"
    >
      <el-form
        :model="caseForm"
        ref="caseForm"
        :rules="rule"
        size="mini"
        label-width="120px"
      >
        <el-form-item label="测试集名称" prop="testCaseName">
          <el-input
            v-model="caseForm.testCaseName"
            placeholder="请输入测试集名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="测试集描述" prop="description">
          <el-input
            v-model="caseForm.description"
            placeholder="请输入测试集描述"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit('caseForm')">确认</el-button>

          <el-button type="info" @click="closeDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 创建测试集结束 -->
    <!-- 复制测试集开始 -->
    <el-dialog
      title="复制测试集"
      :visible.sync="showCopyDialog"
      @close="cancellCopy"
      width="70%"
    >
      <h3>
        原测试集名称:
        <span style="color: #f56c6c">{{ copyCase.testCaseName }}</span>
      </h3>
      <div style="margin: 20px 40px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-input
              v-model="filterTag"
              size="small"
              placeholder="请输入标签过滤用例"
            ></el-input>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="confimFilter" size="small"
              >确认过滤</el-button
            >
          </el-col>
        </el-row>
      </div>
      <div style="margin: 20px 40px">
        <span v-if="filterTagList.length">已过滤标签:</span>
        <el-tag
          :key="index"
          @close="handleClose(tag)"
          type="success"
          :disable-transitions="false"
          v-for="(tag, index) in filterTagList"
          closable
          size="small"
        >
          {{ tag }}
        </el-tag>
      </div>
      <el-row>
        <el-col :span="10">
          <div>
            <el-checkbox
              :indeterminate="isIndeterminate"
              v-model="checkAll"
              @change="handleCheckAllChange"
              >全选</el-checkbox
            >

            <div class="tree-list">
              <el-tree
                ref="tree"
                :data="treeData"
                show-checkbox
                default-expand-all
                @node-click="treeNodeClick"
                highlight-current
                node-key="featureId"
                :props="{
                  children: 'children',
                  label: 'featureName',
                }"
              >
              </el-tree>
            </div>
          </div>
        </el-col>
        <el-col :span="14">
          <el-descriptions title="用例描述" :column="2" size="small">
            <el-descriptions-item label="用例名称：">{{
              featureForm.featureName
            }}</el-descriptions-item>
            <el-descriptions-item label="最近修改时间">{{
              featureForm.updateTime | dateFormat
            }}</el-descriptions-item>
            <el-descriptions-item label="标签">
              <el-tag
                :key="tag"
                v-for="tag in featureForm.tags"
                class="tag-item"
                size="mini"
              >
                {{ tag }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancellCopy">取 消</el-button>
        <el-button size="mini" type="primary" @click="confirmCopy"
          >确定复制</el-button
        >
      </span>
    </el-dialog>
    <!-- 复制测试集结束 -->
  </div>
</template>
<script>
import serviceApi from '../../http/Service'
import testCaseApi from '../../http/TestCase'
import featureApi from '../../http/Feature'
export default {
  data() {
    return {
      service: '',
      serviceList: [],
      activeName: '1',
      tableData: [],
      showHistory: false,
      direction: 'rtl',
      featureData: [],
      currentPage: 1,
      totalSize: 0,
      showDialog: false,
      caseForm: {},
      queryForm: {},
      showCopyDialog: false,
      checkAll: false,
      isIndeterminate: true,
      copyCase: {},
      filterTag: '',
      filterTagList: [],
      treeData: [],
      allKeys: [],
      featureForm: {},
      statics: {},
      rule: {
        testCaseName: [
          { required: true, message: '请输入测试集名称', trigger: 'blur' },
        ],
        description: [
          { required: true, message: '请输入详细描述', trigger: 'blur' },
        ],
        serviceId: [
          { required: true, message: '请选择关联的服务', trigger: 'select' },
        ],
      },
      serviceName: '',
    }
  },
  computed: {
    logoName() {
      if (!this.serviceName) {
        return ''
      }
      return this.serviceName.substring(0, 1)
    },
  },
  methods: {
    clickApiRow(row) {
      var getWinLocHref = function () {
        var location = window.location.href.split('/')
        var basePath = location[0] + '//' + location[2]
        return basePath
      }

      let url =
        getWinLocHref() +
        `/#/service/resource?apiId=${row.apiId}&serviceId=${row.serviceId}`
      window.open(url, '_black')
    },
    treeNodeClick(data) {
      featureApi.getFeatureDetail(data.featureId).then((res) => {
        this.featureForm = res.data
      })
    },
    cancellCopy() {
      this.showCopyDialog = false
      this.filterTagList = []
      this.filterTag = ''
      this.copyCase = {}
      this.checkAll = false
      this.featureForm = {}
    },
    confirmCopy() {
      let array = this.$refs.tree.getCheckedKeys()
      if (!array || array.length == 0) {
        this.$message.warning('请选择需要复制的用例')
        return
      }

      let data = {
        testCaseId: this.copyCase.testCaseId,
        featureIds: array,
      }

      featureApi.copyCaseFeature(data).then((res) => {
        if (res.data) {
          this.$notify.success('复制成功！')
          this.selectService()
          this.cancellCopy()
          return
        }

        this.$notify.error('复制失败！')
      })
    },
    handleClose(tag) {
      this.filterTagList.splice(this.filterTagList.indexOf(tag), 1)
      this.refreshTag()
    },
    confimFilter() {
      if (!this.filterTag) {
        return
      }

      if (this.filterTagList.length >= 5) {
        this.$message.danger('过滤数超过上限')
        return
      }

      this.filterTagList.push(this.filterTag)
      this.filterTag = ''
      this.refreshTag()
    },
    refreshTag() {
      if (this.filterTagList == 0) {
        featureApi.getFeatureTree(this.copyCase.testCaseId).then((res) => {
          this.treeData = res.data
        })
        return
      }

      let item = {
        tags: this.filterTagList,
        testCaseId: this.copyCase.testCaseId,
      }
      featureApi.filterFeatureByTag(item).then((res) => {
        this.treeData = res.data
      })
    },
    handleCheckAllChange(val) {
      if (val) {
        this.$refs.tree.setCheckedNodes(this.treeData)
        this.isIndeterminate = false
      } else {
        this.$refs.tree.setCheckedNodes([])
        this.isIndeterminate = true
      }
    },
    startCopy(row) {
      this.showCopyDialog = true
      this.copyCase = row
      featureApi.getFeatureTree(row.testCaseId).then((res) => {
        this.treeData = res.data
      })
    },
    closeDialog() {
      this.showDialog = false
      this.caseForm = {}
    },
    submit(caseForm) {
      this.$refs[caseForm].validate((valid) => {
        if (!valid) {
          return false
        }
        this.caseForm.serviceId = this.service
        testCaseApi.createTestCase(this.caseForm).then((res) => {
          this.closeDialog()
          if (res.data) {
            this.$notify.success('添加测试集成功')
            this.getTestCaseList(1)
            return
          }
          this.$notify.error('添加测试集失败')
        })
      })
    },
    startCreate() {
      this.showDialog = true
    },
    getServices() {
      this.serviceList = []
      serviceApi.getServices().then((res) => {
        this.serviceList = res.data
        if (!this.service) {
          this.service = this.serviceList[0].serviceId
        }
        this.selectService()
      })
    },
    selectService() {
      this.$store.commit('UPDATE_SERVICE_ID', this.service)
      this.serviceList.forEach((e) => {
        if (e.serviceId == this.service) {
          this.serviceName = e.serviceName
        }
      })

      this.getTestCaseList(1)
      this.getServiceStatic()
    },
    pageChange(page) {
      this.getTestCaseList(page)
    },
    getTestCaseList(page) {
      testCaseApi.getTestCaseList(this.service, page, 10).then((res) => {
        this.currentPage = page
        this.totalSize = res.data.total
        this.featureData = res.data.data
      })
    },
    startEdit(row) {
      this.$router.push({
        path: '/feature',
        query: {
          caseId: row.testCaseId,
        },
      })
    },
    startDelete(row) {
      this.$confirm('测试集删除后用例都会删除，确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        testCaseApi.deleteTestCase(row.testCaseId).then(() => {
          this.$notify.success('删除测试集成功')
          this.getTestCaseList(this.currentPage)
        })
      })
    },
    getServiceStatic() {
      serviceApi.getServiceStatics(this.service).then((res) => {
        this.statics = res.data
        this.statics.uncoverSize = res.data.notCoveredApi.length
      })
    },
  },
  created() {
    this.service = this.$store.state.serviceId
    this.getServices()
  },
}
</script>
<style lang="less" scoped>
.service {
  margin: 10px 20px;
}
.content {
  margin: 10px 20px;
  height: 300px;
}
.history {
  margin: 20px 20px;
}
.history-title {
  font-weight: 900;
}
.check-box-item {
  margin: 10px;
}
.tag-item {
  margin: 0px 10px;
}
.tree-list {
  max-height: 600px;
  overflow-y: scroll;
}
.container {
  display: flex;
  align-items: center;

  .logo-text {
    display: inline-block;
    border-radius: 100px;
    height: 100px;
    line-height: 100px;
    width: 100px;
    text-align: center;
    vertical-align: middle;
    font-size: 30px;
    cursor: pointer;
    margin-left: 40px;
    margin-bottom: 20px;
    color: #909399;
    font-weight: 800;
    background-color: #f2f6fc;
  }

  .num-row {
    width: 400px;
    flex-grow: 1;
  }
}
</style>
