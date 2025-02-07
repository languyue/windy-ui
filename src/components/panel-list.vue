<template>
  <div>
    <div v-for="(item, index) in resultList" :key="index">
      <Panel>
        <template slot="title">
          <div class="list-title" @click="showItem(item)">
            <div class="execute-name" :class="item.status | statusFormat">
              <i class="el-icon-circle-plus icon-tag" v-if="!item.show" />
              <i class="el-icon-remove icon-tag" v-else />
              {{ item.name }}
            </div>

            <div class="tag-list">
              <el-tag :type="item.status | statusFormat" size="mini">
                {{ item.status | statusName }}
              </el-tag>
            </div>
          </div>
        </template>
        <template slot="content">
          <!-- if for执行结果展示开始 -->
          <div
            v-if="
              item.executeType == 2 ||
              item.executeType == 3 ||
              item.executeType == 7
            "
            class="cycle-div"
          >
            <div v-for="(result, index) in item.resultList" :key="index">
              <Panel>
                <template slot="title">
                  <div class="list-title" @click="showItem(result)">
                    <div
                      class="execute-name"
                      :class="item.status | statusFormat"
                    >
                      <i
                        class="el-icon-circle-plus icon-tag"
                        v-if="!result.show"
                      />
                      <i class="el-icon-remove icon-tag" v-else />
                      {{ result.name }}111
                    </div>

                    <div class="tag-list">
                      <el-tag :type="item.status | statusFormat" size="mini">
                        {{ result.status | statusName }}
                      </el-tag>
                    </div>
                  </div>
                </template>
                <template slot="content">
                  <Panel>
                    <template slot="title">
                      <div class="desc-div">
                        <i class="el-icon-s-promotion" /> 请求信息
                      </div>
                    </template>
                    <template slot="content">
                      <div class="request-list">
                        <json-viewer
                          v-if="result.executeDetailVo.requestTips"
                          :value="result.executeDetailVo.requestTips"
                          :expand-depth="5"
                          copyable
                        ></json-viewer>
                      </div>
                    </template>
                  </Panel>
                  <Panel>
                    <template slot="title">
                      <div class="desc-div">
                        <i class="el-icon-camera-solid" /> 响应信息
                      </div>
                    </template>
                    <template slot="content">
                      <div
                        class="request-list"
                        v-if="
                          result.compareResult &&
                          !result.compareResult.compareStatus &&
                          result.compareResult.description
                        "
                      >
                        比较错误：
                        <div class="compare-info">
                          {{ result.compareResult.description }}
                        </div>
                      </div>
                      <div>
                        <div class="request-list">
                          响应结果:
                          <json-viewer
                            v-if="
                              result.executeDetailVo.responseDetailVo
                                .responseBody
                            "
                            :value="
                              result.executeDetailVo.responseDetailVo
                                .responseBody
                            "
                            :expand-depth="5"
                            copyable
                          ></json-viewer>
                        </div>
                      </div>
                    </template>
                  </Panel>
                  <div
                    v-if="result.executeDetailVo.responseDetailVo.errorMessage"
                  >
                    <div class="desc-div error-icon">
                      <i class="el-icon-warning" /> 执行描述
                    </div>
                    <div class="request-list">
                      {{ result.executeDetailVo.responseDetailVo.errorMessage }}
                    </div>
                  </div>
                </template>
              </Panel>
            </div>
          </div>
          <!-- for执行结果展示结束 -->

          <div v-else>
            <div v-for="(result, index) in item.resultList" :key="index">
              <el-row class="desc-div" v-if="result.spendTime">
                <el-col :span="3"><i class="el-icon-timer" /> 请求耗时:</el-col>
                <el-col :span="12"
                  ><el-tag type="warning" size="mini"
                    >{{ result.spendTime }}ms</el-tag
                  ></el-col
                >
              </el-row>

              <Panel>
                <template slot="title">
                  <div class="desc-div">
                    <i class="el-icon-s-promotion" /> 请求信息
                  </div>
                </template>
                <template slot="content">
                  <div class="request-list">
                    <json-viewer
                      v-if="result.executeDetailVo.requestTips"
                      :value="result.executeDetailVo.requestTips"
                      :expand-depth="5"
                      copyable
                    ></json-viewer>
                  </div>
                </template>
              </Panel>
              <Panel>
                <template slot="title">
                  <div class="desc-div">
                    <i class="el-icon-camera-solid" /> 响应信息
                  </div>
                </template>
                <template slot="content">
                  <div
                    class="request-list"
                    v-if="
                      result.compareResult &&
                      !result.compareResult.compareStatus &&
                      result.compareResult.description
                    "
                  >
                    比较错误：
                    <div class="compare-info">
                      {{ result.compareResult.description }}
                    </div>
                  </div>
                  <div>
                    <div class="request-list">
                      响应结果:
                      <json-viewer
                        v-if="
                          result.executeDetailVo.responseDetailVo.responseBody
                        "
                        :value="
                          result.executeDetailVo.responseDetailVo.responseBody
                        "
                        :expand-depth="5"
                        copyable
                      ></json-viewer>
                    </div>
                  </div>
                </template>
              </Panel>
              <div v-if="result.executeDetailVo.responseDetailVo.errorMessage">
                <div class="desc-div error-icon">
                  <i class="el-icon-warning" /> Error
                </div>
                <div class="request-list">
                  {{ result.executeDetailVo.responseDetailVo.errorMessage }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </Panel>
    </div>
  </div>
</template>
<script>
import Panel from './panel.vue'
import JsonViewer from 'vue-json-viewer'
export default {
  name: 'PanelList',
  components: { Panel, JsonViewer },
  props: {
    list: Array,
  },
  data() {
    return {
      resultList: [],
    }
  },
  watch: {
    list(value) {
      this.exchangeData(value)
    },
  },
  methods: {
    showItem(item) {
      item.show = !item.show
    },
    exchangeData(array) {
      this.resultList = []
      array.forEach((e) => {
        let item = this.handleItem(e)
        this.resultList.push(item)
      })
    },
    handleItem(e) {
      let executeSuccess = e.status
      if (e.compareResult) {
        executeSuccess = e.compareResult.compareStatus ? 1 : 2
      }
      let item = {
        name: e.executePointName,
        executeType: e.executeType,
        testStage: e.testStage,
        resultList: e.recordResult,
        compareResult: e.compareResult,
        show: false,
        status: executeSuccess,
      }
      return item
    },
  },
  created() {},
}
</script>
<style scoped>
.list-title {
  position: relative;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}
.tag-list {
  position: absolute;
  right: 20px;
  top: 0px;
}
.desc-div {
  font-size: 14px;
  font-weight: 800;
  margin: 10px 20px;
}
.request-list {
  font-size: 12px;
  margin: 5px 60px;
}
.error-icon {
  color: #f56c6c;
}
.execute-name {
  font-size: 15px;
}
.cycle-div {
  margin-left: 20px;
}
.warning {
  color: #e6a23c;
}
.success {
  color: #67c23a;
}
.danger {
  color: #f56c6c;
}
.info {
  color: #909399;
}
.primary {
  color: #409eff;
}
.compare-info {
  color: #f56c6c;
  font-size: 16px;
  font-weight: 900;
  white-space: normal; /* 允许文字自动换行 */
  word-wrap: break-word; /* 长单词自动换行 */
  overflow-wrap: break-word; /* 兼容性更好的换行方式 */
}
</style>
