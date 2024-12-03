<template>
  <div>
    <div class="title">
      <div class="select-button">
        <el-radio-group v-model="writeType" size="mini">
          <el-radio-button label="1">用例</el-radio-button>
          <el-radio-button label="2">断言</el-radio-button>
          <el-radio-button label="3">变量</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="content">
      <div v-if="writeType == '1'">
        <el-row
          class="item-line"
          v-for="(item, index) in executePoint.params"
          :key="index"
        >
          <el-col :span="4">
            <div class="param_name">{{ item.paramKey }}:</div>
          </el-col>
          <el-col :span="20">
            <FeatureEdit
              :point="executePoint.pointId"
              :feature="item"
              :case="caseId"
              :isEdit="isEdit"
              @refreshData="refreshValue"
            />
          </el-col>
        </el-row>
      </div>
      <div v-if="writeType == '2'">
        <FeatureCompare
          :isEdit="isEdit"
          :point="executePoint.pointId"
          :data="executePoint.compareDefine"
          @refreshCompare="refreshCompare"
        />
      </div>
      <div v-if="writeType == '3'">
        <FeatureVariable
          :isEdit="isEdit"
          :point="executePoint.pointId"
          :data="executePoint.variableDefine"
          @refreshVariable="refreshVariable"
        />
      </div>
    </div>
  </div>
</template>
<script>
import FeatureEdit from '@/components/feature-edit'
import FeatureCompare from '@/components/feature-compare'
import FeatureVariable from '@/components/feature-variable'
export default {
  props: {
    data: Object,
    isEdit: Boolean,
    type: String,
    case: String,
  },
  components: {
    FeatureEdit,
    FeatureCompare,
    FeatureVariable,
  },
  watch: {
    data(val) {
      this.executePoint = val
    },
    type(val) {
      this.writeType = val
    },
  },
  data() {
    return {
      executePoint: {},
      writeType: '',
      caseId: '',
    }
  },
  methods: {
    refreshValue(update) {
      this.executePoint.params.forEach((p) => {
        if (update.item.paramKey == p.paramKey) {
          p.value = update.item.value
        }
      })

      this.$emit('refreshData', {
        data: this.executePoint,
      })
    },
    refreshCompare(update) {
      this.executePoint.compareDefine = update.data
      this.$emit('refreshData', {
        data: this.executePoint,
      })
    },
    refreshVariable(update) {
      this.executePoint.variableDefine = update.data
      this.$emit('refreshData', {
        data: this.executePoint,
      })
    },
  },
  created() {
    this.caseId = this.case
    this.executePoint = this.data
    this.writeType = this.type
  },
}
</script>
<style scoped>
.item-line {
  margin: 10px 0px;
}

.title {
  position: relative;
  min-height: 40px;
  width: 100%;
}
.select-button {
  width: 200px;
  position: absolute;
  left: 50%;
  top: 0%;
  transform: translateX(-50%);
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
