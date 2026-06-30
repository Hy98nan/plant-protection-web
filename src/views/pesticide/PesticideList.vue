<template>
  <div class="pesticide-list">
    <el-card shadow="hover" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="名称/成分" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="全部" clearable style="width: 120px">
            <el-option label="杀虫剂" value="insecticide" />
            <el-option label="杀菌剂" value="fungicide" />
            <el-option label="除草剂" value="herbicide" />
            <el-option label="叶面肥" value="foliar" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <span>药剂列表</span>
          <el-button type="primary" icon="Plus" @click="$router.push('/pesticide/form')">新增药剂</el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="type" label="类型" width="90">
          <template #default="{ row }">{{ getTypeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="ingredient" label="有效成分" width="120" show-overflow-tooltip />
        <el-table-column prop="specification" label="规格" width="100" />
        <el-table-column prop="stock" label="库存(升)" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.stock < 10 ? '#F56C6C' : '#333', fontWeight: row.stock < 10 ? '600' : 'normal' }">
              {{ row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价(元/升)" width="110" align="right" />
        <el-table-column prop="manufacturer" label="生产厂家" min-width="140" show-overflow-tooltip />
        <el-table-column prop="expiryDate" label="有效期至" width="110" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="$router.push(`/pesticide/form/${row.id}`)">编辑</el-button>
            <el-button type="danger" text size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const queryParams = reactive({ keyword: '', type: '', page: 1, pageSize: 20 })

const typeMap = { insecticide: '杀虫剂', fungicide: '杀菌剂', herbicide: '除草剂', foliar: '叶面肥' }
function getTypeLabel(t) { return typeMap[t] || t }

async function fetchData() {
  loading.value = true
  try {
    tableData.value = [
      { id: 1, name: '草甘膦', type: 'herbicide', ingredient: '草甘膦异丙胺盐', specification: '41%水剂', stock: 50, unitPrice: 15.00, manufacturer: '山东农药化工有限公司', expiryDate: '2025-06-01' },
      { id: 2, name: '吡虫啉', type: 'insecticide', ingredient: '吡虫啉', specification: '10%可湿性粉剂', stock: 30, unitPrice: 25.00, manufacturer: '江苏扬农化工股份有限公司', expiryDate: '2025-08-15' },
      { id: 3, name: '多菌灵', type: 'fungicide', ingredient: '多菌灵', specification: '50%可湿性粉剂', stock: 8, unitPrice: 18.00, manufacturer: '安徽华星化工有限公司', expiryDate: '2025-03-20' },
      { id: 4, name: '阿维菌素', type: 'insecticide', ingredient: '阿维菌素B1', specification: '5%乳油', stock: 45, unitPrice: 35.00, manufacturer: '河北威远生物化工有限公司', expiryDate: '2025-12-01' },
      { id: 5, name: '磷酸二氢钾', type: 'foliar', ingredient: '磷酸二氢钾', specification: '99%晶体', stock: 100, unitPrice: 8.00, manufacturer: '四川什邡市川鸿化工有限公司', expiryDate: '2026-01-15' }
    ]
    total.value = 5
  } catch (error) { ElMessage.error('获取药剂列表失败') }
  finally { loading.value = false }
}

function handleSearch() { queryParams.page = 1; fetchData() }
function handleReset() { queryParams.keyword = ''; queryParams.type = ''; queryParams.page = 1; fetchData() }

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除药剂"${row.name}"吗？`, '提示', { type: 'warning' })
    ElMessage.success('删除成功'); fetchData()
  } catch (e) {}
}

onMounted(() => { fetchData() })
</script>

<style scoped>
.pesticide-list { width: 100%; }
.search-card { margin-bottom: 16px; border-radius: 8px; }
.table-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.pagination-container { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
