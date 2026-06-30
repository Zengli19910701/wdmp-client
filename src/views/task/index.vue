<template>
  <div class="page-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="任务列表" name="jobs">
        <el-card>
          <div class="search-bar">
            <el-input v-model="query.jobName" placeholder="搜索任务名称" clearable style="width:220px" @keyup.enter="loadData" />
            <el-button type="primary" icon="Search" @click="loadData">查询</el-button>
            <el-button type="success" icon="Plus" @click="openAdd">新增任务</el-button>
          </div>
          <el-table :data="list" v-loading="loading" stripe border>
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="jobName" label="任务名称" width="160" />
            <el-table-column prop="cronExpr" label="Cron表达式" width="150" />
            <el-table-column prop="beanName" label="Bean名称" width="160" />
            <el-table-column prop="methodName" label="方法名" width="120" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '运行中' : '已停止' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link icon="Edit" @click="openEdit(row)">编辑</el-button>
                <el-button v-if="row.status === 0" type="success" link icon="VideoPlay" @click="handleStart(row.id)">启动</el-button>
                <el-button v-else type="warning" link icon="VideoPause" @click="handleStop(row.id)">停止</el-button>
                <el-button type="info" link icon="Promotion" @click="handleTrigger(row.id)">执行</el-button>
                <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
                  <template #reference><el-button type="danger" link icon="Delete">删除</el-button></template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize"
            :total="total" layout="total, sizes, prev, pager, next" @change="loadData" class="pagination" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="执行日志" name="logs">
        <el-card>
          <el-button icon="Refresh" @click="loadLogs" style="margin-bottom:16px">刷新</el-button>
          <el-table :data="logList" v-loading="logLoading" stripe border>
            <el-table-column prop="id" label="日志ID" width="90" />
            <el-table-column prop="jobName" label="任务名称" width="160" />
            <el-table-column prop="status" label="执行状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '成功' : '失败' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="180" />
            <el-table-column prop="costMs" label="耗时(ms)" width="100" />
            <el-table-column prop="message" label="执行信息" show-overflow-tooltip />
          </el-table>
          <el-pagination v-model:current-page="logQuery.pageNum" v-model:page-size="logQuery.pageSize"
            :total="logTotal" layout="total, prev, pager, next" @change="loadLogs" class="pagination" />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑任务' : '新增任务'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="任务名称" prop="jobName"><el-input v-model="form.jobName" /></el-form-item>
        <el-form-item label="任务分组"><el-input v-model="form.jobGroup" /></el-form-item>
        <el-form-item label="Cron表达式" prop="cronExpr">
          <el-input v-model="form.cronExpr" placeholder="如 0 0/5 * * * ?" />
        </el-form-item>
        <el-form-item label="Bean名称" prop="beanName"><el-input v-model="form.beanName" /></el-form-item>
        <el-form-item label="方法名" prop="methodName"><el-input v-model="form.methodName" /></el-form-item>
        <el-form-item label="参数"><el-input v-model="form.params" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" /></el-form-item>
        <el-form-item label="启动">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="立即启动" />
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
import { getJobPage, saveJob, updateJob, deleteJob, startJob, stopJob, triggerJob, getJobLogs, type Job, type JobLog } from '../../api/task'

const activeTab = ref('jobs'), loading = ref(false), saving = ref(false), logLoading = ref(false)
const list = ref<Job[]>([]), total = ref(0), logList = ref<JobLog[]>([]), logTotal = ref(0)
const dialogVisible = ref(false), editId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const query = reactive({ pageNum: 1, pageSize: 10, jobName: '' })
const logQuery = reactive({ pageNum: 1, pageSize: 10 })
const form = reactive({ jobName: '', jobGroup: 'DEFAULT', cronExpr: '', beanName: '', methodName: '', params: '', remark: '', status: 1 })
const rules: FormRules = {
  jobName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  cronExpr: [{ required: true, message: 'Cron表达式不能为空', trigger: 'blur' }],
  beanName: [{ required: true, message: 'Bean名称不能为空', trigger: 'blur' }],
  methodName: [{ required: true, message: '方法名不能为空', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try { const res = await getJobPage(query); list.value = res.list; total.value = res.total } finally { loading.value = false }
}
async function loadLogs() {
  logLoading.value = true
  try { const res = await getJobLogs(logQuery); logList.value = res.list; logTotal.value = res.total } finally { logLoading.value = false }
}
function openAdd() {
  editId.value = null; Object.assign(form, { jobName: '', jobGroup: 'DEFAULT', cronExpr: '', beanName: '', methodName: '', params: '', remark: '', status: 1 }); dialogVisible.value = true
}
function openEdit(row: Job) { editId.value = row.id; Object.assign(form, row); dialogVisible.value = true }
async function handleSave() {
  await formRef.value?.validate(); saving.value = true
  try {
    editId.value ? await updateJob({ ...form, id: editId.value }) : await saveJob(form)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } finally { saving.value = false }
}
async function handleDelete(id: number) { await deleteJob(id); ElMessage.success('删除成功'); loadData() }
async function handleStart(id: number) { await startJob(id); ElMessage.success('任务已启动'); loadData() }
async function handleStop(id: number) { await stopJob(id); ElMessage.success('任务已停止'); loadData() }
async function handleTrigger(id: number) { await triggerJob(id); ElMessage.success('已触发执行') }

onMounted(() => { loadData(); loadLogs() })
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
