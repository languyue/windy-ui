<template>
  <div style="width: 100%">
    <el-container style="width: 100%">
      <!-- 左侧迭代列表开始 -->
      <el-aside v-bind:style="{ width: detailWidth + 'px' }" id="resize">
        <div class="top-op">
          <el-row>
            <el-col :span="8"
              ><div class="create-line" @click="showIterationDialog">
                <i class="el-icon-plus" /> 创建
              </div></el-col
            >
            <el-col :span="16"
              ><div class="query-div">
                <el-input
                  size="mini"
                  clearable
                  v-model="filterName"
                  placeholder="过滤迭代名称"
                >
                  <i slot="prefix" class="el-input__icon el-icon-search"></i
                ></el-input></div
            ></el-col>
          </el-row>
        </div>
        <el-scrollbar>
          <div
            class="iteration-div"
            v-for="(item, index) in iterations"
            :key="index"
            @click="clickIteration(item)"
          >
            <div class="title">
              <text-view :text="item.name" :len="30"></text-view>
            </div>
            <div class="period">
              周期: {{ item.startTime | dayFormat }} ~
              {{ item.endTime | dayFormat }}
            </div>
            <div class="split-line"></div>
            <div class="status">
              状态:
              <el-tag size="mini" :type="matchStatus(item.status).type">
                {{ matchStatus(item.status).name }}
              </el-tag>
            </div>
            <div class="op-div">
              <el-dropdown
                size="mini"
                placement="right-start"
                @command="selectCommand($event, item)"
              >
                <span>
                  <i class="el-icon-s-tools" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </el-scrollbar>
      </el-aside>
      <div class="split-div">
        <div
          class="dragWidth"
          id="set_menu_width"
          @click="dragControllerDiv"
        ></div>
        <i
          v-bind:class="{
            'el-icon-arrow-left': !isCollapse,
            'el-icon-arrow-right': isCollapse,
            'left-icon': true,
          }"
          @click="hideMenu"
        />
      </div>
      <!-- 左侧迭代列表结束 -->
      <!-- 右侧内容开始 -->
      <el-main>
        <el-empty
          v-if="iterationInfo == null"
          description="请在左侧选择迭代"
        ></el-empty>
        <div v-else class="main-content">
          <div class="content-title">迭代名称: {{ iterationInfo.name }}</div>
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <!-- 预览开始 -->
            <el-tab-pane label="概览" name="review">
              <div class="review-div">
                <div class="ui-container">
                  <div class="ui-item">
                    <div class="title">需求个数</div>
                    <span>{{ statistic.demandCount }}</span>
                  </div>
                  <div class="ui-item">
                    <div class="title">缺陷个数</div>
                    <span>{{ statistic.bugCount }}</span>
                  </div>
                  <div class="ui-item">
                    <div class="title">任务个数</div>
                    <span>{{ statistic.workCount }}</span>
                  </div>
                  <div class="ui-item">
                    <div class="title">总工时</div>
                    <span>{{ statistic.workload }}</span>
                  </div>
                </div>

                <div class="step-line">
                  <div>里程碑</div>
                  <el-steps :active="5" align-center>
                    <el-step title="需求评审">
                      <!-- <div slot="description">08-08</div> -->
                    </el-step>
                    <el-step title="技术评审">
                      <!-- <div slot="description">08-08</div> -->
                    </el-step>
                    <el-step title="开发研发">
                      <!-- <div slot="description">08-08</div> -->
                    </el-step>
                    <el-step title="提测">
                      <!-- <div slot="description">08-08</div> -->
                    </el-step>
                    <el-step title="发布">
                      <!-- <div slot="description">08-08</div> -->
                    </el-step>
                  </el-steps>
                </div>
                <div class="bottom-line">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <div class="desc-box">
                        <el-descriptions
                          size="medium"
                          title="迭代信息"
                          :column="1"
                        >
                          <el-descriptions-item>
                            <span slot="label">
                              <i class="el-icon-s-opportunity" /> 迭代ID
                            </span>
                            {{ iterationInfo.iterationId }}
                          </el-descriptions-item>
                          <el-descriptions-item>
                            <span slot="label">
                              <i class="el-icon-turn-off" /> 状态
                            </span>
                            <el-dropdown
                              size="small"
                              placement="right-start"
                              @command="updateIterationStatus"
                            >
                              <el-tag
                                size="mini"
                                class="tag-status"
                                :type="matchStatus(iterationInfo.status).type"
                              >
                                {{ matchStatus(iterationInfo.status).name }}
                                <i class="el-icon-caret-bottom" />
                              </el-tag>
                              <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item
                                  :command="item.value"
                                  v-for="(item, index) in statusList"
                                  :key="index"
                                >
                                  <span :style="{ color: item.statusColor }">{{
                                    item.statusName
                                  }}</span>
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </el-dropdown>
                          </el-descriptions-item>
                          <el-descriptions-item>
                            <span slot="label">
                              <i class="el-icon-date" /> 迭代周期
                            </span>
                            {{ iterationInfo.startTime | dayFormat }} ~
                            {{ iterationInfo.endTime | dayFormat }}
                          </el-descriptions-item>
                          <el-descriptions-item>
                            <span slot="label">
                              <i class="el-icon-receiving" /> 描述
                            </span>
                            {{ iterationInfo.description }}
                          </el-descriptions-item>
                          <el-descriptions-item>
                            <span slot="label">
                              <i class="el-icon-s-custom" /> 成员
                            </span>
                            <div>
                              <el-tag
                                type="primary"
                                class="tag-item"
                                size="mini"
                                @close="deleteMember(item.userId)"
                                v-for="(item, index) in members"
                                :key="index"
                                :closable="members.length > 1"
                                >{{ item.userName }}</el-tag
                              >
                            </div>
                            <div class="add-member">
                              <el-popover
                                placement="right"
                                v-model="showPop"
                                width="400"
                                trigger="click"
                              >
                                <el-autocomplete
                                  v-model="selectedUser"
                                  :fetch-suggestions="querySearchAsync"
                                  placeholder="请输入用户名称"
                                  @select="handleSelect"
                                ></el-autocomplete>
                                <el-button
                                  slot="reference"
                                  type="text"
                                  size="mini"
                                  icon="el-icon-plus"
                                  >新增</el-button
                                >
                              </el-popover>
                            </div>
                          </el-descriptions-item>
                        </el-descriptions>
                      </div>
                    </el-col>
                    <el-col :span="16">
                      <div class="iteration-comment">
                        <div class="comment-title">迭代动态</div>
                        <div class="comments-div">
                          <div>
                            <el-input
                              type="textarea"
                              :autosize="{ minRows: 2, maxRows: 10 }"
                              placeholder="请输入您对需求的讨论"
                              v-model="commentMsg"
                            >
                            </el-input>
                          </div>
                          <div class="commit-btn">
                            <el-button
                              size="mini"
                              type="primary"
                              @click="addComment"
                              >添加评论</el-button
                            >
                          </div>
                        </div>
                        <el-scrollbar>
                          <div class="comment-list">
                            <div
                              class="history"
                              v-for="(item, index) in comments"
                              :key="index"
                            >
                              <div class="user-comment-div">
                                <span><i class="el-icon-s-custom" /></span>
                                {{ item.userName }}
                                {{ item.createTime | dateFormat }}
                              </div>
                              <div class="history-content">
                                {{ item.comment }}
                              </div>
                            </div>
                          </div>
                        </el-scrollbar>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-tab-pane>
            <!-- 预览结束 -->
            <!-- 需求列表开始 -->
            <el-tab-pane label="需求" name="demand">
              <iterationDemand
                :iteration="iterationInfo.iterationId"
              ></iterationDemand>
            </el-tab-pane>
            <!-- 需求列表结束 -->
            <!-- 缺陷列表开始 -->
            <el-tab-pane label="缺陷" name="bug">
              <iterationBug
                :iteration="iterationInfo.iterationId"
              ></iterationBug>
            </el-tab-pane>
            <!-- 缺陷列表结束 -->
            <!-- 看板开始 -->
            <el-tab-pane label="看板" name="card">
              <div class="card-div">
                <div class="card-title">
                  展示类型：
                  <el-dropdown placement="bottom-end" @command="cardCommand">
                    <span class="down-text">
                      {{ showCardtype
                      }}<i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="demand">需求</el-dropdown-item>
                      <el-dropdown-item command="bug">缺陷</el-dropdown-item>
                      <!-- <el-dropdown-item command="work">任务</el-dropdown-item> -->
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
                <div class="col-list">
                  <div
                    v-for="(item, index) in cardData"
                    :key="index"
                    class="card-col"
                  >
                    <div class="card-col-title">
                      {{ item.name }} ({{ item.data.length }})
                    </div>
                    <div>
                      <div
                        v-for="(it, index) in item.data"
                        :key="index"
                        class="card-item"
                      >
                        <div class="card-type">s</div>
                        {{ it.name }}
                        <div class="tag-div">
                          <div
                            class="tag-inline"
                            v-for="(item, index) in it.selectTag"
                            :key="index"
                            v-bind:style="{
                              'background-color': item.statusColor,
                              'border-color': item.statusColor,
                            }"
                          >
                            {{ item.statusName }}
                          </div>
                          <el-popover
                            placement="right"
                            width="200"
                            trigger="click"
                            v-model="it.showPop"
                          >
                            <div
                              v-for="(item, index) in tagList"
                              :key="index"
                              class="tag-info"
                              @click="clickTag(item, it)"
                            >
                              <div
                                class="tag-line cycle"
                                v-bind:style="{
                                  'background-color': item.statusColor,
                                }"
                              ></div>
                              <div class="tag-line">{{ item.statusName }}</div>
                            </div>
                            <div slot="reference" class="plus-div">+</div>
                          </el-popover>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <!-- 看板结束 -->
          </el-tabs>
        </div>
      </el-main>
      <!-- 右侧内容结束 -->
    </el-container>
    <!-- 创建迭代开始 -->
    <el-dialog
      title="创建迭代"
      :visible.sync="showIteration"
      width="40%"
      :close-on-click-modal="false"
      :before-close="closeIteration"
    >
      <el-form
        :model="iterationForm"
        ref="iterationForm"
        :rules="iterationRule"
        label-width="80px"
        size="mini"
      >
        <el-form-item label="迭代名称" prop="name">
          <el-input v-model="iterationForm.name" placeholder="请输入迭代名称" />
        </el-form-item>
        <el-form-item
          label="迭代周期"
          prop="selectedDate"
          :rules="[
            {
              required: true,
              message: '迭代执行时间点不能为空',
              trigger: 'select',
            },
          ]"
        >
          <el-date-picker
            v-model="iterationForm.selectedDate"
            type="daterange"
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="迭代描述" prop="description">
          <el-input
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 10 }"
            v-model="iterationForm.description"
            placeholder="请输入迭代描述"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="closeIteration">取 消</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="submitIteration('iterationForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 创建迭代结束 -->
  </div>
