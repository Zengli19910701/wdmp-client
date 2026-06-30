import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login', name: 'Login',
      component: () => import('../views/login/index.vue'),
      meta: { title: '登录', noAuth: true }
    },
    {
      path: '/',
      component: () => import('../views/layout/index.vue'),
      redirect: '/system/user',
      children: [
        { path: '/system/user',    name: 'User',           component: () => import('../views/system/user/index.vue'),     meta: { title: '用户管理' } },
        { path: '/system/role',    name: 'Role',           component: () => import('../views/system/role/index.vue'),     meta: { title: '角色管理' } },
        { path: '/system/menu',    name: 'Menu',           component: () => import('../views/system/menu/index.vue'),     meta: { title: '菜单管理' } },
        { path: '/system/dept',    name: 'Dept',           component: () => import('../views/system/dept/index.vue'),     meta: { title: '部门管理' } },
        { path: '/system/config',  name: 'Config',         component: () => import('../views/system/config/index.vue'),   meta: { title: '系统配置' } },
        { path: '/file',           name: 'File',           component: () => import('../views/file/index.vue'),            meta: { title: '文件管理' } },
        { path: '/report/designer',name: 'ReportDesigner', component: () => import('../views/report/designer/index.vue'), meta: { title: '报表设计' } },
        { path: '/report/viewer',  name: 'ReportViewer',  component: () => import('../views/report/viewer/index.vue'),   meta: { title: '报表查看' } },
        { path: '/task',           name: 'Task',           component: () => import('../views/task/index.vue'),            meta: { title: '定时任务' } },
        { path: '/push',           name: 'Push',           component: () => import('../views/push/index.vue'),            meta: { title: '消息推送' } },
        { path: '/org',            name: 'Org',            component: () => import('../views/org/index.vue'),             meta: { title: '组织管理' } }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (to.meta.noAuth) return true
  if (!authStore.isLoggedIn()) return '/login'
  if (!authStore.userInfo) {
    await authStore.fetchUserInfo().catch(() => { authStore.logout(); return '/login' })
  }
  document.title = `${to.meta.title || '首页'} - 工业互联网平台`
  return true
})

export default router
