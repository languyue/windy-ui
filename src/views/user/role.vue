<template>
  <div class="content">
    <el-button type="primary" size="mini" @click="addRole">新增角色</el-button>
    <el-table :data="roleTable" size="mini" height="500px">
      <el-table-column prop="roleId" label="角色Id"> </el-table-column>
      <el-table-column prop="roleName" label="角色名称"> </el-table-column>
      <el-table-column prop="description" label="角色描述"> </el-table-column>
      <el-table-column prop="gmtCreated" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150px">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="editRole(scope.row)"
            >编辑</el-button
          >
          <el-button size="mini" type="text" @click="deleteRole(scope.row)"
            >删除</el-button
          >
          <el-button size="mini" type="text" @click="showBind(scope.row)"
            >绑定资源</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleRoleSizeChange"
      @current-change="handleRolePageChange"
      :current-page="rolePage"
      :page-sizes="[10, 20, 50]"
      :page-size="roleSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="roleTotal"
    >
    </el-pagination>

    <el-dialog
      :title="title"
      :visible.sync="showRoleDialog"
      width="30%"
      :before-close="closeRoleDialog"
    >
      <el-form
        :model="roleForm"
        ref="roleForm"
        :rules="roleRule"
        label-width="80px"
        size="mini"
      >
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            type="testarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入角色描述"
            v-model="roleForm.description"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitRole('roleForm')"
            >确认</el-button
          >
          <el-button type="info">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog
      :title="title"
      :visible.sync="showBindResource"
      width="30%"
      :before-close="closeResourceDialog"
    >
      <el-form :model="resourceForm" label-width="80px" size="mini">
        <el-form-item label="角色ID">
          {{ resourceForm.relationId }}
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input
            v-model="resourceForm.roleName"
            placeholder="请输入角色名称"
          />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            type="testarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入角色描述"
            v-model="resourceForm.description"
          />
        </el-form-item>
        <el-form-item label="关联资源">
          <el-select
            v-model="resourceIds"
            multiple
            clearable
            placeholder="请选择资源"
          >
            <el-option
              v-for="item in resourceList"
              :key="item.resourceId"
              :label="item.resourceName"
              :value="item.resourceId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitBind">确认</el-button>
          <el-button type="info" @click="closeResourceDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import roleApi from '../../http/Role'
import resourceApi from '../../http/Resource'
export default {
  data() {
    return {
      roleTable: [],
      rolePage: 1,
      roleSize: 10,
      roleTotal: 0,
      title: '创建角色',
      showRoleDialog: false,
      showBindResource: false,
      roleForm: {},
      isEdit: false,
      resourceIds: [],
      resourceList: [],
      resourceForm: {},
      roleRule: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, message: '角色名称最少2个字符', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    submitBind() {
      this.resourceForm.resourceIds = this.resourceIds
      resourceApi.bindResource(this.resourceForm).then((res) => {
        if (res.data) {
          this.$notify.success('资源绑定成功')
          this.closeResourceDialog()
        } else {
          this.$notify.error('资源绑定失败')
        }
      })
    },
    showBind(row) {
      this.title = '角色绑定资源'
      this.isEdit = false
      this.resourceForm = row
      this.resourceForm.relationId = row.roleId
      this.showBindResource = true
      this.getAllResource()
      resourceApi.getRoleResources(row.roleId).then((res) => {
        if (res.data) {
          this.resourceIds = []
          res.data.forEach((e) => {
            this.resourceIds.push(e.resourceId)
          })
        }
      })
    },
    closeResourceDialog() {
      this.resourceForm = {}
      this.showBindResource = false
    },
    getAllResource() {
      resourceApi.getAllResources().then((res) => {
        this.resourceList = res.data
      })
    },
    closeRoleDialog() {
      this.showRoleDialog = false
      this.roleForm = {}
      this.isEdit = false
    },
    addRole() {
      this.showRoleDialog = true
      this.roleForm = {}
    },
    submitRole(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }

        if (this.isEdit) {
          roleApi.updateRole(this.roleForm).then((res) => {
            if (res.data) {
              this.$notify.success('修改角色成功')
              this.getRoleList()
              this.closeRoleDialog()
            } else {
              this.$notify.error('修改角色失败')
            }
          })
          return
        }
        roleApi.createRole(this.roleForm).then((res) => {
          if (res.data) {
            this.$notify.success('创建角色成功')
            this.getRoleList()
            this.closeRoleDialog()
          } else {
            this.$notify.error('创建角色失败')
          }
        })
      })
    },
    editRole(row) {
      this.showRoleDialog = true
      this.roleForm = row
      this.isEdit = true
    },
    deleteRole(row) {
      roleApi.deleteRole(row.roleId).then((res) => {
        if (res.data) {
          this.$notify.success('删除角色成功')
          this.getRoleList()
        } else {
          this.$notify.error('删除角色失败')
        }
      })
    },
    handleRoleSizeChange(size) {
      this.roleSize = size
      this.getRoleList()
    },
    handleRolePageChange(page) {
      this.rolePage = page
      this.getRoleList()
    },
    getRoleList() {
      roleApi.getRoles(this.rolePage, this.roleSize).then((res) => {
        console.log('xxxx', res)
        this.roleTable = res.data.data
        this.roleTotal = res.data.total
      })
    },
  },
  created() {
    this.getRoleList()
  },
}
</script>
<style lang="less" scoped>
.content {
  margin: 20px;
  width: 70%;
}
</style>
