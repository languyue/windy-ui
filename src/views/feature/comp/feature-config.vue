<template>
  <div>
    <div class="feature-content gridBackground" ref="parent">
      <div>
        <el-row :gutter="20">
          <!--- 开始编写用例-->
          <el-col :span="18">
            <div class="edit-content" @contextmenu.prevent="onContextmenu">
              <div class="menu-type">
                <el-radio-group
                  v-model="menuType"
                  size="small"
                  @change="selectTestStep"
                >
                  <el-radio-button label="1">预置</el-radio-button>
                  <el-radio-button label="2">执行</el-radio-button>
                  <el-radio-button label="3">清理</el-radio-button>
                </el-radio-group>
              </div>
              <div>
                <el-empty
                  v-if="isShowEmpty"
                  description="请在右侧拖拽组件到此处"
                ></el-empty>
                <div class="drag-content" v-else>
                  <el-scrollbar :wrap-style="'height: calc(80vh - 60px);'">
                    <draggable
                      v-model="displayList"
                      ref="child"
                      class="drag-box"
                      v-bind="dragOptions"
                      @end="dragEnd"
                      @add="addItem"
                    >
                      <div
                        v-for="(executePoint, index) in displayList"
                        :key="executePoint.id"
                      >
                        <el-row>
                          <el-col :span="22">
                            <div class="content-item">
                              <!-- 执行点头部开始 -->
                              <div
                                class="content-item-title"
                                :key="uuid"
                                @dblclick="closeDiv(executePoint)"
                              >
                                <el-row :gutter="10">
                                  <el-col
                                    :span="executePoint.editDesc ? 6 : 13"
                                  >
                                    <span
                                      @dblclick="
                                        () => {
                                          if (
                                            isEdit &&
                                            !executePoint.editDesc
                                          ) {
                                            exchangeEditStatus(executePoint)
                                          }
                                        }
                                      "
                                      >{{ executePoint.description }}
                                    </span>
                                    <i
                                      class="el-icon-document-copy i-icon"
                                      @click="copyExecutePoint(executePoint)"
                                    />

                                    <el-popover
                                      placement="right-end"
                                      title="关联模版信息"
                                      width="400"
                                      v-if="isShowTemplate(executePoint)"
                                      trigger="click"
                                      @show="showExecutePoint(executePoint)"
                                      @hide="hideTemplate"
                                    >
                                      <el-descriptions :column="1">
                                        <el-descriptions-item
                                          label="所属服务"
                                          >{{
                                            pointTemplate.service
                                          }}</el-descriptions-item
                                        >
                                        <el-descriptions-item
                                          label="请求信息"
                                          >{{
                                            pointTemplate.request
                                          }}</el-descriptions-item
                                        >
                                        <el-descriptions-item
                                          label="请求方法"
                                          >{{
                                            pointTemplate.method
                                          }}</el-descriptions-item
                                        >
                                        <el-descriptions-item
                                          label="模版描述"
                                          >{{
                                            pointTemplate.description
                                          }}</el-descriptions-item
                                        >
                                      </el-descriptions>
                                      <i
                                        slot="reference"
                                        class="el-icon-info i-icon icon-template"
                                      ></i>
                                    </el-popover>
                                  </el-col>
                                  <el-col :span="4">
                                    <!-- <i
                              v-if="isEdit"
                              @click="
                                deleteExecutePoint(index, executePoint.pointId)
                              "
                              class="el-icon-delete delete-point"
                            /> -->
                                    <el-popconfirm
                                      v-if="isEdit"
                                      title="确认删除用例的执行点？"
                                      icon-color="#F56C6C"
                                      @confirm="
                                        deleteExecutePoint(
                                          index,
                                          executePoint.pointId
                                        )
                                      "
                                    >
                                      <i
                                        slot="reference"
                                        class="el-icon-delete delete-point"
                                      />
                                    </el-popconfirm>
                                    <i
                                      v-if="isEdit && !executePoint.editDesc"
                                      @click="exchangeEditStatus(executePoint)"
                                      class="el-icon-edit-outline delete-point"
                                    />
                                  </el-col>

                                  <el-col
                                    :span="8"
                                    v-if="executePoint.editDesc && isEdit"
                                  >
                                    <div>
                                      <el-input
                                        placeholder="输入功能描述"
                                        @pointerdown.stop.native
                                        v-model="executePoint.desc"
                                        size="mini"
                                      />
                                    </div>
                                  </el-col>
                                  <el-col
                                    v-if="executePoint.editDesc"
                                    :span="5"
                                  >
                                    <el-button
                                      size="mini"
                                      @click="
                                        exchangeEditStatus(executePoint, true)
                                      "
                                      >保存</el-button
                                    >
                                    <el-button
                                      size="mini"
                                      @click="exchangeEditStatus(executePoint)"
                                      >取消</el-button
                                    >
                                  </el-col>
                                </el-row>
                                <i
                                  :class="{
                                    'el-icon-arrow-down': executePoint.isActive,
                                    'right-icon': true,
                                    'el-icon-arrow-right':
                                      !executePoint.isActive,
                                  }"
                                  @click="closeDiv(executePoint)"
                                />
                              </div>
                              <!-- 执行点头部结束 -->

                              <!-- 执行点内容开始 -->
                              <collapse>
                                <div
                                  v-show="executePoint.isActive"
                                  class="content-item-detail"
                                >
                                  <FeatureTemplate
                                    v-if="
                                      executePoint.executeType == 1 ||
                                      executePoint.executeType == 4 ||
                                      executePoint.executeType == 5
                                    "
                                    :case="caseId"
                                    :data="executePoint"
                                    :isEdit="isEdit"
                                    :key="uuid"
                                    :type="executePoint.writeType"
                                    @refreshData="refreshValue"
                                  />
                                  <FeatureTool
                                    v-else
                                    :data="executePoint"
                                    :isEdit="isEdit"
                                    :key="uuid"
                                    @refreshData="refreshValue"
                                  />
                                </div>
                              </collapse>
                              <!-- 执行点内容结束 -->
                            </div>
                          </el-col>
                          <el-col :span="2">
                            <el-popover
                              placement="right-end"
                              width="120"
                              title="变量列表"
                              trigger="hover"
                            >
                              <div>
                                <ul class="variable-list">
                                  <li
                                    v-for="(
                                      item, index
                                    ) in executePoint.variableDefine"
                                    :key="index"
                                  >
                                    <i class="el-icon-caret-right" />
                                    {{ item.variableKey }}
                                  </li>
                                </ul>
                              </div>

                              <span
                                slot="reference"
                                v-if="
                                  executePoint.variableDefine &&
                                  executePoint.variableDefine.length
                                "
                                class="top-show-icon"
                              >
                                <i class="el-icon-camera-solid"
                              /></span>
                            </el-popover>
                          </el-col>
                        </el-row>
                      </div>
                    </draggable>
                  </el-scrollbar>
                </div>
              </div>
            </div>
          </el-col>
          <!--- 编写用例结束-->

          <!-- 模版列表开始 -->
          <el-col :span="6">
            <div class="feature-config-list">
              <div class="operate">
                <el-link
                  v-if="!isEdit"
                  icon="el-icon-edit"
                  :underline="false"
                  type="primary"
                  @click="clickEdit"
                  size="middle"
                  >编辑</el-link
                >
                <el-link
                  v-if="isEdit"
                  icon="el-icon-upload"
                  type="success"
                  :underline="false"
                  @click="saveConfig"
                  size="middle"
                  >保存</el-link
                >
                <el-link
                  v-if="isEdit"
                  icon="el-icon-circle-close"
                  type="info"
                  :underline="false"
                  @click="cancelEdit"
                  size="middle"
                  >取消</el-link
                >
                <el-link
                  icon="el-icon-video-play"
                  v-if="!isEdit"
                  type="success"
                  :underline="false"
                  @click="startDebug"
                  size="middle"
                  >调试</el-link
                >
                <el-link
                  icon="el-icon-tickets"
                  type="info"
                  :underline="false"
                  @click="showHistoryDrawer = !showHistoryDrawer"
                  size="middle"
                  >历史日志</el-link
                >
              </div>
              <el-collapse v-model="toolType" accordion>
                <el-collapse-item title="基础工具" name="1">
                  <draggable
                    class="tool-list"
                    @start="startDrag($event, { list: featureItemList })"
                    :list="featureItemList"
                    :group="{ name: 'api', pull: 'clone', put: false }"
                    animation="100"
                  >
                    <div
                      v-for="(element, index) in featureItemList"
                      :key="index"
                    >
                      <div class="feature-item" v-if="element.isTool">
                        <div class="template-name">
                          {{ element.name }}
                        </div>
                        <div class="template-desc">
                          {{ element.description }}
                        </div>
                      </div>
                    </div>
                  </draggable>
                </el-collapse-item>
                <el-collapse-item title="业务模版" name="2">
                  <div>
                    <el-row :gutter="20">
                      <el-col :span="14">
                        <el-input
                          size="mini"
                          clearable
                          v-model="filterName"
                          placeholder="过滤模版名称"
                        />
                      </el-col>
                      <el-col :span="3">
                        <i
                          class="el-icon-refresh refresh-icon"
                          @click="getCaseInfo"
                        />
                      </el-col>
                      <el-col :span="7">
                        <el-tooltip
                          effect="dark"
                          content="关联其他服务模版"
                          placement="top-start"
                        >
                          <span>
                            <el-link
                              :underline="false"
                              @click="startShowRelated"
                              icon="el-icon-share"
                              ><span style="font-szie: 12px"
                                >关联</span
                              ></el-link
                            ></span
                          >
                        </el-tooltip>
                      </el-col>
                    </el-row>
                  </div>
                  <div v-for="(item, index) in templateGroup" :key="index">
                    <div @click="closeTemplates(item)" class="service-title">
                      {{ item.name }}
                      <i
                        :class="{
                          'el-icon-arrow-down': item.isActive,
                          'right-icon': true,
                          'el-icon-arrow-right': !item.isActive,
                        }"
                        @click="closeTemplates(item)"
                      />
                    </div>
                    <collapse>
                      <div v-show="item.showList">
                        <draggable
                          @start="startDrag($event, item)"
                          class="template-list"
                          :list="item.list"
                          :group="{ name: 'api', pull: 'clone', put: false }"
                          animation="100"
                        >
                          <div
                            v-for="(element, index) in item.list"
                            :key="index"
                          >
                            <div class="feature-item" v-if="!element.isTool">
                              <div class="template-name">
                                {{ element.name }}
                              </div>
                              <div class="template-desc">
                                {{ element.description }}
                              </div>
                            </div>
                          </div>
                        </draggable>
                      </div>
                    </collapse>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-col>
          <!-- 模版列表结束 -->
        </el-row>
      </div>
    </div>
    <!-- 显示历史日志开始 -->
    <el-drawer
      title="用例历史日志"
      size="50%"
      :visible.sync="showHistoryDrawer"
    >
      <history ref="historyComp" :feature="featureId" />
    </el-drawer>
    <!-- 显示历史日志结束 -->
    <!-- 关联其他服务模版开始 -->
    <el-dialog
      :visible.sync="showRelatedTemplate"
      title="关联服务模版"
      @close="cancelRelatedService"
    >
      <el-form size="mini" inline>
        <el-form-item>
          <el-input
            style="width: 300px"
            v-model="filterText"
            size="mini"
            placeholder="请输入服务名称关键字搜索"
          />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-refresh" type="primary">刷新服务</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="
          serviceList.filter(
            (data) =>
              data.serviceId != service &&
              (!filterText ||
                data.serviceName
                  .toLowerCase()
                  .includes(filterText.toLowerCase()))
          )
        "
        size="mini"
        max-height="500px"
        @selection-change="selectServices"
        ref="relatedTemplateTable"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="服务ID" prop="serviceId"></el-table-column>
        <el-table-column label="服务名称" prop="serviceName"></el-table-column>
        <el-table-column label="服务描述" prop="description"></el-table-column>
      </el-table>
      <div slot="footer">
        <el-button size="mini" @click="cancelRelatedService">取消</el-button>
        <el-button type="primary" @click="addRelatedService" size="mini"
          >确定</el-button
        >
      </div>
    </el-dialog>
    <!-- 关联其他服务模版结束 -->
  </div>
