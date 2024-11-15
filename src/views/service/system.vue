<template>
  <div>
    <el-alert
      class="tips-info"
      title="消息提示"
      type="info"
      :closable="false"
      description="系统配置作用于全局，请谨慎操作"
      show-icon
    >
    </el-alert>
    <div class="content">
      <el-tabs tab-position="left" v-model="configType" @tab-click="clickTab">
        <el-tab-pane label="Git配置" name="git">
          <el-form :model="systemForm" size="mini" label-width="120px">
            <el-form-item label="类型" prop="gitType">
              <el-radio-group v-model="systemForm.gitType" @change="changeGit">
                <el-radio label="Gitea">Gitea</el-radio>
                <el-radio label="Gitlab">Gitlab</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="地址" prop="gitDomain">
              <el-input
                type="text"
                v-model="systemForm.gitDomain"
                placeholder="请输入git访问地址"
                show-password
              />
            </el-form-item>
            <el-form-item
              label="拥有者"
              prop="owner"
              v-if="systemForm.gitType != 'Gitlab'"
            >
              <el-input
                type="text"
                v-model="systemForm.owner"
                placeholder="请输入git拥有者"
              />
            </el-form-item>
            <el-form-item label="访问token" prop="accessToken">
              <el-input
                type="text"
                v-model="systemForm.accessToken"
                placeholder="请输入git访问token"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitGit">提交</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="镜像仓库配置" name="repo">
          <el-form :model="repoForm" size="mini" label-width="120px">
            <el-form-item label="仓库地址" prop="repositoryUrl">
              <el-input
                type="text"
                v-model="repoForm.repositoryUrl"
                placeholder="请输入镜像仓库地址"
                show-password
              />
            </el-form-item>
            <el-form-item label="用户" prop="userName">
              <el-input
                type="text"
                v-model="repoForm.userName"
                placeholder="访问镜像仓库的用户"
                show-password
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                type="text"
                v-model="repoForm.password"
                placeholder="访问镜像仓库的密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitImage">提交</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Maven配置" name="maven">
          <el-form :model="mavenForm" size="mini" label-width="120px">
            <h5>Maven仓库</h5>
            <el-form-item label="推送远程仓库" prop="mavenUrl">
              <el-input
                type="text"
                v-model="mavenForm.mavenUrl"
                placeholder="仓库地址"
                show-password
              />
            </el-form-item>
            <el-form-item label="用户" prop="userName">
              <el-input
                type="text"
                v-model="mavenForm.userName"
                placeholder="访问镜像仓库的用户"
                show-password
              />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                type="text"
                v-model="mavenForm.password"
                placeholder="访问镜像仓库的密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitMaven">提交</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="构建版本管理" name="build">
          <div class="verion-content">
            <el-button
              size="mini"
              icon="el-icon-plus"
              type="primary"
              @click="startAddVersion"
              >新增版本</el-button
            >
            <el-table
              :data="
                versionData.filter(
                  (data) =>
                    !searchText ||
                    data.name.toLowerCase().includes(searchText.toLowerCase())
                )
              "
              height="500"
              size="mini"
            >
              <el-table-column label="版本名称" prop="name"> </el-table-column>
              <el-table-column
                label="语言类型"
                prop="type"
                :filters="[
                  { text: 'Java', value: 'Java' },
                  { text: 'Go', value: 'Go' },
                ]"
                :filter-method="filterLanguageTag"
                filter-placement="bottom-end"
              >
              </el-table-column>

              <el-table-column label="文件路径" prop="installPath">
              </el-table-column>
              <el-table-column label="描述" prop="description">
              </el-table-column>
              <el-table-column align="right">
                <template slot="header" slot-scope="scope">
                  <el-input
                    v-model="searchText"
                    clearable
                    @input="changeFilter(scope.row)"
                    size="mini"
                    placeholder="输入版本名称搜索"
                  />
                </template>
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="danger"
                    @click="handleDelete(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog
      title="新增语言版本"
      :visible.sync="showVersionDialog"
      @close="cancelVersion"
    >
      <el-form
        :model="versionForm"
        ref="versionForm"
        label-width="80px"
        :rules="versionRules"
        size="mini"
      >
        <el-form-item label="版本名称" prop="name">
          <el-input v-model="versionForm.name" placeholder="请输入版本名称" />
        </el-form-item>
        <el-form-item label="版本类型" prop="type">
          <el-radio-group v-model="versionForm.type">
            <el-radio label="Java">Java</el-radio>
            <el-radio label="Go">Go</el-radio>
            <el-radio label="Maven">Maven</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="安装路径" prop="installPath">
          <el-input
            v-model="versionForm.installPath"
            placeholder="请输入安装路径"
          />
        </el-form-item>
        <el-form-item label="版本描述" prop="description">
          <el-input
            v-model="versionForm.description"
            placeholder="请输入版本描述"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitVersion('versionForm')"
            >确认</el-button
          >
          <el-button type="info" @click="cancelVersion">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import systemApi from '../../http/System'
