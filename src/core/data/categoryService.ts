import { request } from './api'
import type { Category, CategoryPayload } from '../models/Catalog'

export function fetchCategories(): Promise<Category[]> {
  return request<Category[]>('/categories')
}

export function fetchAllCategories(): Promise<Category[]> {
  return request<Category[]>('/categories/all')
}

export function createCategory(payload: CategoryPayload): Promise<Category> {
  return request<Category>('/categories', { method: 'POST', body: payload })
}

export function updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
  return request<Category>(`/categories/${id}`, { method: 'PATCH', body: payload })
}

export function setCategoryActive(id: number, active: boolean): Promise<Category> {
  return request<Category>(`/categories/${id}/${active ? 'activate' : 'deactivate'}`, {
    method: 'POST',
  })
}

export function deleteCategory(id: number): Promise<void> {
  return request<void>(`/categories/${id}`, { method: 'DELETE' })
}
