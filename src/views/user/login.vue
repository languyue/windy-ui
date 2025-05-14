<template>
  <div class="content">
    <div class="background">
      <div class="login-div">
        <div class="title">
          <img class="image" :src="windyImage" fit="contain" />
        </div>

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
              @keyup.enter.native="login" 
              placeholder="请输入密码"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          class="login-btn"
          @click="login"
          :loading="isLoading"
          type="primary"
          >登录</el-button
        >
        <div class="bottom-line">
          版本:{{ consoleVersion }} -便捷一站式Devops平台-
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import userApi from '../../http/User'
import systemApi from '../../http/System'
import resourceApi from '../../http/Resource'
import imageLogo from '../../assets/windy.png'
import cookies from 'js-cookie'
export default {
  data() {
    return {
      loginForm: {},
      windyImage: imageLogo,
      consoleVersion: '',
      isLoading: false
    }
  },
  methods: {
    getSystemVersion() {
      systemApi.getSystemVersion().then((res) => {
        this.consoleVersion = res.data.consoleVersion
      })
    },
    getUserMenus(callback) {
      resourceApi.getUserMenuList().then((res) => {
        let array = []
        res.data.forEach((element) => {
          array.push(element.content)
        })

        this.$store.commit('UPDATE_RBAC_LIST', array)
        callback()
      })
    },
    login() {
      this.isLoading = true
      userApi.login(this.loginForm).then((res) => {
        if (res.data.token) {
          cookies.set('token', res.data.token, {
            path: '/',
            expires: 1 / 24,
          })
          this.redirectPage()
        }
        this.isLoading = false
      }).catch(()=>{
        this.isLoading = false
      })
    },
    redirectPage() {
      let pathUri = '/#/'
      if (this.$route.query.redirect) {
        pathUri += this.$route.query.redirect
      }
      this.$store.commit('UPDATE_SERVICE_ID', '')
      this.getUserMenus(() => {
        window.location.href = window.location.origin + pathUri
      })
    },
  },
  created() {
    let cookie = cookies.get('token')
    if (cookie) {
      this.redirectPage()
    }
    this.getSystemVersion()
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
      margin-top: 40px;
      margin-bottom: 30px;
      text-align: center;
      vertical-align: middle;

      .image {
        width: 90px;
        height: 80px;
      }
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

  .background {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-image: url('../../assets/background.jpeg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-color: #d8dae3;
  }
}
</style>
