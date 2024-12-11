<template>
  <div>
    <!-- 数组类型数据展示开始 -->
    <div v-if="data.type == 'Array'">
      <div class="array-plus">
        <span @click="addParam" v-if="isEdit"
          ><i class="el-icon-circle-plus-outline" /> 新增</span
        >
      </div>
      <div v-if="data.initData.rangeType == 'Object'" :key="editId">
        <div
          class="array-show-box"
          v-for="(valueItem, order) in data.value"
          :key="order"
        >
          <el-row>
            <el-col :span="22">
              <el-row
                v-for="(obj, index) in valueItem.rangeList"
                :key="index"
                class="item-line"
              >
                <el-col :span="4">
                  <div class="param_name">{{ obj.paramKey }}:</div>
                </el-col>
                <el-col :span="20">
                  <FeatureEdit
                    :point="pointId"
                    :feature="obj"
                    :isEdit="isEdit"
                    @refreshData="refreshArrayValue($event, order)"
                  />
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="2">
              <div class="array-delete" v-if="isEdit">
                <span @click="deleteArray(order)"
                  ><i class="el-icon-remove-outline" /> 删除</span
                >
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <div v-else>
        <div
          class="array-show-box"
          v-for="(item, index) in paramList"
          :key="index"
        >
          <el-row>
            <el-col :span="20">
              <el-input
                size="small"
                :disabled="!isEdit"
                v-model="item.content"
                @input="refreshList(index)"
              ></el-input>
            </el-col>
            <el-col :span="4">
              <div class="array-delete" v-if="isEdit">
                <span @click="deleteList(index)"
                  ><i class="el-icon-remove-outline" /> 删除</span
                >
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <!-- 数组类型数据展示结束 -->

    <!-- Object数据类型展示开始 -->
    <div v-else-if="data.type == 'Object'">
      <span v-if="paramList.length > 0">
        <el-row
          v-for="(obj, index) in paramList"
          :key="index"
          class="item-line"
        >
          <el-col :span="4">
            <div class="param_name">{{ obj.paramKey }}:</div>
          </el-col>
          <el-col :span="15">
            <FeatureEdit
              :point="pointId"
              :feature="obj"
              :isEdit="isEdit"
              @refreshData="refreshObjectValue"
            />
          </el-col>
        </el-row>
      </span>
      <el-input
        v-else
        v-model="data.valueString"
        :key="objId"
        :disabled="!isEdit"
        @input="inputJson"
        @pointerdown.stop.native
        size="mini"
        placeholder="请输入body对应的json格式,无需转换json字符串"
      >
        <span slot="prepend">JSON内容</span>
        <!-- <span v-if="!data.verify" style="color: #f56c6c" slot="suffix"
          >json格式错误</span
        > -->
      </el-input>
    </div>
    <!-- Object数据类型展示结束 -->

    <!-- Map数据类型展示开始 -->
    <div v-else-if="data.type == 'Map'">
      <el-row v-for="(item, num) in paramList" :key="num" :gutter="10">
        <el-col :span="7">
          <el-input
            size="mini"
            :disabled="!isEdit"
            v-model="item.keyName"
            @input="notifyData"
            placeholder="请输入键"
          >
            <div style="height: 28; line-height: 28px" slot="suffix">键</div>
          </el-input>
        </el-col>
        <el-col :span="1">
          <div class="header-line">-</div>
        </el-col>
        <el-col :span="7">
          <el-input
            size="mini"
            :disabled="!isEdit"
            @input="notifyData"
            v-model="item.keyValue"
            placeholder="请输入值"
          >
            <div style="height: 28; line-height: 28px" slot="suffix">值</div>
          </el-input>
        </el-col>
        <el-col :span="5" v-if="isEdit">
          <el-select v-model="item.valueType" placeholder="请选择" size="mini">
            <el-option label="字符串" value="String"> </el-option>
            <el-option label="整数" value="Integer"> </el-option>
            <el-option label="布尔值" value="Boolean"> </el-option>
            <el-option label="浮点数" value="Float"> </el-option>
          </el-select>
        </el-col>
        <el-col :span="3">
          <div v-if="isEdit" class="op-icon">
            <i
              class="el-icon-remove-outline"
              @click="deleteValueItem(data.value, num)"
            />
            <i class="el-icon-circle-plus-outline" @click="addValueItem" />
          </div>
        </el-col>
      </el-row>
    </div>
    <!-- Map数据类型展示结束 -->

    <!-- Integer数据类型展示开始 -->
    <div v-else-if="data.type == 'Integer' || data.type == 'Long'">
      <el-autocomplete
        style="width: 400px"
        v-if="backshow"
        size="small"
        :disabled="!isEdit"
        v-model="data.value"
        @input="notifyData"
        :fetch-suggestions="querySearch"
        @pointerdown.stop.native
        :placeholder="data.description"
        @select="handleSelect"
      >
        <el-button
          slot="append"
          @click="diaplayString(data.value)"
          icon="el-icon-full-screen"
        ></el-button
      ></el-autocomplete>
      <el-input-number
        size="small"
        v-else
        :disabled="!isEdit"
        v-model="data.value"
        @input="notifyData"
        @pointerdown.stop.native
        controls-position="right"
        :placeholder="data.description"
      ></el-input-number>
      <el-checkbox
        style="margin-left: 10px"
        :disabled="!isEdit"
        v-model="backshow"
        >使用变量</el-checkbox
      >
    </div>
    <!-- Integer数据类型展示结束 -->

    <!-- Integer数据类型展示开始 -->
    <div v-else-if="data.type == 'Boolean'">
      <el-autocomplete
        style="width: 400px"
        v-if="backshow"
        size="small"
        :disabled="!isEdit"
        v-model="data.value"
        @input="notifyData"
        :fetch-suggestions="querySearch"
        @pointerdown.stop.native
        :placeholder="data.description"
        @select="handleSelect"
      >
        <el-button
          slot="append"
          @click="diaplayString(data.value)"
          icon="el-icon-full-screen"
        ></el-button
      ></el-autocomplete>
      <el-switch
        size="small"
        :disabled="!isEdit"
        v-model="data.value"
        @change="notifyData"
        active-color="#13ce66"
        inactive-color="#909399"
      >
      </el-switch>
      <el-checkbox
        style="margin-left: 10px"
        :disabled="!isEdit"
        v-model="backshow"
        >使用变量</el-checkbox
      >
    </div>
    <!-- Integer数据类型展示结束 -->

    <!-- Integer数据类型展示开始 -->
    <div v-else-if="data.type == 'Float'">
      <el-autocomplete
        style="width: 400px"
        v-if="backshow"
        size="small"
        :disabled="!isEdit"
        v-model="data.value"
        @input="notifyData"
        :fetch-suggestions="querySearch"
        @pointerdown.stop.native
        :placeholder="data.description"
        @select="handleSelect"
      >
        <el-button
          slot="append"
          @click="diaplayString(data.value)"
          icon="el-icon-full-screen"
        ></el-button
      ></el-autocomplete>
      <el-input-number
        size="small"
        :precision="2"
        :step="0.1"
        :disabled="!isEdit"
        v-model="data.value"
        @input="notifyData"
        @pointerdown.stop.native
        controls-position="right"
        :placeholder="data.description"
      ></el-input-number>
      <el-checkbox
        style="margin-left: 10px"
        :disabled="!isEdit"
        v-model="backshow"
        >使用变量</el-checkbox
      >
    </div>
    <!-- Integer数据类型展示结束 -->

    <!-- Integer数据类型展示开始 -->
    <div v-else-if="data.type == 'Double'">
      <el-autocomplete
        style="width: 400px"
        v-if="backshow"
        size="small"
        :disabled="!isEdit"
        v-model="data.value"
        @input="notifyData"
        :fetch-suggestions="querySearch"
        @pointerdown.stop.native
        :placeholder="data.description"
        @select="handleSelect"
      >
        <el-button
          slot="append"
          @click="diaplayString(data.value)"
          icon="el-icon-full-screen"
        ></el-button
      ></el-autocomplete>
      <el-input-number
        size="small"
        :precision="2"
        :step="0.1"
        :disabled="!isEdit"
        v-model="data.value"
        @input="notifyData"
        @pointerdown.stop.native
        controls-position="right"
        :placeholder="data.description"
      ></el-input-number>
      <el-checkbox
        style="margin-left: 10px"
        :disabled="!isEdit"
        v-model="backshow"
        >使用变量</el-checkbox
      >
    </div>
    <!-- Integer数据类型展示结束 -->

    <!-- 默认数据类型展示开始 -->
    <el-autocomplete
      v-else
      size="small"
      :disabled="!isEdit"
      v-model="data.value"
      @input="notifyData"
      :fetch-suggestions="querySearch"
      @pointerdown.stop.native
      :placeholder="data.description"
      @select="handleSelect"
    >
      <el-button
        slot="append"
        @click="diaplayString(data.value)"
        icon="el-icon-full-screen"
      ></el-button
    ></el-autocomplete>
    <!-- 默认数据类型展示结束 -->

    <el-dialog
      title="数据编辑"
      :visible.sync="showDetail"
      @close="closeEditor"
      width="60%"
    >
      <codeeditor
        ref="editer"
        :codes="jsonStr"
        :readonly="!isEdit"
        @change="changeEditValue"
      ></codeeditor>
    </el-dialog>
  </div>
