<template>
  <div class="page-container">
    <el-card>
      <div class="search-bar">
        <el-input v-model="query.configName" placeholder="搜索配置名称" clearable style="width:220px" @keyup.enter="loadData" />
        <el-button type="primary" icon="Search" @click="loadData">查询</el-button>
        <el-button type="success" icon="Plus" @click="openAdd">新增</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="configName" label="配置名称" width="180" />
        <el-table-column prop="configKey" label="配置键" width="200" />
        <el-table-column prop="configValue" label="配置值" min-width="200" show-overflow-tooltip />
        <el-table-column prop="configType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.configType === 0 ? 'info' : 'success'" size="small">
              {{ row.configType === 0 ? '系统内置' : '用户自定义' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" link icon="Edit" @click="openEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link icon="Delete" :disabled="row.configType === 0">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize"
        :total="total" layout="total, sizes, prev, pager, next" @change="loadData" class="pagination" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑配置' : '新增配置'" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="配置名称" prop="configName"><el-input v-model="form.configName" /></el-form-item>
        <el-form-item label="配置键" prop="configKey">
          <el-input v-model="form.configKey" :disabled="!!editId" />
        </el-form-item>
        <el-form-item label="配置值"><el-input v-model="form.configValue" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" /></el-form-item>
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
import { getConfigPage, saveConfig, updateConfig, deleteConfig, type Config } from '../../../api/system'

const loading = ref(false), saving = ref(false)
const list = ref<Config[]>([]), total = ref(0)
const dialogVisible = ref(false), editId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const query = reactive({ pageNum: 1, pageSize: 10, configName: '' })
const form = reactive({ configName: '', configKey: '', configValue: '', configType: 1, remark: '' })
const rules: FormRules = {
  configName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
  configKey: [{ required: true, message: '配置键不能为空', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try { const res = await getConfigPage(query); list.value = res.list; total.value = res.total } finally { loading.value = false }
}
function openAdd() {
  editId.value = null; Object.assign(form, { configName: '', configKey: '', configValue: '', configType: 1, remark: '' }); dialogVisible.value = true
}
function openEdit(row: Config) { editId.value = row.id; Object.assign(form, row); dialogVisible.value = true }
async function handleSave() {
  await formRef.value?.validate(); saving.value = true
  try {
    editId.value ? await updateConfig({ ...form, id: editId.value }) : await saveConfig(form)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } finally { saving.value = false }
}
async function handleDelete(id: number) { await deleteConfig(id); ElMessage.success('删除成功'); loadData() }
onMounted(loadData)
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
