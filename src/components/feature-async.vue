<template>
  <div>
    <div class="for-title">
      <div class="for-start">
        异步运行最长时间
        <el-input-number
          :disabled="!isEdit"
          v-model="condition"
          @input="notifyData"
          :min="5"
          @pointerdown.stop.native
          size="mini"
          class="condition-input"
          inline
        />(秒)
      </div>
      {
      <div>
        <draggable
          class="for-content"
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
                  @click="deleteExecutePoint(index, executePoint.pointId)"
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
    }
  },
  methods: {
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
    deleteExecutePoint(index) {
      this.$confirm('确认删除用例执行点?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.points.splice(index, 1)
      })
    },
  },
  created() {
    this.executeData = this.data
    if (this.data.method) {
      this.condition = this.data.method
    }

    this.points = []
    if (this.data.executePoints) {
      this.data.executePoints.forEach((point) => {
        point.executorUnit.randomId = new Date().valueOf()
        let item = point.executorUnit
        item.writeType = '1'
        item.compareDefine = point.compareDefine
        item.variableDefine = point.variableDefine
        this.points.push(item)
      })
    }
  },
}
</script>
<style scoped>
.condition-input {
  width: 20%;
}
.for-title {
  margin: 5px;
  border: 2px dashed #dcdfe6;
  padding: 10px;
  width: 500px;
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
</style>