export default {
  data() {
    return {
      systemForm: {},
      repoForm: {},
      mavenForm: {},
      configType: 'git',
      versionData: [],
      searchText: '',
      showVersionDialog: false,
      versionForm: {},
      versionRules: {
        name: [
          { required: true, message: '请输入版本名称', trigger: 'blur' },
          { max: 50, message: '版本名称长度最多50个', trigger: 'blur' },
        ],
        type: [
          { required: true, message: '请选择版本类型', trigger: 'change' },
        ],
        installPath: [
          { required: true, message: '请输入版本安装路径', trigger: 'blur' },
          { max: 100, message: '安装路径长度最多100个字符', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    changeFilter() {},
    cancelVersion() {
      this.showVersionDialog = false
    },
    handleDelete(row) {
      this.$alert(
        '删除构建工具可能会导致流水线无法使用，确认删除？',
        '删除构建工具',
        {
          confirmButtonText: '确定',
          callback: (action) => {
            if (action != 'confirm') {
              return
            }
            systemApi.deleteTool(row.toolId).then((res) => {
              if (res.data) {
                this.$notify.success('删除构建工具成功')
                this.getVersionList()
              } else {
                this.$notify.error('删除构建工具失败')
              }
            })
          },
        }
      )
    },
    startAddVersion() {
      this.showVersionDialog = true
      this.versionForm = {}
    },
    submitVersion(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        systemApi.createTool(this.versionForm).then((res) => {
          if (res.data) {
            this.$notify.success('添加构建工具成功')
            this.cancelVersion()
            this.getVersionList()
          } else {
            this.$notify.error('添加构建工具失败')
          }
        })
      })
    },
    getVersionList() {
      systemApi.getBuildTools().then((res) => {
        this.versionData = res.data
      })
    },
    filterLanguageTag(value, row) {
      return row.tag === value
    },
    changeGit(type) {
      if (type == 'Gitlab') {
        this.systemForm.owner = 'oauth2'
      }
      if (type != 'Gitlab' && this.systemForm.owner == 'oauth2') {
        this.systemForm.owner = ''
      }
    },
    getGitConfig() {
      systemApi.requestGitConfig().then((res) => {
        this.systemForm = res.data
      })
    },
    getRepoConfig() {
      systemApi.getImageRepository().then((res) => {
        this.repoForm = res.data
      })
    },
    getMavenConfig() {
      systemApi.requestMavenConfig().then((res) => {
        this.mavenForm = res.data
      })
    },
    submitMaven() {
      systemApi.updateMavenConfig(this.mavenForm).then((res) => {
        if (res.data) {
          this.$notify.success('修改Maven配置成功')
        } else {
          this.$notify.error('修改Maven配置失败')
        }
      })
    },
    submitGit() {
      systemApi.updateGitConfig(this.systemForm).then((res) => {
        if (res.data) {
          this.$notify.success('修改Git配置成功')
        } else {
          this.$notify.error('修改Git配置失败')
        }
      })
    },
    submitImage() {
      systemApi.updateRepository(this.repoForm).then((res) => {
        if (res.data) {
          this.$notify.success('修改镜像仓库成功')
        } else {
          this.$notify.error('修改镜像仓库失败')
        }
      })
    },
    clickTab() {
      if (this.configType == 'git') {
        this.getGitConfig()
      }

      if (this.configType == 'repo') {
        this.getRepoConfig()
      }

      if (this.configType == 'maven') {
        this.getMavenConfig()
      }
      if (this.configType == 'build') {
        this.getVersionList()
      }
    },
  },
  created() {
    this.getGitConfig()
  },
}
</script>
<style lang="less" scoped>
.tips-info {
  margin: 10px;
  width: 80%;
}
.verion-content {
  width: 70%;
  padding: 10px;
}
</style>
