<template>
  <div>
    <el-form
      :model="bugForm"
      ref="bugForm"
      size="mini"
      label-width="120px"
      :rules="bugRule"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="缺陷标题" prop="bugName">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 10 }"
              placeholder="请输入缺陷标题"
              v-model="bugForm.bugName"
            ></el-input>
          </el-form-item>

          <el-form-item label="bug现象" prop="scene">
            <el-input
              type="textarea"
              :autosize="{ minRows: 12, maxRows: 30 }"
              placeholder="请输入详细描述缺陷信息"
              v-model="bugForm.scene"
            ></el-input>
          </el-form-item>

          <el-form-item label="复现步骤" prop="replayStep">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 10 }"
              placeholder="请输入缺陷的浮现步骤"
              v-model="bugForm.replayStep"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="预期结果" prop="expectResult">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入预期结果"
              v-model="bugForm.expectResult"
            ></el-input>
          </el-form-item>
          <el-form-item label="实际结果" prop="realResult">
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入实际结果"
              v-model="bugForm.realResult"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="acceptor">
            <userSearch
              :users="bugForm.acceptorUser"
              :single="true"
              @clearUser="clearUser"
              @chooseUser="selectUser"
            ></userSearch>
          </el-form-item>
          <el-form-item label="缺陷环境" prop="environment">
            <el-input
              v-model="bugForm.environment"
              placeholder="请输入缺陷环境"
            ></el-input>
          </el-form-item>
          <el-form-item label="关联需求" prop="demandId">
            <el-input
              placeholder="请输入关联的需求ID"
              v-model="bugForm.demandId"
            ></el-input>
          </el-form-item>
          <el-form-item label="缺陷状态" v-if="edit">
            <el-select v-model="bugForm.status" placeholder="请选择缺陷状态">
              <el-option
                v-for="(item, index) in statusList"
                :key="index"
                :label="item.statusName"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="缺陷级别" prop="level">
            <el-select v-model="bugForm.level" placeholder="请选择缺陷优先级">
              <el-option label="P1" :value="1"></el-option>
              <el-option label="P2" :value="2"></el-option>
              <el-option label="P3" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="bugForm.tags"
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

      <el-form-item>
        <el-button size="mini" @click="closeBug">取 消</el-button>
        <el-button type="primary" @click="submitBug('bugForm')" size="mini"
          >确 定</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import bugApi from '../../http/BugApi'
import userSearch from '../../components/user-search.vue'
export default {
  components: {
    userSearch,
  },
  props: {
    edit: Boolean,
    bug: String,
    iteration: {
      type: String,
      default: '',
    },
  },
  watch: {
    edit: {
      handler(val) {
        this.isEdit = val
      },
      deep: true,
      immediate: true,
    },
    bug: {
      handler(val) {
        console.log('val', val)
        this.bugId = val
        this.bugForm = {}
        this.getBug()
      },
      deep: true,
      immediate: true,
    },
    iteration: {
      handler(val) {
        this.iterationId = val
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      spaceId: '',
      iterationId: '',
      bugForm: {},
      statusList: [],
      isEdit: false,
      bugId: '',
      tagList: [],
      bugRule: {
        bugName: [
          { required: true, message: '请输入缺陷名称', trigger: 'blur' },
          { min: 10, message: '缺陷名称最少10个字符', trigger: 'blur' },
        ],
        level: [
          { required: true, message: '请选择缺陷优先级', trigger: 'change' },
        ],
        scene: [{ required: true, message: '请输入缺陷现象', trigger: 'blur' }],
        acceptor: [
          { required: true, message: '请选择缺陷负责人', trigger: 'change' },
        ],
      },
    }
  },
  methods: {
    selectUser(userList) {
      console.log('dddsssss', userList)
      this.bugForm.acceptor = userList[0].userId
      this.bugForm.acceptorName = userList[0].name
      this.$nextTick(() => {
        this.$refs.bugForm.validate() // 确保数据更新后再校验
      })
    },
    clearUser() {
      this.bugForm.acceptor = ''
      this.bugForm.acceptorName = ''
      this.$nextTick(() => {
        this.$refs.bugForm.validate() // 确保数据更新后再校验
      })
    },
    getBug() {
      if (this.edit) {
        bugApi.getBugDetail(this.bug).then((res) => {
          this.bugForm = res.data
          this.bugForm.acceptorUser = [
            { userId: this.bugForm.acceptor, name: this.bugForm.acceptorName },
          ]
        })
      }
    },
    getstatusList() {
      bugApi.getBugStatuses().then((res) => {
        this.statusList = res.data
      })
    },
    getBugTags() {
      bugApi.getBugTags().then((res) => {
        this.tagList = res.data
      })
    },
    closeBug() {
      this.bugForm = {}
      this.$emit('cancel')
    },
    submitBug(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }

        this.bugForm.spaceId = this.spaceId
        this.bugForm.iterationId = this.iterationId
        if (this.edit) {
          bugApi
            .updateBug(this.bugForm)
            .then((res) => {
              if (res.data) {
                this.$notify.success('修改缺陷成功')
                this.closeBug()
              } else {
                this.$notify.error('修改缺陷失败')
              }
            })
            .catch(() => {
              this.getBug()
            })
          return
        }
        bugApi
          .createBug(this.bugForm)
          .then((res) => {
            if (res.data) {
              this.$notify.success('创建缺陷成功')
              this.closeBug()
            } else {
              this.$notify.error('创建缺陷失败')
            }
          })
          .catch(() => {
            this.getBug()
          })
      })
    },
  },
  created() {
    this.spaceId = this.$store.state.spaceId
    this.isEdit = this.edit
    this.getstatusList()
    this.getBugTags()
  },
}
</script>
