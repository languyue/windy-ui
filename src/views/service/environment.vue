<template>
  <div class="content">
    <div class="title">
      <!-- 表单查询开始 -->
      <div>
        <el-form :inline="true" size="mini">
          <el-form-item label="环境名称">
            <el-input
              clearable
              v-model="queryName"
              placeholder="请输入环境名称"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="startQuery"
              >查询</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-circle-plus-outline"
              @click="createEnv"
              >新增环境</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <!-- 表单查询结束 -->
    </div>
    <div>
      <el-row :gutter="40">
        <el-col :span="6" v-for="(item, index) in envData" :key="index">
          <el-card
            shadow="always"
            class="env-card"
            :body-style="{ padding: '15px' }"
          >
            <div>
              <span class="env-name">
                <textView :text="item.envName" :len="20" />
              </span>
              <img class="env-img" :src="item.img" width="40" height="40" />
            </div>
            <div>
              <div class="status-icon">
                <el-tag :type="item.envStatus | statusFormat" size="medium">{{
                  item.envStatus | deployFormat
                }}</el-tag>
              </div>
              <div class="op-line">
                <el-button
                  icon="el-icon-edit-outline"
                  type="text"
                  @click="handleEdit(item)"
                  >编辑</el-button
                >
                <el-button
                  icon="el-icon-delete"
                  type="text"
                  @click="handleDelete(item)"
                  >删除</el-button
                >
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <div class="page-index">
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

    <el-dialog
      :title="titleName"
      :visible.sync="showEnvDialog"
      width="60%"
      @close="cancellDialog"
    >
      <el-form
        :model="envForm"
        ref="envForm"
        label-width="80px"
        :rules="envRule"
        size="mini"
      >
        <el-form-item label="环境名称" prop="envName">
          <el-input
            v-model="envForm.envName"
            placeholder="请输入环境名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="部署类型" prop="envType">
          <el-radio-group v-model="envForm.envType" @change="selectType">
            <el-radio :label="1">SSH部署</el-radio>
            <el-radio :label="2">K8S部署</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="paramList">
          <el-form label-width="120px" size="mini">
            <el-form-item
              v-for="(item, index) in paramsList"
              :key="index"
              :label="item.name"
            >
              <el-input
                :show-password="item.showPass"
                v-model="item.value"
                :placeholder="item.desc"
              ></el-input>
            </el-form-item>
          </el-form>
        </el-form-item>
        <el-form-item label="环境状态" prop="envStatus">
          <el-row>
            <el-col :span="3">
              <el-switch :disabled="limited" v-model="checked"></el-switch>
            </el-col>
            <el-col :span="6">
              <el-button
                type="primary"
                icon="el-icon-refresh"
                class="check"
                size="mini"
                @click="checkStatus"
                >检测</el-button
              >
            </el-col>
          </el-row>
        </el-form-item>
        <el-alert
          title="检测提示"
          description="只有通过检测才可添加环境，点击检测按钮即可开始检测"
          type="info"
          :closable="false"
          show-icon
        >
        </el-alert>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="cancellDialog"> 取消</el-button>
        <el-button type="primary" size="mini" @click="submit('envForm')">
          确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import k8sIcon from '../../assets/k8s.png'
