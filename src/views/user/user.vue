<template>
  <div>
    <div class="title">
      <el-page-header @back="goBack" content="用户详情"> </el-page-header>
    </div>
    <el-tabs tab-position="left" style="height: 300px">
      <el-tab-pane label="用户信息">
        <div class="logo-text">
          {{ logoName }}
        </div>
        <el-form
          size="mini"
          v-model="userForm"
          label-position="80px"
          class="form-div"
        >
          <el-form-item label="用户名称">{{ userForm.userName }}</el-form-item>
          <el-form-item label="用户昵称">
            <el-input
              class="edit-name"
              v-if="isEdit"
              @blur="updateNickName"
              v-model="userForm.nickName"
              placeholder="请输入用户昵称"
            />
            <span v-else
              >{{ userForm.nickName }}
              <i @click="startEdit" class="el-icon-edit edit-icon"
            /></span>
          </el-form-item>
          <el-form-item label="所属组织">暂无</el-form-item>
          <el-form-item
            ><el-button
              type="primary"
              icon="el-icon-refresh"
              @click="startUpdate"
              >修改密码</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      title="修改用户"
      width="40%"
      :visible.sync="showUpdateDialog"
      @close="closeUpdte"
    >
      <el-form
        :model="updateForm"
        size="mini"
        ref="updateForm"
        :rules="updateRules"
        label-width="80px"
      >
        <el-form-item label="用户">
          {{ userForm.userName }}
        </el-form-item>
        <el-form-item label="用户昵称">
          {{ userForm.nickName }}
        </el-form-item>
        <el-form-item label="旧密码">
          <el-input
            v-model="updateForm.oldPassword"
            show-password
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="updateForm.newPassword"
            show-password
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="closeUpdte">取 消</el-button>
        <el-button size="mini" type="primary" @click="submit('updateForm')"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import userApi from '../../http/User'
export default {
  data() {
    return {
      userForm: {},
      isEdit: false,
      oldName: '',
      updateForm: {},
      showUpdateDialog: false,
      updateRules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' },
          { min: 6, message: '密码最少6位', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码最少6位', trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    logoName() {
      if (!this.userForm || !this.userForm.userName) {
        return ''
      }
      return this.userForm.userName.substring(0, 1)
    },
  },
  methods: {
    startUpdate() {
      this.updateForm = {}
      this.showUpdateDialog = true
    },
    submit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        this.updateForm.userId = this.userForm.userId
        userApi.updatePassword(this.updateForm).then((res) => {
          if (res.data) {
            this.$notify.success('修改密码成功')
            this.closeUpdte()
          } else {
            this.$notify.error('修改密码失败')
          }
        })
      })
    },
    closeUpdte() {
      this.updateForm = {}
      this.showUpdateDialog = false
    },
    startEdit() {
      this.isEdit = true
      this.oldName = this.userForm.nickName
    },
    updateNickName() {
      if (this.oldName == this.userForm.nickName) {
        this.isEdit = false
        return
      }
      userApi.updateUser(this.userForm).then((res) => {
        if (res.data) {
          this.$notify.success('修改成功成功')
          this.isEdit = false
        }
      })
    },
    goBack() {
      this.$router.go(-1)
    },
    getUserInfo() {
      userApi.getUserDetail().then((res) => {
        console.log(res)
        this.userForm = res.data
      })
    },
  },
  created() {
    this.getUserInfo()
  },
}
</script>
<style lang="less" scoped>
.title {
  margin: 20px;
}
.form-div {
  margin-left: 40px;
}

.logo-text {
  border-radius: 100px;
  height: 100px;
  line-height: 100px;
  width: 100px;
  text-align: center;
  vertical-align: middle;
  font-size: 30px;
  cursor: pointer;
  margin: 10px;
  margin-left: 40px;
  margin-bottom: 20px;
  color: #909399;
  font-weight: 800;
  background-color: #f2f6fc;
}
.edit-name {
  width: 200px;
}

.edit-icon {
  font-size: 15px;
  cursor: pointer;
}
</style>
