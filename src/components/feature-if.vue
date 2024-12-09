<template>
  <div>
    <div class="if-content">
      <div class="if-condition">
        <span>if (</span>
        <el-input
          v-if="compareItem.showCustom"
          :disabled="!isEdit"
          v-model="condition"
          placeholder="请输入ongl表达式"
          @input="notifyData"
          @pointerdown.stop.native
          size="mini"
          class="condition-input"
          inline
        />
        <el-row v-else class="condition-input" :gutter="20">
          <el-col :span="6">
            <div class="item">
              <el-input
                size="mini"
                @pointerdown.stop.native
                :disabled="!isEdit"
                v-model="compareItem.compareKey"
                @input="notifyCompare"
                placeholder="请输入比较参数"
              ></el-input>
            </div>
          </el-col>
          <el-col :span="5">
            <div class="item">
              <el-select
                :disabled="!isEdit"
                v-model="compareItem.operator"
                placeholder="选择运算符"
                @change="selectOperator"
                size="mini"
              >
                <el-option
                  v-for="(item, index) in operatorList"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="12">
            <el-row :gutter="10">
              <el-col
                :span="10"
                v-if="
                  compareItem.operator == 'array_item_match' ||
                  compareItem.operator == 'none_item_match'
                "
              >
                <el-input
                  size="mini"
                  :disabled="!isEdit"
                  @input="notifyCompare"
                  @pointerdown.stop.native
                  v-model="compareItem.propertyKey"
                  placeholder="比较的属性Key"
                ></el-input>
              </el-col>
              <el-col
                v-if="compareItem.operator != 'not_null'"
                :span="
                  compareItem.operator == 'array_item_match' ||
                  compareItem.operator == 'none_item_match'
                    ? 14
                    : 22
                "
              >
                <div>
                  <el-input
                    size="mini"
                    :disabled="!isEdit"
                    @input="notifyCompare"
                    @pointerdown.stop.native
                    v-model="compareItem.expectValue"
                    placeholder="请输入期望值"
                  >
                  </el-input>
                </div>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <span>)</span
        ><el-checkbox v-model="compareItem.showCustom">自定义条件</el-checkbox>
      </div>
      {
      <div>
        <draggable
          class="if-list"
          v-model="points"
          @add="addPoint"
          v-bind="dragOptions"
        >
          <div
            v-for="(executePoint, index) in points"
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
                  @refreshData="refreshValue"
                />
              </div>
            </collapse>
            <!-- 执行点内容结束 -->
          </div>
          <!-- <el-collapse accordion :key="uuid">
            <el-collapse-item
              v-for="(executePoint, index) in points"
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
import featureApi from '../http/Feature'
import draggable from 'vuedraggable'
import FeatureTemplate from './feature-template'
export default {
  props: {
    data: Object,
    isEdit: Boolean,
  },
  components: {
    draggable,
    FeatureTemplate,
  },
  data() {
    return {
      executeData: {},
      size: '',
      points: [],
      uuid: '',
      condition: '',
      showCustom: false,
      compareItem: {},
      operatorList: [],
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
      localStorage.setItem('copyItem', JSON.stringify(copyItem))
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: `执行点<strong>[${copyItem.description}]</strong>已复制`,
        type: 'success',
      })
    },
    notifyCompare() {
      let compareItem = this.compareItem || {} // 确保 compareItem 存在
      let keys = ['compareKey', 'operator', 'propertyKey', 'expectValue']

      let condition = keys
        .map((key) => `[${compareItem[key] || ''}]`) // 如果值不存在则设置为空字符串
        .join('')
      console.log('notify compare', condition)
      this.executeData.service = condition
      this.notifyData()
      this.$forceUpdate()
    },
    parseCompare(input) {
      // 使用正则匹配方括号中的内容
      const regex = /\[(.*?)\]/g
      const result = []
      let match

      // 逐个匹配
      while ((match = regex.exec(input)) !== null) {
        result.push(match[1] || '') // 提取方括号内的内容
      }

      return result
    },
    selectOperator() {
      this.notifyCompare()
    },
    diaplayString(item) {
      this.showDetail = true
      this.jsonStr = item.expectValue
    },
    addPoint(e) {
      let index = e.newIndex
      let currentElement = this.points[index]
      if (
        currentElement.executeType == 2 ||
        currentElement.executeType == 3 ||
        currentElement.executeType == 7
      ) {
        this.$notify.warning('不支持嵌套if、for、异步组件')
        this.points.splice(index, 1)
        return
      }
      if (!this.points[index].randomId) {
        this.points[index].randomId = this.$utils.randomString(20)
        this.points[index].writeType = '1'
        this.points[index].sortOrder = e.newIndex
      }

      this.isEdit = true
      this.uuid = new Date().valueOf()

      this.notifyData()
    },
    notifyData() {
      this.refreshValue()
    },
    refreshValue(update) {
      let array = []
      this.points.forEach((e) => {
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
          featureId: this.executeData.featureId,
          randomId: e.randomId,
          compareDefine: e.compareDefine,
          variableDefine: e.variableDefine,
          executeType: e.executeType,
        }
        array.push(point)
      })

      let data = JSON.parse(JSON.stringify(this.executeData))
      data.method = this.condition
      data.executePoints = JSON.parse(JSON.stringify(array))
      this.$emit('refreshData', {
        data: data,
      })
    },
    getOperators() {
      this.operatorList = []
      featureApi.getExecuteOperators().then((res) => {
        res.data.forEach((e) => {
          this.operatorList.push({
            label: e.description,
            value: e.operator,
          })
        })
      })
    },
    deleteExecutePoint(index) {
      this.points.splice(index, 1)
      this.refreshValue()
      this.uuid = this.$utils.randomString(20)
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
      this.refreshValue()
      this.uuid = this.$utils.randomString(20)
    },
  },
  created() {
    this.executeData = this.data

    this.points = []
    if (this.data.executePoints) {
      this.data.executePoints.forEach((point) => {
        point.executorUnit.randomId = this.$utils.randomString(20)
        let item = point.executorUnit
        item.writeType = '1'
        item.description = point.description
        item.executeType = point.executeType
        item.compareDefine = point.compareDefine
        item.variableDefine = point.variableDefine
        this.points.push(item)
      })
    }

    if (this.data.method) {
      this.condition = this.data.method
    }

    if (this.data.service) {
      let splitArray = this.parseCompare(this.data.service)
      this.compareItem.compareKey = splitArray[0]
      this.compareItem.operator = splitArray[1]
      this.compareItem.propertyKey = splitArray[2]
      this.compareItem.expectValue = splitArray[3]
    }
    this.getOperators()
  },
}
</script>
<style lang="less" scoped>
.if-content {
  margin: 5px;
  border: 2px dashed #dcdfe6;
  padding: 10px;
  min-width: 520px;
  border-radius: 4px;

  .if-condition {
    margin: 1px;
    border: 1px dashed #dcdfe6;
    padding: 5px;

    span {
      height: 30px;
      line-height: 30px;
      font-weight: 900;
      font-size: 18px;
      margin-right: 10px;
    }

    .condition-input {
      width: 80%;
      display: inline-block;
    }
  }

  .if-list {
    min-height: 100px;

    .delete-point {
      font-size: 16px;
      margin-left: 20px;
    }
  }
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
