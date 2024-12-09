<template>
  <div>
    <div class="for-box">
      <div class="for-start">
        循环次数
        <el-input-number
          :disabled="!isEdit"
          v-model="condition"
          @input="notifyData"
          size="mini"
          class="size-input"
          inline
        />
      </div>
      {
      <div>
        <draggable
          class="for-content"
          v-model="forFeatures"
          @add="addFeature"
          v-bind="dragOptions"
        >
          <div
            v-for="(executePoint, index) in forFeatures"
            :key="executePoint.id"
            class="content-item"
          >
            <!-- 执行点头部开始 -->
            <div
              class="content-item-title"
              :key="uuid"
              @dblclick="closeDiv(executePoint)"
            >
              <el-row :gutter="10">
                <el-col :span="executePoint.editDesc ? 6 : 13">
                  <span
                    @dblclick="
                      () => {
                        if (isEdit && !executePoint.editDesc) {
                          exchangeEditStatus(executePoint)
                        }
                      }
                    "
                    >{{ executePoint.name }}
                  </span>
                  <i
                    class="el-icon-document-copy i-icon"
                    @click="copyExecutePoint(executePoint)"
                  />

                  <!-- <el-popover
                    placement="right-end"
                    title="关联模版信息"
                    width="400"
                    v-if="isShowTemplate(executePoint)"
                    trigger="click"
                    @show="showExecutePoint(executePoint)"
                    @hide="hideTemplate"
                  >
                    <el-descriptions :column="1">
                      <el-descriptions-item label="所属服务">{{
                        pointTemplate.service
                      }}</el-descriptions-item>
                      <el-descriptions-item label="请求信息">{{
                        pointTemplate.request
                      }}</el-descriptions-item>
                      <el-descriptions-item label="请求方法">{{
                        pointTemplate.method
                      }}</el-descriptions-item>
                      <el-descriptions-item label="模版描述">{{
                        pointTemplate.description
                      }}</el-descriptions-item>
                    </el-descriptions>
                    <i
                      slot="reference"
                      class="el-icon-info i-icon icon-template"
                    ></i>
                  </el-popover> -->
                </el-col>
                <el-col :span="4">
                  <el-popconfirm
                    v-if="isEdit"
                    title="确认删除用例的执行点？"
                    icon-color="#F56C6C"
                    @confirm="deleteExecutePoint(index, executePoint.pointId)"
                  >
                    <i slot="reference" class="el-icon-delete delete-point" />
                  </el-popconfirm>
                  <i
                    v-if="isEdit && !executePoint.editDesc"
                    @click="exchangeEditStatus(executePoint)"
                    class="el-icon-edit-outline delete-point"
                  />
                </el-col>

                <el-col :span="8" v-if="executePoint.editDesc && isEdit">
                  <div>
                    <el-input
                      placeholder="输入功能描述"
                      @pointerdown.stop.native
                      v-model="executePoint.desc"
                      size="mini"
                    />
                  </div>
                </el-col>
                <el-col v-if="executePoint.editDesc" :span="5">
                  <el-button
                    size="mini"
                    @click="exchangeEditStatus(executePoint, true)"
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
                  'el-icon-arrow-right': !executePoint.isActive,
                }"
                @click="closeDiv(executePoint)"
              />
            </div>
            <!-- 执行点头部结束 -->

            <!-- 执行点内容开始 -->
            <collapse>
              <div v-show="executePoint.isActive" class="content-item-detail">
                <FeatureTemplate
                  :data="executePoint"
                  :isEdit="isEdit"
                  :type="executePoint.writeType"
                  @refreshData="refreshList"
                />
              </div>
            </collapse>
            <!-- 执行点内容结束 -->
          </div>
          <!-- <el-collapse accordion :key="uuid">
            <el-collapse-item
              v-for="(executePoint, index) in forFeatures"
              :key="index"
              :name="executePoint.randomId"
            >
              <template slot="title">
                <span>
                  {{ executePoint.name }}
                </span>
                <i
                  v-if="isEdit"
                  @click="deleteExecutePoint(index)"
                  class="el-icon-delete delete-point"
                />
              </template>
              <div class="content-item">
                <FeatureTemplate
                  :data="executePoint"
                  :isEdit="isEdit"
                  :type="executePoint.writeType"
                  @refreshData="refreshValue"
                />
              </div>
            </el-collapse-item>
          </el-collapse> -->
        </draggable>
      </div>
      }
    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import FeatureTemplate from './feature-template'
