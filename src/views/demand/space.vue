<template>
  <div class="root-content">
    <el-container>
      <el-aside
        v-bind:style="{ width: detailWidth + 'px', height: asideHeight + 'px' }"
        class="left-content"
      >
        <div class="space-box">
          <el-popover
            placement="right"
            v-model="showPop"
            width="800"
            trigger="click"
          >
            <spaceList :space="spaceId" @switchSpace="selecteSpace"></spaceList>
            <div v-if="isCollapse" slot="reference" class="collapse-space">
              {{ simpleSpaceName }}
            </div>
            <div v-else slot="reference" class="title-space">
              <textview :text="spaceName" :len="10"></textview>
              <i class="el-icon-caret-bottom" />
            </div>
          </el-popover>
        </div>
        <div class="collapse-icon">
          <i
            v-bind:class="{
              'el-icon-arrow-left': !isCollapse,
              'el-icon-arrow-right': isCollapse,
              'left-icon': true,
            }"
            @click="hideMenu"
          />
        </div>
        <el-menu
          default-active="1"
          @select="selectMenu"
          background-color="#303133"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse="isCollapse"
        >
          <el-menu-item index="1">
            <i class="el-icon-camera-solid"></i>
            <span slot="title">需求</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-aim"></i>
            <span slot="title">缺陷</span>
          </el-menu-item>
          <el-menu-item index="3">
            <i class="el-icon-add-location"></i>
            <span slot="title">迭代</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main v-bind:style="{ height: asideHeight + 'px' }">
        <div class="right-content">
          <demand v-if="showIndex == 1" :space="spaceId"></demand>
          <bug v-else-if="showIndex == 2" :space="spaceId"></bug>
          <iteration :space="spaceId" v-else></iteration>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import bug from '../demand/bug.vue'
import iteration from '../demand/iteration.vue'
import demand from '../demand/demand.vue'
import spaceList from '../demand/space-list.vue'
import textview from '../../components/text-view.vue'
import spaceApi from '../../http/Space'
export default {
  components: {
    bug,
    demand,
    iteration,
    spaceList,
    textview,
  },
  data() {
    return {
      showIndex: 1,
      selectSpacce: '',
      showPop: false,
      detailWidth: 200,
      isCollapse: false,
      spaceName: '',
      spaceId: '',
      asideHeight: '',
    }
  },
  computed: {
    simpleSpaceName() {
      if (!this.spaceName) {
        return ''
      }
      return this.spaceName.substring(0, 1)
    },
  },
  methods: {
    selecteSpace(space) {
      console.log('spacexxx', space)
      this.spaceName = space.spaceName
      this.spaceId = space.spaceId
      this.showPop = false
      this.$store.commit('UPDATE_SPACE', this.spaceId)
    },
    selectMenu(index) {
      this.showIndex = index
    },
    hideMenu() {
      this.isCollapse = !this.isCollapse
      this.detailWidth = this.isCollapse ? 70 : 200
    },
    getSpaceList() {
      spaceApi.getSpaceList().then((res) => {
        if (!this.spaceId) {
          this.spaceName = res.data[0].spaceName
          this.spaceId = res.data[0].spaceId
          this.$store.commit('UPDATE_SPACE', this.spaceId)
        }
      })
    },
    calculateAsideHeight() {
      const documentHeight = document.documentElement.scrollHeight

      // 设置侧边栏高度为文档总高度与视口高度的最大值
      this.asideHeight = Math.max(documentHeight, window.innerHeight) - 50
    },
  },
  created() {
    this.getSpaceList()
    this.calculateAsideHeight()
  },
  mounted() {
    window.addEventListener('scroll', this.calculateAsideHeight)
    window.addEventListener('resize', this.calculateAsideHeight)
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('scroll', this.calculateAsideHeight)
    window.removeEventListener('resize', this.calculateAsideHeight)
  },
}
</script>
<style lang="less" scoped>
.el-menu {
  border-right: solid 0px;
}
</style>
<style lang="less" scoped>
.root-content {
  height: 100%;
  .left-content {
    overflow: visible;
    position: relative;
    // height: auto;
    background-color: #303133;
  }
}

.title-space {
  text-align: center;
  margin: 10px 20px;
  font-size: 13px;
  background-color: #ebeef5;
  padding: 6px;
  border-radius: 5px;
  cursor: pointer;
}
.title-space:hover {
  color: #409eff;
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
.collapse-icon i {
  position: absolute;
  top: 10px;
  right: -10px;
  z-index: 10;
  width: 20px;
  cursor: pointer;
  height: 20px;
  line-height: 20px;
  border-radius: 20px;
  font-size: 14px;
  text-align: center;
  vertical-align: middle;
  background-color: #343857;
  border-color: #464a68;
  color: #ccc;
}
.collapse-icon i:hover {
  color: #fff;
}
.right-content {
  padding: 10px;
}
</style>
