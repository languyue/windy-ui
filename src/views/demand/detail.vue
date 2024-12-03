<template>
  <div>
    <div class="title-line">
      <div class="btn-list">
        <el-button
          size="mini"
          v-if="!isEdit"
          @click="isEdit = !isEdit"
          type="primary"
          icon="el-icon-edit"
          >编辑</el-button
        >
        <el-button
          size="mini"
          v-if="isEdit"
          @click="isEdit = !isEdit"
          type="danger"
          icon="el-icon-circle-close"
          >取消</el-button
        >
        <el-button
          size="mini"
          icon="el-icon-s-promotion"
          v-if="isEdit"
          type="primary"
          @click="submitInfo('demandForm')"
          >提交</el-button
        >
      </div>
    </div>
    <el-row>
      <el-form
        :model="demandForm"
        ref="demandForm"
        size="mini"
        :rules="demandRules"
        label-width="80px"
      >
        <el-col :span="14">
          <el-form-item label="需求ID">
            <span
              >{{ demandForm.demandId }}
              <el-tooltip
                effect="dark"
                content="复制需求ID"
                placement="right-start"
              >
                <i
                  class="copy-icon el-icon-document-copy"
                  :data-clipboard-text="demandForm.demandId"
                />
              </el-tooltip>
            </span>
          </el-form-item>
          <el-form-item label="需求标题">
            <span>{{ demandForm.demandName }}</span>
          </el-form-item>
          <el-form-item label="客户价值">
            <span>{{ demandForm.customerValue }}</span>
          </el-form-item>
          <el-form-item label="需求描述">
            <el-input
              type="textarea"
              :disabled="!isEdit"
              :autosize="{ minRows: 8, maxRows: 20 }"
              placeholder="请输入需求的详细描述"
              v-model="demandForm.demandContent"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="附件"> xxxx.doc </el-form-item>

          <div class="comments-div">
            <div>
              <el-input
                type="textarea"
                :autosize="{ minRows: 4, maxRows: 20 }"
                placeholder="请输入您对需求的讨论"
                v-model="commentMsg"
              >
              </el-input>
            </div>
            <div class="commit-btn">
              <el-button size="mini" type="primary" @click="addComment"
                >添加评论</el-button
              >
            </div>
          </div>
          <div class="comment-list">
            <div class="history" v-for="(item, index) in comments" :key="index">
              <div class="user-div">
                <span><i class="el-icon-s-custom" /></span> {{ item.userName }}
                {{ item.createTime | dateFormat }}
              </div>
              <div class="history-content">
                {{ item.comment }}
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <!-- <el-form :model="demandForm" label-width="120px" size="mini"> -->
          <el-form-item label="提出人">
            <span>{{ demandForm.proposerName }}</span>
          </el-form-item>
          <el-form-item label="接受人" prop="acceptor">
            <userSearch
              :disable="!isEdit"
              :users="demandForm.acceptorUser"
              :single="true"
              @clearUser="clearUser"
              @chooseUser="selectUser"
            ></userSearch>
          </el-form-item>
          <el-form-item label="截止时间" disabled>
            <el-date-picker
              disabled
              v-model="completeDate"
              align="right"
              type="date"
              placeholder="选择日期"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="工作量" disabled>
            <el-input
              disabled
              v-model="demandForm.workload"
              placeholder="请输入工作量(人/日)"
            ></el-input>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="demandForm.tag"
              filterable
              :disabled="!isEdit"
              allow-create
              default-first-option
              placeholder="请选择标签"
            >
              <el-option
                v-for="(item, index) in tagList"
                :key="index"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="需求状态">
            <el-select
              v-model="demandForm.status"
              :disabled="!isEdit"
              @change="statusChange"
              placeholder="请选择状态"
            >
              <el-option
                v-for="(item, index) in statusOptions"
                :key="index"
                :label="item.statusName"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="搁置天数"> 3 </el-form-item>
          <!-- </el-form> -->
        </el-col>
      </el-form>
    </el-row>
  </div>
