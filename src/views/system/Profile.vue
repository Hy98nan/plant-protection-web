<template>
  <div class="profile-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="profile-tabs">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="info">
          <el-form
            ref="infoFormRef"
            :model="infoForm"
            :rules="infoRules"
            label-width="100px"
            style="max-width: 600px; margin-top: 20px;"
          >
            <el-form-item label="头像">
              <div class="avatar-upload">
                <el-avatar :size="80" :src="infoForm.avatar || undefined">
                  <el-icon :size="40"><User /></el-icon>
                </el-avatar>
                <div class="avatar-tip">点击上传新头像</div>
                <input
                  type="file"
                  accept="image/*"
                  class="avatar-input"
                  @change="handleAvatarChange"
                />
              </div>
            </el-form-item>

            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" disabled />
            </el-form-item>

            <el-form-item label="姓名" prop="realName">
              <el-input v-model="infoForm.realName" placeholder="请输入姓名" maxlength="20" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="infoForm.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="infoForm.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="性别">
              <el-radio-group v-model="infoForm.gender">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="0">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker
                v-model="infoForm.birthDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="地址" prop="address">
              <el-input v-model="infoForm.address" placeholder="请输入地址" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="infoLoading" @click="handleUpdateInfo">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 紧急联系人 -->
        <el-tab-pane label="紧急联系人" name="emergency">
          <el-form
            ref="emergencyFormRef"
            :model="emergencyForm"
            label-width="120px"
            style="max-width: 600px; margin-top: 20px;"
          >
            <el-form-item label="联系人姓名">
              <el-input v-model="emergencyForm.emergencyContact" placeholder="请输入紧急联系人姓名" maxlength="20" />
            </el-form-item>

            <el-form-item label="联系电话">
              <el-input v-model="emergencyForm.emergencyPhone" placeholder="请输入紧急联系电话" maxlength="11" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="emergencyLoading" @click="handleUpdateEmergency">
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 账户安全 -->
        <el-tab-pane label="账户安全" name="security">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
            style="max-width: 600px; margin-top: 20px;"
          >
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码（至少6位）"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
                修改密码
              </el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 账号信息 -->
        <el-tab-pane label="账号信息" name="account">
          <div class="account-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">
                {{ userInfo.username || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="员工工号">
                {{ userInfo.employeeNo || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="部门">
                {{ userInfo.department || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="角色">
                <el-tag
                  v-for="role in userInfo.roleNames"
                  :key="role"
                  size="small"
                  type="primary"
                  style="margin-right: 8px;"
                >
                  {{ role }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="入职日期">
                {{ userInfo.hireDate || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="最后登录">
                {{ userInfo.lastLoginTime || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="登录IP">
                {{ userInfo.lastLoginIp || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getUserInfo, updateProfile, changePassword } from '@/api/auth'

const userStore = useUserStore()

const activeTab = ref('info')
const infoFormRef = ref()
const emergencyFormRef = ref()
const passwordFormRef = ref()

const infoLoading = ref(false)
const emergencyLoading = ref(false)
const passwordLoading = ref(false)

const userInfo = ref({
  username: '',
  realName: '',
  avatar: '',
  phone: '',
  email: '',
  gender: null,
  birthDate: '',
  address: '',
  employeeNo: '',
  department: '',
  roleNames: [],
  hireDate: '',
  lastLoginTime: '',
  lastLoginIp: ''
})

const infoForm = reactive({
  realName: '',
  phone: '',
  email: '',
  avatar: '',
  gender: null,
  birthDate: '',
  address: ''
})

const emergencyForm = reactive({
  emergencyContact: '',
  emergencyPhone: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const infoRules = {
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function fetchUserInfo() {
  try {
    const res = await getUserInfo()
    const data = res.data || res

    userInfo.value = {
      username: data.username || '',
      realName: data.realName || '',
      avatar: data.avatar || '',
      phone: data.phone || '',
      email: data.email || '',
      gender: data.gender,
      birthDate: data.birthDate || '',
      address: data.address || '',
      employeeNo: data.employeeNo || '',
      department: data.department || '',
      roleNames: data.roleNames || [],
      hireDate: data.hireDate || '',
      lastLoginTime: data.lastLoginTime || '',
      lastLoginIp: data.lastLoginIp || ''
    }

    // 同步到表单
    infoForm.realName = data.realName || ''
    infoForm.phone = data.phone || ''
    infoForm.email = data.email || ''
    infoForm.avatar = data.avatar || ''
    infoForm.gender = data.gender
    infoForm.birthDate = data.birthDate || ''
    infoForm.address = data.address || ''

    emergencyForm.emergencyContact = data.emergencyContact || ''
    emergencyForm.emergencyPhone = data.emergencyPhone || ''

    // 更新 store 中的用户信息
    userStore.realName = data.realName || ''
    userStore.avatar = data.avatar || ''
  } catch (e) {
    console.error('获取用户信息失败', e)
    ElMessage.error('获取用户信息失败')
  }
}

async function handleUpdateInfo() {
  if (!infoFormRef.value) return

  await infoFormRef.value.validate(async (valid) => {
    if (valid) {
      infoLoading.value = true
      try {
        const res = await updateProfile({
          realName: infoForm.realName,
          phone: infoForm.phone,
          email: infoForm.email,
          avatar: infoForm.avatar,
          gender: infoForm.gender,
          birthDate: infoForm.birthDate,
          address: infoForm.address
        })

        if (res.code === 200 || res.code === 0) {
          ElMessage.success('个人信息更新成功')
          fetchUserInfo()
        } else {
          ElMessage.error(res.message || '更新失败')
        }
      } catch (e) {
        console.error('更新失败', e)
        ElMessage.error(e.message || '更新失败')
      } finally {
        infoLoading.value = false
      }
    }
  })
}

async function handleUpdateEmergency() {
  emergencyLoading.value = true
  try {
    const res = await updateProfile({
      emergencyContact: emergencyForm.emergencyContact,
      emergencyPhone: emergencyForm.emergencyPhone
    })

    if (res.code === 200 || res.code === 0) {
      ElMessage.success('紧急联系人更新成功')
      fetchUserInfo()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (e) {
    console.error('更新失败', e)
    ElMessage.error(e.message || '更新失败')
  } finally {
    emergencyLoading.value = false
  }
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await ElMessageBox.confirm('确定要修改密码吗？修改后需要重新登录。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        passwordLoading.value = true
        const res = await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })

        if (res.code === 200 || res.code === 0) {
          ElMessage.success('密码修改成功，请重新登录')
          resetPasswordForm()
          setTimeout(() => {
            userStore.userLogout()
          }, 1500)
        } else {
          ElMessage.error(res.message || '修改失败')
        }
      } catch (e) {
        if (e !== 'cancel') {
          console.error('修改密码失败', e)
          ElMessage.error(e.message || '修改失败')
        }
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

function resetPasswordForm() {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

function handleAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 验证文件大小（最大2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    infoForm.avatar = event.target.result
    ElMessage.success('头像已选择，点击「保存修改」上传')
  }
  reader.readAsDataURL(file)
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-tabs {
  margin-top: 10px;
}

.avatar-upload {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.avatar-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.avatar-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  opacity: 0;
  cursor: pointer;
}

.account-info {
  margin-top: 20px;
  max-width: 600px;
}
</style>
