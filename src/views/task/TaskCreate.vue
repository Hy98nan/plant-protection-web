<template>
  <div class="task-create">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑草稿' : '创建任务' }}</span>
          <el-button text @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon> 返回
          </el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        size="large"
        class="task-form"
      >
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="任务类型" prop="taskType">
              <el-select v-model="form.taskType" placeholder="请选择任务类型" style="width: 100%">
                <el-option v-for="item in TASK_TYPES" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">作业信息</el-divider>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="客户" prop="customerId">
              <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width: 100%" @change="handleCustomerChange">
                <el-option v-for="item in customerOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地块" prop="farmlandId">
              <el-select v-model="form.farmlandId" placeholder="请选择地块" filterable style="width: 100%">
                <el-option v-for="item in filteredFarmlandOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="作业面积" prop="plannedArea">
              <el-input-number v-model="form.plannedArea" :min="0.1" :max="10000" :precision="1" placeholder="亩" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="药剂" prop="pesticideId">
              <el-select v-model="form.pesticideId" placeholder="请选择药剂" filterable style="width: 100%">
                <el-option v-for="item in pesticideOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="每亩用量">
              <el-input-number v-model="form.dosagePerAcre" :min="0" :precision="2" placeholder="ml/亩" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">调度信息</el-divider>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="指派飞手" prop="pilotId">
              <el-select v-model="form.pilotId" placeholder="请选择飞手" filterable style="width: 100%">
                <el-option v-for="item in pilotOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="指派无人机" prop="droneId">
              <el-select v-model="form.droneId" placeholder="请选择无人机" filterable style="width: 100%">
                <el-option v-for="item in droneOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="计划日期" prop="plannedDate">
              <el-date-picker v-model="form.plannedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">备注</el-divider>
        <el-form-item label="备注">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入备注信息" maxlength="500" show-word-limit />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ isEdit ? '发布任务' : '提交任务' }}</el-button>
          <el-button :loading="submitting" @click="handleSaveDraft">保存草稿</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { TASK_TYPES } from '@/utils/constants'
import { createTask, saveDraft, publishDraft, getTaskDetail } from '@/api/task'
import { getCustomerOptions } from '@/api/customer'
import { getFarmlandOptions } from '@/api/farmland'
import { getDroneOptions } from '@/api/drone'
import { getPesticideOptions } from '@/api/pesticide'
import { getPilotOptions } from '@/api/pilot'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const submitting = ref(false)
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  taskType: '',
  priority: 'medium',
  customerId: '',
  farmlandId: '',
  plannedArea: null,
  pesticideId: '',
  dosagePerAcre: null,
  pilotId: '',
  droneId: '',
  plannedDate: '',
  description: ''
})

const rules = {
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  farmlandId: [{ required: true, message: '请选择地块', trigger: 'change' }],
  plannedArea: [{ required: true, message: '请输入作业面积', trigger: 'blur' }],
  pilotId: [{ required: true, message: '请选择飞手', trigger: 'change' }],
  droneId: [{ required: true, message: '请选择无人机', trigger: 'change' }],
  plannedDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }]
}

const customerOptions = ref([])
const farmlandOptions = ref([])
const pesticideOptions = ref([])
const pilotOptions = ref([])
const droneOptions = ref([])

const filteredFarmlandOptions = computed(() => {
  if (!form.customerId) return farmlandOptions.value
  return farmlandOptions.value.filter(item => item.customerId === form.customerId)
})

async function loadOptions() {
  try {
    const [customerRes, farmlandRes, pesticideRes, pilotRes, droneRes] = await Promise.all([
      getCustomerOptions(),
      getFarmlandOptions(),
      getPesticideOptions(),
      getPilotOptions(),
      getDroneOptions()
    ])
    customerOptions.value = customerRes.data || []
    farmlandOptions.value = farmlandRes.data || []
    pesticideOptions.value = pesticideRes.data || []
    pilotOptions.value = pilotRes.data || []
    droneOptions.value = droneRes.data || []
  } catch (error) {
    ElMessage.error('加载选项数据失败')
  }
}

function handleCustomerChange() {
  form.farmlandId = ''
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (form.id) {
        await publishDraft(form.id)
        ElMessage.success('任务发布成功')
      } else {
        await createTask(form)
        ElMessage.success('任务创建成功')
      }
      router.push('/task/list')
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

async function handleSaveDraft() {
  submitting.value = true
  try {
    const draftData = { ...form }
    const res = await saveDraft(draftData)
    if (res.data?.id) {
      form.id = res.data.id
    }
    ElMessage.success('草稿已保存')
    router.push('/task/list')
  } catch (error) {
    ElMessage.error('保存草稿失败')
  } finally {
    submitting.value = false
  }
}

async function loadDraft() {
  if (!route.params.id) return
  loading.value = true
  try {
    const res = await getTaskDetail(route.params.id)
    const data = res.data || res
    if (data) {
      Object.assign(form, {
        id: data.id,
        taskType: data.taskType || '',
        customerId: data.customerId || '',
        farmlandId: data.farmlandId || '',
        plannedArea: data.plannedArea || null,
        pesticideId: data.pesticideId || '',
        dosagePerAcre: data.dosagePerAcre || null,
        pilotId: data.pilotId || '',
        droneId: data.droneId || '',
        plannedDate: data.plannedDate || '',
        description: data.description || ''
      })
    }
  } catch (error) {
    ElMessage.error('加载草稿失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadOptions()
  if (isEdit.value) {
    await loadDraft()
  }
})
</script>

<style scoped>
.task-create {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.task-form {
  max-width: 900px;
}
</style>