</template>
<script>
import Clipboard from 'clipboard'
import DemandApi from '../../http/DemandApi'
import CommentApi from '../../http/Comment'
import userSearch from '../../components/user-search.vue'
export default {
  props: {
    demand: {
      type: String,
    },
  },
  components: {
    userSearch,
  },
  watch: {
    demand: {
      handler(val) {
        this.demandId = val
        this.init()
      },
    },
  },
  data() {
    return {
      demandForm: {},
      demandId: '',
      tagList: ['个人需求', '数据分析', '客户定制'],
      abilityList: ['用户体验', '功能增强', '性能', '可靠性', '安全', '运维'],
      commentMsg: '',
      refuseReason: '',
      isRefuse: false,
      completeDate: null,
      isEdit: false,
      statusOptions: [],
      comments: [],
      demandRules: {
        acceptor: [
          { required: true, validator: this.validAcceptor, trigger: 'change' },
        ],
      },
    }
  },
  methods: {
    validAcceptor(rule, value, callback) {
      console.log('触发回掉')
      if (!this.demandForm.acceptor || !this.demandForm.acceptorName) {
        callback(new Error('请选择需求负责人'))
      } else {
        callback()
      }
    },
    selectUser(userList) {
      console.log('dddsssss', userList)
      this.demandForm.acceptor = userList[0].userId
      this.demandForm.acceptorName = userList[0].name
      this.demandForm.acceptorUser = userList
      this.$nextTick(() => {
        this.$refs.demandForm.validate() // 确保数据更新后再校验
      })
    },
    clearUser() {
      this.demandForm.acceptor = ''
      this.demandForm.acceptorName = ''
      this.demandForm.acceptorUser = []
      this.$nextTick(() => {
        this.$refs.demandForm.validate() // 确保数据更新后再校验
      })
    },
    submitInfo(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        DemandApi.updateDemand(this.demandForm).then((res) => {
          if (res.data) {
            this.$notify.success('更新成功')
            this.isEdit = false
          } else {
            this.$notify.error('更新失败')
          }
        })
      })
    },
    initCopy() {
      let _this = this
      let clipboard = new Clipboard('.copy-icon')

      clipboard.on('success', function () {
        _this.$notify.success('复制成功')
      })
      clipboard.on('error', function () {
        _this.$notify.success('复制失败')
      })
    },
    getDemandDetail() {
      if (!this.demandId) {
        return
      }
      DemandApi.getDemandDetail(this.demandId).then((res) => {
        this.demandForm = res.data
        this.completeDate = new Date(this.demandForm.expectTime)
        this.demandForm.acceptorUser = [
          {
            userId: this.demandForm.acceptor,
            name: this.demandForm.acceptorName,
          },
        ]
      })
    },
    getstatusList() {
      DemandApi.getDemandStatuses().then((res) => {
        this.statusOptions = res.data
      })
    },
    statusChange() {
      console.log(this.demandForm.status, this.demandId)
      DemandApi.updateDemandStatus({
        status: this.demandForm.status,
        demandId: this.demandId,
      }).then((res) => {
        console.log('返回结果', res)
        this.$notify.success('修改状态成功')
      })
    },
    getCommentsList() {
      if (!this.demandId) {
        return
      }
      CommentApi.getComments(this.demandId).then((res) => {
        console.log('list comment ', res)
        this.comments = res.data
      })
    },
    addComment() {
      let data = {
        comment: this.commentMsg,
        relativeId: this.demandId,
        userId: 'admin',
        userName: 'admin',
      }
      CommentApi.createComment(data).then((res) => {
        if (res.data) {
          this.$notify.success('添加评论成功')
          this.getCommentsList()
          this.commentMsg = ''
        } else {
          this.$notify.error('添加评论失败')
        }
      })
    },
    init() {
      this.getDemandDetail()
      this.getCommentsList()
      this.getstatusList()
    },
  },
  created() {
    this.demandId = this.demand
    this.init()
  },
  mounted() {
    this.initCopy()
  },
}
</script>
<style scoped>
.comments-div {
  margin: 20px 0 20px 20px;
}
.commit-btn {
  margin-top: 10px;
  text-align: right;
}
.history {
  margin: 20px;
}
.user-div {
  font-size: 13px;
  color: #000;
}
.history-content {
  padding: 10px 20px;
}
.op-line {
  margin-bottom: 20px;
  margin-right: 20px;
  text-align: right;
}
.reason {
  margin: 10px 0 10px 20px;
}
.copy-icon {
  margin-left: 20px;
  cursor: pointer;
}
.title-line {
  margin: 10px;
  position: relative;
  z-index: 1000;
}
.btn-list {
  position: absolute;
  right: 10px;
  top: -20px;
}
.comment-list {
  max-height: 300px;
  overflow-y: scroll;
}
</style>
