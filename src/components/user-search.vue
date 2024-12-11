<template>
  <div class="user-content">
    <div
      v-if="!selectList || selectList.length < 1"
      class="show-user-div"
      @click="showUserDialog"
    >
      <div class="user-add-icon">
        <i class="el-icon-user-solid" />
      </div>
      <span>选择用户</span>
    </div>
    <div v-else>
      <div
        class="show-select-user"
        v-for="(item, index) in selectList"
        :key="index"
      >
        <i
          v-if="!disable"
          class="close-icon el-icon-circle-close"
          @click="clearUser(index, item)"
        />
        <div class="user-select-icon">{{ item.name.substring(0, 1) }}</div>
        <span>{{ item.name }}</span>
      </div>
    </div>

    <el-dialog
      title="选择用户"
      :visible.sync="userDialogVisiable"
      append-to-body
      @close="closeDialog"
    >
      <el-autocomplete
        v-model="selectedUser"
        prefix-icon="el-icon-search"
        :fetch-suggestions="querySearchAsync"
        placeholder="请输入用户名称搜索"
        @select="handleSelect"
      ></el-autocomplete>
      <el-row>
        <el-col :span="12">
          <el-tree
            :data="treeData"
            @node-click="handleNodeClick"
            node-key="userId"
            default-expand-all
            :expand-on-click-node="false"
          >
            <span class="custom-tree-node" slot-scope="{ data }">
              <i v-if="data.isGroup" class="el-icon-office-building" />
              <i v-else class="el-icon-user" /> <span>{{ data.name }}</span>
            </span>
          </el-tree>
        </el-col>
        <el-col :span="12">
          <div>已选中用户列表({{ selectList.length }}):</div>
          <ul class="list-item">
            <li class="item" v-for="(item, index) in selectList" :key="index">
              <div class="user-select-icon">
                {{ item.name.substring(0, 1) }}
              </div>
              <span>{{ item.name }}</span>
              <i
                class="el-icon-delete delete-icon"
                @click="deleteSelectUser(index)"
              />
            </li>
          </ul>
        </el-col>
      </el-row>
      <div slot="footer">
        <el-button type="primary" @click="confirm" size="mini"> 确定</el-button>
        <el-button type="info" size="mini" @click="closeDialog">
          取消</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
import userApi from '../http/User'
import groupApi from '../http/Group'
export default {
  props: {
    disable: {
      type: Boolean,
      default: false,
    },
    users: {
      type: Array,
      default() {
        return []
      },
    },
    single: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    single: {
      immediate: true,
      handler(val) {
        this.isSingle = val
      },
    },
    users: {
      immediate: true,
      handler(val) {
        if (val) {
          this.selectList = val
        }
      },
    },
  },
  data() {
    return {
      selectedUser: '',
      userDialogVisiable: false,
      treeData: [],
      selectList: [],
      isSingle: false,
    }
  },
  methods: {
    deleteSelectUser(index) {
      this.selectList.splice(index, 1)
    },
    confirm() {
      this.$emit('chooseUser', JSON.parse(JSON.stringify(this.selectList)))
      this.closeDialog()
    },
    closeDialog() {
      this.userDialogVisiable = false
    },
    handleNodeClick(data) {
      if (data.isGroup) {
        return
      }
      this.addSelectUser(data)
    },
    addSelectUser(item) {
      if (this.isSingle) {
        this.selectList = []
        this.selectList.push(item)
        return
      }
      this.selectList.push(item)
    },
    showUserDialog() {
      if (this.disable) {
        return
      }
      this.userDialogVisiable = true
      this.getGroupUserTree()
    },
    getGroupUserTree() {
      groupApi.getGroupUserTree().then((res) => {
        this.treeData = res.data
      })
    },
    querySearchAsync(queryString, cb) {
      userApi.queryUserByName(queryString).then((res) => {
        let array = []
        res.data.forEach((e) => {
          e.value = e.userName + '-' + e.nickName
          array.push(e)
        })
        cb(array)
      })
    },
    handleSelect(item) {
      this.addSelectUser({
        userId: item.userId,
        name: item.nickName ? item.nickName : item.userName,
      })
      this.selectedUser = ''
    },
    clearUser(index, item) {
      this.selectList.splice(index, 1)
      this.$emit('clearUser', item)
    },
  },
  created() {
    this.selectList = this.users
    this.isSingle = this.single
  },
}
</script>
<style lang="less" scoped>
.user-content {
  width: 200px;
}
.show-user-div {
  cursor: pointer;

  .user-add-icon {
    background-color: #409eff;
    height: 25px;
    width: 25px;
    line-height: 25px;
    display: inline-block;
    border-radius: 25px;
    text-align: center;
    color: #fff;
    vertical-align: middle;
  }
  span {
    margin-left: 5px;
    color: #c0c4cc;
    font-size: 13px;
  }
}

.show-select-user {
  cursor: pointer;
  width: 120px;

  border-radius: 5px;
  position: relative;

  .user-select-icon {
    background-color: #409eff;
    height: 25px;
    width: 25px;
    line-height: 25px;
    display: inline-block;
    border-radius: 25px;
    text-align: center;
    color: #fff;
  }

  span {
    margin-left: 5px;
    font-size: 13px;
  }

  .close-icon {
    display: none; /* 默认不显示子元素 */
    position: absolute;
    top: 3px;
    right: 10px;
    border: 2px;
    color: #303133;
    font-size: 18px;
  }

  &:hover {
    background-color: #f2f6fc;
  }

  &:hover .close-icon {
    display: block;
  }
}
.list-item {
  list-style: none;
  padding: 0;

  .item {
    cursor: pointer;
    position: relative;
    width: 200px;
    padding: 5px;

    .user-select-icon {
      background-color: #409eff;
      height: 25px;
      width: 25px;
      line-height: 25px;
      display: inline-block;
      border-radius: 25px;
      text-align: center;
      color: #fff;
    }

    span {
      margin-left: 5px;
      font-size: 13px;
    }

    .delete-icon {
      display: none;
      position: absolute;
      top: 50%;
      right: 20px;
      color: #f56c6c;
      transform: translateY(-50%);
    }
    &:hover {
      background-color: #f2f6fc;
    }

    &:hover .delete-icon {
      display: block;
    }
  }
}
</style>
