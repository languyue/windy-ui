<template>
  <div class="content">
    <div class="query-line">
      <el-form :inline="true" v-model="queryForm" size="mini">
        <el-form-item label="需求名称">
          <el-input
            class="search-input"
            v-model="queryForm.name"
            placeholder="需求名称查询"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            class="search-input"
            clearable
            placeholder="需求状态"
          >
            <el-option
              v-for="(item, index) in statusList"
              :key="index"
              :label="item.statusName"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理人">
          <el-select
            v-model="queryForm.acceptor"
            clearable
            :remote-method="querySearchAsync"
            filterable
            placeholder="处理人"
          >
            <el-option
              v-for="item in userList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryDemands">查询</el-button>
        </el-form-item>
      </el-form>
      <div class="demand-div">
        <el-dropdown @command="selectQueryCommand" size="small">
          <span class="view-mode"
            ><i class="el-icon-view" />查看:
            {{ queryTypeList[commandIndex].label }}
            <i class="el-icon-arrow-down el-icon--right"></i
          ></span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :command="index + 1"
              v-for="(item, index) in queryTypeList"
              :key="index"
            >
              <span
                ><i :class="item.icon" />{{ item.label }}</span
              ></el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          icon="el-icon-plus"
          type="primary"
          @click="createDemand"
          size="mini"
          >创建需求</el-button
        >
      </div>
    </div>
    <div class="table-list">
      <el-table :data="tableData" height="500" size="mini" style="width: 100%">
        <el-table-column prop="demandName" label="需求名称"> </el-table-column>
        <el-table-column prop="proposerName" label="提出人" width="180">
        </el-table-column>
        <el-table-column prop="status" label="需求状态">
          <template slot-scope="scope">
            {{ exchangeStatusName(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column prop="expectTime" label="期待结束时间">
          <template slot-scope="scope">
            <i class="el-icon-date" /> {{ scope.row.expectTime | dayFormat }}
          </template>
        </el-table-column>
        <el-table-column prop="tag" label="需求标签"> </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="viewDemand(scope.row)" size="small"
              >查看</el-button
            >
            <el-button type="text" @click="deleteDemand(scope.row)" size="small"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="bottm-page">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="10"
          layout="sizes, prev, pager, next"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
    <el-dialog
      :title="demandTitle"
      :visible.sync="showDemandDialog"
      width="80%"
    >
      <div style="height: 100%">
        <el-form
          :model="demandFormModel"
          ref="demandFormModel"
          size="mini"
          label-width="120px"
          :rules="demandModelRules"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="需求标题" prop="demandName">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 10 }"
                  placeholder="请输入需求标题"
                  v-model="demandFormModel.demandName"
                ></el-input>
              </el-form-item>
              <el-form-item label="需求描述" prop="demandContent">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 12, maxRows: 30 }"
                  placeholder="请输入需求的详细描述"
                  v-model="demandFormModel.demandContent"
                >
                </el-input>
              </el-form-item>
              <!-- <el-form-item label="附件">
            <el-upload
              class="upload-demo"
              action="https://jsonplaceholder.typicode.com/posts/"
              multiple
              :limit="3"
              :file-list="demandFormModel.fileList"
            >
              <el-button size="mini" type="primary">上传附件</el-button>
            </el-upload>
          </el-form-item> -->
            </el-col>
            <el-col :span="12">
              <el-form-item label="需求价值" prop="customerValue">
                <el-select
                  v-model="demandFormModel.customerValue"
                  placeholder="请选择需求价值"
                >
                  <el-option
                    v-for="(item, index) in abilityList"
                    :key="index"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="需求优先级" prop="level">
                <el-select
                  v-model="demandFormModel.level"
                  placeholder="请选择需求优先级"
                >
                  <el-option label="P1" :value="1"></el-option>
                  <el-option label="P2" :value="2"></el-option>
                  <el-option label="P3" :value="3"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="接受人" prop="acceptor">
                <userSearch
                  :users="demandFormModel.acceptorUser"
                  :single="true"
                  @clearUser="clearUser"
                  @chooseUser="selectUser"
                ></userSearch>
              </el-form-item>
              <el-form-item label="期待完成时间" prop="expectTime">
                <el-date-picker
                  v-model="demandFormModel.expectTime"
                  align="right"
                  type="date"
                  :pickerOptions="pickOption"
                  value-format="timestamp"
                  placeholder="选择日期"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item label="工作量(人/日)" prop="workload">
                <el-input-number
                  style="width: 150px"
                  :min="1"
                  :step="1"
                  v-model="demandFormModel.workload"
                  placeholder="请输入工作量"
                ></el-input-number>
              </el-form-item>
              <el-form-item label="标签">
                <el-select
                  v-model="demandFormModel.tag"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择标签"
                >
                  <el-option
                    v-for="(item, index) in tagList"
                    :key="index"
                    :label="item.statusName"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="closeDemand">取 消</el-button>
          <el-button
            type="primary"
            @click="submitDemand('demandFormModel')"
            size="mini"
            >确 定</el-button
          >
        </div>
      </div>
    </el-dialog>
    <el-dialog title="需求详情" :visible.sync="showDemandDetail" width="90%">
      <detail :demand="demandDetail.demandId"></detail>
    </el-dialog>
  </div>
</template>
<script>
import demandApi from '../../http/DemandApi'
import userApi from '../../http/User'
import detail from './detail.vue'
import userSearch from '../../components/user-search.vue'
export default {
  props: {
    space: {
      default: '',
      type: String,
    },
    iteration: {
      default: '',
      type: String,
    },
  },
  components: {
    detail,
    userSearch,
  },
  watch: {
    space: {
      handler(val) {
        if (val) {
          this.spaceId = val
          this.getDemandList()
        }
      },
    },
    iteration(val) {
      this.iterationId = val
      this.getDemandList()
    },
  },
  data() {
    return {
      spaceId: '',
      tableData: [],
      searchUser: '',
      queryForm: {
        name: '',
        status: '',
        type: 1,
      },
      statusList: [],
      demandFormModel: {},
      demandId: '',
      showDemandDialog: false,
      showDemandDetail: false,
      demandTitle: '创建需求',
      tagList: [],
      abilityList: ['用户体验', '功能增强', '性能', '可靠性', '安全', '运维'],
      currentPage: 1,
      currentSize: 10,
      total: 0,
      demandDetail: {},
      demandModelRules: {
        acceptor: [
          { required: true, validator: this.validAcceptor, trigger: 'change' },
        ],
        demandName: [
          { required: true, message: '请输入需求名称', trigger: 'blur' },
          { min: 10, message: '需求名称最少10个字符', trigger: 'blur' },
        ],
        demandContent: [
          { required: true, message: '请输入需求描述', trigger: 'blur' },
          { min: 20, message: '需求名称最少20个字符', trigger: 'blur' },
        ],
        customerValue: [
          { required: true, message: '请选择客户价值', trigger: 'change' },
        ],
        level: [
          { required: true, message: '请选择需求优先级', trigger: 'change' },
        ],
        workload: [
          { required: true, message: '请输入工作量', trigger: 'blur' },
        ],
        expectTime: [
          { required: true, message: '请选择期待完成日期', trigger: 'change' },
        ],
      },
      userList: [],
      queryTypeList: [
        { icon: 'el-icon-house', label: '所有' },
        { icon: 'el-icon-thumb', label: '我负责' },
        { icon: 'el-icon-zoom-in', label: '我创建' },
      ],
      commandIndex: 0,
      pickOption: {
        disabledDate: (time) => {
          console.log('time', time)
          return time.getTime() <= Date.now() - 86400000
        },
      },
    }
  },
  methods: {
    selectQueryCommand(command) {
      this.queryForm.type = command
      console.log('查询dddd', command)
      this.commandIndex = command - 1
      this.getDemandList()
    },
    querySearchAsync(queryString) {
      console.log('查询用户', queryString)
      this.userList = []
      userApi.queryUserByName('').then((res) => {
        if (!queryString) {
          this.userList = res.data
          return
        }

        this.userList = res.data.filter((item) => {
          return (
            item.label.toLowerCase().indexOf(queryString.toLowerCase()) > -1
          )
        })
      })
    },
    handleSelect(item) {
      console.log(item)
      //tem.nickName ? item.nickName : item.userName
      this.queryForm.acceptor = item.userId
    },
    validAcceptor(rule, value, callback) {
      if (
        !this.demandFormModel.acceptor ||
        !this.demandFormModel.acceptorName
      ) {
        callback(new Error('请选择需求负责人'))
      } else {
        callback()
      }
    },
    selectUser(userList) {
      console.log('dddsssss', userList)
      this.demandFormModel.acceptor = userList[0].userId
      this.demandFormModel.acceptorName = userList[0].name
      this.demandFormModel.acceptorUser = userList
      this.$nextTick(() => {
        this.$refs.demandFormModel.validate() // 确保数据更新后再校验
      })
    },
    clearUser() {
      this.demandFormModel.acceptor = ''
      this.demandFormModel.acceptorName = ''
      this.$nextTick(() => {
        this.$refs.demandFormModel.validate() // 确保数据更新后再校验
      })
    },
    exchangeStatusName(status) {
      let statusName = '-'
      this.statusList.forEach((e) => {
        if (e.value == status) {
          statusName = e.statusName
        }
      })
      return statusName
    },
    queryDemands() {
      this.queryForm.type = ''
      this.getDemandList()
    },
    viewDemand(row) {
      this.showDemandDetail = true
      this.demandDetail = row
    },
    deleteDemand(row) {
      demandApi.deleteDemand(row.demandId).then((res) => {
        if (res.data) {
          this.$notify({
            title: '成功',
            message: '删除需求成功',
            type: 'success',
          })
          this.getDemandList()
        } else {
          this.$notify({
            title: '失败',
            message: '删除需求失败',
            type: 'danger',
          })
        }
      })
    },
    createDemand() {
      this.showDemandDialog = true
    },
    handlePageChange(page) {
      this.currentPage = page
      this.getDemandList()
    },
    handleSizeChange(size) {
      this.currentSize = size
      this.getDemandList()
    },
    closeDemand() {
      this.showDemandDialog = false
      this.demandFormModel = {}
      this.$refs.demandFormModel.resetFields()
    },
    submitDemand(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        this.demandFormModel.spaceId = this.spaceId
        if (this.iterationId) {
          this.demandFormModel.iterationId = this.iterationId
        }
        demandApi.createDemand(this.demandFormModel).then((res) => {
          if (res.data) {
            this.$notify.success('创建需求成功')
            this.getDemandList()
            this.closeDemand()
          } else {
            this.$notify.error('创建需求失败')
          }
        })
      })
    },
    getDemandList() {
      if (!this.spaceId) {
        return
      }
      demandApi
        .getDemandList(
          this.currentPage,
          this.currentSize,
          this.queryForm.name,
          this.queryForm.status,
          this.spaceId,
          this.iterationId ? this.iterationId : '',
          this.queryForm.type ? this.queryForm.type : '',
          this.queryForm.acceptor ? this.queryForm.acceptor : ''
        )
        .then((res) => {
          console.log(res)
          this.tableData = res.data.data
          this.total = res.data.total
        })
    },
    getstatusList() {
      demandApi.getDemandStatuses().then((res) => {
        this.statusList = res.data
      })
    },
    getDemandTags() {
      demandApi.getDemandTags().then((res) => {
        this.tagList = res.data
      })
    },
  },
  created() {
    this.spaceId = this.$store.state.spaceId
    this.iterationId = this.iteration
    this.getDemandList()
    this.getDemandTags()
    this.getstatusList()
    this.querySearchAsync('')
  },
}
</script>
<style lang="less" scoped>
.content {
  /* padding: 10px; */
  position: relative;
  width: 100%;
}
.demand-div {
  position: absolute;
  right: 30px;
  top: 0px;
}
.bottm-page {
  margin-top: 10px;
}
.query-line {
  margin-left: 5px;
  .search-input {
    width: 120px;
  }
}
.view-mode {
  margin-right: 20px;
  cursor: pointer;

  i {
    margin-right: 5px;
  }
}
</style>
