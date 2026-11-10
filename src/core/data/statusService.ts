import { request } from './api'
import type { Status, StatusPayload } from '../models/Catalog'

export function fetchStatuses(): Promise<Status[]> {
  return request<Status[]>('/statuses')
}

export function fetchAllStatuses(): Promise<Status[]> {
  return request<Status[]>('/statuses/all')
}

export function createStatus(payload: StatusPayload): Promise<Status> {
  return request<Status>('/statuses', { method: 'POST', body: payload })
}

export function updateStatus(id: number, payload: StatusPayload): Promise<Status> {
  return request<Status>(`/statuses/${id}`, { method: 'PATCH', body: payload })
}

export function setStatusActive(id: number, active: boolean): Promise<Status> {
  return request<Status>(`/statuses/${id}/${active ? 'activate' : 'deactivate'}`, {
    method: 'POST',
  })
}

export function deleteStatus(id: number): Promise<void> {
  return request<void>(`/statuses/${id}`, { method: 'DELETE' })
}
