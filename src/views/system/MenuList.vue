<template>
  <div class="menu-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="queryForm" class="search-form" ref="searchFormRef">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="queryForm.menuName" placeholder="请输入菜单名称" clearable style="width: 200px;" />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-select v-model="queryForm.menuType" placeholder="请选择类型" clearable style="width: 140px;">
            <el-option label="目录" value="directory" />
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
          </el-select>
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
      <el-button type="primary" @click="handleAdd">新增菜单</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading" border stripe row-key="id" default-expand-all>
      <el-table-column prop="menuName" label="菜单名称" min-width="150" />
      <el-table-column prop="icon" label="图标" width="100">
        <template #default="{ row }">
          <el-icon v-if="row.icon">
            <component :is="row.icon" />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="menuType" label="类型" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.menuType === 'directory'" type="warning">目录</el-tag>
          <el-tag v-else-if="row.menuType === 'menu'" type="success">菜单</el-tag>
          <el-tag v-else type="info">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由路径" min-width="150" show-overflow-tooltip />
      <el-table-column prop="component" label="组件路径" min-width="150" show-overflow-tooltip />
      <el-table-column prop="permission" label="权限标识" width="150" show-overflow-tooltip />
      <el-table-column prop="visible" label="显示" width="80">
        <template #default="{ row }">
          <el-tag :type="row.visible === 1 ? 'success' : 'danger'">
            {{ row.visible === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="handleAddChild(row)" v-if="row.menuType !== 'button'">新增子级</el-button>
          <el-button link type="danger" @click="handleDelete(row)" :disabled="row.menuType === 'button' && hasChildren(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTreeData"
            :props="{ label: 'menuName', children: 'children', value: 'id' }"
            check-strictly
            placeholder="请选择上级菜单"
            clearable
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="form.menuType">
            <el-radio label="directory">目录</el-radio>
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon" v-if="form.menuType !== 'button'">
          <el-input v-model="form.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path" v-if="form.menuType !== 'button'">
          <el-input v-model="form.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-if="form.menuType === 'menu'">
          <el-input v-model="form.component" placeholder="请输入组件路径，如: system/UserList" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission" v-if="form.menuType === 'button'">
          <el-input v-model="form.permission" placeholder="请输入权限标识，如: system:user:list" />
        </el-form-item>
        <el-form-item label="显示" prop="visible" v-if="form.menuType !== 'button'">
          <el-radio-group v-model="form.visible">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
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
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMenuTree, getMenuDetail, createMenu, updateMenu, deleteMenu } from '@/api/menu'

const loading = ref(false)
const submitLoading = ref(false)
const allMenuData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const formRef = ref(null)
const searchFormRef = ref(null)

const menuTreeData = ref([])

const queryForm = reactive({
  menuName: '',
  menuType: '',
  status: null
})

const tableData = computed(() => {
  if (!queryForm.menuName && !queryForm.menuType && queryForm.status === null) {
    return allMenuData.value
  }
  
  return filterMenuTree(allMenuData.value, (menu) => {
    let match = true
    if (queryForm.menuName) {
      match = match && menu.menuName.includes(queryForm.menuName)
    }
    if (queryForm.menuType) {
      match = match && menu.menuType === queryForm.menuType
    }
    if (queryForm.status !== null) {
      match = match && menu.status === queryForm.status
    }
    return match
  })
})

function filterMenuTree(menus, predicate) {
  const result = []
  menus.forEach(menu => {
    const children = menu.children ? filterMenuTree(menu.children, predicate) : []
    const match = predicate(menu)
    if (match || children.length > 0) {
      result.push({
        ...menu,
        children: children.length > 0 ? children : undefined
      })
    }
  })
  return result
}

const form = reactive({
  id: null,
  parentId: null,
  menuType: 'menu',
  menuName: '',
  icon: '',
  path: '',
  component: '',
  permission: '',
  visible: 1,
  status: 1,
  sort: 0
})

const rules = {
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
  loadMenuTree()
})

async function loadData() {
  loading.value = true
  try {
    const res = await getMenuTree()
    if (res.code === 200) {
      allMenuData.value = res.data
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  // 搜索逻辑已经在 computed 属性中实现
}

function handleReset() {
  searchFormRef.value?.resetFields()
}

async function loadMenuTree() {
  try {
    const res = await getMenuTree()
    if (res.code === 200) {
      menuTreeData.value = [{ id: 0, menuName: '顶级菜单', children: res.data }]
    }
  } catch (error) {
    console.error('加载菜单树失败', error)
  }
}

function handleAdd() {
  dialogTitle.value = '新增菜单'
  resetForm()
  dialogVisible.value = true
}

function handleAddChild(row) {
  dialogTitle.value = '新增子级菜单'
  resetForm()
  form.parentId = row.id
  form.menuType = row.menuType === 'directory' ? 'menu' : 'button'
  dialogVisible.value = true
}

async function handleEdit(row) {
  dialogTitle.value = '编辑菜单'
  try {
    const res = await getMenuDetail(row.id)
    if (res.code === 200) {
      Object.assign(form, res.data)
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取菜单详情失败', error)
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const api = form.id ? updateMenu : createMenu
    const res = await api(form.id, { ...form })
    if (res.code === 200) {
      ElMessage.success('操作成功')
      dialogVisible.value = false
      loadData()
      loadMenuTree()
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

function resetForm() {
  Object.keys(form).forEach(key => {
    if (key === 'menuType') form[key] = 'menu'
    else if (key === 'visible') form[key] = 1
    else if (key === 'status') form[key] = 1
    else if (key === 'sort') form[key] = 0
    else form[key] = null
  })
}

async function handleDelete(row) {
  if (hasChildren(row)) {
    ElMessage.warning('该菜单存在子级，无法删除')
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？', '提示', { type: 'warning' })
    const res = await deleteMenu(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
      loadMenuTree()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error)
    }
  }
}

function hasChildren(row) {
  return row.children && row.children.length > 0
}
</script>

<style scoped>
.menu-container {
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
</style>
