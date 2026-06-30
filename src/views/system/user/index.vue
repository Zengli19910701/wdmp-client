<template>
  <div class="page-container">
    <el-card>
      <div class="search-bar">
        <el-input v-model="query.username" placeholder="搜索用户名" clearable style="width:220px"
          @keyup.enter="loadData" @clear="loadData" />
        <el-button type="primary" icon="Search" @click="loadData">查询</el-button>
        <el-button type="success" icon="Plus" @click="openAdd">新增</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
              <template #reference><el-button type="danger" link icon="Delete">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize"
        :total="total" layout="total, sizes, prev, pager, next" @change="loadData" class="pagination" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑用户' : '新增用户'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!editId" />
        </el-form-item>
        <el-form-item label="密码" :prop="editId ? '' : 'password'">
          <el-input v-model="form.password" type="password" :placeholder="editId ? '不填则不修改' : ''" show-password />
        </el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.realName" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width:100%">
            <el-option v-for="r in roles" :key="r.id" :label="r.roleName" :value="r.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUserPage, saveUser, updateUser, deleteUser, getAllRoles, type User, type Role } from '../../../api/system'

const loading = ref(false), saving = ref(false)
const list = ref<User[]>([]), total = ref(0), roles = ref<Role[]>([])
const dialogVisible = ref(false), editId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const query = reactive({ pageNum: 1, pageSize: 10, username: '' })
const form = reactive({ username: '', password: '', realName: '', phone: '', email: '', status: 1, roleIds: [] as number[] })

const rules: FormRules = {
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
}

/** 加载用户列表 */
async function loadData() {
  loading.value = true
  try { const res = await getUserPage(query); list.value = res.list; total.value = res.total } finally { loading.value = false }
}

/** 打开新增弹窗 */
function openAdd() {
  editId.value = null
  Object.assign(form, { username: '', password: '', realName: '', phone: '', email: '', status: 1, roleIds: [] })
  dialogVisible.value = true
}

/** 打开编辑弹窗 */
function openEdit(row: User) {
  editId.value = row.id; Object.assign(form, { ...row, password: '', roleIds: [] }); dialogVisible.value = true
}

/** 保存用户 */
async function handleSave() {
  await formRef.value?.validate()
  saving.value = true
  try {
    editId.value ? await updateUser({ ...form, id: editId.value }) : await saveUser(form)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } finally { saving.value = false }
}

/** 删除用户 */
async function handleDelete(id: number) { await deleteUser(id); ElMessage.success('删除成功'); loadData() }

onMounted(async () => { loadData(); roles.value = await getAllRoles() })
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
