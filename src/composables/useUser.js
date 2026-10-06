import { shallowRef } from 'vue'
import getUser from '../core/data/userService'
import User from '../core/models/User'

export default function useUser() {
  // Пустой пользователь вместо null: компонентам не нужны проверки на null.
  // При входе/выходе объект заменяется целиком, поэтому достаточно shallowRef.
  const user = shallowRef(new User())

  const login = () => {
    user.value = new User(getUser())
  }

  const logout = () => {
    user.value = new User()
  }

  return { user, login, logout }
}