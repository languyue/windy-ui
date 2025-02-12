<template>
  <div class="content">
    <div class="input-line" v-for="(item, num) in paramList" :key="num">
      <el-row>
        <el-col :span="8">
          <el-input
            size="mini"
            :disabled="!isEdit"
            v-model="item.variableKey"
            @pointerdown.stop.native
            @input="notifyData"
            placeholder="请输入参数名称"
          ></el-input>
        </el-col>
        <el-col :span="2">
          <div class="header-line">-</div>
        </el-col>
        <el-col :span="8">
          <el-input
            size="mini"
            :disabled="!isEdit"
            @pointerdown.stop.native
            @input="notifyData"
            v-model="item.variableValue"
            placeholder="请输入值"
          >
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-checkbox
            class="global-box"
            :disabled="!isEdit"
            v-model="item.global"
            >全局变量</el-checkbox
          >
        </el-col>
        <el-col :span="2" v-if="isEdit">
          <div @click="deleteValueItem(paramList, num)" class="delete-icon">
            <i class="el-icon-remove-outline" />
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="add-line" v-bind:class="{ 'disable-select': !isEdit }">
      <div @click="addItem" class="add-button">
        <i class="el-icon-plus" /> 新增
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    data: Array,
    isEdit: Boolean,
    point: String,
  },
  data() {
    return {
      paramList: [],
      pointId: '',
    }
  },
  methods: {
    addItem() {
      this.paramList.push({})
    },
    notifyData() {
      this.$emit('refreshVariable', {
        data: this.paramList,
        pointId: this.pointId,
      })
    },
    deleteValueItem(array, index) {
      array.splice(index, 1)
      if (array.length == 0) {
        array.push({
          variableKey: '',
          variableValue: '',
        })
      }
      this.notifyData()
    },
  },
  created() {
    this.pointId = this.point
    if (this.data) {
      this.paramList = this.data
      return
    }
    this.paramList.push({})
  },
}
</script>
<style scoped>
.content {
  padding: 5px 20px;
  min-height: 100px;
}
.add-line {
  position: relative;
  height: 30px;
  margin: 10px 20px;
}
.disable-select {
  color: #c0c4cc;
  border-color: #f2f6fc;
  pointer-events: none;
}
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
.header-line {
  text-align: center;
}
.delete-icon {
  cursor: pointer;
  font-size: 16px;
  color: #f56c6c;
  padding-left: 10px;
}
.input-line {
  margin: 10px;
}
.global-box {
  margin: 3px 5px 3px 10px;
}
</style>
