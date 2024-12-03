<template>
  <div>
    <el-form
      :model="infoForm"
      ref="infoForm"
      :rules="infoRule"
      size="small"
      :disabled="!isEdit"
      label-width="120px"
    >
      <el-form-item label="模版名称" prop="name">
        <el-input
          v-model="infoForm.name"
          placeholder="请输入模版名称"
          @input="dataChange"
        ></el-input>
      </el-form-item>
      <el-form-item label="模版类型" prop="invokeType">
        <el-radio-group v-model="infoForm.invokeType" @change="changeType">
          <el-radio :label="1">本地方法调用</el-radio>
          <el-radio :label="2">HTTP调用</el-radio>
          <el-radio :label="3">关联模版</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="关联模版" v-if="infoForm.invokeType == 3">
        <el-select
          v-model="infoForm.relatedId"
          placeholder="请选择关联的模版"
          @change="selectTemplate"
          clearable
        >
          <el-option
            v-for="item in uploadTemplates"
            :key="item.templateId"
            :label="item.name"
            :value="item.templateId"
          >
          </el-option>
        </el-select>
        <div class="related-div">
          <span v-if="infoForm.className"
            >关联模版类名: {{ infoForm.className }}</span
          >
          <span v-if="infoForm.methodName"
            >方法名: {{ infoForm.methodName }}</span
          >
        </div>
      </el-form-item>
      <el-form-item
        :label="infoForm.invokeType == 1 ? '类名' : 'Url'"
        prop="service"
      >
        <el-input v-model="infoForm.service" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="请求header" v-if="infoForm.invokeType != 1">
        <el-row v-for="(item, index) in headerList" :key="index">
          <el-col :span="10">
            <el-input
              size="mini"
              v-model="item.key"
              @input="dataChange"
              placeholder="请输入"
            ></el-input>
          </el-col>
          <el-col :span="2">
            <div class="header-line">-</div>
          </el-col>
          <el-col :span="10">
            <el-input
              size="mini"
              v-model="item.value"
              @input="dataChange"
              placeholder="请输入默认值"
            ></el-input>
          </el-col>
          <el-col :span="2">
            <i
              v-if="isEdit"
              class="el-icon-remove-outline op-icon"
              @click="removeHeader(index)"
            />
            <i
              class="el-icon-circle-plus-outline op-icon"
              v-if="index == headerList.length - 1 && isEdit"
              @click="addHeader"
            />
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="方法" prop="method">
        <el-input
          v-if="infoForm.invokeType == 1"
          v-model="infoForm.method"
          @input="dataChange"
          placeholder="请输入"
        ></el-input>
        <el-select
          v-else
          v-model="infoForm.method"
          @change="dataChange"
          placeholder="请选择"
        >
          <el-option
            v-for="item in httpMethods"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="参数列表">
        <el-row v-for="(item, num) in infoForm.params" :key="num">
          <el-col :span="3">
            <el-input
              size="mini"
              @input="dataChange"
              v-model="item.paramKey"
              placeholder="请输入参数名"
            ></el-input>
          </el-col>
          <el-col :span="1">
            <div class="header-line">-</div>
          </el-col>
          <el-col :span="3">
            <el-select
              v-model="item.type"
              placeholder="请选择参数类型"
              @change="dataChange"
            >
              <el-option
                v-for="item in paramTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="1">
            <div class="header-line">-</div>
          </el-col>
          <el-col :span="3">
            <el-input
              size="mini"
              v-model="item.description"
              placeholder="请输入参数描述"
              @input="dataChange"
            ></el-input>
          </el-col>
          <el-col :span="1">
            <div class="header-line">-</div>
          </el-col>
          <el-col :span="2">
            <el-select
              v-model="item.position"
              @change="dataChange"
              placeholder="参数位置"
            >
              <el-option
                v-for="item in positionList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="1">
            <div class="header-line">-</div>
          </el-col>
          <el-col :span="3">
            <el-input
              size="mini"
              @input="dataChange"
              v-model="item.initValue"
              placeholder="请输入默认值"
            ></el-input>
          </el-col>
          <el-col :span="2">
            <div class="delete-icon">
              <i
                v-if="isEdit"
                class="el-icon-remove-outline op-icon"
                @click="deleteItem(num)"
              />
              <i
                class="el-icon-circle-plus-outline op-icon"
                v-if="num == infoForm.params.length - 1 && isEdit"
                @click="addItem"
              />
            </div>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="infoForm.description"
          placeholder="请输入模版功能描述"
          type="textarea"
          @input="dataChange"
          :autosize="{ minRows: 2, maxRows: 4 }"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="isEdit">
        <el-button size="mini" type="primary" @click="submit('infoForm')"
          >确定</el-button
        >
        <el-button size="mini" type="info" @click="closeDialog">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import templateApi from '../../../http/Template'
