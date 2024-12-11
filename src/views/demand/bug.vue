<template>
  <div class="content">
    <div class="query-line">
      <el-form :inline="true" v-model="queryForm" size="mini">
        <el-form-item label="缺陷名称">
          <el-input
            v-model="queryForm.name"
            placeholder="输入缺陷名称查询"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryForm.status"
            clearable
            placeholder="请选择缺陷状态"
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
          <el-button type="primary" @click="queryBugs">查询</el-button>
        </el-form-item>
      </el-form>
      <div class="bug-div">
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
          @click="createBug"
          size="mini"
          >创建缺陷</el-button
        >
      </div>
    </div>
    <div class="table-list">
      <el-table :data="tableData" height="500" size="mini" style="width: 100%">
        <el-table-column prop="bugName" label="缺陷名称">
          <template slot-scope="scope">
            <text-view :text="scope.row.bugName"></text-view>
          </template>
        </el-table-column>
        <el-table-column prop="acceptorName" label="负责人"> </el-table-column>
        <el-table-column prop="status" label="缺陷状态">
          <template slot-scope="scope">
            {{ exchangeStatusName(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提出时间">
          <template slot-scope="scope">
            {{ scope.row.createTime | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column prop="tag" label="缺陷标签"> </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="viewBug(scope.row)" size="small"
              >查看</el-button
            >
            <el-button type="text" @click="deleteBug(scope.row)" size="small"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
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
      :title="bugTitle"
      :visible.sync="showBugDialog"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      width="80%"
    >
      <div>
        <bugDetail
          :edit="isEdit"
          :iteration="iterationId"
          :bug="bugId"
          @cancel="closeBug"
        ></bugDetail>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import TextView from '../../components/text-view.vue'
import bugApi from '../../http/BugApi'
import userApi from '../../http/User'
import bugDetail from './bug-detail.vue'
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
    bugDetail,
    TextView,
  },
  watch: {
    space: {
      handler(val) {
        this.spaceId = val
        this.getBugList()
      },
    },
    iteration: {
      handler(val) {
        this.iterationId = val
        this.getBugList()
      },
    },
  },
  data() {
    return {
      spaceId: '',
      iterationId: '',
      tableData: [],
      queryForm: {
        name: '',
        status: '',
        type: 1,
      },
      statusList: [],
      bugForm: {},
      bugId: '',
      showBugDialog: false,
      bugTitle: '创建缺陷',
      abilityList: ['用户体验', '功能增强', '性能', '可靠性', '安全', '运维'],
      currentPage: 1,
      currentSize: 10,
      total: 0,
      isEdit: false,
      bugRule: {
        bugName: [
          { required: true, message: '请输入缺陷名称', trigger: 'blur' },
          { min: 10, message: '缺陷名称最少10个字符', trigger: 'blur' },
        ],
        level: [
          { required: true, message: '请选择缺陷优先级', trigger: 'change' },
        ],
      },
      userList: [],
      queryTypeList: [
        { icon: 'el-icon-house', label: '所有' },
        { icon: 'el-icon-thumb', label: '我负责' },
        { icon: 'el-icon-zoom-in', label: '我创建' },
      ],
      commandIndex: 0,
    }
  },
  methods: {
    selectQueryCommand(command) {
      this.queryForm.type = command
      if (this.queryForm.type != '1') {
        this.$set(this.queryForm, 'acceptor', '')
      }
      this.commandIndex = command - 1
      this.getBugList()
    },
    querySearchAsync(queryString) {
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
    exchangeStatusName(status) {
      let statusName = '-'
      this.statusList.forEach((e) => {
        if (e.value == status) {
          statusName = e.statusName
        }
      })
      return statusName
    },
    queryBugs() {
      this.getBugList()
    },
    viewBug(row) {
      this.showBugDialog = true
      this.bugId = row.bugId
      // this.bugForm = row
      this.isEdit = true
      this.bugTitle = '缺陷详情'
    },
    deleteBug(row) {
      bugApi.deleteBug(row.bugId).then((res) => {
        if (res.data) {
          this.$notify({
            title: '成功',
            message: '删除缺陷成功',
            type: 'success',
          })
          this.getBugList()
        } else {
          this.$notify({
            title: '失败',
            message: '删除缺陷失败',
            type: 'danger',
          })
        }
      })
    },
    createBug() {
      this.showBugDialog = true
      this.isEdit = false
      this.bugId = ''
      this.bugTitle = '创建详情'
    },
    handlePageChange(page) {
      this.currentPage = page
      this.getBugList()
    },
    handleSizeChange(size) {
      this.currentSize = size
      this.getBugList()
    },
    closeBug() {
      this.showBugDialog = false
      this.bugForm = {}
      this.getBugList()
      this.$refs.bugForm.resetFields()
    },
    getBugList() {
      bugApi
        .getBugList(
          this.currentPage,
          this.currentSize,
          this.queryForm.name ? this.queryForm.name : '',
          this.queryForm.status ? this.queryForm.status : '',
          this.spaceId,
          this.iterationId ? this.iterationId : '',
          this.queryForm.type ? this.queryForm.type : '',
          this.queryForm.acceptor ? this.queryForm.acceptor : ''
        )
        .then((res) => {
          this.tableData = res.data.data
          this.total = res.data.total
        })
    },
    getstatusList() {
      bugApi.getBugStatuses().then((res) => {
        this.statusList = res.data
      })
    },
  },
  created() {
    this.spaceId = this.$store.state.spaceId
    this.iterationId = this.iteration
    this.getBugList()
    this.getstatusList()
    this.querySearchAsync()
  },
}
</script>
<style lang="less" scoped>
.content {
  position: relative;
  width: 100%;
}
.bug-div {
  position: absolute;
  right: 30px;
  top: 0px;
}
.query-line {
  margin-left: 5px;
}
.view-mode {
  margin-right: 20px;
  cursor: pointer;

  i {
    margin-right: 5px;
  }
}
</style>
