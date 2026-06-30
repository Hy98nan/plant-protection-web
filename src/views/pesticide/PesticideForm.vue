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
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="杀虫剂" value="insecticide" />
            <el-option label="杀菌剂" value="fungicide" />
            <el-option label="除草剂" value="herbicide" />
            <el-option label="叶面肥" value="foliar" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效成分" prop="ingredient">
          <el-input v-model="form.ingredient" placeholder="请输入有效成分" maxlength="100" />
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input v-model="form.specification" placeholder="请输入规格" maxlength="50" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="库存(升)" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :max="99999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价(元)" prop="unitPrice">
              <el-input-number v-model="form.unitPrice" :min="0" :precision="2" style="width: 100%" />
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

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const isEdit = computed(() => !!route.params.id)

const form = reactive({ name: '', type: '', ingredient: '', specification: '', stock: 0, unitPrice: 0, manufacturer: '', expiryDate: '', remark: '' })

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  ingredient: [{ required: true, message: '请输入有效成分', trigger: 'blur' }],
  specification: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  expiryDate: [{ required: true, message: '请选择有效期', trigger: 'change' }]
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try { ElMessage.success(isEdit.value ? '修改成功' : '新增成功'); router.push('/pesticide/list') }
    catch (error) { ElMessage.error('操作失败') }
    finally { submitting.value = false }
  })
}

onMounted(() => {
  if (isEdit.value) {
    form.name = '草甘膦'; form.type = 'herbicide'; form.ingredient = '草甘膦异丙胺盐'
    form.specification = '41%水剂'; form.stock = 50; form.unitPrice = 15.00
    form.manufacturer = '山东农药化工有限公司'; form.expiryDate = '2025-06-01'
  }
})
</script>

<style scoped>
.pesticide-form { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
</style>
