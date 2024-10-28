<template>
  <div class="content">
    <el-alert
      class="tips-info"
      title="消息提示"
      type="info"
      description="以下是对master与client的监控，相比较下master更需要关注内存使用情况，client更关心cpu与线程数"
      show-icon
    >
    </el-alert>
    <div>
      <div>
        <el-button
          type="primary"
          icon="el-icon-refresh"
          size="mini"
          :loading="isLoading"
          @click="refresh"
        >
          刷新状态</el-button
        >
      </div>
      <el-divider content-position="left">Master节点</el-divider>
      <div>
        <el-table :data="masterData">
          <el-table-column label="Master IP">
            <template slot-scope="scope">
              <i class="el-icon-monitor"></i>
              <span style="margin-left: 10px">{{ scope.row.ip }}</span>
            </template>
          </el-table-column>
          <el-table-column label="cpu" prop="cpu"> </el-table-column>
          <el-table-column label="内存" prop="heap"> </el-table-column>
          <el-table-column label="线程数" prop="threads"> </el-table-column>
          <el-table-column label="任务数" prop="size"> </el-table-column>
          <el-table-column label="垃圾收集">
            <template slot-scope="scope">
              <el-popover placement="right" width="600" trigger="click">
                <el-table :data="scope.row.histories">
                  <el-table-column
                    width="300"
                    property="collector"
                    label="收集器"
                  ></el-table-column>
                  <el-table-column
                    width="150"
                    property="collectCount"
                    label="收集次数"
                  ></el-table-column>
                  <el-table-column
                    width="150"
                    property="collectTime"
                    label="收集耗时"
                  ></el-table-column>
                </el-table>
                <el-button size="mini" type="primary" slot="reference"
                  >查看垃圾回收</el-button
                >
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="client">
      <el-divider content-position="left">Client节点</el-divider>
      <el-table :data="clientData">
        <el-table-column label="Client IP">
          <template slot-scope="scope">
            <i class="el-icon-monitor"></i>
            <span style="margin-left: 10px">{{ scope.row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="cpu" prop="cpu"> </el-table-column>
        <el-table-column label="内存" prop="heap"> </el-table-column>
        <el-table-column label="线程数" prop="threads"> </el-table-column>
        <el-table-column label="任务数" prop="size"> </el-table-column>
        <el-table-column label="垃圾收集">
          <template slot-scope="scope">
            <el-popover placement="right" width="600" trigger="click">
              <el-table :data="scope.row.histories">
                <el-table-column
                  width="300"
                  property="collector"
                  label="收集器"
                ></el-table-column>
                <el-table-column
                  width="150"
                  property="collectCount"
                  label="收集次数"
                ></el-table-column>
                <el-table-column
                  width="150"
                  property="collectTime"
                  label="收集耗时"
                ></el-table-column>
              </el-table>
              <el-button size="mini" type="primary" slot="reference"
                >查看垃圾回收</el-button
              >
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import systemApi from '../../http/System'
export default {
  data() {
    return {
      clientData: [],
      masterData: [],
      isLoading: false,
    }
  },
  methods: {
    refresh() {
      this.getMonitor()
    },
    getMonitor() {
      this.isLoading = true
      systemApi.getMonitor().then((res) => {
        this.clientData = []
        if (res.data.clients) {
          res.data.clients.forEach((e) => {
            if (e) {
              let item = e.physics
              item.size = e.waitQuerySize
              this.clientData.push(item)
            }
          })
        }
        this.masterData = []
        if (res.data.masters) {
          res.data.masters.forEach((e) => {
            if (e) {
              let item = e.physics
              item.size = e.taskCount
              this.masterData.push(item)
            }
          })
        }
        this.isLoading = false
      })
    },
  },
  created() {
    this.getMonitor()
  },
}
</script>
<style scoped>
.content {
  width: 90%;
  margin-left: 5%;
}
.tips-info {
  margin: 10px;
}
.client {
  margin-top: 20px;
}
</style>
