<template>
  <div class="drone-form">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑无人机' : '新增无人机' }}</span>
          <el-button text @click="$router.back()"><el-icon><ArrowLeft /></el-icon> 返回</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="large" style="max-width: 600px;">
        <el-form-item label="编号" prop="droneNo">
          <el-input v-model="form.droneNo" placeholder="请输入编号" maxlength="20" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-select v-model="form.brand" placeholder="请选择品牌" style="width: 100%">
            <el-option label="大疆" value="大疆" />
            <el-option label="极飞" value="极飞" />
            <el-option label="汉和" value="汉和" />
          </el-select>
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="form.model" placeholder="请输入型号" maxlength="30" />
        </el-form-item>
        <el-form-item label="购买日期" prop="purchaseDate">
          <el-date-picker v-model="form.purchaseDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="空闲" value="idle" />
            <el-option label="作业中" value="working" />
            <el-option label="维护中" value="maintaining" />
            <el-option label="已报废" value="scrapped" />
          </el-select>
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
import { getDroneDetail, createDrone, updateDrone } from '@/api/drone'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const isEdit = computed(() => !!route.params.id)

const form = reactive({ droneNo: '', brand: '', model: '', purchaseDate: '', status: 'idle', remark: '' })

const rules = {
  droneNo: [{ required: true, message: '请输入编号', trigger: 'blur' }],
  brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  purchaseDate: [{ required: true, message: '请选择购买日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateDrone(route.params.id, form)
        ElMessage.success('修改成功')
      } else {
        await createDrone(form)
        ElMessage.success('新增成功')
      }
      router.push('/drone/list')
    }
    catch (error) { ElMessage.error('操作失败') }
    finally { submitting.value = false }
  })
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const res = await getDroneDetail(route.params.id)
      const data = res.data || res
      Object.assign(form, {
        droneNo: data.droneNo,
        brand: data.brand,
        model: data.model,
        purchaseDate: data.purchaseDate,
        status: data.status,
        remark: data.remark
      })
    } catch (error) {
      ElMessage.error('获取无人机信息失败')
    }
  }
})
</script>

<style scoped>
.drone-form { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
</style>
