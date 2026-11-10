// Справочники, которыми управляет модератор
export interface Category {
  id: number
  name: string
  description: string
  color: string
  icon: string
  isActive: boolean
  isSystem: boolean
  sortOrder: number
  resolveHours: number | null
}

export interface Status {
  id: number
  key: string | null
  name: string
  description: string
  color: string
  isDefault: boolean
  isActive: boolean
  sortOrder: number
}

export interface Service {
  id: number
  name: string
}

export interface CategoryPayload {
  name: string
  description?: string
  color: string
  icon: string
  sortOrder?: number | null
  resolveHours?: number | null
}

export interface StatusPayload {
  name: string
  description?: string
  color: string
  sortOrder?: number | null
}