export default {
  props: {
    config: Object,
    service: String,
    isEdit: Boolean,
    isCreate: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    service: {
      handler(val) {
        this.serviceId = val
      },
      deep: true,
      immediate: true,
    },
    config: {
      handler(val) {
        let rowData = JSON.parse(JSON.stringify(val))
        if (rowData.headers && Object.keys(rowData.headers).length > 0) {
          let array = []
          Object.keys(rowData.headers).forEach((key) => {
            array.push({ key: key, value: rowData.headers[key] })
          })
          this.headerList = array
        } else {
          this.headerList = [{ key: '', value: '' }]
        }

        if (!rowData.params || rowData.params.length == 0) {
          this.infoForm = rowData
          this.infoForm.params = [{ position: 'Body' }]
          return
        }

        rowData.params.forEach((e) => {
          if (this.isEmpty(e.initData)) {
            return
          }
          if (e.type == 2) {
            e.range = e.initData.range
          }
          e.initValue = e.initData.data
        })
        this.infoForm = rowData
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      uploadTemplates: [],
      serviceId: '',
      infoForm: {},
      headerList: [],
      infoRule: {
        name: [{ required: true, message: '请输入模版名称', trigger: 'blur' }],
        invokeType: [
          { required: true, message: '请选择执行类型', trigger: 'blur' },
        ],
        service: [{ required: true, message: '此项不能为空', trigger: 'blur' }],
        method: [{ required: true, message: '此项不能为空', trigger: 'blur' }],
        description: [
          { required: true, message: '模版描述不能为空', trigger: 'blur' },
        ],
      },
      options: [],
      paramTypeList: [
        { label: 'String', value: 'String' },
        { label: 'Map', value: 'Map' },
        { label: 'Array', value: 'Array' },
        { label: 'Integer', value: 'Integer' },
        { label: 'Float', value: 'Float' },
        { label: 'Double', value: 'Double' },
        { label: 'Boolean', value: 'Boolean' },
        { label: 'Object', value: 'Object' },
      ],
      httpMethods: [
        { label: 'Post', value: 'Post' },
        { label: 'Get', value: 'Get' },
        { label: 'Put', value: 'Put' },
        { label: 'Delete', value: 'Delete' },
      ],
      positionList: [
        { label: 'Body', value: 'Body' },
        { label: 'Path', value: 'Path' },
        { label: 'Query', value: 'Query' },
        { label: 'Header', value: 'Header' },
      ],
      pluginType: 5,
    }
  },
  methods: {
    selectTemplate() {
      this.infoForm.className = ''
      this.infoForm.methodName = ''
      this.uploadTemplates.forEach((e) => {
        if (e.templateId == this.infoForm.relatedId) {
          this.infoForm.className = e.service
          this.infoForm.methodName = e.method
        }
      })
    },
    changeType(type) {
      if (type != 3) {
        this.infoForm.relatedId = ''
        this.infoForm.className = ''
        this.infoForm.methodName = ''
      }
      templateApi.getTemplateByType(this.pluginType).then((res) => {
        this.uploadTemplates = res.data
      })
      this.dataChange()
    },
    isEmpty(value) {
      return !value || value == '' || value == null
    },
    removeHeader(index) {
      this.headerList.splice(index, 1)
    },
    addHeader() {
      this.headerList.push({})
    },
    deleteItem(index) {
      this.infoForm.params.splice(index, 1)
    },
    addItem() {
      this.infoForm.params.push({ position: 'Body' })
    },
    dataChange() {
      let data = JSON.parse(JSON.stringify(this.infoForm))
      data.params.forEach((e) => {
        e.initData = {
          data: e.initValue,
          range: e.range,
        }
      })

      let header = {}
      this.headerList.forEach((e) => {
        if (!e.key) {
          e.key = ''
        }
        if (!e.value) {
          e.value = ''
        }
        header[e.key] = e.value
      })
      data.headers = header
      this.$emit('dataChange', data)
    },
    submit(infoForm) {
      this.$refs[infoForm].validate((valid) => {
        if (!valid) {
          return false
        }

        let requestParam = JSON.parse(JSON.stringify(this.infoForm))

        let array = []
        requestParam.params.forEach((e) => {
          e.initData = {
            data: e.initValue ? e.initValue : '',
          }
          if (e.type == 2) {
            e.initData.range = e.range
          }

          if (e.type == 1 && this.isEmpty(e.value)) {
            e.initData.data = '{}'
          }

          if (e.paramKey) {
            array.push(e)
          }
        })
        requestParam.params = array

        let headers = {}
        if (this.headerList.length > 0) {
          this.headerList.forEach((e) => {
            if (this.isEmpty(e.key) || this.isEmpty(e.value)) {
              return
            }
            headers[e.key] = e.value
          })
        }
        requestParam.owner = this.serviceId
        requestParam.headers = headers

        if (!this.isCreate) {
          templateApi.updateTemplate(requestParam).then(() => {
            this.$notify.success({ message: `修改成功`, showClose: true })
            this.$emit('complete')
          })
          return
        }

        templateApi.createTemplate(requestParam).then(() => {
          this.$notify.success({ message: `添加成功`, showClose: true })
          this.$emit('complete')
        })
      })
    },
    closeDialog() {
      this.infoForm = { params: [{ position: 'Body' }] }
      this.$emit('complete')
    },
  },
  created() {
    this.changeType(3)
  },
}
</script>
<style lang="less" scoped>
.header-line {
  text-align: center;
}
.delete-icon {
  font-size: 20px;
  cursor: pointer;
}
.op-icon {
  margin-left: 10px;
  font-size: 16px;
  cursor: pointer;
}
.related-div {
  color: #c0c4cc;
  span {
    margin-left: 10px;
  }
}
</style>
