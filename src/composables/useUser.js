import { shallowRef } from 'vue'
import * as userService from '../core/data/userService'
import User from '../core/models/User'

// Состояние уровня модуля: все компоненты видят одного и того же пользователя.
// Как в примере преподавателя: всегда объект User, никогда null.
const user = shallowRef(new User())

export default function useUser() {
  const setSession = (data) => {
    userService.saveToken(data.token)
    user.value = new User(data.user)
  }

  const login = async (email, password) => {
    setSession(await userService.login(email, password))
  }

  const register = async (payload) => {
    setSession(await userService.register(payload))
  }

  // Восстановление сессии после перезагрузки по сохранённому токену
  const load = async () => {
    if (!userService.hasToken()) return
    try {
      user.value = new User(await userService.fetchMe())
    } catch {
      userService.clearToken()
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
    userService.clearToken()
    user.value = new User()
  }

  return { user, login, register, load, updateProfile, uploadAvatar, logout }
}
