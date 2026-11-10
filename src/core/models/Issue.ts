import type { Category, Service, Status } from './Catalog'

export interface IssueAuthor {
  id: number
  nickname: string
  avatar: string | null
}

export interface Issue {
  id: number
  description: string
  photos: string[]
  lat: number
  lng: number
  address: string
  category: Category
  status: Status
  author: IssueAuthor
  assignee: Service | null
  rejectReason: string | null
  resolvedPhotoUrl: string | null
  votes: number
  voted: boolean
  commentsCount: number
  createdAt: string
}

export interface Comment {
  id: number
  issueId: number
  userId: number
  text: string
  createdAt: string
  author: IssueAuthor
}

export interface HistoryEntry {
  id: number
  fromName: string | null
  fromColor: string | null
  toName: string | null
  toColor: string | null
  changedBy: string
  comment: string | null
  createdAt: string
}

export type IssueSort = 'newest' | 'oldest' | 'votes' | 'category' | 'status'

export interface IssueFilters {
  search: string
  categoryId: number | null
  statusId: number | null
  sort: IssueSort
}

export interface IssueQuery extends IssueFilters {
  from?: string
  to?: string
}

export interface IssuePayload {
  categoryId: number
  description: string
  address: string
  lat: number
  lng: number
  keepPhotos?: string[]
  photos?: File[]
}

export interface StatusChangePayload {
  statusId: number
  comment?: string
  resolvedPhoto?: File | null
}

export interface VoteResult {
  votes: number
  voted: boolean
}
