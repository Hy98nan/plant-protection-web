<template>
  <div class="price-list">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>定价管理</span>
          <el-button type="primary" @click="handleCreate">添加定价</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="定价类型">
          <el-select v-model="searchForm.priceType" placeholder="全部" style="width: 150px">
            <el-option label="作业服务费" value="service" />
            <el-option label="药剂费" value="pesticide" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.enabled" placeholder="全部" style="width: 120px">
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="定价类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.priceType === 'service' ? 'primary' : 'success'">
              {{ row.priceType === 'service' ? '作业服务费' : '药剂费' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cropType" label="适用作物" width="120">
          <template #default="{ row }">
            {{ row.cropType || '通用' }}
          </template>
        </el-table-column>
        <el-table-column prop="taskType" label="任务类型" width="120">
          <template #default="{ row }">
            {{ getTaskTypeName(row.taskType) }}
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价" width="100">
          <template #default="{ row }">
            ¥{{ row.unitPrice }}
            <span v-if="row.priceType === 'service'">/亩</span>
            <span v-else>/升</span>
          </template>
        </el-table-column>
        <el-table-column prop="dosagePerAcre" label="推荐用量" width="120">
          <template #default="{ row }">
            {{ row.dosagePerAcre ? row.dosagePerAcre + ' ml/亩' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button text size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button text size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button text size="small" :type="row.enabled ? 'info' : 'success'" @click="toggleStatus(row)">
              {{ row.enabled ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑定价' : '添加定价'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="定价类型" prop="priceType">
          <el-select v-model="form.priceType" placeholder="请选择定价类型" style="width: 100%">
            <el-option label="作业服务费" value="service" />
            <el-option label="药剂费" value="pesticide" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用作物">
          <el-input v-model="form.cropType" placeholder="为空表示通用" />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="form.taskType" placeholder="为空表示通用" style="width: 100%">
            <el-option label="喷洒" value="spray" />
            <el-option label="播种" value="sow" />
            <el-option label="施肥" value="fertilize" />
            <el-option label="巡查" value="scout" />
          </el-select>
        </el-form-item>
        <el-form-item label="单价" prop="unitPrice">
          <el-input-number v-model="form.unitPrice" :min="0.01" :precision="2" placeholder="元" style="width: 100%" />
        </el-form-item>
        <el-form-item label="推荐用量" v-if="form.priceType === 'pesticide'">
          <el-input-number v-model="form.dosagePerAcre" :min="0" :precision="2" placeholder="ml/亩" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序优先级">
          <el-input-number v-model="form.sortOrder" :min="0" placeholder="数字越小优先级越高" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPriceConfigPage, createPriceConfig, updatePriceConfig, deletePriceConfig } from '@/api/priceConfig'

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const tableData = ref([])
const loading = ref(false)

const searchForm = reactive({
  priceType: '',
  enabled: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  priceType: '',
  cropType: '',
  taskType: '',
  pesticideId: null,
  unitPrice: null,
  dosagePerAcre: null,
  enabled: true,
  sortOrder: 0,
  remark: ''
})

const rules = {
  priceType: [{ required: true, message: '请选择定价类型', trigger: 'change' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }]
}

const TASK_TYPES = {
  spray: '喷洒',
  sow: '播种',
  fertilize: '施肥',
  scout: '巡查'
}

const getTaskTypeName = (type) => {
  return type ? TASK_TYPES[type] || type : '通用'
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    if (searchForm.priceType) params.priceType = searchForm.priceType
    if (searchForm.enabled !== '') params.enabled = searchForm.enabled
    const res = await getPriceConfigPage(params)
    tableData.value = res.data?.records || []
    pagination.total = res.data?.total || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}

const handleReset = () => {
  searchForm.priceType = ''
  searchForm.enabled = ''
  pagination.pageNum = 1
  loadData()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  loadData()
}

const handleCreate = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    priceType: '',
    cropType: '',
    taskType: '',
    pesticideId: null,
    unitPrice: null,
    dosagePerAcre: null,
    enabled: true,
    sortOrder: 0,
    remark: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    priceType: row.priceType,
    cropType: row.cropType || '',
    taskType: row.taskType || '',
    pesticideId: row.pesticideId,
    unitPrice: row.unitPrice,
    dosagePerAcre: row.dosagePerAcre,
    enabled: row.enabled,
    sortOrder: row.sortOrder || 0,
    remark: row.remark || ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await updatePriceConfig(form.id, form)
        ElMessage.success('更新成功')
      } else {
        await createPriceConfig(form)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条定价配置吗？', '提示', {
      type: 'warning'
    })
    await deletePriceConfig(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const toggleStatus = async (row) => {
  try {
    await updatePriceConfig(row.id, {
      ...row,
      enabled: !row.enabled
    })
    ElMessage.success(row.enabled ? '已禁用' : '已启用')
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.price-list {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.search-form {
  margin-bottom: 20px;
}
</style>