<template>
  <div class="content">
    <el-button size="mini" icon="el-icon-plus" type="primary" @click="showSpace"
      >新增空间</el-button
    >
    <el-table :data="tableData" size="mini">
      <el-table-column prop="spaceName" label="空间名称" width="200">
        <template slot-scope="scope">
          <i
            v-if="scope.row.spaceId == space"
            class="el-icon-success chosed-space"
          />
          <textview :len="20" :text="scope.row.spaceName"></textview>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述">
        <template slot-scope="scope">
          <textview :len="40" :text="scope.row.description"></textview>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="150">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            @click="startEdit(scope.row)"
            type="text"
            size="small"
            icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button
            @click="startDelete(scope.row)"
            type="text"
            size="small"
            v-if="scope.row.spaceId != space"
            icon="el-icon-edit"
            >删除</el-button
          >
          <el-button
            @click="switchSpace(scope.row)"
            type="text"
            size="small"
            v-if="scope.row.spaceId != space"
            icon="el-icon-sort"
            >切换空间</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="spaceTitle"
      :visible.sync="showSpaceDialog"
      width="40%"
      :append-to-body="true"
      :before-close="handleClose"
    >
      <el-form
        :model="spaceForm"
        ref="spaceForm"
        :rules="SpaceRules"
        label-width="80px"
        size="mini"
      >
        <el-form-item label="空间名称" prop="spaceName">
          <el-input
            v-model="spaceForm.spaceName"
            placeholder="请输入空间名称"
          />
        </el-form-item>
        <el-form-item label="空间描述" prop="description">
          <el-input
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 10 }"
            v-model="spaceForm.description"
            placeholder="请输入空间名称"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose" size="mini">取 消</el-button>
        <el-button type="primary" size="mini" @click="submitForm('spaceForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import textview from '../../components/text-view.vue'
import spaceApi from '../../http/Space'
export default {
  props: {
    space: String,
  },
  components: { textview },
  data() {
    return {
      tableData: [{}],
      showSpaceDialog: false,
      spaceForm: {},
      spaceTitle: '',
      edit: false,
      SpaceRules: {
        spaceName: [
          { required: true, message: '请输入空间名称', trigger: 'blur' },
          { min: 2, message: '缺陷名称最少2个字符', trigger: 'blur' },
        ],
        description: [
          { required: true, message: '请输入空间描述', trigger: 'change' },
        ],
      },
    }
  },
  methods: {
    switchSpace(row) {
      this.$emit('switchSpace', row)
    },
    showSpace() {
      this.spaceTitle = '创建空间'
      this.showSpaceDialog = true
      this.edit = false
    },
    startEdit(row) {
      this.spaceTitle = '编辑空间'
      this.showSpaceDialog = true
      this.edit = true
      this.spaceForm = row
    },
    startDelete(row) {
      this.$confirm(
        '删除空间会清除空间下所有需求、缺陷、与迭代，确认删除?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        spaceApi.deleteSpace(row.spaceId).then((res) => {
          if (res.data) {
            this.$notify({
              title: '成功',
              message: '删除空间成功',
              type: 'success',
            })
            this.getSpaceList()
          } else {
            this.$notify({
              title: '失败',
              message: '删除空间失败',
              type: 'danger',
            })
          }
        })
      })
    },
    handleClose() {
      this.showSpaceDialog = false
      this.spaceForm = {}
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }

        if (this.edit) {
          spaceApi
            .updateSpace(this.spaceForm.spaceId, this.spaceForm)
            .then((res) => {
              if (res.data) {
                this.$notify.success('修改空间成功')
                this.handleClose()
                this.getSpaceList()
              } else {
                this.$notify.error('修改空间失败')
              }
            })
          return
        }

        spaceApi.createSpace(this.spaceForm).then((res) => {
          if (res.data) {
            this.$notify.success('创建空间成功')
            this.handleClose()
            this.getSpaceList()
          } else {
            this.$notify.error('创建空间失败')
          }
        })
      })
    },
    getSpaceList() {
      spaceApi.getSpaceList().then((res) => {
        this.tableData = res.data
      })
    },
  },
  created() {
    console.log('ssss', this.spaceId)
    this.getSpaceList()
  },
}
</script>
<style lang="less" scoped>
.content {
  padding: 10px;
}
.chosed-space {
  color: #67c23a;
  margin-right: 5px;
}
</style>
