const TOKEN_KEY = 'plant_protection_token'
const REFRESH_TOKEN_KEY = 'plant_protection_refresh_token'
const TOKEN_EXPIRES_KEY = 'plant_protection_token_expires'
const USER_INFO_KEY = 'plant_protection_user_info'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(refreshToken) {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function removeRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getTokenExpires() {
  const expires = localStorage.getItem(TOKEN_EXPIRES_KEY)
  return expires ? parseInt(expires, 10) : 0
}

export function setTokenExpires(expiresIn) {
  const expiresAt = Date.now() + expiresIn * 1000
  localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt))
}

export function removeTokenExpires() {
  localStorage.removeItem(TOKEN_EXPIRES_KEY)
}

export function isTokenExpiringSoon() {
  const expiresAt = getTokenExpires()
  if (!expiresAt) return true
  const threshold = 5 * 60 * 1000
  return Date.now() + threshold >= expiresAt
}

export function isTokenExpired() {
  const expiresAt = getTokenExpires()
  if (!expiresAt) return true
  return Date.now() >= expiresAt
}

export function getUserInfo() {
  const info = localStorage.getItem(USER_INFO_KEY)
  return info ? JSON.parse(info) : null
}

export function setUserInfo(userInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
}

export function clearAuth() {
  removeToken()
  removeRefreshToken()
  removeTokenExpires()
  removeUserInfo()
}
