import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from './store/index'
import router from './router/index'
import utils from './lib/utils'
import VuePipeline from 'vue-pipeline'
import './lib/filter'
import Contextmenu from 'vue-contextmenujs'
import './lib/direction'

Vue.use(Contextmenu)
Vue.prototype.$utils = utils
Vue.use(ElementUI)
Vue.use(VuePipeline)

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app')
