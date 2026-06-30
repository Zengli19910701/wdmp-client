<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :span="10">
        <el-card>
          <template #header>发送消息</template>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="消息标题" prop="title"><el-input v-model="form.title" /></el-form-item>
            <el-form-item label="消息内容" prop="content">
              <el-input v-model="form.content" type="textarea" :rows="4" />
            </el-form-item>
            <el-form-item label="消息类型">
              <el-select v-model="form.msgType" style="width:100%">
                <el-option :value="1" label="📢 通知" />
                <el-option :value="2" label="⚠️ 警告" />
                <el-option :value="3" label="🚨 紧急" />
              </el-select>
            </el-form-item>
            <el-form-item label="推送目标">
              <el-radio-group v-model="form.targetType">
                <el-radio :value="0">全体用户</el-radio>
                <el-radio :value="1">指定用户</el-radio>
                <el-radio :value="2">指定角色</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="目标ID" v-if="form.targetType !== 0">
              <el-input v-model="form.targetIds" placeholder="多个ID用逗号分隔" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Promotion" :loading="sending" @click="handleSend">立即发送</el-button>
              <el-button icon="DocumentAdd" @click="handleDraft">保存草稿</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>消息历史</span>
              <el-button icon="Refresh" size="small" @click="loadData">刷新</el-button>
            </div>
          </template>
          <el-table :data="list" v-loading="loading" stripe border max-height="500">
            <el-table-column prop="title" label="标题" width="150" show-overflow-tooltip />
            <el-table-column prop="msgType" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="(['', '', 'warning', 'danger'] as any)[row.msgType]" size="small">
                  {{ ['', '通知', '警告', '紧急'][row.msgType] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="targetType" label="目标" width="90">
              <template #default="{ row }">{{ ['全体', '用户', '角色'][row.targetType] }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '已发送' : '草稿' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sendTime" label="发送时间" width="160" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
                  <template #reference><el-button type="danger" link icon="Delete">删除</el-button></template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize"
            :total="total" layout="total, prev, pager, next" @change="loadData" class="pagination" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getPushPage, sendMsg, saveDraft, deleteMsg, type PushMsg } from '../../api/push'

const loading = ref(false), sending = ref(false)
const list = ref<PushMsg[]>([]), total = ref(0)
const formRef = ref<FormInstance>()
const query = reactive({ pageNum: 1, pageSize: 10 })
const form = reactive({ title: '', content: '', msgType: 1, targetType: 0, targetIds: '' })
const rules: FormRules = {
  title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try { const res = await getPushPage(query); list.value = res.list; total.value = res.total } finally { loading.value = false }
}
async function handleSend() {
  await formRef.value?.validate(); sending.value = true
  try { await sendMsg(form); ElMessage.success('消息发送成功'); resetForm(); loadData() } finally { sending.value = false }
}
async function handleDraft() {
  await formRef.value?.validate(); await saveDraft(form); ElMessage.success('草稿已保存'); loadData()
}
async function handleDelete(id: number) { await deleteMsg(id); ElMessage.success('删除成功'); loadData() }
function resetForm() { Object.assign(form, { title: '', content: '', msgType: 1, targetType: 0, targetIds: '' }) }
onMounted(loadData)
</script>

<style scoped>
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
