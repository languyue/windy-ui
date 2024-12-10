<template>
  <div class="all">
    <!-- 查询条件开始 -->
    <div>
      <el-form :inline="true" size="mini" @submit.native.prevent>
        <el-form-item label="服务名称">
          <el-input
            @input="startQuery"
            v-model="queryName"
            placeholder="请输入服务名称"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="startQuery"
            >查询</el-button
          >
          <el-button
            type="primary"
            icon="el-icon-circle-plus-outline"
            @click="startCreate"
            >新增服务</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <!-- 查询条件结束 -->
    <div class="content">
      <el-table :data="serviceData" size="mini">
        <el-table-column prop="serviceName" label="服务名称"> </el-table-column>
        <el-table-column prop="description" label="服务描述">
          <template slot-scope="scope">
            <textView :text="scope.row.description" />
          </template>
        </el-table-column>
        <el-table-column prop="gitUrl" label="git地址"> </el-table-column>
        <el-table-column prop="priority" label="优先级">
          <template slot-scope="scope">
            <el-rate v-model="scope.row.priority" disabled></el-rate>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            {{ scope.row.createTime | dateFormat }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="startEdit(scope.row)"
              plain
              size="mini"
              >编辑</el-button
            >
            <el-button
              type="danger"
              @click="startDelete(scope.row)"
              plain
              size="mini"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div>
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
    <!-- 创建服务开始 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="showServiceDialog"
      @close="closeDialog"
      width="70%"
    >
      <el-form
        :model="serviceForm"
        :rules="rules"
        ref="serviceForm"
        size="mini"
        label-width="120px"
      >
        <el-form-item label="服务名称" prop="serviceName">
          <el-input
            v-model="serviceForm.serviceName"
            placeholder="请输入服务名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="服务描述" prop="description">
          <el-input
            v-model="serviceForm.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入服务描述"
          ></el-input>
        </el-form-item>

        <el-form-item label="服务git地址" prop="gitUrl">
          <el-input
            v-model="serviceForm.gitUrl"
            placeholder="请输入服务git地址"
          ></el-input>
        </el-form-item>
        <el-form-item label="优先级" prop="gitUrl">
          <el-rate v-model="serviceForm.priority"></el-rate>
        </el-form-item>
        <el-form-item v-if="isEdit" label="成员列表">
          <el-tag
            type="primary"
            class="tag-item"
            @close="deleteMember(item.userId)"
            v-for="(item, index) in members"
            :key="index"
            :closable="members.length > 1"
            >{{ item.userName }}</el-tag
          >
          <div class="add-member">
            <el-popover
              placement="right"
              v-model="showPop"
              width="200"
              trigger="click"
            >
              <userSearch
                :user="selectedUser"
                @chooseUser="handleSelect"
              ></userSearch>
              <el-button
                slot="reference"
                type="text"
                size="mini"
                icon="el-icon-plus"
                >新增</el-button
              >
            </el-popover>
          </div>
        </el-form-item>
        <el-collapse accordion>
          <el-collapse-item title="服务配置">
            <el-form-item label="部署方式" prop="deployType">
              <el-radio-group v-model="contextForm.deployType">
                <el-radio :label="2">Kubernetes部署</el-radio>
                <el-radio :label="1">SSH部署</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="开发语言" prop="code">
              <el-radio-group
                v-model="contextForm.code"
                @change="selectCodeType"
              >
                <el-radio label="Java">Java</el-radio>
                <el-radio label="Go">Go</el-radio>
                <!-- <el-radio label="Python">Python</el-radio>
                <el-radio label="Vue">Vue</el-radio> -->
              </el-radio-group>
            </el-form-item>
            <el-form-item label="构建版本" prop="code">
              <el-radio-group v-model="contextForm.buildVersion">
                <el-radio
                  :label="version.installPath"
                  v-for="(version, index) in codeVersions"
                  :key="index"
                  >{{ version.name }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-collapse-item>
          <el-collapse-item>
            <template slot="title">
              Git配置
              <el-tooltip
                content="此处可不配置。在系统变量中统一配置"
                placement="top"
              >
                <i class="header-icon el-icon-info"></i>
              </el-tooltip>
            </template>
            <el-alert
              style="margin: 10px"
              title="此处可不配置。在系统变量中统一配置"
              type="info"
              show-icon
            >
              <template slot="title">
                此处可不配置。在系统变量中统一配置
                <el-link type="primary" @click="goEnv"
                  >前往配置>></el-link
                ></template
              >
            </el-alert>
            <el-form-item label="类型" prop="gitType">
              <el-radio-group v-model="gitForm.gitType" @change="changeGit">
                <el-radio label="Gitea">Gitea</el-radio>
                <el-radio label="Gitlab">Gitlab</el-radio>
                <el-radio label="Github">Github</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="地址" prop="gitDomain">
              <el-input
                type="text"
                v-model="gitForm.gitDomain"
                placeholder="请输入git访问地址"
              />
            </el-form-item>
            <el-form-item
              label="拥有者"
              prop="owner"
              v-if="gitForm.gitType != 'Gitlab'"
            >
              <el-input
                type="text"
                v-model="gitOwner"
                placeholder="请输入git拥有者"
              />
            </el-form-item>
            <el-form-item label="访问token" prop="accessToken">
              <el-input
                type="text"
                v-model="gitForm.accessToken"
                placeholder="请输入git访问token"
              />
            </el-form-item>
          </el-collapse-item>
          <el-collapse-item>
            <template slot="title">
              Kubernetes配置
              <el-tooltip content="配置服务在k8s中部署信息" placement="top">
                <i class="header-icon el-icon-info"></i>
              </el-tooltip>
            </template>
            <el-tabs v-model="activeName" type="border-card" class="k8s-config">
              <el-tab-pane label="基础配置" name="first">
                <el-form-item label="工作负载名称" label-width="120px">
                  <el-input
                    v-model="deploymentName"
                    placeholder="服务部署的deployment名称"
                  />
                </el-form-item>
                <el-form-item label="负载副本数">
                  <el-input-number
                    :min="1"
                    v-model="replicas"
                    placeholder="工作负载部署个数,默认是1"
                  />
                </el-form-item>
                <el-form-item label="环境变量">
                  <el-row
                    v-for="(env, index) in envList"
                    :key="index"
                    class="param-line"
                  >
                    <el-col :span="6">
                      <el-input v-model="env.name" placeholder="环境变量名称" />
                    </el-col>
                    <el-col :span="2">-</el-col>
                    <el-col :span="6">
                      <el-input v-model="env.value" placeholder="环境变量值" />
                    </el-col>
                    <el-col :span="4">
                      <el-switch
                        v-model="env.isRelated"
                        active-text="系统变量"
                      ></el-switch>
                    </el-col>
                    <el-col :span="4" class="op-box">
                      <i
                        class="el-icon-remove op-icon del"
                        @click="delEnv(index)"
                      />
                      <i
                        class="el-icon-circle-plus op-icon add"
                        @click="addEnv"
                        v-if="index == envList.length - 1"
                      />
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-form-item label="文件挂载">
                  <el-row
                    v-for="(volume, index) in volumeList"
                    :key="index"
                    class="param-line"
                  >
                    <el-col :span="6">
                      <el-input
                        v-model="volume.hostVolume"
                        placeholder="主机路径"
                      />
                    </el-col>
                    <el-col :span="2">-</el-col>
                    <el-col :span="6">
                      <el-input
                        v-model="volume.volume"
                        placeholder="容器路径"
                      />
                    </el-col>
                    <el-col :span="2">-</el-col>
                    <el-col :span="4">
                      <el-input v-model="volume.name" placeholder="名称" />
                    </el-col>
                    <el-col :span="4" class="op-box">
                      <i
                        class="el-icon-remove op-icon del"
                        @click="delVolume(index)"
                      />
                      <i
                        class="el-icon-circle-plus op-icon add"
                        @click="addVolume"
                      />
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-form-item label="端口映射">
                  <el-row
                    v-for="(port, index) in portList"
                    :key="index"
                    class="param-line"
                  >
                    <el-col :span="6">
                      <el-input v-model="port.port" placeholder="容器端口" />
                    </el-col>
                    <el-col :span="2">-</el-col>
                    <el-col :span="6">
                      <el-input
                        v-model="port.hostPort"
                        placeholder="宿主机端口"
                      />
                    </el-col>
                    <el-col :span="2">-</el-col>
                    <el-col :span="4">
                      <el-select v-model="port.protocol" placeholder="协议类型">
                        <el-option label="TCP" value="TCP"> </el-option>
                        <el-option label="UDP" value="UDP"> </el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="4" class="op-box">
                      <i
                        class="el-icon-remove op-icon del"
                        @click="delPort(index)"
                      />
                      <i
                        class="el-icon-circle-plus op-icon add"
                        @click="addPort"
                      />
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane label="高级配置" name="second">
                <el-form-item label="更新策略">
                  <el-select v-model="strategy" placeholder="选择更新策略">
                    <el-option label="暂停更新" value="Recreate"> </el-option>
                    <el-option label="滚动更新" value="RollingUpdate">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="节点调度">
                  <el-radio-group v-model="selectWay">
                    <el-radio label="name">根据【节点名称】选择节点</el-radio>
                    <el-radio label="label" disabled
                      >根据【标签选择器】选择节点</el-radio
                    >
                    <el-radio label="rule" disabled
                      >根据【节点亲和性】选择节点</el-radio
                    >
                  </el-radio-group>
                  <div>
                    请选择标签:
                    <el-link type="primary" @click="chooseNode"
                      ><i class="el-icon-thumb">选择标签</i>
                    </el-link>
                    <span v-if="selectNode" class="chosed-tag"
                      >已选择标签：<el-tag
                        @close="selectNode = null"
                        size="mini"
                        closable
                        >{{ selectNode }}</el-tag
                      ></span
                    >
                  </div>
                </el-form-item>
              </el-tab-pane>
            </el-tabs>
          </el-collapse-item>
        </el-collapse>

        <el-form-item>
          <el-button type="primary" @click="submit('serviceForm')"
            >确认</el-button
          >
          <el-button type="info" @click="closeDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 创建服务结束 -->
    <!-- 选择节点开始 -->
    <el-dialog title="选择节点" :visible.sync="showChooseNode">
      <el-select
        v-model="selectEnv"
        placeholder="请选择环境"
        size="mini"
        @change="chooseEnv"
      >
        <el-option
          v-for="item in deployEnvList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <el-table :data="nodeList" @row-click="clickNode">
        <el-table-column label="节点名" prop="nodeName"></el-table-column>
        <el-table-column label="节点IP" prop="nodeIp"></el-table-column>
      </el-table>
    </el-dialog>
    <!-- 选择节点结束 -->
  </div>
</template>
<script>
import serviceApi from '../../http/Service'
import envApi from '../../http/Environment'
import systemApi from '../../http/System'
import userApi from '../../http/User'
import userSearch from '../../components/user-search.vue'
import textView from '../../components/text-view.vue'
export default {
  components: {
    userSearch,
    textView,
  },
  data() {
    return {
      activeName: 'first',
      serviceData: [],
      currentPage: 1,
      totalSize: 0,
      queryName: '',
      dialogTitle: '创建服务',
      showServiceDialog: false,
      serviceForm: {},
      isEdit: false,
      rules: {
        serviceName: [
          { required: true, message: '请输入服务名称', trigger: 'blur' },
        ],
        description: [
          { required: true, message: '请输入服务描述', trigger: 'blur' },
        ],
        gitUrl: [
          { required: true, message: '请输入服务的git地址', trigger: 'blur' },
        ],
      },
      notConfigGit: false,
      envList: [{}],
      volumeList: [{}],
      portList: [{}],
      deploymentName: '',
      showChooseNode: false,
      nodeList: [],
      deployEnvList: [],
      selectEnv: '',
      selectWay: '',
      selectNode: '',
      strategy: '',
      replicas: 1,
      members: [],
      selectedUser: null,
      showPop: false,
      gitForm: {},
      contextForm: {},
      gitOwner: '',
      buildVersions: {},
      codeVersions: [],
    }
  },
  methods: {
    selectCodeType(codeType) {
      this.codeVersions = []
      this.buildVersions.forEach((e) => {
        if (codeType == 'Java' && e.type == 'Maven') {
          this.codeVersions.push(e)
        }

        if (codeType == 'Go' && e.type == 'Go') {
          this.codeVersions.push(e)
        }
      })
    },
    changeGit(type) {
      if (type == 'Gitlab') {
        this.gitOwner = 'oauth2'
      }
      if (type != 'Gitlab' && this.gitOwner == 'oauth2') {
        this.gitOwner = ''
      }
    },
    deleteMember(userId) {
      serviceApi
        .removeMember(this.serviceForm.serviceId, userId)
        .then((res) => {
          if (res.data) {
            this.getserviceMember(this.serviceForm.serviceId)
          }
        })
    },
    querySearchAsync(queryString, cb) {
      userApi.queryUserByName(queryString).then((res) => {
        let array = []
        res.data.forEach((e) => {
          e.value = e.userName
          array.push(e)
        })
        cb(array)
      })
    },
    handleSelect(users) {
      users.forEach((e) => {
        serviceApi
          .addServiceMembers({
            resourceId: this.serviceForm.serviceId,
            userId: e.userId,
          })
          .then((res) => {
            if (res.data) {
              this.selectedUser = ''
              this.getserviceMember(this.serviceForm.serviceId)
            }
          })
      })
      this.showPop = !this.showPop
    },
    clickNode(row) {
      this.selectNode = row.nodeName
      this.showChooseNode = false
      this.nodeList = []
      this.selectEnv = ''
    },
    chooseEnv(envId) {
      envApi.getNodeList(envId).then((res) => {
        this.nodeList = res.data
      })
    },
    chooseNode() {
      this.showChooseNode = true
      this.deployEnvList = []
      envApi.getAllEnvs().then((res) => {
        console.log(res)
        res.data.forEach((e) => {
          this.deployEnvList.push({
            label: e.envName,
            value: e.envId,
          })
        })
      })
    },
    getNodeList() {},
    delPort(index) {
      if (this.portList.length == 1 && index == 0) {
        return
      }
      this.portList.splice(index, 1)
    },
    delEnv(index) {
      if (this.envList.length == 1 && index == 0) {
        return
      }
      this.envList.splice(index, 1)
    },
    delVolume(index) {
      if (this.volumeList.length == 1 && index == 0) {
        return
      }
      this.volumeList.splice(index, 1)
    },
    addPort() {
      this.portList.push({ protocol: 'TCP' })
    },
    addEnv() {
      this.envList.push({})
    },
    addVolume() {
      this.volumeList.push({})
    },
    getserviceMember(serviceId) {
      serviceApi.getServiceMembers(serviceId).then((res) => {
        this.members = res.data
      })
    },
    startEdit(row) {
      this.getBuildVersions()
      this.getserviceMember(row.serviceId)
      this.dialogTitle = '修改服务'
      this.isEdit = true
      this.showPop = false
      this.showServiceDialog = true
      this.serviceForm = JSON.parse(JSON.stringify(row))
      let config = row.serviceConfig
      this.replicas = config.replicas
      this.gitOwner = config.gitAccessInfo.owner
      this.deploymentName = config.appName
      this.gitForm = config.gitAccessInfo ? config.gitAccessInfo : {}
      this.contextForm = config.serviceContext ? config.serviceContext : {}
      if (!config) {
        return
      }
      if (config.envParams && config.envParams.length > 0) {
        this.envList = config.envParams
      }

      if (config.ports && config.ports.length > 0) {
        this.portList = config.ports
      }

      if (config.volumes && config.volumes.length > 0) {
        this.volumeList = config.volumes
      }

      this.selectWay = config.nodeStrategy.type
      this.selectNode = config.nodeStrategy.value
      this.strategy = config.strategy.type
    },
    startDelete(row) {
      this.$confirm(`确认删除服务【${row.serviceName}】?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        serviceApi.deleteService(row.serviceId).then((res) => {
          if (res.data == 1) {
            this.$notify.success('删除服务成功')
            this.closeDialog()
            this.getServices(1)
            return
          }
          this.$message.warning('删除服务失败')
        })
      })
    },
    startQuery() {
      this.getServices(1)
    },
    startCreate() {
      this.getBuildVersions()
      this.dialogTitle = '添加服务'
      this.isEdit = false
      this.showServiceDialog = true
      this.contextForm = {
        deployType: 2,
        code: 'Java',
      }
    },
    closeDialog() {
      this.isEdit = false
      this.showServiceDialog = false
      this.gitForm = {}
      this.contextForm = {}
      this.envList = [{}]
      this.portList = [{}]
      this.volumeList = [{}]
      this.serviceForm = {}
      this.selectedUser = ''
      this.replicas = 1
      this.deploymentName = ''
      this.members = []
      this.gitOwner = ''
    },
    pageChange(page) {
      this.getServices(page)
    },
    getServices(page) {
      let name = this.queryName
      if (name == null || name == undefined) {
        name = ''
      }
      serviceApi.getServicesPage(page, 10, name).then((res) => {
        this.totalSize = res.data.total
        this.currentPage = page
        this.serviceData = res.data.data
      })
    },
    submit(serviceForm) {
      this.$refs[serviceForm].validate((valid) => {
        if (!valid) {
          return false
        }
        let git = {}
        if (this.isConfigGit()) {
          git = this.gitForm
          git.owner = this.gitOwner
        }
        let config = {
          gitAccessInfo: git,
          serviceContext: this.contextForm,
          envParams: this.envList,
          ports: this.portList,
          volumes: this.volumeList,
          appName: this.deploymentName,
          replicas: this.replicas,
          nodeStrategy: {
            type: this.selectWay,
            value: this.selectNode,
          },
          strategy: {
            type: this.strategy,
          },
        }
        this.serviceForm.serviceConfig = config
        if (this.isEdit) {
          serviceApi.updateService(this.serviceForm).then(() => {
            this.$notify.success('修改成功！')
            this.closeDialog()
            this.getServices(1)
          })
          return
        }
        serviceApi.createService(this.serviceForm).then(() => {
          this.$notify.success('添加成功！')
          this.closeDialog()
          this.getServices(1)
        })
      })
    },
    isConfigGit() {
      if (
        this.gitForm.gitDomain &&
        this.gitForm.accessToken &&
        this.gitForm.gitType
      ) {
        return true
      }
      return false
    },
    getBuildVersions() {
      systemApi.getBuildTools().then((res) => {
        this.buildVersions = res.data
        if (this.contextForm.code) {
          this.selectCodeType(this.contextForm.code)
        }
      })
    },
    getGitEnv() {
      systemApi.requestGitConfig().then((res) => {
        this.notConfigGit = this.$utils.isEmpty(res.data.accessToken)
      })
    },
    goEnv() {
      this.$router.push({ path: '/system' })
    },
  },
  created() {
    this.getGitEnv()
    this.getServices(1)
  },
}
</script>
<style scoped>
.all {
  margin: 10px;
}
.page-title {
  margin: 10px 0;
  font-size: 15px;
}
.param-line {
  margin-bottom: 5px;
  text-align: center;
}
.btn-add {
  border: 1px dashed #ccc;
  width: 200px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
}
.del {
  color: #f56c6c;
  margin-left: 10px;
}
.add {
  color: #409eff;
}
.op-icon {
  font-size: 20px;
  margin-right: 20px;
  cursor: pointer;
}
.op-box {
  text-align: left;
}
.chosed-tag {
  margin-left: 20px;
}
.k8s-config {
  margin-bottom: 20px;
}
.add-member {
  display: inline-block;
  margin-left: 10px;
  font-size: 13px;
  cursor: pointer;
}
.tag-item {
  margin-left: 10px;
}
</style>
