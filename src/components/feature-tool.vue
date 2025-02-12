<template>
  <div>
    <div v-if="executePoint.executeType == 2">
      <FeatureFor
        :data="executePoint"
        :isEdit="isEdit"
        @refreshData="refreshValue"
      >
      </FeatureFor>
    </div>
    <div v-if="executePoint.executeType == 3">
      <FeatureIF
        :data="executePoint"
        :isEdit="isEdit"
        @refreshData="refreshValue"
      >
      </FeatureIF>
    </div>
    <div v-if="executePoint.executeType == 6">
      <div class="cover-glocal">
        <el-checkbox
          size="mini"
          :disabled="!isEdit"
          @change="selectCheck"
          v-model="coverGlobal"
          >覆盖全局变量</el-checkbox
        >
      </div>

      <codeeditor
        :codes="executePoint.service"
        @change="dataChange"
        language="javascript"
        :readonly="!isEdit"
      ></codeeditor>
    </div>
    <div v-if="executePoint.executeType == 7">
      <FeatureAsync
        :data="executePoint"
        :isEdit="isEdit"
        @refreshData="refreshValue"
      >
      </FeatureAsync>
    </div>
  </div>
</template>
<script>
import FeatureFor from '@/components/feature-for'
import FeatureIF from '@/components/feature-if'
import FeatureAsync from '@/components/feature-async'
import codeeditor from '@/components/CodeEditor.vue'
export default {
  props: {
    data: Object,
    isEdit: Boolean,
  },
  components: {
    FeatureFor,
    FeatureIF,
    codeeditor,
    FeatureAsync,
  },
  watch: {
    data(val) {
      this.executePoint = val
    },
  },
  data() {
    return {
      executePoint: {},
      writeType: '',
      coverGlobal: false,
    }
  },
  methods: {
    selectCheck() {
      this.executePoint.method = JSON.stringify({ global: this.coverGlobal })
      this.$emit('refreshData', {
        data: this.executePoint,
      })
    },
    dataChange(info) {
      this.executePoint.service = info
      this.executePoint.method = JSON.stringify({ global: this.coverGlobal })
      this.$emit('refreshData', {
        data: this.executePoint,
      })
    },
    refreshValue(update) {
      this.$emit('refreshData', update)
    },
  },
  created() {
    this.executePoint = this.data
    if (this.executePoint.executeType == 6 && this.executePoint.method) {
      let config = JSON.parse(this.executePoint.method)
      this.coverGlobal = config.global
    }
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
}
.cover-glocal {
  margin: 5px;
}
</style>