</template>
<script>
import iterationDemand from '../demand/demand.vue'
import iterationBug from '../demand/bug.vue'
import iterationApi from '../../http/Iteration'
import TextView from '../../components/text-view.vue'
import CommentApi from '../../http/Comment'
import DemandApi from '../../http/DemandApi'
import BugApi from '../../http/BugApi'
import userApi from '../../http/User'
export default {
  props: {
    space: {
      type: String,
      default: '',
    },
  },
  components: {
    iterationDemand,
    iterationBug,
    TextView,
  },
  watch: {
    space: {
      handler(val) {
        console.log('space', val)
        this.spaceId = val
        this.getIterationList()
      },
      immediate: true,
    },
  },
  data() {
    return {
      showCardtype: '需求',
      cardData: {},
      commentMsg: '',
      comments: [],
      statistic: {},
      iterationInfo: null,
      iterationRule: {
        name: [
          { required: true, message: '请输入迭代名称', trigger: 'blur' },
          { min: 4, message: '迭代名称最少10个字符', trigger: 'blur' },
        ],
        description: [
          { max: 256, message: '迭代名称最少10个字符', trigger: 'blur' },
        ],
      },
      iterationList: [],
      iterationForm: {},
      showIteration: false,
      selectedDate: [],
      spaceId: '',
      showIndex: '',
      selectSpacce: '',
      showPop: false,
      detailWidth: 250,
      isCollapse: false,
      activeName: 'review',
      tagList: [],
      members: [],
      steps: [
        {
          date: '07/31',
          subDate: '08/05',
          description: '需求评审',
          completed: true,
        },
        {
          date: '08/02',
          subDate: '08/05',
          description: '技术评审',
          completed: true,
        },
        {
          date: '08/06',
          description: '计划确认',
          completed: false,
        },
        {
          date: '08/09',
          description: '提测',
          completed: false,
        },
        {
          date: '08/17',
          description: '验收',
          completed: false,
        },
        {
          date: '08/19',
          description: '发布评审',
          completed: false,
        },
        {
          date: '08/20',
          description: '结项',
          completed: false,
        },
      ],
      selectedUser: '',
      filterName: '',
      statusList: [],
    }
  },
  computed: {
    iterations() {
      return this.iterationList.filter((item) => {
        return item.name.toLowerCase().includes(this.filterName.toLowerCase())
      })
    },
  },
  methods: {
    updateIterationStatus(type) {
      iterationApi
        .updateIteration(this.iterationInfo.iterationId, {
          iterationId: this.iterationInfo.iterationId,
          status: type,
        })
        .then((res) => {
          if (res.data) {
            this.$notify({
              message: `修改迭代【${this.iterationInfo.name}】状态成功`,
              type: 'success',
            })
            iterationApi
              .getIterationDetail(this.iterationInfo.iterationId)
              .then((res) => {
                this.iterationInfo = res.data
              })
          } else {
            this.$notify({
              message: `修改迭代【${this.iterationInfo.name}】状态失败`,
              type: 'error',
            })
          }
        })
    },
    getIterationStatus() {
      iterationApi.getIterationStatuses().then((res) => {
        this.statusList = res.data
      })
    },
    querySearchAsync(queryString, cb) {
      userApi.queryUserByName(queryString).then((res) => {
        let array = []
        res.data.forEach((e) => {
          e.value = e.userName
          array.push(e)
        })
        cb(array)
      })
    },
    handleSelect(item) {
      iterationApi
        .addMembers({
          resourceId: this.iterationInfo.iterationId,
          userId: item.userId,
        })
        .then((res) => {
          if (res.data) {
            this.selectedUser = ''
            this.showPop = !this.showPop
            this.getserviceMember(this.iterationInfo.iterationId)
          }
        })
    },
    getserviceMember(iterationId) {
      iterationApi.getMembers(iterationId).then((res) => {
        this.members = res.data
      })
    },
    deleteMember(userId) {
      iterationApi
        .deleteMembers(this.iterationInfo.iterationId, userId)
        .then((res) => {
          if (res.data) {
            this.getserviceMember(this.iterationInfo.iterationId)
          }
        })
    },
    cardCommand(command) {
      this.getDemandTags()
      this.cardData = {
        noStart: {
          name: '未开始',
          data: [],
        },
        process: {
          name: '处理中',
          data: [],
        },
        complete: {
          name: '已完成',
          data: [],
        },
      }
      if (command == 'demand') {
        this.showCardtype = '需求'
        this.getDemandCard()
      }
      if (command == 'bug') {
        this.showCardtype = '缺陷'
        this.getBugCard()
      }
    },
    getCommentsList() {
      if (!this.iterationInfo.iterationId) {
        return
      }
      CommentApi.getComments(this.iterationInfo.iterationId).then((res) => {
        this.comments = res.data
      })
    },
    addComment() {
      let data = {
        comment: this.commentMsg,
        relativeId: this.iterationInfo.iterationId,
      }
      CommentApi.createComment(data).then((res) => {
        if (res.data) {
          this.$notify.success('添加评论成功')
          this.getCommentsList()
          this.commentMsg = ''
        } else {
          this.$notify.error('添加评论失败')
        }
      })
    },
    clickIteration(row) {
      iterationApi.getIterationDetail(row.iterationId).then((res) => {
        this.iterationInfo = res.data
        this.getCommentsList()
      })
      iterationApi.getIterationStatistic(row.iterationId).then((res) => {
        this.statistic = res.data
      })
      this.getserviceMember(row.iterationId)
    },
    selectCommand(event, row) {
      console.log(event, row)
      if (event == 'edit') {
        this.iterationForm = JSON.parse(JSON.stringify(row))
        this.iterationForm.selectedDate = [row.startTime, row.endTime]
        this.showIteration = true
        this.isEditIteration = true
      }
      if (event == 'delete') {
        iterationApi.deleteIteration(row.iterationId).then((res) => {
          if (res.data) {
            this.$notify({
              title: '成功',
              message: '删除迭代成功',
              type: 'success',
            })
            this.getIterationList()
          } else {
            this.$notify({
              title: '失败',
              message: '删除迭代失败',
              type: 'danger',
            })
          }
        })
      }
    },
    matchStatus(status) {
      if (!status) {
        return {}
      }
      switch (status) {
        case 1:
          return { name: '未开始', type: 'info' }
        case 2:
          return { name: '进行中', type: 'primary' }
        case 3:
          return { name: '已关闭', type: 'warning' }
        case 4:
          return { name: '已完成', type: 'success' }
      }
      return {}
    },
    getIterationList() {
      iterationApi.getIterationList(this.spaceId).then((res) => {
        this.iterationList = res.data
      })
    },
    submitIteration(formName) {
      this.$refs[formName].validate((valid) => {
        console.log(this.iterationForm)
        if (!valid) {
          return false
        }

        if (!this.spaceId) {
          this.$message.warning('未选择空间，创建迭代失败')
          return
        }
        this.iterationForm.spaceId = this.spaceId
        this.iterationForm.startTime = this.iterationForm.selectedDate[0]
        this.iterationForm.endTime = this.iterationForm.selectedDate[1]
        if (this.isEditIteration) {
          iterationApi
            .updateIteration(this.iterationForm.iterationId, this.iterationForm)
            .then((res) => {
              if (res.data) {
                this.$notify.success('修改迭代成功')
                this.closeIteration()
                this.getIterationList()
              } else {
                this.$notify.error('修改迭代失败')
              }
            })
          return
        }

        iterationApi.createIteration(this.iterationForm).then((res) => {
          if (res.data) {
            this.$notify.success('创建迭代成功')
            this.closeIteration()
            this.getIterationList()
          } else {
            this.$notify.error('创建迭代失败')
          }
        })
      })
    },
    showIterationDialog() {
      this.showIteration = true
    },
    closeIteration() {
      this.isEditIteration = false
      this.iterationForm = {}
      this.selectedDate = []
      this.showIteration = false
    },
    clickTag(tag, item) {
      item.selectTag.push(tag)
      item.showPop = false
    },
    handleClick(tab) {
      console.log('tab', tab)
      if (tab.name == 'card') {
        this.cardCommand('demand')
      }
    },
    selectMenu(index) {
      this.showIndex = index
    },
    hideMenu() {
      this.isCollapse = !this.isCollapse
      this.detailWidth = this.isCollapse ? 0 : 250
    },
    dragControllerDiv() {
      let data = this
      let resize = document.getElementById('set_menu_width')
      resize.onmousedown = function (e) {
        // 颜色改变提醒
        // resize.style.background = "#67c23a";
        let startX = e.clientX
        resize.left = resize.offsetLeft
        document.onmousemove = function (e) {
          // 计算并应用位移量
          let endX = e.clientX
          let moveLen = endX - startX
          startX = endX

          let len = data.detailWidth + moveLen
          if (len <= 100) {
            data.detailWidth = 100
            return
          }
          data.detailWidth += moveLen
        }
        document.onmouseup = function () {
          // 颜色恢复
          resize.style.background = ''
          document.onmousemove = null
          document.onmouseup = null
        }
        return false
      }
    },
    getDemandTags() {
      DemandApi.getDemandTags().then((res) => {
        this.tagList = res.data
      })
    },
    getBugCard() {
      BugApi.getIterationBugs(this.iterationInfo.iterationId).then((res) => {
        console.log(res.data)
        res.data.forEach((e) => {
          let item = {
            name: e.bugName,
            id: e.bugId,
            showPop: false,
            selectTag: [],
          }
          if (e.status == 1) {
            this.cardData.noStart.data.push(item)
          }
          if (e.status > 1 && e.status <= 4) {
            this.cardData.process.data.push(item)
          }
          if (e.status > 4) {
            this.cardData.complete.data.push(item)
          }
        })
      })
    },
    getDemandCard() {
      DemandApi.getIterationDemandList(this.iterationInfo.iterationId).then(
        (res) => {
          console.log(res.data)
          res.data.forEach((e) => {
            let item = {
              name: e.demandName,
              id: e.demandId,
              showPop: false,
              selectTag: [],
            }
            if (e.status == 1) {
              this.cardData.noStart.data.push(item)
            }
            if (e.status > 1 && e.status <= 4) {
              this.cardData.process.data.push(item)
            }
            if (e.status > 4) {
              this.cardData.complete.data.push(item)
            }
          })
        }
      )
    },
  },
  created() {
    this.getIterationStatus()
    this.getDemandTags()
  },
}
</script>
<style lang="less" scoped>
.dragWidth {
  position: relative;
  width: 5px;
  height: calc(100vh - 50px);
  cursor: e-resize;
  border-left: solid 1px #e6e6e6;
}
.dragWidth:hover {
  border-left: solid 3px #409eff;
}
.left-icon {
  position: absolute;
  left: 0px;
  top: 200px;
  line-height: 30px;
  width: 12px;
  height: 30px;
  background-color: rgba(24, 43, 80, 0.2);
  color: #fff;
  font-size: 16px;
  vertical-align: middle;
  text-align: center;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}
