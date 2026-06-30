<template>
  <div class="role-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="queryForm" class="search-form" ref="searchFormRef">
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="queryForm.roleCode" placeholder="请输入角色编码" clearable />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="queryForm.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 140px;">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="roleCode" label="角色编码" min-width="120" />
      <el-table-column prop="roleName" label="角色名称" min-width="120" />
      <el-table-column prop="roleType" label="角色类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.roleType === 'system' ? 'danger' : 'info'">
            {{ row.roleType === 'system' ? '系统' : '自定义' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
      <el-table-column prop="dataScope" label="数据范围" width="100">
        <template #default="{ row }">
          <span v-if="row.dataScope === 'all'">全部数据</span>
          <span v-else-if="row.dataScope === 'dept'">本部门</span>
          <span v-else-if="row.dataScope === 'self'">本人数据</span>
          <span v-else>自定义</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="handleAssignMenus(row)">分配菜单</el-button>
          <el-button link type="danger" @click="handleDelete(row)" :disabled="row.roleType === 'system'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="form.roleCode" placeholder="请输入角色编码" :disabled="form.id" />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色类型" prop="roleType">
          <el-select v-model="form.roleType" placeholder="请选择角色类型">
            <el-option label="系统角色" value="system" />
            <el-option label="自定义角色" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据范围" prop="dataScope">
          <el-select v-model="form.dataScope" placeholder="请选择数据范围">
            <el-option label="全部数据" value="all" />
            <el-option label="本部门数据" value="dept" />
            <el-option label="本人数据" value="self" />
            <el-option label="自定义数据" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配菜单弹窗 -->
    <el-dialog v-model="menuDialogVisible" title="分配菜单权限" width="700px">
      <div class="menu-tree-container">
        <el-tree
          ref="menuTreeRef"
          :data="menuTreeData"
          :props="{ children: 'children', label: 'menuName' }"
          node-key="id"
          :check-strictly="false"
          show-checkbox
          default-expand-all
        />
      </div>
      <template #footer>
        <el-button @click="closeMenuDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmitMenus" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoleList, getRoleDetail, createRole, updateRole, deleteRole, getRoleMenus, getAllMenuTree, assignMenus } from '@/api/role'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const menuDialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref(null)
const searchFormRef = ref(null)
const menuTreeRef = ref(null)
const currentRoleId = ref(null)
const menuTreeData = ref([])

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const queryForm = reactive({
  roleCode: '',
  roleName: '',
  status: null
})

const form = reactive({
  id: null,
  roleCode: '',
  roleName: '',
  roleType: 'custom',
  dataScope: 'all',
  sort: 0,
  status: 1,
  description: ''
})

const rules = {
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleType: [{ required: true, message: '请选择角色类型', trigger: 'change' }],
  dataScope: [{ required: true, message: '请选择数据范围', trigger: 'change' }]
}

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...queryForm
    }
    const res = await getRoleList(params)
    if (res.code === 200) {
      tableData.value = res.data.records || res.data.list || []
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.pageNum = 1
  loadData()
}

function handleReset() {
  searchFormRef.value?.resetFields()
  pagination.pageNum = 1
  loadData()
}

function handleSizeChange() {
  pagination.pageNum = 1
  loadData()
}

function handlePageChange() {
  loadData()
}

function handleAdd() {
  dialogTitle.value = '新增角色'
  Object.keys(form).forEach(key => {
    if (key === 'roleType') form[key] = 'custom'
    else if (key === 'dataScope') form[key] = 'all'
    else if (key === 'sort') form[key] = 0
    else if (key === 'status') form[key] = 1
    else form[key] = null
  })
  dialogVisible.value = true
}

async function handleEdit(row) {
  dialogTitle.value = '编辑角色'
  try {
    const res = await getRoleDetail(row.id)
    if (res.code === 200) {
      Object.assign(form, res.data)
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取角色详情失败', error)
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const api = form.id ? updateRole : createRole
    const data = { ...form }
    delete data.menuIds
    const res = await api(form.id, data)
    if (res.code === 200) {
      ElMessage.success('操作成功')
      dialogVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('操作失败', error)
  } finally {
    submitLoading.value = false
  }
}

function handleDialogClose() {
  formRef.value?.resetFields()
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', { type: 'warning' })
    const res = await deleteRole(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}

async function handleAssignMenus(row) {
  currentRoleId.value = row.id
  submitLoading.value = false
  menuTreeData.value = []
  try {
    // 获取角色的菜单树（包含 checked 属性）
    const menuRes = await getRoleMenus(row.id)
    if (menuRes.code === 200) {
      menuTreeData.value = menuRes.data || []
    }
    
    // 显示弹窗并设置勾选状态
    menuDialogVisible.value = true
    await nextTick()
    await nextTick()
    
    // 根据 checked 属性设置勾选状态
    if (menuTreeRef.value && menuRes.data) {
      const checkedIds = []
      extractCheckedIds(menuRes.data, checkedIds)
      menuTreeRef.value.setCheckedKeys(checkedIds)
    }
  } catch (error) {
    console.error('加载菜单失败', error)
  }
}

function extractCheckedIds(menus, ids) {
  if (!menus) return
  menus.forEach(menu => {
    if (menu.checked) {
      ids.push(menu.id)
    }
    if (menu.children && menu.children.length > 0) {
      extractCheckedIds(menu.children, ids)
    }
  })
}

async function handleSubmitMenus() {
  submitLoading.value = true
  try {
    const checkedNodes = menuTreeRef.value?.getCheckedNodes(false, true) || []
    const menuIds = checkedNodes.map(node => node.id)
    const res = await assignMenus(currentRoleId.value, menuIds)
    if (res.code === 200) {
      ElMessage.success('分配成功')
      closeMenuDialog()
    }
  } catch (error) {
    console.error('分配失败', error)
  } finally {
    submitLoading.value = false
  }
}

function closeMenuDialog() {
  menuDialogVisible.value = false
  if (menuTreeRef.value) {
    menuTreeRef.value.setCheckedKeys([])
  }
  menuTreeData.value = []
}
</script>

<style scoped>
.role-container {
  padding: 20px;
}

.search-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  color: #fff;
}

:deep(.el-input__wrapper),
:deep(.el-select .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-input__inner) {
  color: #333 !important;
}

:deep(.el-input__inner::placeholder) {
  color: #999;
}

.toolbar {
  margin-bottom: 15px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.menu-tree-container {
  max-height: 400px;
  overflow-y: auto;
}
</style>
