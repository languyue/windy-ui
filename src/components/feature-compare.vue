<template>
  <div class="line">
    <el-row v-for="(item, num) in compareData" :key="num">
      <el-col :span="6">
        <div class="item">
          <el-input
            size="mini"
            @pointerdown.stop.native
            :disabled="!isEdit"
            v-model="item.compareKey"
            @input="notifyData"
            placeholder="请输入响应参数"
          ></el-input>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="item">
          <el-select
            :disabled="!isEdit"
            v-model="item.operator"
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
            :span="8"
            v-if="
              item.operator == 'array_item_match' ||
              item.operator == 'none_item_match'
            "
          >
            <el-input
              size="mini"
              :disabled="!isEdit"
              @input="notifyData"
              @pointerdown.stop.native
              v-model="item.propertyKey"
              placeholder="比较的属性Key"
            ></el-input>
          </el-col>
          <el-col
            v-if="item.operator != 'not_null'"
            :span="
              item.operator == 'array_item_match' ||
              item.operator == 'none_item_match'
                ? 16
                : 24
            "
          >
            <div>
              <el-input
                size="mini"
                :disabled="!isEdit"
                @input="notifyData"
                @pointerdown.stop.native
                v-model="item.expectValue"
                placeholder="请输入期望值"
              >
                <template slot="append">
                  <i class="el-icon-full-screen" @click="diaplayString(item)" />
                </template>
              </el-input>
            </div>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="1">
        <div class="delete-div">
          <i
            class="el-icon-remove-outline delete-icon"
            v-bind:class="{ 'disable-icon': !isEdit }"
            @click="deleteValueItem(compareData, num)"
          />
        </div>
      </el-col>
    </el-row>
    <div
      class="add-line"
      @click="addItem"
      v-bind:class="{ 'disable-select': !isEdit }"
    >
      <div class="add-button"><i class="el-icon-plus" /> 新增</div>
    </div>

    <el-dialog
      title="数据编辑"
      :visible.sync="showDetail"
      @close="closeEditor"
      width="60%"
    >
      <monaco ref="editer" :codes="jsonStr" :readonly="false"></monaco>
    </el-dialog>
  </div>
</template>
<script>
import featureApi from '../http/Feature'
import monaco from '@/components/MonacoEditor.vue'
export default {
  props: {
    data: Array,
    point: String,
    isEdit: Boolean,
  },
  components: {
    monaco,
  },
  data() {
    return {
      showDetail: false,
      operator: '',
      operatorList: [],
      compareData: [],
      disableSelect: 'disable-select',
      pointId: '',
      jsonStr: '',
      chooseItem: null,
    }
  },
  methods: {
    selectOperator() {
      this.notifyData()
    },
    closeEditor() {
      this.chooseItem.expectValue = this.$refs.editer.getValue()
    },
    diaplayString(item) {
      this.chooseItem = item
      this.showDetail = true
      this.jsonStr = item.expectValue
    },
    deleteValueItem(array, index) {
      array.splice(index, 1)
      if (array.length == 0) {
        array.push({
          keyName: '',
          keyValue: '',
        })
      }
      this.notifyData()
    },
    notifyData() {
      let array = JSON.parse(JSON.stringify(this.compareData))
      array.forEach((item) => {
        if (item.propertyKey) {
          item.expectValue =
            '{' +
            item.propertyKey +
            '}' +
            (item.expectValue ? item.expectValue : '')
        }
      })

      this.$emit('refreshCompare', {
        data: array,
        pointId: this.pointId,
      })
    },
    addItem() {
      this.compareData.push({})
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
    isEmptyArray(array) {
      if (array == null || array == undefined || array.length == 0) {
        return true
      }
      return false
    },
    parseString(str) {
      const regex = /\{(.*?)\}(.*)/
      const match = str.match(regex)

      if (match) {
        const identifier = match[1] // 提取 aa
        const content = match[2] // 提取 huhu
        return { identifier, content }
      } else {
        return { identifier: '', content: str } // 不符合格式时将整个字符串作为 content
      }
    },
  },
  created() {
    this.pointId = this.point
    this.compareData = this.data
    console.log('compareData', this.compareData)
    if (this.isEmptyArray(this.compareData)) {
      this.compareData = [{}]
    } else {
      this.compareData.forEach((e) => {
        if (
          e.expectValue &&
          (e.operator == 'array_item_match' || e.operator == 'none_item_match')
        ) {
          console.log('dddddd', e.expectValue)
          let item = this.parseString(e.expectValue)
          e.propertyKey = item.identifier
          e.expectValue = item.content
        }
      })
    }

    this.selectOperator()
    this.getOperators()
  },
}
</script>
<style scoped>
.add-button {
  border: 1px dashed #dcdfe6;
  border-radius: 3px;
  width: 200px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  vertical-align: middle;
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
}
.add-line {
  position: relative;
  margin: 10px 20px;
}
.line {
  padding: 5px 20px;
  min-height: 100px;
}
.item {
  margin: 2px 5px;
}
.delete-icon {
  cursor: pointer;
  font-size: 16px;
  color: #f56c6c;
}
.delete-div {
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
}
.disable-select {
  color: #c0c4cc;
  border-color: #f2f6fc;
  pointer-events: none;
}
.disable-icon {
  display: none;
}
</style>
