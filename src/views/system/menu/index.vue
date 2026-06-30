<template>
  <div class="page-container">
    <el-card>
      <div class="search-bar">
        <el-button type="success" icon="Plus" @click="openAdd(0)">新增根菜单</el-button>
        <el-button icon="Refresh" @click="loadData">刷新</el-button>
      </div>
      <el-table :data="menuTree" v-loading="loading" row-key="id" border default-expand-all>
        <el-table-column prop="menuName" label="菜单名称" min-width="200" />
        <el-table-column prop="menuType" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.menuType === 1 ? '' : row.menuType === 2 ? 'success' : 'info'" size="small">
              {{ ['', '目录', '菜单', '按钮'][row.menuType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }"><el-icon v-if="row.icon"><component :is="row.icon" /></el-icon></template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" width="180" />
        <el-table-column prop="component" label="组件路径" width="200" />
        <el-table-column prop="perms" label="权限标识" width="180" />
        <el-table-column prop="orderNum" label="排序" width="70" />
        <el-table-column prop="visible" label="可见" width="70">
          <template #default="{ row }">
            <el-tag :type="row.visible === 1 ? 'success' : 'info'" size="small">{{ row.visible === 1 ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link icon="Plus" @click="openAdd(row.id)">子菜单</el-button>
            <el-button type="warning" link icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
              <template #reference><el-button type="danger" link icon="Delete">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑菜单' : '新增菜单'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="父菜单ID"><el-input-number v-model="form.parentId" :min="0" /></el-form-item>
        <el-form-item label="菜单名称" prop="menuName"><el-input v-model="form.menuName" /></el-form-item>
        <el-form-item label="类型" prop="menuType">
          <el-radio-group v-model="form.menuType">
            <el-radio :value="1">目录</el-radio>
            <el-radio :value="2">菜单</el-radio>
            <el-radio :value="3">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="路由路径" v-if="form.menuType !== 3"><el-input v-model="form.path" /></el-form-item>
        <el-form-item label="组件路径" v-if="form.menuType === 2">
          <el-input v-model="form.component" placeholder="如 system/user/index" />
        </el-form-item>
        <el-form-item label="权限标识" v-if="form.menuType === 3">
          <el-input v-model="form.perms" placeholder="如 system:user:add" />
        </el-form-item>
        <el-form-item label="图标"><el-input v-model="form.icon" placeholder="Element Plus 图标名" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.orderNum" :min="0" /></el-form-item>
        <el-form-item label="可见"><el-switch v-model="form.visible" :active-value="1" :inactive-value="0" /></el-form-item>
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
import { getMenuTree, saveMenu, updateMenu, deleteMenu, type MenuItem } from '../../../api/system'

const loading = ref(false), saving = ref(false)
const menuTree = ref<MenuItem[]>([])
const dialogVisible = ref(false), editId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ parentId: 0, menuName: '', menuType: 2, path: '', component: '', perms: '', icon: '', orderNum: 0, visible: 1, status: 1 })
const rules: FormRules = {
  menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
}

async function loadData() {
  loading.value = true; try { menuTree.value = await getMenuTree() } finally { loading.value = false }
}
function openAdd(parentId: number) {
  editId.value = null
  Object.assign(form, { parentId, menuName: '', menuType: 2, path: '', component: '', perms: '', icon: '', orderNum: 0, visible: 1, status: 1 })
  dialogVisible.value = true
}
function openEdit(row: MenuItem) { editId.value = row.id; Object.assign(form, row); dialogVisible.value = true }
async function handleSave() {
  await formRef.value?.validate()
  saving.value = true
  try {
    editId.value ? await updateMenu({ ...form, id: editId.value }) : await saveMenu(form)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } finally { saving.value = false }
}
async function handleDelete(id: number) { await deleteMenu(id); ElMessage.success('删除成功'); loadData() }
onMounted(loadData)
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
</style>
