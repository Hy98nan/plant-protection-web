<template>
  <div class="pesticide-form">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑药剂' : '新增药剂' }}</span>
          <el-button text @click="$router.back()"><el-icon><ArrowLeft /></el-icon> 返回</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="large" style="max-width: 600px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入药剂名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="类型" prop="pesticideType">
          <el-select v-model="form.pesticideType" placeholder="请选择类型" style="width: 100%">
            <el-option label="杀虫剂" value="insecticide" />
            <el-option label="杀菌剂" value="fungicide" />
            <el-option label="除草剂" value="herbicide" />
            <el-option label="叶面肥" value="foliar" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效成分" prop="targetPest">
          <el-input v-model="form.targetPest" placeholder="请输入有效成分" maxlength="100" />
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input v-model="form.specification" placeholder="请输入规格" maxlength="50" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="库存" prop="stockQuantity">
              <el-input-number v-model="form.stockQuantity" :min="0" :max="99999" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="form.unit" placeholder="请选择单位" style="width: 100%">
                <el-option label="升" value="升" />
                <el-option label="千克" value="千克" />
                <el-option label="瓶" value="瓶" />
                <el-option label="袋" value="袋" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="单价(元)" prop="unitPrice">
              <el-input-number v-model="form.unitPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="每亩用量" prop="dosagePerAcre">
              <el-input-number v-model="form.dosagePerAcre" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="form.manufacturer" placeholder="请输入生产厂家" maxlength="100" />
        </el-form-item>
        <el-form-item label="有效期至" prop="expiryDate">
          <el-date-picker v-model="form.expiryDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
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
import { getPesticideDetail, createPesticide, updatePesticide } from '@/api/pesticide'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  pesticideType: '',
  targetPest: '',
  specification: '',
  stockQuantity: 0,
  unit: '升',
  unitPrice: 0,
  dosagePerAcre: 0,
  manufacturer: '',
  expiryDate: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  pesticideType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  targetPest: [{ required: true, message: '请输入有效成分', trigger: 'blur' }],
  specification: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  stockQuantity: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  expiryDate: [{ required: true, message: '请选择有效期', trigger: 'change' }]
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value) {
        await updatePesticide(route.params.id, form)
        ElMessage.success('修改成功')
      } else {
        await createPesticide(form)
        ElMessage.success('新增成功')
      }
      router.push('/pesticide/list')
    } catch (error) {
      ElMessage.error(error?.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const res = await getPesticideDetail(route.params.id)
      const data = res.data
      if (data) {
        Object.assign(form, {
          name: data.name || '',
          pesticideType: data.pesticideType || '',
          targetPest: data.targetPest || '',
          specification: data.specification || '',
          stockQuantity: data.stockQuantity || 0,
          unit: data.unit || '升',
          unitPrice: data.unitPrice || 0,
          dosagePerAcre: data.dosagePerAcre || 0,
          manufacturer: data.manufacturer || '',
          expiryDate: data.expiryDate || '',
          remark: data.remark || ''
        })
      }
    } catch (error) {
      ElMessage.error('获取药剂信息失败')
      router.push('/pesticide/list')
    }
  }
})
</script>

<style scoped>
.pesticide-form { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
</style>
