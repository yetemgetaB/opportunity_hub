import { apiRequest } from './api'
import type { NotificationRecord } from '../types/notification'

export function getNotifications(): Promise<NotificationRecord[]> {
  return apiRequest<NotificationRecord[]>('/notifications')
}

export async function getUnreadNotificationCount(): Promise<number> {
  const result = await apiRequest<{ count: number }>('/notifications/unread-count')
  return result.count
}

export function markNotificationAsRead(id: string): Promise<NotificationRecord> {
  return apiRequest<NotificationRecord>(`/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  })
}
