<template>
  <div class="content">
    <el-button type="primary" size="mini" @click="addResource"
      >新增资源</el-button
    >
    <el-table :data="resourceTable" size="mini" height="500px">
      <el-table-column prop="resourceName" label="资源名称名称">
      </el-table-column>
      <el-table-column prop="resourceType" label="资源类型">
        <template slot-scope="scope">
          <el-tag :type="scope.row.resourceType == 1 ? 'primary' : 'success'">{{
            scope.row.resourceType == 1 ? '接口权限' : '菜单权限'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="资源内容"> </el-table-column>
      <el-table-column prop="operate" label="操作类型"> </el-table-column>
      <el-table-column prop="description" label="资源描述">
        <template slot-scope="scope">
          <textView :text="scope.row.description" />
        </template>
      </el-table-column>
      <el-table-column prop="gmtCreated" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150px">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="editResource(scope.row)"
            >编辑</el-button
          >
          <el-button size="mini" type="text" @click="deleteResource(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleResourceSizeChange"
      @current-change="handleResourcePageChange"
      :current-page="resourcePage"
      :page-sizes="[10, 20, 50]"
      :page-size="resourceSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="resourceTotal"
    >
    </el-pagination>

    <el-dialog
      :title="title"
      :visible.sync="showResourceDialog"
      width="40%"
      :before-close="closeResourceDialog"
    >
      <el-form
        :model="resourceForm"
        ref="resourceForm"
        :rules="resourceRule"
        label-width="120px"
        size="mini"
      >
        <el-form-item label="资源名称">
          <el-input
            v-model="resourceForm.resourceName"
            placeholder="请输入资源名称"
          />
        </el-form-item>
        <el-form-item label="资源描述">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入资源描述"
            v-model="resourceForm.description"
          />
        </el-form-item>
        <el-form-item label="资源操作类型">
          <el-select
            v-model="resourceForm.operate"
            placeholder="请选择资源操作类型"
          >
            <el-option label="查询" value="GET"> </el-option>
            <el-option label="创建" value="POST"> </el-option>
            <el-option label="更新" value="PUT"> </el-option>
            <el-option label="删除" value="DELETE"> </el-option>
            <el-option label="任意" value="*"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select
            v-model="resourceForm.resourceType"
            placeholder="请选择资源操作类型"
            ><el-option label="接口权限" :value="1"> </el-option>
            <el-option label="菜单权限" :value="2"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源内容">
          <el-input
            v-model="resourceForm.content"
            placeholder="请输入资源名称"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="resourceForm.sortOrder"
            placeholder="请输入资源名称"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitResource('resourceForm')"
            >确认</el-button
          >
          <el-button @click="closeResourceDialog" type="info">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import resourceApi from '../../http/Resource'
import textView from '../../components/text-view.vue'
export default {
  components: {
    textView,
  },
  data() {
    return {
      resourceTable: [],
      resourcePage: 1,
      resourceSize: 10,
      resourceTotal: 0,
      title: '创建资源',
      showResourceDialog: false,
      resourceForm: {},
      isEdit: false,
      resourceRule: {
        resourceName: [
          { required: true, message: '请输入资源名称', trigger: 'blur' },
          { min: 2, message: '资源名称最少2个字符', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    closeResourceDialog() {
      this.showResourceDialog = false
      this.resourceForm = {}
      this.isEdit = false
    },
    addResource() {
      this.showResourceDialog = true
      this.resourceForm = {}
    },
    submitResource(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }

        if (this.isEdit) {
          resourceApi.updateResource(this.resourceForm).then((res) => {
            if (res.data) {
              this.$notify.success('修改资源成功')
              this.getResourceList()
              this.closeResourceDialog()
            } else {
              this.$notify.error('修改资源失败')
            }
          })
          return
        }
        resourceApi.createResource(this.resourceForm).then((res) => {
          if (res.data) {
            this.$notify.success('创建资源成功')
            this.getResourceList()
            this.closeResourceDialog()
          } else {
            this.$notify.error('创建资源失败')
          }
        })
      })
    },
    editResource(row) {
      this.showResourceDialog = true
      this.resourceForm = row
      this.isEdit = true
    },
    deleteResource(row) {
      resourceApi.deleteResource(row.resourceId).then((res) => {
        if (res.data) {
          this.$notify.success('删除资源成功')
          this.getResourceList()
        } else {
          this.$notify.error('删除资源失败')
        }
      })
    },
    handleResourceSizeChange(size) {
      this.resourceSize = size
      this.getResourceList()
    },
    handleResourcePageChange(page) {
      this.resourcePage = page
      this.getResourceList()
    },
    getResourceList() {
      resourceApi
        .getResources(this.resourcePage, this.resourceSize)
        .then((res) => {
          this.resourceTable = res.data.data
          this.resourceTotal = res.data.total
        })
    },
  },
  created() {
    this.getResourceList()
  },
}
</script>
<style lang="less" scoped>
.content {
  margin: 20px;
}
</style>
