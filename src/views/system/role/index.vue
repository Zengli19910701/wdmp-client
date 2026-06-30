<template>
  <div class="page-container">
    <el-card>
      <div class="search-bar">
        <el-input v-model="query.roleName" placeholder="搜索角色名称" clearable style="width:220px" @keyup.enter="loadData" />
        <el-button type="primary" icon="Search" @click="loadData">查询</el-button>
        <el-button type="success" icon="Plus" @click="openAdd">新增</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleKey" label="角色标识" width="150" />
        <el-table-column prop="orderNum" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '正常' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-button type="warning" link icon="Key" @click="openMenuAssign(row)">分配菜单</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
              <template #reference><el-button type="danger" link icon="Delete">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize"
        :total="total" layout="total, sizes, prev, pager, next" @change="loadData" class="pagination" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑角色' : '新增角色'" width="460px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName"><el-input v-model="form.roleName" /></el-form-item>
        <el-form-item label="角色标识" prop="roleKey">
          <el-input v-model="form.roleKey" :disabled="!!editId" />
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.orderNum" :min="0" /></el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="menuDialogVisible" title="分配菜单权限" width="400px">
      <el-tree ref="menuTreeRef" :data="menuTree"
        :props="{ label: 'menuName', children: 'children' }"
        show-checkbox node-key="id" :default-checked-keys="checkedMenuIds" check-strictly />
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleAssignMenus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getRolePage, saveRole, updateRole, deleteRole, assignRoleMenus, getMenuTree, getRoleMenuIds, type Role, type MenuItem } from '../../../api/system'

const loading = ref(false), saving = ref(false)
const list = ref<Role[]>([]), total = ref(0)
const dialogVisible = ref(false), menuDialogVisible = ref(false)
const editId = ref<number | null>(null), menuRoleId = ref<number>(0)
const formRef = ref<FormInstance>(), menuTreeRef = ref<any>()
const menuTree = ref<MenuItem[]>([]), checkedMenuIds = ref<number[]>([])
const query = reactive({ pageNum: 1, pageSize: 10, roleName: '' })
const form = reactive({ roleName: '', roleKey: '', orderNum: 0, status: 1, remark: '' })

const rules: FormRules = {
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '角色标识不能为空', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try { const res = await getRolePage(query); list.value = res.list; total.value = res.total } finally { loading.value = false }
}
function openAdd() {
  editId.value = null; Object.assign(form, { roleName: '', roleKey: '', orderNum: 0, status: 1, remark: '' }); dialogVisible.value = true
}
function openEdit(row: Role) { editId.value = row.id; Object.assign(form, row); dialogVisible.value = true }
async function handleSave() {
  await formRef.value?.validate()
  saving.value = true
  try {
    editId.value ? await updateRole({ ...form, id: editId.value }) : await saveRole(form)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } finally { saving.value = false }
}
async function openMenuAssign(row: Role) {
  menuRoleId.value = row.id
  menuTree.value = await getMenuTree()
  checkedMenuIds.value = await getRoleMenuIds(row.id)
  menuDialogVisible.value = true
}
async function handleAssignMenus() {
  saving.value = true
  try {
    const ids = menuTreeRef.value?.getCheckedKeys() || []
    await assignRoleMenus(menuRoleId.value, ids)
    ElMessage.success('权限分配成功'); menuDialogVisible.value = false
  } finally { saving.value = false }
}
async function handleDelete(id: number) { await deleteRole(id); ElMessage.success('删除成功'); loadData() }
onMounted(() => { loadData() })
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
