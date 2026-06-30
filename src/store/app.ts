import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const title = ref('工业互联网平台')
  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
  return { sidebarCollapsed, title, toggleSidebar }
})
