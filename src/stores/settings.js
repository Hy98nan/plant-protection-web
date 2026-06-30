import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const SETTINGS_KEY = 'zhibao_settings'

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载设置失败', e)
  }
  return {}
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('保存设置失败', e)
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = loadSettings()

  const showFloatingButton = ref(saved.showFloatingButton === true)

  watch(showFloatingButton, (val) => {
    saveSettings({
      showFloatingButton: val
    })
  })

  function updateShowFloatingButton(val) {
    showFloatingButton.value = val
  }

  return {
    showFloatingButton,
    updateShowFloatingButton
  }
})
