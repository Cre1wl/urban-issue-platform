import { request } from './api'
import type {
  Comment,
  HistoryEntry,
  Issue,
  IssuePayload,
  IssueQuery,
  StatusChangePayload,
  VoteResult,
} from '../models/Issue'

function queryString(query: IssueQuery): string {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.categoryId) params.set('categoryId', String(query.categoryId))
  if (query.statusId) params.set('statusId', String(query.statusId))
  if (query.sort) params.set('sort', query.sort)
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  const value = params.toString()
  return value ? `?${value}` : ''
}

function issueForm(payload: IssuePayload): FormData {
  const form = new FormData()
  form.append('categoryId', String(payload.categoryId))
  form.append('description', payload.description)
  form.append('address', payload.address)
  form.append('lat', String(payload.lat))
  form.append('lng', String(payload.lng))
  if (payload.keepPhotos) form.append('keepPhotos', JSON.stringify(payload.keepPhotos))
  for (const file of payload.photos ?? []) form.append('photos', file)
  return form
}

export function fetchIssues(query: IssueQuery): Promise<Issue[]> {
  return request<Issue[]>(`/issues${queryString(query)}`)
}

export function fetchIssue(id: number): Promise<Issue> {
  return request<Issue>(`/issues/${id}`)
}

export function createIssue(payload: IssuePayload): Promise<Issue> {
  return request<Issue>('/issues', { method: 'POST', formData: issueForm(payload) })
}

export function updateIssue(id: number, payload: IssuePayload): Promise<Issue> {
  return request<Issue>(`/issues/${id}`, { method: 'PATCH', formData: issueForm(payload) })
}

export function deleteIssue(id: number): Promise<void> {
  return request<void>(`/issues/${id}`, { method: 'DELETE' })
}

export function vote(id: number): Promise<VoteResult> {
  return request<VoteResult>(`/issues/${id}/vote`, { method: 'POST' })
}

export function fetchComments(id: number): Promise<Comment[]> {
  return request<Comment[]>(`/issues/${id}/comments`)
}

export function createComment(id: number, text: string): Promise<Comment> {
  return request<Comment>(`/issues/${id}/comments`, { method: 'POST', body: { text } })
}

export function updateComment(id: number, commentId: number, text: string): Promise<Comment> {
  return request<Comment>(`/issues/${id}/comments/${commentId}`, { method: 'PATCH', body: { text } })
}

export function deleteComment(id: number, commentId: number): Promise<void> {
  return request<void>(`/issues/${id}/comments/${commentId}`, { method: 'DELETE' })
}

export function fetchHistory(id: number): Promise<HistoryEntry[]> {
  return request<HistoryEntry[]>(`/issues/${id}/status`)
}

export function changeStatus(id: number, payload: StatusChangePayload): Promise<Issue> {
  const form = new FormData()
  form.append('statusId', String(payload.statusId))
  if (payload.comment) form.append('comment', payload.comment)
  if (payload.resolvedPhoto) form.append('resolvedPhoto', payload.resolvedPhoto)
  return request<Issue>(`/issues/${id}/status`, { method: 'PATCH', formData: form })
}

export function assign(id: number, serviceId: number | null): Promise<Issue> {
  return request<Issue>(`/issues/${id}/assign`, { method: 'PATCH', body: { serviceId } })
}
