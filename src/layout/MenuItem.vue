<template>
  <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.fullPath">
    <template #title>
      <el-icon v-if="menu.meta.icon"><component :is="menu.meta.icon" /></el-icon>
      <span>{{ menu.meta.title }}</span>
    </template>
    <menu-item
      v-for="child in menu.children"
      :key="child.fullPath"
      :menu="child"
    />
  </el-sub-menu>
  <el-menu-item v-else :index="menu.fullPath">
    <el-icon v-if="menu.meta.icon"><component :is="menu.meta.icon" /></el-icon>
    <template #title>
      <span>{{ menu.meta.title }}</span>
    </template>
  </el-menu-item>
</template>

<script setup>
defineProps({
  menu: {
    type: Object,
    required: true
  }
})
</script>