<template>
  <el-container class="layout-container">
    <el-aside :width="sidebarWidth" class="sidebar">
      <div class="logo">
        <span v-if="!appStore.sidebarCollapsed">🏭 工业互联网平台</span>
        <span v-else>🏭</span>
      </div>
      <el-menu :default-active="currentPath" :collapse="appStore.sidebarCollapsed"
        background-color="#001529" text-color="#a6adb4" active-text-color="#1890ff" router class="side-menu">
        <el-sub-menu index="/system">
          <template #title><el-icon><Setting /></el-icon><span>系统管理</span></template>
          <el-menu-item index="/system/user"><el-icon><User /></el-icon>用户管理</el-menu-item>
          <el-menu-item index="/system/role"><el-icon><Avatar /></el-icon>角色管理</el-menu-item>
          <el-menu-item index="/system/menu"><el-icon><Menu /></el-icon>菜单管理</el-menu-item>
          <el-menu-item index="/system/dept"><el-icon><OfficeBuilding /></el-icon>部门管理</el-menu-item>
          <el-menu-item index="/system/config"><el-icon><Tools /></el-icon>系统配置</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/file"><el-icon><FolderOpened /></el-icon><span>文件管理</span></el-menu-item>
        <el-sub-menu index="/report">
          <template #title><el-icon><DataAnalysis /></el-icon><span>报表管理</span></template>
          <el-menu-item index="/report/designer"><el-icon><EditPen /></el-icon>报表设计</el-menu-item>
          <el-menu-item index="/report/viewer"><el-icon><View /></el-icon>报表查看</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/task"><el-icon><Clock /></el-icon><span>任务调度</span></el-menu-item>
        <el-menu-item index="/push"><el-icon><Bell /></el-icon><span>消息推送</span></el-menu-item>
        <el-menu-item index="/org"><el-icon><Connection /></el-icon><span>组织管理</span></el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
            <Expand v-if="appStore.sidebarCollapsed" /><Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleDropdown">
            <span class="user-info">
              <el-avatar :size="28" :src="authStore.userInfo?.avatar || defaultAvatar" />
              <span class="username">{{ authStore.userInfo?.realName || authStore.userInfo?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout"><el-icon><SwitchButton /></el-icon> 退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive><component :is="Component" /></keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '../../store/auth'
import { useAppStore } from '../../store/app'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

/** 侧边栏宽度 */
const sidebarWidth = computed(() => appStore.sidebarCollapsed ? '64px' : '220px')
const currentPath = computed(() => route.path)
const currentTitle = computed(() => String(route.meta.title || ''))

/** 顶部下拉菜单处理 */
async function handleDropdown(command: string) {
  if (command === 'logout') {
    await ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' })
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container { height: 100vh; overflow: hidden; }
.sidebar { background-color: #001529; transition: width 0.3s; overflow: hidden; }
.logo { height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; border-bottom: 1px solid #0d2137; white-space: nowrap; overflow: hidden; }
.side-menu { border-right: none; height: calc(100% - 60px); overflow-y: auto; overflow-x: hidden; }
.side-menu:not(.el-menu--collapse) { width: 220px; }
.header { height: 60px !important; background: #fff; border-bottom: 1px solid #e8e8e8; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-shadow: 0 1px 4px rgba(0,21,41,0.08); }
.header-left { display: flex; align-items: center; gap: 16px; }
.collapse-btn { font-size: 20px; cursor: pointer; color: #666; transition: color 0.2s; }
.collapse-btn:hover { color: #1890ff; }
.header-right { display: flex; align-items: center; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #333; font-size: 14px; }
.main-content { background: #f0f2f5; padding: 20px; overflow-y: auto; }
</style>
