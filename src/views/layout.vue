<template>
  <el-container>
    <!-- 侧边栏 -->
    <el-header class="header">
      <!-- 侧边导航 -->
      <el-menu
        mode="horizontal"
        class="title-menu"
        v-if="$store.state.rbacList.length > 0"
        :default-active="$route.path"
        background-color="#545c64"
        text-color="#fff"
        @select="handleSelect"
        active-text-color="#ffd04b"
      >
        <el-submenu index="" v-auth="'m10015'">
          <template slot="title">
            <i class="el-icon-s-marketing"></i>
            <span slot="title">工作台</span>
          </template>
          <el-menu-item index="/workbench" v-auth="'m10000'">
            <i class="el-icon-s-platform"></i>
            个人工作台</el-menu-item
          >
          <el-menu-item index="/space" v-auth="'m10001'">
            <i class="el-icon-s-shop"></i>
            空间</el-menu-item
          >
          <el-menu-item index="plugin">
            <div>
              <i class="el-icon-download"></i>
              Intellij IDEA 插件
              <el-popover
                title="Windy插件"
                placement="right"
                width="400"
                trigger="hover"
              >
                <div>
                  <p>
                    下载Windy插件并安装,支持在Intellij
                    IDEA工具栏管理需求与缺陷状态以及生成git提交信息
                  </p>
                  <el-image
                    style="width: 300px; height: 354px"
                    :src="imageUrl"
                    :preview-src-list="[imageUrl]"
                  >
                  </el-image>
                </div>

                <i slot="reference" class="el-icon-question" />
              </el-popover>
            </div>
          </el-menu-item>
        </el-submenu>
        <el-submenu index="/" v-auth="'m10016'">
          <template slot="title">
            <i class="el-icon-s-help"></i>
            <span slot="title">服务管理</span>
          </template>
          <el-menu-item index="/" v-auth="'m10002'">
            <i class="el-icon-s-opportunity"></i>
            服务列表</el-menu-item
          >
          <el-menu-item index="/service/resource" v-auth="'m10003'">
            <i class="el-icon-location"></i>
            api管理</el-menu-item
          >
        </el-submenu>
        <el-submenu index="/code/change" v-auth="'m10017'">
          <template slot="title">
            <i class="el-icon-share"></i>
            <span slot="title">流水线管理</span>
          </template>
          <el-menu-item index="/code/change" v-auth="'m10004'">
            <i class="el-icon-s-unfold"></i>
            变更列表</el-menu-item
          >
          <el-menu-item index="/pipeline" v-auth="'m10005'">
            <i class="el-icon-share"></i>
            流水线</el-menu-item
          >
          <el-menu-item index="/pipe/action" v-auth="'m10006'">
            <i class="el-icon-coin"></i>
            流水线节点</el-menu-item
          >
        </el-submenu>
        <el-submenu index="/case" v-auth="'m10018'">
          <template slot="title">
            <i class="el-icon-s-promotion"></i>
            <span slot="title">用例管理</span>
          </template>
          <el-menu-item index="/case" v-auth="'m10007'">
            <i class="el-icon-cpu"></i>
            功能用例</el-menu-item
          >
          <el-menu-item index="/e2e" v-auth="'m10008'">
            <i class="el-icon-cpu"></i>
            e2e测试</el-menu-item
          >
          <el-menu-item index="/template" v-auth="'m10009'">
            <i class="el-icon-s-platform"></i>
            模版管理</el-menu-item
          >
          <el-menu-item index="/task" v-auth="'m10010'">
            <i class="el-icon-s-order"></i>
            任务管理</el-menu-item
          >
        </el-submenu>
        <el-submenu index="/system" v-auth="'m10019'">
          <template slot="title">
            <i class="el-icon-s-promotion"></i>
            <span slot="title">系统管理</span>
          </template>
          <el-menu-item index="/system" v-auth="'m10011'">
            <i class="el-icon-s-tools"></i>
            系统配置</el-menu-item
          >
          <el-menu-item index="/rbac" v-auth="'m10012'">
            <i class="el-icon-s-tools"></i>
            组织权限管理</el-menu-item
          >
          <el-menu-item index="/env" v-auth="'m10013'">
            <i class="el-icon-place"></i>
            环境管理</el-menu-item
          >
          <el-menu-item index="/monitor" v-auth="'m10014'">
            <i class="el-icon-s-platform"></i>
            监控</el-menu-item
          >
        </el-submenu>
      </el-menu>
      <div class="github-icon">
        <img
          src="../assets/github-mark.svg"
          width="25px"
          height="25px"
          alt="跳转github"
          @click="goGithub"
        />
      </div>
      <div class="user-icon">
        <el-dropdown szie="mini" @command="handleClick">
          <span class="user-div">
            <i class="el-icon-user-solid" />
            <span>{{ user.nickName ? user.nickName : user.userName }}</span>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="main-bg">
      <router-view></router-view>
    </el-main>
    <el-drawer
      title="节点监控"
      :visible.sync="showDrawer"
      direction="rtl"
      size="60%"
    >
      <monitor />
    </el-drawer>
  </el-container>
</template>
<script>
import resourceApi from '../http/Resource'
import windyTool from '../assets/windy-tool.png'
import userApi from '../http/User'
import cookies from 'js-cookie'
import monitor from './service/monitor.vue'
export default {
  components: {
    monitor,
  },
  data() {
    return {
      user: {},
      imageUrl: windyTool,
      showDrawer: false,
    }
  },
  methods: {
    goGithub() {
      window.open('https://github.com/zhijianfree/Windy', '__blank')
    },
    getUserMenus() {
      resourceApi.getUserMenuList().then((res) => {
        let array = []
        res.data.forEach((element) => {
          array.push(element.content)
        })

        this.$store.commit('UPDATE_RBAC_LIST', array)
      })
    },
    handleSelect(index) {
      if (index == 'plugin') {
        window.open(
          'https://plugins.jetbrains.com/plugin/25539-windy/reviews?noRedirect=true',
          '_blank'
        )
        return
      }

      if (index == '/monitor') {
        this.showDrawer = true
        return
      }
      this.$router.push({ path: index })
    },
    handleClick(command) {
      if (command == 'logout') {
        userApi.logout().then(() => {
          cookies.remove('token')
          this.$store.commit('UPDATE_SERVICE_ID', '')
          this.$router.push({ path: '/login' })
        })
      }
      if (command == 'profile') {
        this.$router.push({ path: '/user' })
      }
    },
  },
  mounted() {
    userApi.getUserDetail().then((res) => {
      this.user = res.data
    })
    this.getUserMenus()
  },
}
</script>
<style>
body {
  padding: 0px;
  margin: 0px;
  color: #303133;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}
html,
body {
  margin: 0;
  height: 100%;
}
#app,
.el-container {
  height: 100%;
}
.header {
  padding: 0 !important;
  background-color: #545c64;
  height: 50px !important;
  position: relative;
}

.el-main {
  padding: 0px !important;
}
.title-menu {
  width: 800px;
  left: 50%;
  transform: translate(-50%);
}
.el-submenu__title {
  height: 50px !important;
  line-height: 50px !important;
}
.el-menu-item {
  height: 50px !important;
  line-height: 50px !important;
}
.user-icon {
  position: absolute;
  right: 20px;
  top: 10px;
  cursor: pointer;
}
.github-icon {
  position: absolute;
  right: 150px;
  top: 10px;
  cursor: pointer;
}
.user-div {
  color: #fff;
  font-size: 16px;
}
.user-div span {
  font-size: 14px;
  margin-left: 5px;
}
</style>
