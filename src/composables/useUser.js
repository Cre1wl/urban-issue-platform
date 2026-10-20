import { shallowRef } from 'vue'
import * as authService from '../core/data/authService'
import * as userService from '../core/data/userService'
import { clearToken, hasToken, saveToken } from '../core/auth/tokenStorage'
import User from '../core/models/User'

// Состояние уровня модуля: все компоненты видят одного и того же пользователя.
// Как в примере преподавателя: всегда объект User, никогда null.
const user = shallowRef(new User())

export default function useUser() {
  const setSession = (data) => {
    saveToken(data.token)
    user.value = new User(data.user)
  }

  const login = async (email, password) => {
    setSession(await authService.login(email, password))
  }

  const register = async (payload) => {
    setSession(await authService.register(payload))
  }

  // Восстановление сессии после перезагрузки по сохранённому токену
  const load = async () => {
    if (!hasToken()) return
    try {
      user.value = new User(await userService.fetchMe())
    } catch {
      clearToken()
      user.value = new User()
    }
  }

  const updateProfile = async (patch) => {
    user.value = new User(await userService.updateProfile(patch))
  }

  const uploadAvatar = async (file) => {
    user.value = new User(await userService.uploadAvatar(file))
  }

  const logout = () => {
    clearToken()
    user.value = new User()
  }

  return { user, login, register, load, updateProfile, uploadAvatar, logout }
}
