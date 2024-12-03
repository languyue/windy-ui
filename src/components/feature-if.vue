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
          group="api"
          animation="100"
        >
          <el-collapse accordion :key="uuid">
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
          </el-collapse>
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
  methods: {
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
      let index = e.newIndex == 0 ? 0 : e.newIndex - 1
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
          featureId: this.executeData.pointId,
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
      this.$confirm('确认删除用例执行点?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.points.splice(index, 1)
        this.refreshValue()
        this.uuid = this.$utils.randomString(20)
      })
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
</style>
