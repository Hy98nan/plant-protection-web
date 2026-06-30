<template>
  <div class="pilot-form">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑飞手' : '新增飞手' }}</span>
          <el-button text @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon> 返回
          </el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="large" style="max-width: 700px;">
        <el-form-item label="选择用户" prop="userId" v-if="!isEdit">
          <el-select v-model="form.userId" placeholder="请选择用户" style="width: 100%" filterable @change="handleUserSelect">
            <el-option
              v-for="user in availableUsers"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户姓名" prop="name" v-if="isEdit">
          <el-input v-model="form.name" disabled />
        </el-form-item>
        <el-form-item label="用户手机号" prop="phone" v-if="isEdit">
          <el-input v-model="form.phone" disabled />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="无人机执照" prop="licenseNo">
              <el-input v-model="form.licenseNo" placeholder="请输入执照编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执照类型" prop="licenseType">
              <el-select v-model="form.licenseType" placeholder="请选择执照类型" style="width: 100%">
                <el-option label="AOPA" value="AOPA" />
                <el-option label="CAAC" value="CAAC" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="执照有效期" prop="licenseExpiry">
          <el-date-picker v-model="form.licenseExpiry" type="date" placeholder="请选择执照有效期" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="证件照片" prop="licenseImage">
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :file-list="licenseImageList"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            accept="image/*"
            :disabled="form.auditStatus === 1"
          >
            <el-button size="small" type="primary">点击上传证件照片</el-button>
            <template #tip>
              <div class="el-upload__tip">请上传执照照片，支持 jpg、png 格式</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="技能等级" prop="skillLevel">
              <el-select v-model="form.skillLevel" placeholder="请选择技能等级" style="width: 100%">
                <el-option label="初级" value="junior" />
                <el-option label="高级" value="senior" />
                <el-option label="专家" value="expert" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="飞行时长(h)" prop="totalFlightHours">
              <el-input-number v-model="form.totalFlightHours" :min="0" :max="99999" :precision="1" :step="0.5" placeholder="小时" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作业面积(亩)" prop="totalFlightArea">
              <el-input-number v-model="form.totalFlightArea" :min="0" :max="999999" :precision="2" :step="1" placeholder="亩" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成任务数" prop="taskCount">
              <el-input-number v-model="form.taskCount" :min="0" :max="99999" placeholder="个" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="form.rating" :max="5" :allow-half="true" />
          <span style="margin-left: 10px; color: #909399;">{{ form.rating }}分</span>
        </el-form-item>
        <el-form-item label="擅长机型" prop="skillModels">
          <el-select v-model="form.skillModels" multiple placeholder="请选择擅长机型" style="width: 100%">
            <el-option label="大疆T40" value="T40" />
            <el-option label="大疆T30" value="T30" />
            <el-option label="大疆T20" value="T20" />
            <el-option label="大疆T16" value="T16" />
            <el-option label="极飞P80" value="P80" />
            <el-option label="极飞P40" value="P40" />
            <el-option label="极飞P30" value="P30" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">在职</el-radio>
            <el-radio :value="0">离职</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="500" show-word-limit />
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
import { getPilotDetail, createPilot, updatePilot, getAvailableUsers, uploadLicenseImage } from '@/api/pilot'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const isEdit = computed(() => !!route.params.id)
const availableUsers = ref([])
const licenseImageList = ref([])

const form = reactive({
  userId: null,
  name: '',
  phone: '',
  licenseNo: '',
  licenseType: '',
  licenseExpiry: '',
  licenseImage: '',
  auditStatus: 0,
  skillLevel: 'junior',
  totalFlightHours: 0,
  totalFlightArea: 0,
  rating: 5,
  taskCount: 0,
  skillModels: [],
  status: 1,
  remark: ''
})

const uploadUrl = computed(() => {
  if (!route.params.id) return ''
  return `/api/pilots/${route.params.id}/license-image`
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
})

const rules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  licenseNo: [{ required: true, message: '请输入执照编号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

async function loadAvailableUsers() {
  try {
    const res = await getAvailableUsers()
    availableUsers.value = res.data || []
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

function handleUserSelect(userId) {
  const user = availableUsers.value.find(u => u.value === userId)
  if (user) {
    form.name = user.realName || ''
    form.phone = user.phone || ''
  }
}

function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

function handleUploadSuccess(response) {
  if (response.code === 200) {
    form.licenseImage = response.data.imagePath
    licenseImageList.value = [{ url: response.data.url || form.licenseImage }]
    ElMessage.success('证件上传成功')
  } else {
    ElMessage.error('证件上传失败')
  }
}

function handleUploadError() {
  ElMessage.error('证件上传失败')
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const data = {
        userId: form.userId,
        licenseNo: form.licenseNo,
        licenseType: form.licenseType,
        licenseExpiry: form.licenseExpiry,
        licenseImage: form.licenseImage,
        skillLevel: form.skillLevel,
        totalFlightHours: form.totalFlightHours,
        totalFlightArea: form.totalFlightArea,
        rating: form.rating,
        taskCount: form.taskCount,
        skillModels: JSON.stringify(form.skillModels),
        status: isEdit.value ? form.status : 0,
        remark: form.remark
      }
      if (isEdit.value) {
        await updatePilot(route.params.id, data)
        ElMessage.success('修改成功')
      } else {
        await createPilot(data)
        ElMessage.success('新增成功，请等待管理员审核')
      }
      router.push('/pilot/list')
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const res = await getPilotDetail(route.params.id)
      const data = res.data
      form.userId = data.userId
      form.name = data.name || ''
      form.phone = data.phone || ''
      form.licenseNo = data.licenseNo || ''
      form.licenseType = data.licenseType || ''
      form.licenseExpiry = data.licenseExpiry || ''
      form.skillLevel = data.skillLevel || 'junior'
      form.totalFlightHours = data.totalFlightHours != null ? (typeof data.totalFlightHours === 'object' && data.totalFlightHours.intValue ? data.totalFlightHours.intValue() : data.totalFlightHours) : 0
      form.totalFlightArea = data.totalFlightArea != null ? (typeof data.totalFlightArea === 'object' && data.totalFlightArea.intValue ? data.totalFlightArea.intValue() : data.totalFlightArea) : 0
      form.rating = data.rating != null ? (typeof data.rating === 'object' && data.rating.intValue ? data.rating.intValue() : data.rating) : 5
      form.taskCount = data.taskCount != null ? (typeof data.taskCount === 'object' && data.taskCount.intValue ? data.taskCount.intValue() : data.taskCount) : 0
      form.skillModels = data.skillModels ? JSON.parse(data.skillModels) : []
      form.status = data.status != null ? data.status : 1
      form.remark = data.remark || ''
      form.auditStatus = data.auditStatus != null ? data.auditStatus : 0
      form.licenseImage = data.licenseImage || ''
      if (form.licenseImage) {
        licenseImageList.value = [{ url: data.licenseImageUrl || form.licenseImage }]
      }
    } catch (error) {
      ElMessage.error('获取飞手信息失败')
    }
  } else {
    await loadAvailableUsers()
  }
})
</script>

<style scoped>
.pilot-form { width: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
</style>
