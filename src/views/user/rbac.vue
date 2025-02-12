<template>
  <div>
    <el-tabs tab-position="left" style="height: 600px; margin: 20px">
      <el-tab-pane label="组织管理">
        <group></group>
      </el-tab-pane>
      <el-tab-pane label="角色管理">
        <role></role>
      </el-tab-pane>
      <el-tab-pane label="资源管理">
        <resource></resource>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import group from './group.vue'
import role from './role.vue'
import resource from './resource.vue'
export default {
  components: {
    group,
    resource,
    role,
  },
  data() {
    return {}
  },
}
</script>
<style lang="less"></style>