</template>
<script>
import FeatureEdit from '@/components/feature-edit'
import codeeditor from '@/components/CodeEditor.vue'
export default {
  name: 'FeatureEdit',
  props: {
    feature: Object,
    isEdit: Boolean,
    point: String,
    case: String,
  },
  components: {
    FeatureEdit,
    codeeditor,
  },
  watch: {
    feature() {
      // this.data = JSON.parse(JSON.stringify(val))
      // this.exchangeDataValue()
    },
  },
  data() {
    return {
      pointId: '',
      data: {
        value: [],
      },
      paramList: [],
      uniqId: '',
      jsonStr: '',
      showDetail: false,
      backshow: false,
      contextList: [],
      originString: '',
      objId: '1',
      editId: '1',
    }
  },
  methods: {
    inputJson(data) {
      let jsonVerify = function (str) {
        try {
          JSON.parse(str)
          return true
        } catch (e) {
          return false
        }
      }
      this.data.verify = jsonVerify(data)
      if (this.data.verify) {
        this.data.value = JSON.parse(data)
        this.notifyData()
      }
    },
    isValidPlaceholder(str) {
      // 检查是否以 `${` 开始
      if (!str.startsWith('$')) {
        return false
      }
      // 获取 `${` 之后的字符串
      const remaining = str.slice(2)
      // 检查是否包含 `}`
      if (!remaining.includes('}')) {
        return true
      }
      // 提取 `${` 和 `}` 之间的部分
      const betweenBraces = remaining.split('}')[0]
      // 检查 `${` 和 `}` 之间是否为空或只包含空格
      return betweenBraces.trim().length === 0
    },
    querySearch(queryString, cb) {
      this.originString = queryString
      if (queryString && this.isValidPlaceholder(queryString)) {
        let filterText = queryString.replace('$', '')

        var globalContext = JSON.parse(JSON.stringify(this.contextList))
        var results = filterText
          ? globalContext.filter(this.createFilter(filterText))
          : globalContext
        results.push({ value: '$RandomString(6)' })
        results.push({ value: '$RandomInteger(1,10)' })
        cb(results)
      } else {
        cb([])
      }
    },
    createFilter(queryString) {
      return (globalString) => {
        return (
          globalString.value
            .toLowerCase()
            .indexOf(queryString.toLowerCase()) === 0
        )
      }
    },
    handleSelect(item) {
      if (item.value.indexOf('$Random') != -1) {
        this.data.value = item.value
      } else {
        this.data.value = '${' + item.value + '}'
      }
    },
    changeEditValue() {
      this.notifyData()
      this.data.value = this.$refs.editer.getValue()
    },
    closeEditor() {
      this.showDetail = false
    },
    deleteArray(index) {
      this.data.value.splice(index, 1)
      this.notifyData()
    },
    addParam() {
      if (this.data.initData.rangeType == 'Object') {
        let rangeList = []
        this.data.initData.range.forEach((e) => {
          let item = JSON.parse(JSON.stringify(e))
          item.value = null
          rangeList.push(item)
        })
        this.data.value.push({
          rangeList: rangeList,
        })
      } else {
        this.paramList.push({
          content: '',
        })
      }
      // this.$forceUpdate()
    },
    deleteList(index) {
      this.paramList.splice(index, 1)
      this.refreshList()
    },
    refreshObjectValue(event) {
      this.data.value = this.data.value ? this.data.value : {}
      if (this.data.initData.range) {
        this.data.initData.range.forEach((e) => {
          if (e.paramKey == event.item.paramKey) {
            e.value = event.item.value
          }

          this.data.value[e.paramKey] = e.value
        })
        this.notifyData()
      }
    },
    refreshList() {
      let array = []
      this.paramList.forEach((e) => {
        array.push(e.content)
      })
      this.data.value = array
      this.notifyData()
    },
    refreshArrayValue(event, index) {
      this.$set(this.data.value[index], event.item.paramKey, event.item.value)
      this.notifyData()
    },
    diaplayString(str) {
      this.showDetail = true
      this.jsonStr = str
    },
    notifyData() {
      let data = JSON.parse(JSON.stringify(this.data))
      if (this.data.type == 'Map') {
        let item = {}
        this.paramList.forEach((e) => {
          if (e.valueType == 'Float') {
            item[e.keyName] = parseFloat(e.keyValue)
          } else if (e.valueType == 'Integer') {
            item[e.keyName] = parseInt(e.keyValue)
          } else if (e.valueType == 'Boolean') {
            item[e.keyName] = e.keyValue == 'true'
          } else {
            item[e.keyName] = e.keyValue
          }
        })
        data.value = item
        data.paramKey = this.data.paramKey
      }

      this.$emit('refreshData', {
        item: data,
        pointId: this.pointId,
      })
      // this.$forceUpdate()
    },
    matchMap(map) {
      let array = []
      if (map == null || map == undefined) {
        array.push({
          keyName: '',
          keyValue: '',
          valueType: 'String',
        })
        return array
      }

      for (var name in map) {
        array.push({
          keyName: name,
          keyValue: map[name],
          valueType: 'String',
        })
      }

      if (array.length == 0) {
        array.push({
          keyName: '',
          keyValue: '',
          valueType: 'String',
        })
      }
      return array
    },
    deleteValueItem(array, index) {
      this.paramList.splice(index, 1)
      if (this.paramList.length == 0) {
        this.paramList.push({
          keyName: '',
          keyValue: '',
        })
      }
      this.notifyData()
    },
    addValueItem() {
      this.paramList.push({
        keyName: '',
        keyValue: '',
      })
    },
    exchangeDataValue() {
      if (!this.data.value && this.data.type == 'Boolean') {
        this.data.value = false
      }

      if (this.data.type == 'Map') {
        this.paramList = this.matchMap(this.data.value)
      }
      //====数组数据处理开始=====
      if (
        this.data.value &&
        this.data.type == 'Array' &&
        this.data.initData.rangeType != 'Object'
      ) {
        this.paramList = []
        this.data.value.forEach((e) => {
          this.paramList.push({ content: e })
        })
      }
      if (
        this.data.value &&
        this.data.initData &&
        this.data.initData.rangeType == 'Object'
      ) {
        let rangList = this.data.initData.range
        this.data.value.forEach((e) => {
          e.rangeList = []
          rangList.forEach((ele) => {
            let item = e[ele.paramKey]
            ele.value = item ? item : ''
          })
          e.rangeList = JSON.parse(JSON.stringify(rangList))
        })
      }
      if (!this.data.value && this.data.type == 'Array') {
        this.data.value = []
      }
      //====数组数据处理结束=====

      //====Object数据处理开始====
      if (this.data.type == 'Object') {
        this.data.value = this.data.value ? this.data.value : null
        let objData = JSON.parse(JSON.stringify(this.data))
        this.paramList = []
        if (objData.initData && objData.initData.range) {
          objData.initData.range.forEach((e) => {
            if (this.data.value) {
              e.value = this.data.value[e.paramKey]
            }
            this.paramList.push(e)
          })
        } else {
          this.objId = this.$utils.randomString(20)
          this.$set(
            this.data,
            'valueString',
            this.data.value ? JSON.stringify(this.data.value) : ''
          )
        }
      }
      //====Object数据处理结束====

      if (!this.data.value && this.data.initData && this.data.initData.data) {
        this.data.value = this.data.initData.data
      }

      if (
        this.data.type != 'String' &&
        this.data.type != 'Map' &&
        this.data.type != 'Array' &&
        this.data &&
        this.data.value &&
        (this.data.value + '').indexOf('$') != -1
      ) {
        this.backshow = true
      }
    },
  },
  created() {
    let array = this.$store.state.caseContext[this.case]
    if (array) {
      array.forEach((e) => {
        this.contextList.push({ value: e })
      })
    }

    this.pointId = this.point
    this.data = this.feature
    this.exchangeDataValue()
  },
}
</script>
<style scoped>
.header-line {
  text-align: center;
}

.op-icon i {
  margin-left: 10px;
  font-size: 16px;
  cursor: pointer;
}
.item-line {
  margin: 10px 0px;
}

.array-show-box {
  padding: 4px 8px;
  background-color: #ecf8ff;
  border-radius: 4px;
  border-left: 10px solid #50bfff;
  margin: 0px 10px 10px 10px;
}
.array-plus {
  margin: 10px;
}
.array-plus span {
  cursor: pointer;
}
.array-delete {
  cursor: pointer;
  display: flex;
  color: #f56c6c;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.param_name {
  height: 30px;
  line-height: 30px;
  float: right;
  margin-right: 10px;
  color: #606266;
  vertical-align: middle;
  text-align: center;
}
</style>
