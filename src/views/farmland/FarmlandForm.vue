<template>
  <div class="farmland-form">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑地块' : '新增地块' }}</span>
          <el-button text @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon> 返回
          </el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="large" style="max-width: 600px;">
        <el-form-item label="地块名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入地块名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="所属客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width: 100%">
            <el-option v-for="item in customerOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="作物类型" prop="cropType">
          <el-select v-model="form.cropType" placeholder="请选择作物类型" style="width: 100%">
            <el-option label="水稻" value="rice" />
            <el-option label="小麦" value="wheat" />
            <el-option label="玉米" value="corn" />
            <el-option label="果树" value="fruit" />
            <el-option label="蔬菜" value="vegetable" />
          </el-select>
        </el-form-item>
        <el-form-item label="面积(亩)" prop="area">
          <el-input-number v-model="form.area" :min="0.1" :max="100000" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="详细地址" prop="location">
          <el-input v-model="form.location" placeholder="请输入详细地址" maxlength="200" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number v-model="form.longitude" :precision="6" :step="0.0001" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number v-model="form.latitude" :precision="6" :step="0.0001" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getFarmlandDetail, createFarmland, updateFarmland } from '@/api/farmland'
import { getCustomerOptions } from '@/api/customer'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '', customerId: '', cropType: '', area: null, location: '', longitude: null, latitude: null, remark: ''
})

const customerOptions = ref([])

const rules = {
  name: [{ required: true, message: '请输入地块名称', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  cropType: [{ required: true, message: '请选择作物类型', trigger: 'change' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
  location: [{ required: true, message: '请输入地址', trigger: 'blur' }]
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateFarmland(route.params.id, form)
        ElMessage.success('修改成功')
      } else {
        await createFarmland(form)
        ElMessage.success('新增成功')
      }
      router.push('/farmland/list')
    } catch (error) { ElMessage.error('操作失败') }
    finally { submitting.value = false }
  })
}

async function loadCustomerOptions() {
  try {
    const res = await getCustomerOptions()
    customerOptions.value = res.data || []
  } catch (error) {
    ElMessage.error('获取客户列表失败')
  }
}

onMounted(async () => {
  await loadCustomerOptions()
  if (isEdit.value) {
    try {
      const res = await getFarmlandDetail(route.params.id)
      const data = res.data || res
      Object.assign(form, {
        name: data.name,
        customerId: data.customerId,
        cropType: data.cropType,
        area: data.area,
        location: data.location,
        longitude: data.longitude,
        latitude: data.latitude,
        remark: data.remark
      })
    } catch (error) {
      ElMessage.error('获取地块信息失败')
    }
  }
})
</script>

<style scoped>
.farmland-form { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
</style>
