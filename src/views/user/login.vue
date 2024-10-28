<template>
  <div class="content">
    <div class="video-background">
      <div class="login-div">
        <div class="title">Windy</div>

        <el-form
          size="small"
          class="form-div"
          :model="loginForm"
          label-width="40px"
        >
          <el-form-item
            label="用户"
            prop="userName"
            class="form-line"
            size="mini"
          >
            <el-input
              v-model="loginForm.userName"
              placeholder="请输入用户名"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" class="form-line">
            <el-input
              v-model="loginForm.password"
              show-password
              placeholder="请输入密码"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          class="login-btn"
          @click="login"
          :loading="false"
          type="primary"
          >登录</el-button
        >
        <div class="bottom-line">-便捷一站式Devops平台-</div>
      </div>
    </div>
  </div>
</template>
<script>
import userApi from '../../http/User'
import resourceApi from '../../http/Resource'
import cookies from 'js-cookie'
export default {
  data() {
    return {
      loginForm: {},
    }
  },
  methods: {
    getUserMenus(callback) {
      resourceApi.getUserMenuList().then((res) => {
        console.log(res)
        let array = []
        res.data.forEach((element) => {
          array.push(element.content)
        })

        this.$store.commit('UPDATE_RBAC_LIST', array)
        callback()
      })
    },
    login() {
      userApi.login(this.loginForm).then((res) => {
        if (res.data.token) {
          cookies.set('token', res.data.token, {
            path: '/',
          })
          let pathUri = '/#/'
          if (this.$route.query.redirect) {
            pathUri += this.$route.query.redirect
          }
          this.$store.commit('UPDATE_SERVICE_ID', '')
          this.getUserMenus(() => {
            window.location.href = window.location.origin + pathUri
          })
        }
      })
    },
  },
}
</script>
<style lang="less" scoped>
.content {
  position: relative;

  .login-div {
    position: absolute;
    top: 10%;
    left: 10%;
    height: 60%;
    min-height: 400px;
    width: 400px;
    border-radius: 20px;
    background-color: #fff;

    .bottom-line {
      position: absolute;
      bottom: 10px;
      width: 100%;
      text-align: center;
      color: #c0c4cc;
      font-size: 12px;
    }

    .title {
      margin-top: 50px;
      margin-bottom: 30px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      vertical-align: middle;
    }
    .form-div {
      margin: 10% 20px;
    }

    .form-line {
      margin: 20px 0;
    }

    .login-btn {
      width: 80%;
      margin-left: 60px;
    }
  }

  .video-background {
    position: relative;
    width: 100%;
    height: 100vh; /* 或任意你希望的高度 */
    overflow: hidden;
    background-size: cover;
    background-image: url('../../assets/background.png');
  }

  .video-background video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    transform: translateX(-50%) translateY(-50%);
    z-index: -1;
    background-size: cover;
    transition: 1s opacity;
  }
}
</style>
