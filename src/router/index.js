import Vue from 'vue'
import store from '../store/index'
import VueRouter from 'vue-router'
import Layout from '../views/layout.vue'
import TestCase from '../views/feature/test-case.vue'
import TestE2E from '../views/feature/test-e2e.vue'
import Feature from '../views/feature/feature.vue'
import Template from '../views/feature/template.vue'
import Login from '../views/user/login.vue'
import User from '../views/user/user.vue'
import NoPermission from '../views/user/permission.vue'
import RBAC from '../views/user/rbac.vue'
import Task from '../views/feature/task-manage.vue'
import Space from '../views/demand/space.vue'
import Workbench from '../views/demand/workbench.vue'
import RecordDetail from '../views/feature/record-detail.vue'
import Service from '../views/service/service.vue'
import ServiceApi from '../views/service/api.vue'
import Environment from '../views/service/environment.vue'
import System from '../views/service/system.vue'
import Monitor from '../views/service/monitor.vue'
import Pipeline from '../views/pipeline/pipeline.vue'
import PipeAction from '../views/pipeline/action.vue'
import CodeChange from '../views/pipeline/codechange.vue'

Vue.use(VueRouter)
const subRoutes = [
  {
    path: 'workbench',
    name: 'Workbench',
    auth: 'm10000',
    component: Workbench,
  },
  {
    path: 'space',
    name: 'Space',
    auth: 'm10001',
    component: Space,
  },
  {
    path: '',
    name: 'Service',
    auth: 'm10002',
    component: Service,
  },
  {
    path: 'service/resource',
    name: 'ServiceApi',
    auth: 'm10003',
    component: ServiceApi,
  },
  {
    path: 'code/change',
    name: 'CodeChange',
    auth: 'm10004',
    component: CodeChange,
  },
  {
    path: 'pipeline',
    name: 'Pipeline',
    auth: 'm10005',
    component: Pipeline,
  },
  {
    path: 'pipe/action',
    name: 'PipeAction',
    auth: 'm10006',
    component: PipeAction,
  },
  {
    path: 'feature',
    name: 'Feature',
    auth: 'm10007',
    component: Feature,
  },
  {
    path: 'case',
    name: 'TestCase',
    auth: 'm10007',
    component: TestCase,
  },
  {
    path: 'e2e',
    name: 'TestE2E',
    auth: 'm10008',
    component: TestE2E,
  },
  {
    path: 'template',
    name: 'Template',
    auth: 'm10009',
    component: Template,
  },
  {
    path: 'task',
    name: 'Task',
    auth: 'm10010',
    component: Task,
  },
  {
    path: 'record/detail',
    name: 'RecordDetail',
    auth: 'm10010',
    component: RecordDetail,
  },
  {
    path: 'system',
    name: 'System',
    auth: 'm10011',
    component: System,
  },
  {
    path: 'rbac',
    name: 'RBAC',
    auth: 'm10012',
    component: RBAC,
  },
  {
    path: 'env',
    name: 'Environment',
    auth: 'm10013',
    component: Environment,
  },

  {
    path: 'monitor',
    name: 'Monitor',
    auth: 'm10014',
    component: Monitor,
  },
]

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/permission',
    name: 'NoPermission',
    component: NoPermission,
  },
  {
    path: '/user',
    name: 'User',
    component: User,
  },
  {
    path: '',
    component: Layout,
    children: subRoutes,
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  let rbacList = store.state.rbacList
  if (rbacList && rbacList.length > 0) {
    let result = subRoutes.find((e) => '/' + e.path == to.path)
    if (result && result.auth && !rbacList.includes(result.auth)) {
      // 如果用户没有登录且想访问 /about，重定向到主页
      next('/permission')
    } else {
      // 允许路由继续
      next()
    }
  } else {
    next()
  }
})

export default router
