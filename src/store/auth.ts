import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin, getUserInfo } from '../api/auth'

interface UserInfo { userId: number; username: string; realName: string; avatar: string; roles: string[]; perms: string[] }

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  async function login(username: string, password: string) {
    const res = await apiLogin({ username, password })
    token.value = res.token
    localStorage.setItem('token', res.token)
    userInfo.value = res
  }

  async function fetchUserInfo() {
    if (!token.value) return
    const res = await getUserInfo()
    userInfo.value = res
  }

  function logout() {
    token.value = ''; userInfo.value = null; localStorage.removeItem('token')
  }

  const isLoggedIn = () => !!token.value
  return { token, userInfo, login, fetchUserInfo, logout, isLoggedIn }
})