import sshIcon from '../../assets/ssh.png'
import envApi from '../../http/Environment'
import textView from '../../components/text-view.vue'
export default {
  components: {
    textView,
  },
  data() {
    return {
      currentPage: 1,
      totalSize: 0,
      envData: [],
      queryName: '',
      showEnvDialog: false,
      envForm: {},
      titleName: '创建环境',
      limited: true,
      isEdit: false,
      checked: false,
      envRule: {
        envName: [
          { required: true, message: '请输入需求名称', trigger: 'blur' },
          { max: 50, message: '环境名称最长50个字符', trigger: 'blur' },
        ],
        paramList: [
          { required: true, validator: this.checkParam, trigger: 'blur' },
        ],
      },
      sshParams: [
        { key: 'sshIp', value: '', name: '访问IP', desc: '请输入访问ssh的IP' },
        {
          key: 'sshPort',
          value: '22',
          name: '访问端口',
          desc: '请输入访问ssh的端口',
        },
        {
          key: 'user',
          value: '',
          name: 'ssh用户',
          desc: '请输入访问ssh所使用的用户',
        },
        {
          key: 'password',
          value: '',
          name: 'ssh密码',
          showPass: true,
          desc: '请输入访问ssh所使用的密码',
        },
        {
          key: 'remotePath',
          value: '',
          name: '远端路径',
          desc: '请输入ssh远端服务的运行路径',
        },
      ],
      k8sParams: [
        {
          key: 'apiService',
          value: '',
          name: 'Api服务',
          desc: '请输入访问k8s的ApiService地址',
        },
        {
          key: 'token',
          value: '',
          name: '访问token',
          showPass: true,
          desc: '请输入访问k8s的地址',
        },
        {
          key: 'namespace',
          value: '',
          name: '命名空间',
          desc: '请输入部署的Namespace',
        },
        {
          key: 'repository',
          value: '',
          name: '镜像仓库',
          desc: '请输入访问k8s镜像仓库的地址,填写后覆盖默认仓库地址',
        },
        {
          key: 'secretName',
          value: '',
          name: 'Secret名称',
          desc: '请输入拉取镜像的Secret名称',
        },
      ],
      paramsList: [],
    }
  },
  methods: {
    checkParam(rule, value, callback) {
      let msg
      this.paramsList.forEach((e) => {
        if (!e.value && e.key != 'repository' && e.key != 'secretName') {
          msg = e.desc
        }
      })

      if (msg) {
        callback(new Error(msg))
      } else {
        callback()
      }
    },
    pageChange(page) {
      this.currentPage = page
      this.getEnvs()
    },
    handleDelete(row) {
      this.$confirm(`确认删除环境【${row.envName}】?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        envApi.deleteEnv(row.envId).then((res) => {
          if (res.data) {
            this.$notify.success('删除环境成功')
            this.getEnvs()
          } else {
            this.$notify.error('删除环境失败')
          }
        })
      })
    },
    handleEdit(row) {
      this.showEnvDialog = true
      this.isEdit = true
      this.titleName = '修改环境'
      this.paramsList = this.translate(row)
      this.limited = row.envStatus == 2
      this.envForm = JSON.parse(JSON.stringify(row))
      this.checked = row.envStatus == 1
    },
    translate(data) {
      let params = JSON.parse(data.envParams)
      let array = []
      if (data.envType == 1) {
        array = JSON.parse(JSON.stringify(this.sshParams))
      }
      if (data.envType == 2) {
        array = JSON.parse(JSON.stringify(this.k8sParams))
      }
      this.setValue(array, params)
      return array
    },
    setValue(array, data) {
      array.forEach((e) => {
        let value = data[e.key]
        if (value) {
          e.value = value
        }
      })
    },
    submit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        if (!this.checked) {
          this.$notify({
            title: '提示',
            message: '请先检查环境状态,检查通过才可添加环境',
            type: 'warning',
          })
          return
        }
        let data = this.envForm
        let param = {}
        this.paramsList.forEach((e) => {
          param[e.key] = e.value
        })
        data.envParams = JSON.stringify(param)
        data.envStatus = 2
        if (this.checked) {
          data.envStatus = 1
        }
        if (this.isEdit) {
          envApi.updateEnv(data).then((res) => {
            if (res.data) {
              this.$notify.success('修改环境成功')
              this.cancellDialog()
              this.getEnvs()
            } else {
              this.$notify.error('修改环境失败')
            }
          })
          return
        }

        envApi.createEnv(data).then((res) => {
          if (res.data) {
            this.$notify.success('添加环境成功')
            this.cancellDialog()
            this.getEnvs()
          } else {
            this.$notify.error('添加环境失败')
          }
        })
      })
    },
    cancellDialog() {
      this.showEnvDialog = false
      this.envForm = {}
      this.checked = false
      this.paramsList = []
    },
    selectType(type) {
      this.paramsList = []
      if (type == 1) {
        this.paramsList = JSON.parse(JSON.stringify(this.sshParams))
      }

      if (type == 2) {
        this.paramsList = JSON.parse(JSON.stringify(this.k8sParams))
      }
    },
    getEnvs() {
      this.envData = []
      envApi.getEnvs(this.currentPage, 10, this.queryName).then((res) => {
        if (!res.data.data) {
          return
        }
        res.data.data.forEach((element) => {
          element.configList = this.translate(element)
          if (element.envType == 1) {
            element.img = sshIcon
          }
          if (element.envType == 2) {
            element.img = k8sIcon
          }
          this.envData.push(element)
        })
        this.totalSize = res.data.total
      })
    },
    checkStatus() {
      let data = {}
      this.paramsList.forEach((e) => {
        data[e.key] = e.value
      })
      envApi.checkEnv(this.envForm.envType, data).then((res) => {
        if (res.data) {
          this.$notify.success('环境检查成功')
          this.limited = false
          this.checked = true
        } else {
          this.checked = false
          this.limited = true
          let msg = '请检查远程访问地址IP、端口、远程用户名与密码是否正确'
          if (this.envForm.envType == 2) {
            msg = '请检查K8S访问地址、token权限、命名空间名称是否正确'
          }
          this.$notify({
            title: '环境状态检测失败',
            message: msg,
            type: 'warning',
          })
        }
      })
    },
    startQuery() {
      this.getEnvs()
    },
    createEnv() {
      this.showEnvDialog = true
      this.envForm = { envType: 1 }
      this.selectType(1)
      this.limited = true
      this.isEdit = false
      this.titleName = '创建环境'
    },
  },
  created() {
    this.getEnvs()
  },
}
</script>

<style scoped>
.title {
  margin: 10px;
}
.check {
  margin-left: 20px;
}
.content {
  margin: 10px;
}
.env-name {
  vertical-align: middle;
  line-height: 50px;

  color: #303133;
  font-weight: 900;
  font-size: 18px;
}

.env-name i {
  margin-left: 10px;
}
.env-img {
  float: right;
  margin-right: 20px;
}
.status-icon {
  float: right;
  margin-right: 20px;
}
.config-line {
  color: #c0c4cc;
  font-weight: 500;
  margin: 2px;
  opacity: 0.5;
}
.env-card {
  height: 150px;
  overflow: hidden;
  margin: 10px;
  cursor: pointer;
}
.op-line {
  margin-top: 20px;
}
.page-index {
  margin-top: 20px;
}
</style>
