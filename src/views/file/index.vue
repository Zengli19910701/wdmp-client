<template>
  <div class="page-container">
    <el-card>
      <div class="search-bar">
        <el-upload :action="uploadUrl" :headers="uploadHeaders"
          :on-success="handleUploadSuccess" :on-error="handleUploadError" :show-file-list="false">
          <el-button type="primary" icon="Upload">上传文件</el-button>
        </el-upload>
        <el-button icon="Refresh" @click="loadData">刷新</el-button>
      </div>
      <el-table :data="list" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="fileType" label="类型" width="80">
          <template #default="{ row }"><el-tag size="small">{{ row.fileType }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="fileSize" label="大小" width="100">
          <template #default="{ row }">{{ formatSize(row.fileSize) }}</template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link icon="Download" @click="handleDownload(row.id, row.fileName)">下载</el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize"
        :total="total" layout="total, sizes, prev, pager, next" @change="loadData" class="pagination" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getFilePage, deleteFile, getDownloadUrl, type SysFile } from '../../api/file'

const loading = ref(false)
const list = ref<SysFile[]>([]), total = ref(0)
const query = reactive({ pageNum: 1, pageSize: 10 })

/** 上传接口地址（直连后端） */
const uploadUrl = 'http://localhost:8080/api/files/upload'
/** 上传时附带 Token */
const uploadHeaders = computed(() => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }))

/** 格式化文件大小 */
function formatSize(bytes: number): string {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

async function loadData() {
  loading.value = true
  try { const res = await getFilePage(query); list.value = res.list; total.value = res.total } finally { loading.value = false }
}
function handleUploadSuccess() { ElMessage.success('上传成功'); loadData() }
function handleUploadError() { ElMessage.error('上传失败，请检查文件类型和大小') }

/** 文件下载 */
function handleDownload(id: number, fileName: string) {
  const a = document.createElement('a')
  a.href = getDownloadUrl(id); a.download = fileName; a.click()
}
async function handleDelete(id: number) { await deleteFile(id); ElMessage.success('删除成功'); loadData() }

onMounted(loadData)
</script>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.pagination { margin-top: 16px; justify-content: flex-end; }
</style>
