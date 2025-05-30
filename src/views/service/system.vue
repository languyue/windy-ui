<template>
  <div>
    <el-alert
      class="tips-info"
      title="使用提示"
      type="info"
      :closable="false"
      description="系统配置作用于全局，请谨慎操作"
      show-icon
    >
    </el-alert>
    <div class="content">
      <el-tabs tab-position="left" v-model="configType" @tab-click="clickTab">
        <el-tab-pane label="Git配置" name="git">
          <el-divider content-position="left">Git仓库配置</el-divider>
          <el-form :model="systemForm" size="mini" label-width="120px">
            <el-form-item label="类型" prop="gitType">
              <el-radio-group v-model="systemForm.gitType" @change="changeGit">
                <el-radio label="Gitea">Gitea</el-radio>
                <el-radio label="Gitlab">Gitlab</el-radio>
                <el-radio label="GitHub">GitHub</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Git域名" prop="gitDomain">
              <el-input
                type="text"
                v-model="systemForm.gitDomain"
                placeholder="请输入git域名,例如: https://gitlab.cn 或 使用IP+ 端口"
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

            <el-divider content-position="left">Git推送配置</el-divider>
            <el-form-item>
              <template slot="label">
                推送Secret
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="在 Git 服务端添加 Webhook 时，配置的 secret 即为当前设置的值。"
                  placement="top-end"
                >
                  <i class="el-icon-info" />
                </el-tooltip>
              </template>
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-input
                    type="text"
                    v-model="systemForm.pushSecret"
                    :show-password="showSecret"
                  />
                </el-col>
                <el-col :span="4">
                  <el-popover
                    placement="top"
                    width="300"
                    v-model="confirmRefresh"
                  >
                    <p style="margin: 0">
                      重新生成 Secret 会导致已配置的 Git
                      推送校验失败，进而影响Webhook的正常触发。<br />
                      这不仅会导致需求和缺陷状态变更无法及时更新，还会导致推送类型的流水线无法自动执行，从而影响整体流程的效率和准确性。
                    </p>
                    <div style="text-align: right; margin: 0">
                      <el-button
                        size="mini"
                        type="text"
                        @click="confirmRefresh = !confirmRefresh"
                        >取消</el-button
                      >
                      <el-button
                        type="primary"
                        size="mini"
                        @click="refreshSecret"
                        >确定</el-button
                      >
                    </div>
                    <el-button
                      slot="reference"
                      type="danger"
                      plain
                      icon="el-icon-refresh"
                      size="mini"
                      >生成密钥</el-button
                    >
                  </el-popover>
                </el-col>
              </el-row>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitGit">提交</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="容器镜像仓库配置" name="repo">
          <el-form :model="repoForm" size="mini" label-width="120px">
            <el-form-item label="镜像仓库地址" prop="repositoryUrl">
              <el-input
                type="text"
                v-model="repoForm.repositoryUrl"
                placeholder="请输入镜像仓库地址"
              />
            </el-form-item>
            <el-form-item label="用户" prop="userName">
              <el-input
                type="text"
                v-model="repoForm.userName"
                placeholder="访问镜像仓库的用户"
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
        <el-tab-pane label="二方包Maven配置" name="maven">
          <el-form :model="mavenForm" size="mini" label-width="120px">
            <h5>Maven仓库</h5>
            <el-form-item label="推送远程仓库" prop="mavenUrl">
              <el-input
                type="text"
                v-model="mavenForm.mavenUrl"
                placeholder="仓库地址"
              />
            </el-form-item>
            <el-form-item label="用户" prop="userName">
              <el-input
                type="text"
                v-model="mavenForm.userName"
                placeholder="访问镜像仓库的用户"
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
        <el-tab-pane label="构建工具管理" name="build">
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
                    !searchVersion ||
                    data.name
                      .toLowerCase()
                      .includes(searchVersion.toLowerCase())
                )
              "
              height="500"
              size="mini"
            >
              <el-table-column label="工具名称" prop="name"> </el-table-column>
              <el-table-column
                label="工具类型"
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
                    v-model="searchVersion"
                    clearable
                    size="mini"
                    @change="
                      () => {
                        scope.row
                      }
                    "
                    placeholder="输入版本名称搜索"
                  />
                </template>
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    @click="handleEdit(scope.row)"
                    >编辑</el-button
                  >
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
    <div class="version-box">
      ©Windy, 保留所有权利-控制台版本: {{ consoleVersion }}
    </div>
    <el-dialog
      title="构建工具管理"
      :visible.sync="showVersionDialog"
      @close="cancelVersion"
    >
      <el-form
        :model="versionForm"
        ref="versionForm"
        label-width="120px"
        :rules="versionRules"
        size="mini"
      >
        <el-form-item label="工具名称" prop="name">
          <el-input v-model="versionForm.name" placeholder="请输入版本名称" />
        </el-form-item>
        <el-form-item label="工具类型" prop="type">
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
        <el-form-item label="工具描述" prop="description">
          <el-input
            v-model="versionForm.description"
            placeholder="请输入版本描述"
          />
        </el-form-item>
        <el-form-item label="仓库配置" v-if="versionForm.type == 'Maven'">
          <div v-for="(item, index) in repositories" :key="index">
            <el-row>
              <el-col :span="22">
                <el-form
                  size="mini"
                  label-width="80px"
                  label-position="left"
                  class="form-box"
                >
                  <el-form-item label="仓库ID">
                    <el-input
                      v-model="item.repositoryId"
                      placeholder="请输入仓库ID"
                    />
                  </el-form-item>
                  <el-form-item label="仓库地址">
                    <el-input
                      v-model="item.repositoryUrl"
                      placeholder="请输入maven仓库地址"
                    />
                  </el-form-item>
                  <el-form-item label="仓库用户">
                    <el-input
                      v-model="item.userName"
                      placeholder="请输入访问仓库的用户"
                    />
                  </el-form-item>
                  <el-form-item label="密码">
                    <el-input
                      v-model="item.password"
                      placeholder="请输入maven仓库的用户密码"
                    />
                  </el-form-item> </el-form
              ></el-col>
              <el-col :span="2"
                ><i
                  @click="deleteItem(index)"
                  class="el-icon-delete-solid delete-icon"
              /></el-col>
            </el-row>
          </div>
          <div class="add-text" @click="addRepository">新增</div>
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
      systemForm: {
        gitType: 'Gitlab',
        secrets: [],
      },
      repoForm: {},
      showCreateSecret: false,
      mavenForm: {},
      configType: 'git',
      versionData: [],
      searchVersion: '',
      showSecret: true,
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
      consoleVersion: '',
      editTool: false,
      repositories: [],
      secretForm: {},
      confirmRefresh: false,
    }
  },
  methods: {
    refreshSecret() {
      this.confirmRefresh = false
      systemApi.createSecret().then((res) => {
        if (res.data) {
          this.showSecret = false
          this.$set(this.systemForm, 'pushSecret', res.data)
          this.$notify.success('获取密钥成，请点击提交按钮保存')
        }
      })
    },
    deleteItem(index) {
      this.repositories.splice(index, 1)
    },
    addRepository() {
      this.repositories.push({})
    },
    cancelVersion() {
      this.showVersionDialog = false
      this.repositories = []
      this.editTool = false
    },
    handleEdit(row) {
      this.editTool = true
      this.showVersionDialog = true
      this.versionForm = row
      if (row.buildConfig) {
        this.repositories = JSON.parse(row.buildConfig)
      }
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
        this.versionForm.buildConfig = JSON.stringify(this.repositories)
        if (!this.editTool) {
          systemApi.createTool(this.versionForm).then((res) => {
            if (res.data) {
              this.$notify.success('添加构建工具成功')
              this.cancelVersion()
              this.getVersionList()
            } else {
              this.$notify.error('添加构建工具失败')
            }
          })
        } else {
          systemApi.updateTool(this.versionForm).then((res) => {
            if (res.data) {
              this.$notify.success('修改构建工具成功')
              this.cancelVersion()
              this.getVersionList()
            } else {
              this.$notify.error('修改构建工具失败')
            }
          })
        }
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
        if (!this.systemForm.secrets) {
          this.systemForm.secrets = []
        }
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
    getSystemVersion() {
      systemApi.getSystemVersion().then((res) => {
        this.consoleVersion = res.data.consoleVersion
      })
    },
  },
  created() {
    this.getSystemVersion()
    this.getGitConfig()
  },
}
</script>
<style lang="less" scoped>
.tips-info {
  width: 100%;
}
.content {
  width: 70%;
  padding: 10px;
}
.version-box {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;

  color: #c0c4cc;
  text-align: center;
  font-size: 12px;
}
.form-box {
  border-left: 4px solid #409eff;
  padding-left: 5px;
}
.delete-icon {
  margin-left: 20px !important;
  cursor: pointer;
}
.add-text {
  height: 30px;
  line-height: 30px;
  text-align: center;
  vertical-align: middle;
  border: 1px dashed #c0c4cc;
  margin-top: 20px;
  width: 200px;
  margin-left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
}
</style>
