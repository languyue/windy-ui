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
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitMaven">提交</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
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
    }
  },
  methods: {
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
    },
  },
  created() {
    this.getGitConfig()
  },
}
</script>
<style scoped>
.content {
  width: 50%;
}
.tips-info {
  margin: 10px;
}
</style>
