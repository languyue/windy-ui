<template>
  <div class="content">
    <el-row :gutter="20">
      <el-col :span="6">
        <h3>组织列表</h3>
        <div>
          <el-button type="primary" @click="trggerShow" size="mini"
            >新增组织</el-button
          >
        </div>
        <div class="group-div">
          <el-tree
            node-key="groupId"
            :data="treeList"
            @node-click="handleNodeClick"
          >
            <div style="width: 100%" slot-scope="{ data }">
              <span>
                <i class="el-icon-office-building" /> {{ data.groupName }}</span
              >
              <div style="float: right">
                <el-dropdown @command="handleCommand($event, data)" size="mini">
                  <span>...</span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="delete">删除</el-dropdown-item>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="subgroup"
                      >新增子组织</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </el-tree>
        </div>
      </el-col>

      <el-col :span="17">
        <el-empty v-if="!chooseGroup" description="请在左侧选择组织"></el-empty>
        <div v-else>
          <h3>
            <i class="el-icon-office-building" />:{{ chooseGroup.groupName }}
          </h3>
          <el-tabs
            type="card"
            v-model="chooseName"
            @tab-click="clickTab"
            style="height: 600px"
          >
            <el-tab-pane label="用户管理" name="user">
              <el-button type="primary" size="mini" @click="clickUser"
                >新增用户</el-button
              >
              <el-table :data="userTable" size="mini" height="300px">
                <el-table-column prop="userId" label="用户Id">
                </el-table-column>
                <el-table-column prop="userName" label="用户名称">
                </el-table-column>
                <el-table-column prop="gmtCreated" label="创建时间">
                  <template slot-scope="scope">
                    {{ scope.row.createTime | dateFormat }}
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="text" @click="editUser(scope.row)"
                      >编辑</el-button
                    >
                    <el-button type="text" @click="deleteUser(scope.row)"
                      >删除</el-button
                    >
                    <el-button type="text" @click="bindRole(scope.row)"
                      >绑定角色</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                @size-change="handleUserSizeChange"
                @current-change="handleUserPageChange"
                :current-page="groupUserPage"
                :page-sizes="[10, 20, 50]"
                :page-size="groupUserSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="groupUserTotal"
              >
              </el-pagination>
            </el-tab-pane>
            <el-tab-pane label="角色管理" name="role">
              <div>
                <el-button type="primary" @click="groupBind" size="mini"
                  >绑定角色</el-button
                >
              </div>
              <div>
                <el-table :data="groupRoles" size="mini" height="300px">
                  <el-table-column prop="roleId" label="角色ID">
                  </el-table-column>
                  <el-table-column prop="roleName" label="角色名称">
                  </el-table-column>
                  <el-table-column prop="description" label="角色描述">
                  </el-table-column>
                  <el-table-column prop="createTime" label="创建时间">
                    <template slot-scope="scope">
                      {{ scope.row.createTime | dateFormat }}
                    </template>
                  </el-table-column>
                </el-table>
                <el-pagination
                  @size-change="handleUserSizeChange"
                  @current-change="handleUserPageChange"
                  :current-page="groupUserPage"
                  :page-sizes="[10, 20, 50]"
                  :page-size="groupUserSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="groupUserTotal"
                >
                </el-pagination>
              </div>
            </el-tab-pane>
            <el-tab-pane label="资源列表">
              <el-collapse
                v-model="activeRoleNames"
                @change="loadRoleResources"
                accordion
              >
                <el-collapse-item
                  v-for="(item, index) in groupRoles"
                  :key="index"
                  :title="item.roleName"
                  :name="item.roleId"
                >
                  <h4>功能列表:</h4>
                  <el-checkbox-group v-model="checkList">
                    <el-checkbox
                      v-for="(api, num) in item.resources"
                      :key="num"
                      :label="api.resourceName"
                      :checked="true"
                      disabled
                    ></el-checkbox>
                  </el-checkbox-group>
                </el-collapse-item>
              </el-collapse>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>

    <el-dialog :visible.sync="showDialog" title="创建组织" @close="groupClose">
      <el-form v-model="groupForm" label-width="80px" size="mini">
        <el-form-item v-if="groupForm.parentId" label="父组织">
          {{ groupForm.parentName }}
        </el-form-item>
        <el-form-item label="组织名称">
          <el-input
            v-model="groupForm.groupName"
            placeholder="请输入组织名称"
          />
        </el-form-item>
        <el-form-item label="组织描述">
          <el-input
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 4 }"
            placeholder="请输入组织描述"
            v-model="groupForm.description"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitGroup">确认</el-button>
          <el-button type="info" @click="groupClose">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog :visible.sync="showUserDialog" :title="userTitle">
      <el-form v-model="userForm" label-width="80px" size="mini">
        <el-form-item label="用户名称">
          <el-input v-model="userForm.userName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="userForm.password"
            placeholder="请输入用户密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="userForm.nickName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="重置密码" v-if="edistUser">
          <el-button
            type="primary"
            icon="el-icon-refresh"
            @click="resetPassword"
            >重置密码</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitUser">确认</el-button>
          <el-button type="info" @click="cancelUser">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      title="绑定角色"
      :visible.sync="showBindDialog"
      width="60%"
      @close="cancelBind"
    >
      <el-form v-model="bindForm" size="mini" label-width="120px">
        <el-form-item :label="bindForm.userType == 2 ? '组织ID' : '用户ID'">
          <el-input
            v-model="bindForm.relationId"
            placeholder="请输入"
            disabled
          />
        </el-form-item>
        <el-form-item :label="bindForm.userType == 2 ? '组织名称' : '用户名称'">
          <el-input v-model="bindForm.name" placeholder="请输入" disabled />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="bindForm.userType" placeholder="请选择" disabled>
            <el-option label="用户" :value="1"> </el-option>
            <el-option label="组织" :value="2"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联角色">
          <el-select
            v-model="roleIds"
            multiple
            clearable
            placeholder="请选择角色"
          >
            <el-option
              v-for="item in roleList"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitBind">确定</el-button>
          <el-button type="info" @click="cancelBind">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import userApi from '../../http/User'
