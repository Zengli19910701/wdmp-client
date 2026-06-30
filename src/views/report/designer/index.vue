<template>
  <div class="page-container">
    <el-card>
      <div class="search-bar">
        <el-input v-model="query.reportName" placeholder="搜索报表名称" clearable style="width:220px" @keyup.enter="loadData" />
        <el-button type="primary" icon="Search" @click="loadData">查询</el-button>
        <el-button type="success" icon="Plus" @click="openAdd">新建报表</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="reportName" label="报表名称" width="200" />
        <el-table-column prop="reportType" label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="['', '', 'success', 'warning'][row.reportType] as any" size="small">
              {{ ['', '表格', '图表', '混合'][row.reportType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link icon="Edit" @click="openEdit(row)">设计</el-button>
            <el-button type="success" link icon="View" @click="preview(row.id)">预览</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
              <template #reference><el-button type="danger" link icon="Delete">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize"
        :total="total" layout="total, sizes, prev, pager, next" @change="loadData" class="pagination" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑报表' : '新建报表'" width="700px" top="5vh">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="报表名称" prop="reportName"><el-input v-model="form.reportName" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报表类型" prop="reportType">
              <el-select v-model="form.reportType" style="width:100%">
                <el-option :value="1" label="表格报表" />
                <el-option :value="2" label="图表报表" />
                <el-option :value="3" label="混合报表" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="数据SQL" prop="dataSql">
          <el-input v-model="form.dataSql" type="textarea" :rows="5" placeholder="输入 SELECT 查询语句，用于获取报表数据" />
        </el-form-item>
        <el-form-item label="图表配置" v-if="form.reportType !== 1">
          <el-input v-model="form.configJson" type="textarea" :rows="6"
            placeholder='JSON格式，示例：{"chartType":"bar","xField":"name","yField":"value"}' />
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="报表预览" width="900px" top="5vh">
      <ReportViewer v-if="previewId" :report-id="previewId" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getReportPage, saveReport, updateReport, deleteReport, type Report } from '../../../api/report'
import ReportViewer from '../viewer/index.vue'

const loading = ref(false), saving = ref(false)
const list = ref<Report[]>([]), total = ref(0)
const dialogVisible = ref(false), previewVisible = ref(false)
const editId = ref<number | null>(null), previewId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const query = reactive({ pageNum: 1, pageSize: 10, reportName: '' })
const form = reactive({ reportName: '', reportType: 1, dataSql: '', configJson: '', remark: '', status: 1 })
const rules: FormRules = {
  reportName: [{ required: true, message: '报表名称不能为空', trigger: 'blur' }],
  reportType: [{ required: true, message: '请选择报表类型', trigger: 'change' }],
  dataSql: [{ required: true, message: '数据SQL不能为空', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try { const res = await getReportPage(query); list.value = res.list; total.value = res.total } finally { loading.value = false }
}
function openAdd() {
  editId.value = null; Object.assign(form, { reportName: '', reportType: 1, dataSql: '', configJson: '', remark: '', status: 1 }); dialogVisible.value = true
}
function openEdit(row: Report) { editId.value = row.id; Object.assign(form, row); dialogVisible.value = true }
function preview(id: number) { previewId.value = id; previewVisible.value = true }
async function handleSave() {
  await formRef.value?.validate(); saving.value = true
  try {
    editId.value ? await updateReport({ ...form, id: editId.value }) : await saveReport(form)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } finally { saving.value = false }
}
async function handleDelete(id: number) { await deleteReport(id); ElMessage.success('删除成功'); loadData() }
onMounted(loadData)
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