import collapse from '../lib/collapse'
export default {
  props: {
    data: Object,
    isEdit: Boolean,
  },
  components: {
    draggable,
    FeatureTemplate,
    collapse,
  },
  data() {
    return {
      forData: {},
      size: '',
      str: '<',
      forFeatures: [],
      uuid: '',
      condition: '',
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 100,
        group: 'api',
        pull: false,
        put: true,
        disabled: !this.isEdit,
      }
    },
  },
  methods: {
    copyExecutePoint(copyItem) {
      console.log('copppppy', copyItem)
      localStorage.setItem('copyItem', JSON.stringify(copyItem))
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `执行点<strong>[${copyItem.description}]</strong>已复制`,
        type: 'success',
      })
    },
    addFeature(e) {
      // this.forFeatures.forEach((ele) => {
      //   ele.randomId = new Date().valueOf()
      //   ele.writeType = '1'
      //   ele.sortOrder = e.newIndex
      // })
      // evt.preventDefault();

      let index = e.newIndex
      let currentElement = this.forFeatures[index]
      console.log(this.forFeatures)
      if (
        currentElement.executeType == 2 ||
        currentElement.executeType == 3 ||
        currentElement.executeType == 7
      ) {
        this.$notify.warning('不支持嵌套if、for、异步组件')
        this.forFeatures.splice(index, 1)
        return
      }
      if (!this.forFeatures[index].randomId) {
        this.forFeatures[index].randomId = this.$utils.randomString(20)
        this.forFeatures[index].writeType = '1'
        this.forFeatures[index].sortOrder = e.newIndex
      }

      this.isEdit = true
      this.uuid = new Date().valueOf()
      this.notifyData()
    },
    notifyData() {
      this.refreshValue()
    },
    refreshList(item) {
      console.log('list updatecccc', item, this.forFeatures)
      this.forFeatures.forEach((e) => {
        if (item.data && e.randomId == item.data.randomId) {
          e = item.data
        }
      })
      this.refreshValue()
    },
    refreshValue(update) {
      let points = []
      this.forFeatures.forEach((e) => {
        if (update && e.randomId == update.data.randomId) {
          e = update.data
        }

        let point = {
          executorUnit: {
            method: e.method,
            name: e.name,
            description: e.description,
            service: e.service,
            params: e.params,
            invokeType: e.invokeType,
            headers: e.headers,
            relatedId: e.relatedId,
          },
          featureId: this.forData.featureId,
          pointId: e.pointId,
          randomId: e.randomId,
          compareDefine: e.compareDefine,
          variableDefine: e.variableDefine,
          executeType: e.executeType,
        }
        points.push(point)
      })

      let data = JSON.parse(JSON.stringify(this.forData))
      data.method = this.condition
      data.executePoints = JSON.parse(JSON.stringify(points))
      this.$emit('refreshData', {
        data: data,
      })
    },
    deleteExecutePoint(index) {
      this.forFeatures.splice(index, 1)
      this.refreshValue()
    },
    closeDiv(executePoint) {
      executePoint.isActive = !executePoint.isActive
      this.uuid = this.$utils.randomString(20)
    },
    exchangeEditStatus(item, isUpdateText) {
      if (isUpdateText) {
        item.name = item.desc
      }
      item.editDesc = !item.editDesc
      this.uuid = this.$utils.randomString(20)
    },
  },
  created() {
    this.forData = this.data
    if (this.data.method) {
      this.condition = this.data.method
    }

    this.forFeatures = []
    if (this.data.executePoints) {
      this.data.executePoints.forEach((point) => {
        point.executorUnit.randomId = new Date().valueOf()
        let item = point.executorUnit
        item.writeType = '1'
        item.description = point.description
        item.executeType = point.executeType
        item.compareDefine = point.compareDefine
        item.variableDefine = point.variableDefine
        this.forFeatures.push(item)
      })
    }
    console.log(
      'init',
      JSON.parse(JSON.stringify(this.forFeatures)),
      JSON.parse(JSON.stringify(this.forData))
    )
  },
}
</script>
<style lang="less" scoped>
.size-input {
  width: 100px;
}
.for-box {
  margin: 5px;
  border: 2px dashed #dcdfe6;
  padding: 10px;
  margin: 10px;
  border-radius: 4px;
}
.for-content {
  min-height: 100px;
}
.for-start {
  margin: 1px;
  border: 1px dashed #dcdfe6;
  padding: 5px;
}
.delete-point {
  font-size: 16px;
  margin-left: 20px;
}
.content-item {
  background: #ffffff;
  margin: 10px 20px;
  border-radius: 5px;
  width: 90%;
  padding: 3px 10px;
  border-bottom: 1px solid #ebeef5;
  border-top: 1px solid #ebeef5;

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

  .i-icon {
    margin-left: 10px;
    font-size: 15px;
  }

  .icon-template {
    color: #909399;
  }
  .delete-point {
    font-size: 16px;
    margin-left: 20px;
  }

  .right-icon {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