import groupApi from '../../http/Group'
import roleApi from '../../http/Role'
import resourceApi from '../../http/Resource'
export default {
  data() {
    return {
      treeList: [],
      title: '',
      showDialog: false,
      groupForm: {},
      userTable: [],
      showUserDialog: false,
      userForm: {},
      chooseGroup: null,
      showBindDialog: false,
      bindForm: {},
      checkList: [],
      resourceList: [],
      roleList: [],
      chooseName: 'user',
      groupRoles: [],
      edistUser: false,
      userTitle: '创建用户',
      editGroup: false,
      groupUserPage: 1,
      groupUserSize: 10,
      groupUserTotal: 0,
      roleIds: [],
      activeRoleNames: [],
    }
  },
  methods: {
    resetPassword() {
      userApi.resetPassword({ userId: this.userForm.userId }).then((res) => {
        if (res.data) {
          this.$notify.success('重置密码成功')
        } else {
          this.$notify.error('重置密码失败')
        }
      })
    },
    groupClose() {
      this.groupForm = {}
      this.showDialog = false
    },
    handleUserSizeChange(size) {
      this.groupUserSize = size
      this.getGroupUsers()
    },
    handleUserPageChange(page) {
      this.groupUserPage = page
      this.getGroupUsers()
    },
    handleCommand(command, data) {
      console.log(command, data)
      if (command == 'delete') {
        groupApi.deleteGroup(data.groupId).then((res) => {
          if (res) {
            this.$notify.success('删除组织成功!')
            this.getGroups()
          }
        })
      }
      if (command == 'edit') {
        this.showDialog = true
        this.editGroup = true
        this.groupForm = data
      }
      if (command == 'subgroup') {
        this.groupForm.parentId = data.groupId
        this.groupForm.parentName = data.groupName
        this.showDialog = true
        this.editGroup = false
      }
    },
    groupBind() {
      this.bindForm = {
        relationId: this.chooseGroup.groupId,
        name: this.chooseGroup.label,
        userType: 2,
      }
      this.getAllRoles()
      this.showBindDialog = true
      this.getUserOrGroupRoles(this.chooseGroup.groupId)
    },
    getAllRoles() {
      roleApi.getAllRoles().then((res) => {
        this.roleList = res.data
      })
    },
    submitBind() {
      this.bindForm.roleIds = this.roleIds
      roleApi.bindRole(this.bindForm).then((res) => {
        if (res) {
          this.$notify.success('绑定角色成功！')
          this.getUserOrGroupRoles(this.chooseGroup.groupId, 2)
          this.cancelBind()
        }
      })
    },
    cancelBind() {
      this.showBindDialog = false
      this.bindForm = {}
      this.roleList = []
    },
    editUser(row) {
      this.showUserDialog = true
      this.userForm = row
      this.edistUser = true
      this.userTitle = '编辑用户'
    },
    bindRole(row) {
      this.getAllRoles()
      this.showBindDialog = true
      this.getUserOrGroupRoles(row.userId, 1)
      this.bindForm = {
        userId: row.userId,
        relationId: row.userId,
        name: row.userName,
        userType: 1,
      }
    },
    clickUser() {
      this.showUserDialog = true
      this.userForm = {}
      this.edistUser = false
      this.userTitle = '创建用户'
    },
    handleNodeClick(data) {
      this.chooseGroup = data
      this.getGroupUsers()
      this.getUserOrGroupRoles(this.chooseGroup.groupId)
    },
    trggerShow() {
      this.showDialog = true
    },
    submitUser() {
      let data = this.userForm
      data.groupId = this.chooseGroup.groupId
      if (this.edistUser) {
        userApi.updateUser(this.userForm).then((res) => {
          if (res) {
            this.$notify.success('修改用户成功')
            this.showUserDialog = false
            this.getGroupUsers()
          }
        })
        return
      }
      userApi.createUser(this.userForm).then((res) => {
        if (res) {
          this.$notify.success('添加用户成功')
          this.showUserDialog = false
          this.getGroupUsers()
        }
      })
    },

    deleteUser(row) {
      userApi.deleteUser(row.userId).then((res) => {
        if (res) {
          this.$notify.success('删除用户成功')
          this.getGroupUsers()
        }
      })
    },
    cancelUser() {
      this.showUserDialog = false
      this.userForm = {}
    },
    submitGroup() {
      if (this.editGroup) {
        groupApi
          .updateGroup(this.groupForm.groupId, this.groupForm)
          .then((res) => {
            if (res.data) {
              this.$notify.success('修改组织成功')
              this.showDialog = false
              this.getGroups()
            } else {
              this.$notify.error('修改组织失败')
            }
          })
        return
      }
      groupApi.createGroup(this.groupForm).then((res) => {
        if (res) {
          this.$notify.success('添加组织成功')
          this.showDialog = false
          this.getGroups()
        } else {
          this.$notify.error('添加组织失败')
        }
      })
    },
    cancelGroup() {
      this.editGroup = false
      this.showDialog = false
      this.groupForm = {}
    },
    getGroups() {
      groupApi.getGroups().then((res) => {
        this.treeList = res.data
      })
    },
    clickTab(tab) {
      this.activeRoleNames = []
      if (tab.name == 'user') {
        this.getGroupUsers()
      }

      if (tab.name == 'role') {
        this.getUserOrGroupRoles(this.chooseGroup.groupId, 2)
      }
    },
    getUserOrGroupRoles(userId) {
      roleApi.getGropRoles(userId).then((res) => {
        this.groupRoles = res.data.data
        this.roleIds = []
        if (!res.data.data) {
          return
        }
        res.data.data.forEach((e) => {
          this.roleIds.push(e.roleId)
        })
      })
    },
    loadRoleResources(roleId) {
      console.log('wwwwwww')
      resourceApi.getRoleResources(roleId).then((res) => {
        console.log(this.groupRoles)
        let array = []
        this.groupRoles.forEach((e) => {
          if (e.roleId == roleId) {
            e.resources = res.data
          }
          array.push(e)
        })

        this.groupRoles = array
      })
    },
    getGroupUsers() {
      groupApi
        .getGroupUsers(
          this.chooseGroup.groupId,
          this.groupUserPage,
          this.groupUserSize
        )
        .then((res) => {
          this.userTable = res.data.data
          this.groupUserTotal = res.data.total
        })
    },
  },
  created() {
    this.getGroups()
  },
}
</script>
<style lang="less" scoped>
.content {
  margin: 20px;
}
.group-div {
  margin-top: 20px;
}
.content-right {
  margin-right: 10px;
}
</style>
