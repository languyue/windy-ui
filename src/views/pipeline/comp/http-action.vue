<template>
  <div>
    <el-divider content-position="left">动作触发配置</el-divider>
    <el-form-item label="POST请求方式">
      <el-radio-group v-model="dataForm.bodyType">
        <el-radio label="json">json</el-radio>
        <el-radio label="form-data">form-data</el-radio>
        <el-radio label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="动作触发地址">
      <el-input
        placeholder="请输入Action名称"
        v-model="dataForm.actionUrl"
        @input="notifyParam"
      />
    </el-form-item>
    <el-form-item label="参数列表">
      <el-row
        v-for="(item, index) in paramList"
        :key="index"
        class="config-line"
      >
        <el-col :span="5">
          <el-input
            placeholder="输入参数名"
            v-model="item.name"
            size="mini"
            @input="notifyParam"
          />
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="6">
          <el-input
            placeholder="输入参数描述"
            v-model="item.description"
            @input="notifyParam"
          />
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="4">
          <el-select size="mini" v-model="item.position" placeholder="参数位置">
            <el-option
              v-for="item in positionList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="5">
          <el-input
            placeholder="输入默认值"
            size="mini"
            v-model="item.value"
            @input="notifyParam"
          />
        </el-col>
        <el-col :span="1" class="delete-icon"
          ><i class="el-icon-remove-outline" @click="deleteParam(index)"
        /></el-col>
      </el-row>
      <div class="add-btn" @click="addNewItem">新增参数</div>
    </el-form-item>

    <el-divider content-position="left">状态查询配置</el-divider>
    <el-form-item label="状态查询地址">
      <el-input
        placeholder="请输入状态查询地址"
        size="mini"
        v-model="dataForm.queryUrl"
        @input="notifyParam"
      />
    </el-form-item>
    <el-form-item>
      <template slot="label">
        循环查询条件
        <el-tooltip placement="top">
          <div slot="content">
            任务触发后windy会查询任务状态,查询结果后根据期望值与状态接口返回值比较，以此来确认任务执行状态。<br />
            如果不希望只查询一次可通过配置判断判断条件，实现状态轮训的功能。<br />(默认超时时间1小时)
          </div>
          <i class="el-icon-question tip" />
        </el-tooltip>
      </template>
      <el-row>
        <el-col :span="4">
          <el-input
            size="mini"
            placeholder="比较Key"
            v-model="loopQuery.compareKey"
            @input="notifyParam"
          />
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="4">
          <el-select
            size="mini"
            v-model="loopQuery.valueType"
            placeholder="选择数据类型"
            @change="notifyParam"
          >
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="4">
          <el-select
            size="mini"
            v-model="loopQuery.operator"
            placeholder="选择运算服符"
            @change="notifyParam"
          >
            <el-option
              v-for="item in operators"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="4">
          <el-input
            size="mini"
            placeholder="设置期望值"
            v-model="loopQuery.value"
            @input="notifyParam"
          />
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item label="结果条件列表">
      <template slot="label">
        结果状态判断列表
        <el-tooltip placement="top">
          <div slot="content">
            根据轮训接口返回的结果判断任务是否成功，<br />例如配置:比较Key为result,
            期待值1 代表接口返回的json格式数据的result字段值为1时任务执行成功
          </div>
          <i class="el-icon-question tip" />
        </el-tooltip>
      </template>
      <el-row
        v-for="(item, index) in compareList"
        :key="index"
        class="config-line"
      >
        <el-col :span="4">
          <el-input
            placeholder="比较Key"
            v-model="item.compareKey"
            @input="notifyParam"
          />
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="4">
          <el-input
            placeholder="描述"
            v-model="item.description"
            @input="notifyParam"
          />
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="4">
          <el-select
            v-model="item.valueType"
            placeholder="选择数据类型"
            @change="notifyParam"
          >
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="3">
          <el-select
            v-model="item.operator"
            placeholder="选择运算服符"
            @change="notifyParam"
          >
            <el-option
              v-for="item in operators"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1" class="separate-line">-</el-col>
        <el-col :span="4">
          <el-input
            placeholder="设置期望值"
            v-model="item.value"
            @input="notifyParam"
          />
        </el-col>
        <el-col :span="1" class="delete-icon"
          ><i class="el-icon-remove-outline" @click="deleteCompare(index)"
        /></el-col>
      </el-row>
      <div class="add-btn" @click="addNewCondition">新增条件</div>
    </el-form-item>
  </div>
</template>
<script>
import Template from '../../feature/template.vue'
export default {
  props: {
    form: Object,
    Template,
  },
  watch: {
    form: {
      handler(val) {
        this.dataForm = val
        if (val.paramList && val.paramList.length > 0) {
          this.paramList = val.paramList
        }
        if (val.compareResults && val.compareResults.length > 0) {
          this.compareList = val.compareResults
        }
        this.notifyParam()
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      loopQuery: {},
      dataForm: {},
      paramList: [{ position: 'Body' }],
      compareList: [{ showCompare: true }],
      operators: [
        { label: '等值(字符串、值比较时使用)', value: 'equal' },
        { label: '大于', value: '>' },
        { label: '大于等于', value: '>=' },
        { label: '等于（数字时使用）', value: '=' },
        { label: '小于', value: '<' },
        { label: '小于等于', value: '<=' },
      ],
      typeList: [
        { label: '数字类型', value: 'Integer' },
        { label: '字符串类型', value: 'String' },
      ],
      positionList: [
        { label: 'Body', value: 'Body' },
        { label: 'Path', value: 'Path' },
        { label: 'Query', value: 'Query' },
        { label: 'Header', value: 'Header' },
      ],
    }
  },
  methods: {
    deleteCompare(index) {
      if (this.compareList.length == 1) {
        return
      }
      this.compareList.splice(index, 1)
    },
    deleteParam(index) {
      this.paramList.splice(index, 1)
    },
    notifyParam() {
      this.$emit('notifyParam', {
        paramList: this.paramList,
        compareList: this.compareList,
        actionUrl: this.dataForm.actionUrl,
        queryUrl: this.dataForm.queryUrl,
      })
    },
    changeBodyType(value) {
      if (value == 'none') {
        this.paramList = []
      } else {
        if (this.paramList.length < 1) {
          this.paramList.push({ position: 'Body' })
        }
      }
    },
    addNewItem() {
      this.paramList.push({ position: 'Body' })
    },
    addNewCondition() {
      this.compareList.push({ showCompare: true })
    },
  },
  destroyed() {
    this.paramList = []
  },
  created() {
    this.dataForm = this.form
    this.notifyParam()
  },
}
</script>
<style scoped>
.separate-line {
  text-align: center;
}
.delete-icon {
  color: #f56c6c;
  padding-left: 10px;
  cursor: pointer;
}
.add-btn {
  height: 30px;
  line-height: 30px;
  text-align: center;
  vertical-align: middle;
  border: 1px dashed #ccc;
  margin: 10px 20%;
  cursor: pointer;
}
.config-line {
  margin: 0 0 10px 0px;
}
.tip {
  cursor: pointer;
}
</style>
