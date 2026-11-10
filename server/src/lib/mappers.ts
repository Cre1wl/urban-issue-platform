import type { CategoryRow, CommentRow, HistoryRow, IssueRow, ServiceRow, StatusRow } from '../domain'

export const ISSUE_SELECT = `
  SELECT i.*,
    c.name AS category_name, c.description AS category_description, c.color AS category_color,
    c.icon AS category_icon, c.is_active AS category_active, c.is_system AS category_system,
    c.sort_order AS category_sort, c.resolve_hours AS category_resolve_hours,
    s.key AS status_key, s.name AS status_name, s.description AS status_description,
    s.color AS status_color, s.is_default AS status_default, s.is_active AS status_active,
    s.sort_order AS status_sort,
    u.nickname AS author_nickname, u.avatar AS author_avatar,
    rs.name AS assignee_name,
    EXISTS (SELECT 1 FROM votes v WHERE v.issue_id = i.id AND v.user_id = $1) AS voted,
    (SELECT COUNT(*)::int FROM comments cm WHERE cm.issue_id = i.id) AS comments_count
  FROM issues i
  JOIN categories c ON c.id = i.category_id
  JOIN statuses s ON s.id = i.status_id
  JOIN users u ON u.id = i.author_id
  LEFT JOIN responsible_services rs ON rs.id = i.assignee
`

export interface IssueQueryRow extends IssueRow {
  category_name: string
  category_description: string
  category_color: string
  category_icon: string
  category_active: boolean
  category_system: boolean
  category_sort: number
  category_resolve_hours: number | null
  status_key: string | null
  status_name: string
  status_description: string
  status_color: string
  status_default: boolean
  status_active: boolean
  status_sort: number
  author_nickname: string
  author_avatar: string | null
  assignee_name: string | null
  voted: boolean
  comments_count: number
}

export function toCategory(row: CategoryRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    isActive: row.is_active,
    isSystem: row.is_system,
    sortOrder: row.sort_order,
    resolveHours: row.resolve_hours === null ? null : Number(row.resolve_hours),
  }
}

export function toStatus(row: StatusRow) {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    color: row.color,
    isDefault: row.is_default,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  }
}

export function toService(row: ServiceRow) {
  return { id: row.id, name: row.name }
}

export function toIssue(row: IssueQueryRow, voted = row.voted, commentsCount = row.comments_count) {
  return {
    id: row.id,
    description: row.description,
    photos: row.photo_urls,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    address: row.address,
    category: {
      id: row.category_id,
      name: row.category_name,
      description: row.category_description,
      color: row.category_color,
      icon: row.category_icon,
      isActive: row.category_active,
      isSystem: row.category_system,
      sortOrder: row.category_sort,
      resolveHours: row.category_resolve_hours === null ? null : Number(row.category_resolve_hours),
    },
    status: {
      id: row.status_id,
      key: row.status_key,
      name: row.status_name,
      description: row.status_description,
      color: row.status_color,
      isDefault: row.status_default,
      isActive: row.status_active,
      sortOrder: row.status_sort,
    },
    author: { id: row.author_id, nickname: row.author_nickname, avatar: row.author_avatar },
    assignee: row.assignee ? { id: row.assignee, name: row.assignee_name } : null,
    rejectReason: row.reject_reason,
    resolvedPhotoUrl: row.resolved_photo_url,
    votes: row.votes,
    voted,
    commentsCount,
    createdAt: row.created_at,
  }
}

export function toComment(row: CommentRow) {
  return {
    id: row.id,
    issueId: row.issue_id,
    userId: row.user_id,
    text: row.text,
    createdAt: row.created_at,
    author: { id: row.user_id, nickname: row.nickname, avatar: row.avatar },
  }
}

export function toHistory(row: HistoryRow) {
  return {
    id: row.id,
    fromName: row.from_name,
    fromColor: row.from_color,
    toName: row.to_name,
    toColor: row.to_color,
    changedBy: row.changed_by,
    comment: row.comment,
    createdAt: row.created_at,
  }
}
