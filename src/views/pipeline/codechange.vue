<template>
  <div>
    <div class="title-line">
      <el-form :inline="true" size="mini" class="demo-form-inline">
        <el-form-item label="服务列表" @submit.native.prevent>
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
      </el-form>
    </div>
    <div class="change-content">
      <div class="change-title">
        <div class="change-desc">代码变更列表</div>
        <div class="filter-input">
          <el-input
            type="text"
            prefix-icon="el-icon-search"
            size="mini"
            v-model="filterText"
            placeholder="输入分支名称过滤变更列表"
            clearable
          />
        </div>
        <div class="add-btn">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-circle-plus-outline"
            @click="addChangeCode"
            >添加变更</el-button
          >
        </div>
      </div>
      <div class="change-list">
        <div>
          <el-table
            :data="
              changeList.filter(
                (data) =>
                  !filterText ||
                  data.changeBranch
                    .toLowerCase()
                    .includes(filterText.toLowerCase())
              )
            "
            size="mini"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="changeName" label="变更"> </el-table-column>
            <el-table-column prop="changeBranch" label="分支">
            </el-table-column>
            <el-table-column prop="changeDesc" label="描述"> </el-table-column>
            <el-table-column prop="relationId" label="需求/缺陷Id">
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间">
              <template slot-scope="scope">
                {{ scope.row.createTime | dateFormat }}
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button
                  @click="startEdit(scope.row)"
                  slot="reference"
                  type="text"
                  size="small"
                  >编辑</el-button
                >
                <el-button
                  @click="removeChange(scope.row)"
                  slot="reference"
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
    <el-dialog
      title="创建变更"
      :visible.sync="dialogFormVisible"
      @close="closeDialog"
    >
      <el-form
        :model="changeForm"
        ref="changeForm"
        :rules="rule"
        size="mini"
        label-width="120px"
      >
        <el-form-item label="变更描述" prop="changeName">
          <el-input
            v-model="changeForm.changeName"
            placeholder="请输入变更详细说明"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="详细说明" prop="changeDesc">
          <el-input
            type="textarea"
            placeholder="请输入详细说明"
            v-model="changeForm.changeDesc"
            :autosize="{ minRows: 2, maxRows: 4 }"
          ></el-input>
        </el-form-item>
        <el-form-item label="选择分支" prop="branchType">
          <el-radio-group
            @change="selectBranchType"
            v-model="changeForm.branchType"
          >
            <el-radio label="default">默认</el-radio>
            <el-radio label="custom">自定义</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="变更分支" prop="changeBranch">
          <el-input
            v-model="changeForm.changeBranch"
            :disabled="disableBranch"
            placeholder="请输入分支名"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="关联需求/bug" prop="relationId">
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog" size="mini">取 消</el-button>
        <el-button
          type="primary"
          v-clickOnce
          :disabled="isProcessing"
          @click="confirmChange('changeForm')"
          :loading="isProcessing"
          size="mini"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import requestApi from '../../http/CodeChange'
import serviceApi from '../../http/Service'
export default {
  data() {
    return {
      service: '',
      filterText: '',
      serviceList: [],
      changeList: [],
      changeForm: {
        branchType: 'custom',
      },
      selectItem: {},
      dialogFormVisible: false,
      loading: false,
      disableBranch: false,
      rule: {
        changeName: [
          { required: true, message: '请输入变更描述', trigger: 'blur' },
        ],
        changeBranch: [
          { required: true, message: '请输入分支名称', trigger: 'blur' },
        ],
        relationId: [
          {
            required: true,
            message: '请选关联的需求或缺陷',
            trigger: 'change',
          },
        ],
      },
      isProcessing: false,
    }
  },
  methods: {
    startEdit(row) {
      this.dialogFormVisible = true
      this.changeForm = JSON.parse(JSON.stringify(row))
      this.changeForm.relationId = row.relationId
      this.querySearchAsync('', (array) => {
        array.forEach((e) => {
          if (e.relationId == row.relationId) {
            this.selectItem = e
          }
        })
      })
    },
    querySearchAsync(text, cb) {
      if (!text) {
        text = ''
      }
      requestApi.relationList(text).then((res) => {
        let array = []
        res.data.forEach((e) => {
          e.value = e.name
          array.push(e)
        })
        cb(array)
      })
    },
    handleSelect(item) {
      this.selectItem = item
      this.changeForm.relationId = item.relationId
    },
    getServices() {
      this.serviceList = []
      serviceApi.getServices().then((res) => {
        this.serviceList = res.data
        if (!this.service) {
          this.service = this.serviceList[0].serviceId
        }
        this.getCodeChangeList()
      })
    },
    addChangeCode() {
      this.dialogFormVisible = true
    },
    selectService() {
      this.$store.commit('UPDATE_SERVICE_ID', this.service)
      this.getCodeChangeList()
    },
    selectBranchType(value) {
      if (value == 'default') {
        let branchName = 'develop_'
        var today = new Date()
        var DD = String(today.getDate()).padStart(2, '0')
        var MM = String(today.getMonth() + 1).padStart(2, '0')
        var yyyy = today.getFullYear()
        branchName += yyyy + MM + DD + '_' + this.$utils.randomString(6)
        this.changeForm.changeBranch = branchName
        this.disableBranch = true
      } else {
        this.disableBranch = false
        this.changeForm.changeBranch = ''
      }
      this.$forceUpdate()
    },
    removeChange(item) {
      this.$confirm('确认删除？').then(() => {
        requestApi.deleteCodeChange(this.service, item.changeId).then(() => {
          this.$message({
            message: '删除变更成功',
            type: 'success',
          })
          this.getCodeChangeList()
        })
      })
    },
    closeDialog() {
      this.dialogFormVisible = false
      this.changeForm = {
        branchType: 'custom',
      }
      this.selectItem = {}
      this.isProcessing = false
      this.$refs.changeForm.resetFields()
    },
    confirmChange(confirmChange) {
      this.$refs[confirmChange].validate((valid) => {
        if (!valid) {
          return false
        }
        this.changeForm.relationId = this.selectItem.relationId
        this.changeForm.relationType = this.selectItem.relationType
        this.changeForm.serviceId = this.service
        this.isProcessing = true
        requestApi
          .saveCodeChange(this.changeForm)
          .then(() => {
            this.$message({
              message: '创建变更成功',
              type: 'success',
            })
            this.closeDialog()
            this.getCodeChangeList()
          })
          .catch(() => {
            this.isProcessing = false
          })
      })
    },
    getCodeChangeList() {
      requestApi.codeChangeList(this.service).then((res) => {
        this.changeList = res.data
      })
    },
  },
  created() {
    this.service = this.$store.state.serviceId
    this.getServices()
  },
}
</script>
<style scoped>
.add-btn {
  position: absolute;
  right: 20px;
  top: 10px;
}
.change-title {
  position: relative;
}
.change-desc {
  margin: 10px;
  font-weight: 800;
  width: 200px;
}
.change-list {
  margin-top: 30px;
}
.title-line {
  margin: 10px;
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
.filter-input {
  width: 300px;
  margin-left: 10px;
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