</template>
<script>
import history from '../history.vue'
import FeatureTemplate from '@/components/feature-template'
import FeatureTool from '@/components/feature-tool'
import draggable from 'vuedraggable'
import featureApi from '../../../http/Feature'
import testCaseApi from '../../../http/TestCase'
import serviceApi from '../../../http/Service'
import collapse from '../../../lib/collapse'
export default {
  props: {
    service: String,
    feature: String,
    case: String,
  },
  components: {
    draggable,
    history,
    FeatureTemplate,
    FeatureTool,
    collapse,
  },
  watch: {
    feature: {
      handler(val) {
        if (val != this.featureId) {
          this.featureId = val
          this.getFeatureInfo()
        }
      },
      deep: true,
      immediate: true,
    },
    service: {
      handler(val) {
        if (val != this.serviceId) {
          this.serviceId = val
          this.getExecutePoint()
        }
      },
      deep: true,
      immediate: true,
    },
    case: {
      handler(val) {
        if (val != this.caseId) {
          this.caseId = val
          this.getCaseInfo()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    dragOptions() {
      return {
        animation: 100,
        group: 'api',
        pull: true,
        revertClone: true,
        disabled: !this.isEdit,
        ghostClass: 'ghost',
      }
    },
    isShowEmpty() {
      let flag = false
      if (
        this.displayList.length == 0 ||
        this.displayList.length == undefined
      ) {
        flag = true
      }
      if (this.isDrag) {
        flag = false
      }
      return flag
    },
    templateGroup() {
      let array = this.serviceGroup.filter((data) => {
        if (!data.filterList) {
          data.filterList = JSON.parse(JSON.stringify(data.list))
        }
        if (!this.filterName || this.filterName == '') {
          data.list = data.filterList
          return true
        }

        let temp = data.filterList.filter((item) => {
          return item.name.toLowerCase().includes(this.filterName.toLowerCase())
        })

        data.list = temp
        return temp.length > 0
      })

      return array
    },
    templateList() {
      return this.featureItemList.filter(
        (data) =>
          !this.filterName ||
          data.name.toLowerCase().includes(this.filterName.toLowerCase())
      )
    },
  },
  data() {
    return {
      displayList: [],
      allPoints: [],
      menuType: '2',
      toolType: '2',
      isDrag: false,
      dragGroupList: [],
      featureItemList: [],
      isEdit: false,
      uuid: '',
      isActive: false,
      featureId: '',
      featureInfo: {},
      filterName: '',
      serviceId: '',
      caseId: '',
      caseInfo: {},
      serviceList: [],
      testActive: false,
      testShow: false,
      serviceGroup: [],
      pointTemplate: {},
      showHistoryDrawer: false,
      showRelatedTemplate: false,
      filterText: '',
      relatedServices: [],
    }
  },
  methods: {
    selectServices(array) {
      this.relatedServices = []
      array.forEach((e) => {
        this.relatedServices.push(e.serviceId)
      })
    },
    startShowRelated() {
      this.showRelatedTemplate = true
    },
    cancelRelatedService() {
      this.showRelatedTemplate = false
      this.relatedServices = []
    },
    addRelatedService() {
      if (!this.relatedServices.length) {
        this.$notify.warning('请先选择关联的服务')
        return
      }
      let item = {
        serviceId: this.service,
        relatedServiceIds: this.relatedServices,
      }
      featureApi.addRelatedService(item).then((res) => {
        if (res.data) {
          this.$notify.success('关联服务成功')
          this.cancelRelatedService()
          this.getTemplates()
        } else {
          this.$notify.error('关联服务失败')
        }
      })
    },
    getFeatureInfo() {
      featureApi.getFeatureDetail(this.featureId).then((res) => {
        this.featureInfo = res.data
      })
    },
    isShowTemplate(point) {
      return (
        point.executeType == 1 ||
        point.executeType == 4 ||
        point.executeType == 5
      )
    },
    showExecutePoint(point) {
      if (!point.pointId) {
        return
      }
      featureApi.getExecutePointTemplate(point.pointId).then((res) => {
        this.pointTemplate = res.data
      })
    },
    hideTemplate() {
      this.pointTemplate = {}
    },
    closeTemplates(item) {
      item.isActive = !item.isActive
      item.showList = !item.showList
    },
    onContextmenu(event) {
      this.$contextmenu({
        items: [
          {
            label: '粘贴执行点',
            disabled: !this.isEdit,
            onClick: () => {
              this.pasteExecutePoint()
            },
          },
        ],
        event,
        zIndex: 3,
        minWidth: 230,
      })
      return true
    },
    pasteExecutePoint() {
      let copyString = localStorage.getItem('copyItem')
      let pasteItem = JSON.parse(copyString)
      if (pasteItem && pasteItem.randomId) {
        pasteItem.randomId = this.$utils.randomString(20)
        pasteItem.writeType = '1'
        pasteItem.testStage = parseInt(this.menuType)
        pasteItem.pointId = null
        pasteItem.id = this.displayList.length
        this.allPoints.push(pasteItem)
        this.displayExepoints()

        localStorage.removeItem('copyItem')
      }
    },
    copyExecutePoint(copyItem) {
      localStorage.setItem('copyItem', JSON.stringify(copyItem))
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `执行点<strong>[${copyItem.description}]</strong>已复制`,
        type: 'success',
      })
    },
    closeDiv(executePoint) {
      executePoint.isActive = !executePoint.isActive
      this.uuid = this.$utils.randomString(20)
    },
    deleteExecutePoint(index, pointId) {
      if (!pointId) {
        this.removeItem(this.displayList[index])
        this.displayExepoints()
        return
      }
      this.deletePoint(pointId, index)
    },
    deletePoint(pointId, index) {
      featureApi.deleteExecutePoint(pointId).then((res) => {
        if (res.data == 1) {
          this.removeItem(this.displayList[index])
          this.displayExepoints()
          this.$notify.success('删除执行点成功')
          return
        }
        this.$message.warning('删除执行点失败')
      })
    },
    removeItem(item) {
      if (!item) {
        return
      }
      let index = -1
      for (let i in this.allPoints) {
        if (this.allPoints[i]['randomId'] === item.randomId) {
          index = i
          break
        }
      }
      if (index == -1) return
      this.allPoints.splice(index, 1)
    },
    startDebug() {
      featureApi.startFeature(this.featureId).then((res) => {
        if (res.data) {
          this.$notify.success('开始执行，请查看运行日志')
        } else {
          this.$notify.error('执行失败')
        }
      })
    },
    resetOrder() {
      this.bindStepPoints()
      this.allPoints.sort((m, n) => {
        let before = m.testStage
        let current = n.testStage
        if (before > current) {
          return 1
        }
        if (before < current) {
          return -1
        }
        return 0
      })
    },
    saveConfig() {
      this.displayList.forEach((e) => {
        e.editDesc = false
      })
      let data = this.convertFeatureData()
      featureApi.updateFeature(data).then(() => {
        this.$notify.success('保存成功')
        this.isEdit = false
        this.getExecutePoint()
      })
    },
    convertFeatureData() {
      let index = 0
      let array = []
      this.resetOrder()
      this.allPoints.forEach((e) => {
        let item = {
          method: e.method,
          name: e.name,
          invokeType: e.invokeType,
          description: e.description,
          service: e.service,
          headers: e.headers,
          relatedId: e.relatedId,
        }

        if (e.executeType == 2 || e.executeType == 3 || e.executeType == 7) {
          item.executePoints = e.executePoints
        } else {
          item.params = e.params
        }

        array.push({
          pointId: e.pointId,
          featureId: this.featureId,
          templateId: e.templateId,
          testStage: e.testStage,
          sortOrder: index,
          executorUnit: item,
          compareDefine: e.compareDefine,
          variableDefine: e.variableDefine,
          executeType: e.executeType,
          description: e.description,
        })
        index++
      })
      return {
        featureId: this.featureId,
        parentId: this.featureInfo.parentId,
        testFeatures: array,
      }
    },
    exchangeEditStatus(item, isUpdateText) {
      if (isUpdateText) {
        item.description = item.desc
      }
      item.editDesc = !item.editDesc
      this.uuid = this.$utils.randomString(20)
    },
    cancelEdit() {
      this.getExecutePoint()
      this.isEdit = false
    },
    clickEdit() {
      this.isEdit = !this.isEdit
    },
    dragEnd() {
      //每当拖拽的时候，整理下所有执行点的顺序，重新排序时不会错乱
      let array = JSON.parse(JSON.stringify(this.allPoints))
      let groups = {}
      array.forEach((e) => {
        let key = e.testStage + ''
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(e)
      })
      groups[this.menuType] = this.displayList
      let result = []
      Object.values(groups).forEach((group) => {
        result = result.concat(group)
      })
      this.allPoints = result
    },
    addItem(e) {
      let item = JSON.parse(JSON.stringify(this.dragGroupList[e.oldIndex]))
      item.isActive = true
      item.randomId = this.$utils.randomString(20)
      item.writeType = '1'
      item.sortOrder = e.newIndex
      item.testStage = parseInt(this.menuType)
      item.pointId = null
      this.allPoints.push(item)
      this.isEdit = true
      this.displayExepoints()
      this.uuid = this.$utils.randomString(20)
    },
    refreshValue(update) {
      //删除添加到if或者for中的执行点
      let removeArray = []
      if (update.data.executePoints) {
        update.data.executePoints.forEach((e) => {
          if (e.pointId) {
            removeArray.push(e.randomId)
          }
        })
      }

      let needUpdate = false
      this.allPoints = this.allPoints.filter((e) => {
        let result = removeArray.indexOf(e.randomId) < 0
        if (!result) {
          this.deletePoint(e.pointId)
        }
        return result
      })
      if (needUpdate) {
        let data = this.convertFeatureData()
        featureApi.updateFeature(data).then(() => {
          console.log('drag delete point save success')
        })
      }

      //更新数据
      let updateArray = []
      this.allPoints.forEach((e) => {
        if (e.randomId == update.data.randomId) {
          updateArray.push(update.data)
        } else {
          updateArray.push(e)
        }
      })
      this.allPoints = updateArray
      this.displayExepoints()
    },
    startDrag(event, item) {
      this.isEdit = true
      this.dragGroupList = item.list
      this.isDrag = true
    },
    selectTestStep() {
      this.bindStepPoints()
      this.displayExepoints()
    },
    bindStepPoints() {
      if (this.displayList.length == 0) {
        return
      }
      let currentStage = this.displayList[0].testStage
      let array = this.allPoints.filter((e) => {
        return e.testStage != currentStage
      })
      this.allPoints = array.concat(
        JSON.parse(JSON.stringify(this.displayList))
      )
    },
    refreshArray(data) {
      this.displayList = []
      let index = 0
      data.forEach((e) => {
        this.$set(this.displayList, index, e)
        index++
      })
    },
    getExecutePoint() {
      featureApi.getExecutePoints(this.featureId).then((res) => {
        this.allPoints = []
        res.data.forEach((e) => {
          let executePoint = e.executorUnit
          let data = executePoint.params
          let item = {
            id: e.sortOrder,
            pointId: e.pointId,
            relatedId: executePoint.relatedId,
            name: executePoint.name,
            method: executePoint.method,
            service: executePoint.service,
            description: e.description,
            invokeType: executePoint.invokeType,
            headers: executePoint.headers,
            params: data,
            executePoints: executePoint.executePoints,
            compareDefine: e.compareDefine,
            variableDefine: e.variableDefine,
            writeType: '1',
            executeType: e.executeType,
            randomId: this.$utils.randomString(20),
            testStage: e.testStage,
            isActive: false,
          }
          this.allPoints.push(item)
        })
        this.menuType = '2'
        this.displayExepoints()
      })
      this.getTemplates()
    },
    getCaseInfo() {
      if (!this.caseId) {
        this.caseId = this.$route.query.caseId
      }
      testCaseApi.getTestCaseDetail(this.caseId).then((res) => {
        this.caseInfo = res.data
        this.getTemplates()
      })
    },
    getTemplates() {
      this.caseId = this.$route.query.caseId
      testCaseApi.getTestCaseDetail(this.caseId).then((res) => {
        this.caseInfo = res.data
        if (this.caseInfo.caseType == 2) {
          featureApi.getAllTemplates().then((res) => {
            let serviceIds = []
            let array = res.data
            array.forEach((e) => {
              e.isTool = e.templateType != 1
              e.executeType = e.templateType
              e.service = e.service ? e.service : ''

              if (serviceIds.indexOf(e.owner) == -1) {
                serviceIds.push(e.owner)
              }
            })
            const idString = Array.from(serviceIds).join(',')
            serviceApi.getServicesByIds(idString).then((res) => {
              this.serviceList = res.data
              this.exchangeGroup(array)
              this.featureItemList = array
            })
          })
          return
        }
        featureApi.getServiceTemplates(this.serviceId).then((res) => {
          let array = res.data
          array.forEach((e) => {
            e.isTool = e.templateType != 1
            e.executeType = e.templateType
            e.service = e.service ? e.service : ''
          })
          this.exchangeGroup(array)
          this.featureItemList = array
        })
      })
    },
    exchangeGroup(array) {
      let serviceTemplateMap = {}
      array.forEach((e) => {
        let list = serviceTemplateMap[e.owner]
        if (!list) {
          list = []
        }

        list.push(e)
        serviceTemplateMap[e.owner] = list
      })

      //将服务列表转成新的对象
      const serviceMap = this.serviceList.reduce((acc, item) => {
        acc[item.serviceId] = item.serviceName
        return acc
      }, {})

      let groupList = []
      for (let key in serviceTemplateMap) {
        if (key && key != '') {
          let service = serviceMap[key]
          if (service) {
            groupList.push({
              name: service,
              isActive: false,
              showList: false,
              list: serviceTemplateMap[key],
            })
          }
        }
      }
      this.serviceGroup = groupList
    },
    displayExepoints() {
      this.displayList = []
      let array = []
      let stage = parseInt(this.menuType)
      this.allPoints.forEach((e) => {
        if (e.testStage == stage) {
          array.push(e)
        }
      })
      this.displayList = array
      this.$forceUpdate()
    },
    getServices() {
      serviceApi.getServices().then((res) => {
        this.serviceList = res.data
      })
    },
  },
  created() {
    this.getServices()
    this.getExecutePoint()
    this.caseId = this.$route.query.caseId
    this.getCaseInfo()
  },
}
</script>
<style scoped>
.operate {
  margin: 10px;
}
.operate a {
  margin-right: 10px;
}
.right-icon {
  position: absolute;
  top: 10px;
  right: 10px;
}
.content-item {
  background: #ffffff;
  margin: 10px 20px;
  border-radius: 5px;
  width: 90%;
  padding: 5px 10px;
}
.content-item-title {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  cursor: pointer;
  position: relative;
}
.content-item-detail {
  font-size: 13px;
  padding: 10px 10px;
}
.feature-item {
  height: 40px;
  padding: 2px 4px;
  border-radius: 5px;
  text-align: left;
  border: 2px solid #f2f6fc;
  cursor: pointer;
  background-color: #f2f6fc;
  box-shadow: 1px 1px 2px #f2f6fc;
  margin: 10px;
  font-size: 14px;
  color: #606266;
  border: 1px dashed #d4d6d8;
}
.template-desc {
  font-size: 12px;
  color: #909399;
}
.template-name {
  height: 20px;
}

.feature-config-list {
  background-color: #ffffff;
  height: 80vh;
  padding: 10px 20px;
  padding-right: 10px;
}

.delete-point {
  font-size: 16px;
  margin-left: 20px;
}

.menu-type {
  width: 200px;
  margin-left: 50%;
  margin-top: 10px;
  transform: translateX(-50%);
  margin-bottom: 10px;
}

.edit-content {
  position: relative;
}

.feature-content {
  min-height: 300px;
  padding: 0 10px;
  background-color: #fff;
}

.gridBackground {
  background: #dcdfe6;
  background-image: linear-gradient(white 0px, transparent 0),
    linear-gradient(90deg, white 0px, transparent 0),
    linear-gradient(hsla(0, 0%, 100%, 0.3) 1px, transparent 0),
    linear-gradient(90deg, hsla(0, 0%, 100%, 0.3) 1px, transparent 0);
  background-size: 75px 75px, 75px 75px, 15px 15px, 15px 15px;
}
.tool-list {
  height: 300px;
  padding-bottom: 30px;
  overflow-y: scroll;
}
.template-list {
  height: 400px;
  padding-bottom: 30px;
  overflow-y: scroll;
}

.refresh-icon {
  font-size: 18px;
  cursor: pointer;
}
.service-title {
  position: relative;
  color: #fff;
  height: 40px;
  line-height: 40px;
  background: #606266;
  padding-left: 20px;
  vertical-align: middle;
  cursor: pointer;
  border-radius: 5px;
  margin: 5px;
}
.i-icon {
  margin-left: 10px;
  font-size: 15px;
}
.icon-template {
  color: #909399;
}
.top-show-icon {
  font-size: 13px;
  cursor: pointer;
  border-color: #409eff;
  color: #fff;
  display: inline-block;
  height: 30px;
  padding: 0 8px;
  margin: 15px 10px;
  line-height: 30px;
  background-color: #409eff;
  font-size: 12px;
  border-radius: 30px;
  box-sizing: border-box;
  white-space: nowrap;
}
</style>
<style lang="less" scoped>
.drag-content {
  height: calc(80vh - 60px);
  overflow-y: hidden;
}
.drag-box {
  min-height: calc(80vh - 60px);
}
.variable-list {
  list-style: none;
  padding: 0;

  li {
    margin: 5px 0;
  }
}
</style>