.left-icon:hover {
  background-color: #8c95a8;
  cursor: pointer;
}
.split-div {
  position: relative;
}
.space-box {
  width: 200px;
}
.collapse-space {
  border-radius: 5px;
  height: 30px;
  width: 30px;

  cursor: pointer;
  margin: 10px;
  margin-left: 20px;
  line-height: 30px;
  color: #fff;
  font-weight: 800;
  background-color: #67c23a;
  text-align: center;
  vertical-align: middle;
}

.iteration-div {
  margin: 5px;
  position: relative;
  background-color: rgba(24, 43, 80, 0.04);
  padding: 10px 8px;
  border: solid 1px #f2f6fc;
  border-radius: 5px;
  cursor: pointer;

  .split-line {
    border: dashed 1px #fff;
    margin-bottom: 10px;
  }

  .title {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .period {
    font-size: 12px;
    margin-bottom: 10px;
  }
  .status {
    font-size: 13px;
  }
  .op-div {
    position: absolute;
    top: 10px;
    display: none;
    right: 10px;
    background-color: #fff;
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 5px;
    text-align: center;
    vertical-align: middle;
  }

  &:hover {
    background-color: rgb(179, 216, 255);
    .op-div {
      display: block; // 悬浮时显示子 div
    }
  }
}

.create-line {
  font-size: 14px;
  cursor: pointer;
}

.create-line i {
  font-weight: 900;
}

.create-line:hover {
  color: #409eff;
}
.top-op {
  margin-top: 40px;
  margin: 20px;
}
.main-content {
  margin-top: 20px;
  width: 100%;
}
.content-title {
  font-size: 16px;
  font-weight: 900;
}
.cycle {
  height: 10px;
  width: 10px;
  line-height: 10px;
  border-radius: 10px;
  margin-right: 20px;
}
.tag-item {
  margin-left: 10px;
}
.add-member {
  display: inline-block;
  margin-left: 10px;
  font-size: 13px;
  cursor: pointer;
}
.tag-line {
  display: inline-block;
}

.tag-info {
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  padding: 5px 10px;
  &:hover {
    background-color: #dcdfe6;
  }
}
.tag-status {
  cursor: pointer;
}
.card-div {
  .card-title {
    margin: 10px;
    font-size: 14px;
    .down-text {
      cursor: pointer;
    }
  }
  .col-list {
    display: flex;

    .card-col {
      flex: 1;
      background: linear-gradient(
        180deg,
        rgba(24, 43, 80, 0.04),
        hsla(0, 0%, 100%, 0)
      );
      height: calc(100vh - 100px);

      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      margin: 0px 10px;

      .card-col-title {
        padding: 10px;
        font-weight: 900;
      }
      .card-item {
        min-height: 100px;
        margin: 20px;
        padding: 20px;
        z-index: 12;
        width: 200px;
        background-color: #fff;
        border-radius: 10px;
        font-size: 14px;
        overflow: hidden;
        line-height: 16px;
        color: #182b50;

        .card-type {
          width: 15px;
          height: 15px;
          text-align: center;
          vertical-align: middle;
          line-height: 15px;
          font-size: 12px;
          border-radius: 3px;
          display: inline-block;
          background-color: #409eff;
        }

        .tag-div {
          margin-top: 20px;

          .tag-inline {
            margin-top: 10px;
            margin-right: 10px;
            display: inline-block;
            height: 20px;
            padding: 0 5px;
            line-height: 20px;
            font-size: 12px;
            color: #fff;
            border: 1px solid #d9ecff;
            border-radius: 4px;
            box-sizing: border-box;
            white-space: nowrap;
          }
        }

        .plus-div {
          margin-top: 10px;
          font-weight: 800;
          width: 20px;
          height: 20px;
          line-height: 20px;
          color: #c0c4cc;
          text-align: center;
          margin-left: 10px;
          vertical-align: middle;
          display: inline-block;
          visibility: hidden;
          border: dashed 1px #c0c4cc;
          border-radius: 5px;

          &:hover {
            border: dashed 1px #303133;
            color: #303133;
          }
        }

        &:hover {
          border: 1px solid #edeef1;
          cursor: pointer;

          .plus-div {
            visibility: inherit;
          }
        }
      }
    }
  }
}

.review-div {
  height: 400px;
  padding-left: 30px;
  background: linear-gradient(
    180deg,
    rgba(24, 43, 80, 0.04),
    hsla(0, 0%, 100%, 0)
  );

  .ui-container {
    width: 100%;
    display: flex;
    padding: 20px 10px;
    justify-content: space-between;

    .ui-item {
      text-align: center;
      background-color: #fff;
      position: relative;
      height: 150px;
      width: 23%;
      border: 1px solid #edeef1;
      border-radius: 10px;
      cursor: pointer;

      .title {
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 16px;
        font-weight: 900;
      }

      span {
        vertical-align: middle;
        line-height: 200px;
        font-size: 40px;
        font-weight: 900;
      }

      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
    }
  }

  .step-line {
    background-color: #fff;
    margin: 10px;
    cursor: pointer;
    border: 1px solid #edeef1;
    border-radius: 10px;
    padding: 10px;

    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }

  .bottom-line {
    margin: 10px;

    .desc-box {
      background-color: #fff;
      border: 1px solid #edeef1;
      padding: 20px 10px;

      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
    }
    .iteration-comment {
      background-color: #fff;
      border: 1px solid #edeef1;
      padding: 20px 10px;
      min-height: 200px;

      .comment-title {
        font-weight: 900;
      }
      .comments-div {
        margin: 10px 0 10px 10px;

        .commit-btn {
          margin-top: 10px;
          text-align: right;
        }
      }

      .comment-list {
        height: 200px;

        .history {
          margin: 10px;
        }
        .user-comment-div {
          font-size: 13px;
        }
        .history-content {
          padding: 10px 20px;
        }
      }
      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
    }
  }
}

.query-div {
  i {
    cursor: pointer;
  }
}
</style>
