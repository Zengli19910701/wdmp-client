<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-header">
        <h1>🏭 工业互联网平台</h1>
        <p>WDMP Industrial Internet Platform</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large" prefix-icon="User" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" prefix-icon="Lock" show-password clearable />
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" class="login-btn" @click="handleLogin">
          {{ loading ? '登录中...' : '登 录' }}
        </el-button>
      </el-form>
      <div class="login-tip">默认账号：admin / Admin@123</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../store/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: 'admin', password: 'Admin@123' })

/** 表单校验规则 */
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

/** 登录处理 */
async function handleLogin() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().then(() => true).catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await authStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    await router.push('/')
  } catch (e: any) {
    console.error('登录失败:', e?.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  display: flex; align-items: center; justify-content: center;
}
.login-box {
  background: #fff; border-radius: 12px; padding: 48px 40px;
  width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.login-header { text-align: center; margin-bottom: 36px; }
.login-header h1 { font-size: 24px; font-weight: 700; color: #1890ff; margin-bottom: 8px; }
.login-header p { font-size: 13px; color: #999; }
.login-form :deep(.el-form-item) { margin-bottom: 20px; }
.login-btn { width: 100%; height: 44px; font-size: 16px; letter-spacing: 4px; margin-top: 8px; }
.login-tip { text-align: center; margin-top: 20px; font-size: 12px; color: #aaa; }
</style>
