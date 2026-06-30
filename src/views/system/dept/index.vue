<template>
  <div class="page-container">
    <el-card>
      <div class="search-bar">
        <el-button type="success" icon="Plus" @click="openAdd(0)">新增</el-button>
        <el-button icon="Refresh" @click="loadData">刷新</el-button>
      </div>
      <el-table :data="deptTree" v-loading="loading" row-key="id" border default-expand-all>
        <el-table-column prop="deptName" label="部门名称" min-width="200" />
        <el-table-column prop="orderNum" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link icon="Plus" @click="openAdd(row.id)">子部门</el-button>
            <el-button type="warning" link icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
              <template #reference><el-button type="danger" link icon="Delete">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑部门' : '新增部门'" width="420px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="父部门ID"><el-input-number v-model="form.parentId" :min="0" /></el-form-item>
        <el-form-item label="部门名称" prop="deptName"><el-input v-model="form.deptName" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.orderNum" :min="0" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
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
import { getDeptTree, saveDept, updateDept, deleteDept, type Dept } from '../../../api/system'

const loading = ref(false), saving = ref(false)
const deptTree = ref<Dept[]>([])
const dialogVisible = ref(false), editId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ parentId: 0, deptName: '', orderNum: 0, status: 1 })
const rules: FormRules = { deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }] }

async function loadData() {
  loading.value = true; try { deptTree.value = await getDeptTree() } finally { loading.value = false }
}
function openAdd(parentId: number) {
  editId.value = null; Object.assign(form, { parentId, deptName: '', orderNum: 0, status: 1 }); dialogVisible.value = true
}
function openEdit(row: Dept) { editId.value = row.id; Object.assign(form, row); dialogVisible.value = true }
async function handleSave() {
  await formRef.value?.validate(); saving.value = true
  try {
    editId.value ? await updateDept({ ...form, id: editId.value }) : await saveDept(form)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } finally { saving.value = false }
}
async function handleDelete(id: number) { await deleteDept(id); ElMessage.success('删除成功'); loadData() }
onMounted(loadData)
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
</style>
