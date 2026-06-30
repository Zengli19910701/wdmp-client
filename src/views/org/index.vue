<template>
  <div class="page-container">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>组织机构</span>
              <el-button type="success" size="small" icon="Plus" @click="openAdd(0)">新增顶级</el-button>
            </div>
          </template>
          <el-tree v-loading="loading" :data="orgTree"
            :props="{ label: 'orgName', children: 'children' }"
            node-key="id" highlight-current default-expand-all @node-click="handleNodeClick">
            <template #default="{ node, data }">
              <span class="tree-node">
                <span>{{ node.label }}</span>
                <span class="node-actions">
                  <el-button type="primary" link size="small" icon="Plus" @click.stop="openAdd(data.id)" />
                  <el-button type="warning" link size="small" icon="Edit" @click.stop="openEdit(data)" />
                  <el-popconfirm title="确认删除？" @confirm="handleDelete(data.id)">
                    <template #reference>
                      <el-button type="danger" link size="small" icon="Delete" @click.stop />
                    </template>
                  </el-popconfirm>
                </span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <template #header>组织详情</template>
          <template v-if="selectedOrg">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="组织ID">{{ selectedOrg.id }}</el-descriptions-item>
              <el-descriptions-item label="组织名称">{{ selectedOrg.orgName }}</el-descriptions-item>
              <el-descriptions-item label="组织编码">{{ selectedOrg.orgCode }}</el-descriptions-item>
              <el-descriptions-item label="组织类型">{{ ['', '企业', '工厂', '车间', '工段'][selectedOrg.orgType] }}</el-descriptions-item>
              <el-descriptions-item label="排序">{{ selectedOrg.orderNum }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="selectedOrg.status === 1 ? 'success' : 'danger'">{{ selectedOrg.status === 1 ? '正常' : '停用' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">{{ selectedOrg.remark }}</el-descriptions-item>
            </el-descriptions>
          </template>
          <el-empty v-else description="请点击左侧组织节点查看详情" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑组织' : '新增组织'" width="480px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="父组织ID"><el-input-number v-model="form.parentId" :min="0" /></el-form-item>
        <el-form-item label="组织名称" prop="orgName"><el-input v-model="form.orgName" /></el-form-item>
        <el-form-item label="组织编码"><el-input v-model="form.orgCode" /></el-form-item>
        <el-form-item label="组织类型">
          <el-select v-model="form.orgType" style="width:100%">
            <el-option :value="1" label="企业" /><el-option :value="2" label="工厂" />
            <el-option :value="3" label="车间" /><el-option :value="4" label="工段" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.orderNum" :min="0" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
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
import { getOrgTree, saveOrg, updateOrg, deleteOrg, type Org } from '../../api/org'

const loading = ref(false), saving = ref(false)
const orgTree = ref<Org[]>([])
const dialogVisible = ref(false), editId = ref<number | null>(null)
const selectedOrg = ref<Org | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ parentId: 0, orgName: '', orgCode: '', orgType: 1, orderNum: 0, status: 1, remark: '' })
const rules: FormRules = { orgName: [{ required: true, message: '组织名称不能为空', trigger: 'blur' }] }

async function loadData() {
  loading.value = true; try { orgTree.value = await getOrgTree() } finally { loading.value = false }
}
function handleNodeClick(data: Org) { selectedOrg.value = data }
function openAdd(parentId: number) {
  editId.value = null; Object.assign(form, { parentId, orgName: '', orgCode: '', orgType: 1, orderNum: 0, status: 1, remark: '' }); dialogVisible.value = true
}
function openEdit(row: Org) { editId.value = row.id; Object.assign(form, row); dialogVisible.value = true }
async function handleSave() {
  await formRef.value?.validate(); saving.value = true
  try {
    editId.value ? await updateOrg({ ...form, id: editId.value }) : await saveOrg(form)
    ElMessage.success('保存成功'); dialogVisible.value = false; loadData()
  } finally { saving.value = false }
}
async function handleDelete(id: number) { await deleteOrg(id); ElMessage.success('删除成功'); selectedOrg.value = null; loadData() }
onMounted(loadData)
</script>

<style scoped>
.tree-node { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.node-actions { display: none; }
.tree-node:hover .node-actions { display: flex; }
</style>
