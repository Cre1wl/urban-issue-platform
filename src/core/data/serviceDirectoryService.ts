import { request } from './api'
import type { Service } from '../models/Catalog'

export function fetchServices(): Promise<Service[]> {
  return request<Service[]>('/services')
}

export function createService(name: string): Promise<Service> {
  return request<Service>('/services', { method: 'POST', body: { name } })
}

export function updateService(id: number, name: string): Promise<Service> {
  return request<Service>(`/services/${id}`, { method: 'PATCH', body: { name } })
}

export function deleteService(id: number): Promise<void> {
  return request<void>(`/services/${id}`, { method: 'DELETE' })
}
