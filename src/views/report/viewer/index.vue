<template>
  <div class="viewer-container">
    <el-card v-if="!reportId" class="selector-card">
      <template #header>选择报表</template>
      <el-select v-model="selectedId" placeholder="请选择报表" style="width:300px" @change="loadReport">
        <el-option v-for="r in reportList" :key="r.id" :label="r.reportName" :value="r.id" />
      </el-select>
    </el-card>

    <el-card v-if="currentReport" v-loading="loading">
      <template #header>
        <div class="report-header">
          <span>{{ currentReport.reportName }}</span>
          <el-tag size="small" type="info" style="margin-left:8px">
            {{ ['', '表格', '图表', '混合'][currentReport.reportType] }}
          </el-tag>
        </div>
      </template>
      <template v-if="currentReport.reportType === 1">
        <el-table :data="tableData" border stripe max-height="500">
          <el-table-column v-for="col in tableColumns" :key="col" :prop="col" :label="col" show-overflow-tooltip />
        </el-table>
        <div class="data-count">共 {{ tableData.length }} 条数据</div>
      </template>
      <template v-else-if="currentReport.reportType === 2">
        <div ref="chartRef" class="chart-area"></div>
      </template>
      <template v-else>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-table :data="tableData" border stripe max-height="400" size="small">
              <el-table-column v-for="col in tableColumns" :key="col" :prop="col" :label="col" />
            </el-table>
          </el-col>
          <el-col :span="12"><div ref="chartRef" class="chart-area"></div></el-col>
        </el-row>
      </template>
    </el-card>
    <el-empty v-else-if="!reportId" description="请选择要查看的报表" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getReportPage, getReportById, getReportData, type Report } from '../../../api/report'

const props = defineProps<{ reportId?: number }>()

const loading = ref(false)
const reportList = ref<Report[]>([])
const selectedId = ref<number | null>(null)
const currentReport = ref<Report | null>(null)
const tableData = ref<Record<string, unknown>[]>([])
const tableColumns = ref<string[]>([])
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

/** 加载报表详情和数据 */
async function loadReport(id?: number | null) {
  const rid = id ?? selectedId.value ?? props.reportId
  if (!rid) return
  loading.value = true
  try {
    currentReport.value = await getReportById(rid)
    const data = await getReportData(rid)
    tableData.value = data
    tableColumns.value = data.length > 0 ? Object.keys(data[0]) : []
    if (currentReport.value.reportType !== 1) {
      await nextTick(); renderChart(currentReport.value, data)
    }
  } finally { loading.value = false }
}

/** 渲染 ECharts 图表 */
function renderChart(report: Report, data: Record<string, unknown>[]) {
  if (!chartRef.value) return
  chartInstance?.dispose()
  chartInstance = echarts.init(chartRef.value)
  let config: any = {}
  try { config = JSON.parse(report.configJson || '{}') } catch {}
  const xField = config.xField || tableColumns.value[0] || ''
  const yField = config.yField || tableColumns.value[1] || ''
  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(d => String(d[xField] ?? '')) },
    yAxis: { type: 'value' },
    series: [{ type: config.chartType || 'bar', data: data.map(d => Number(d[yField] ?? 0)), smooth: true }]
  })
}

onMounted(async () => {
  if (props.reportId) {
    await loadReport(props.reportId)
  } else {
    const res = await getReportPage({ pageNum: 1, pageSize: 100 })
    reportList.value = res.list
  }
})

watch(() => props.reportId, (id) => { if (id) loadReport(id) })
</script>

<style scoped>
.viewer-container { min-height: 400px; }
.selector-card { margin-bottom: 16px; }
.report-header { font-weight: 600; font-size: 16px; }
.chart-area { width: 100%; height: 400px; }
.data-count { margin-top: 8px; font-size: 13px; color: #999; text-align: right; }
</style>
