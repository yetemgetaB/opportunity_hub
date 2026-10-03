export type StudentNotificationCategory = 'application' | 'deadline' | 'system'

export type StudentNotificationIcon = 'calendarEvent' | 'check' | 'clock' | 'bookmark' | 'x'

export interface StudentNotificationItem {
  id: string
  category: StudentNotificationCategory
  icon: StudentNotificationIcon
  iconStyle: string
  title: string
  description: string
  time: string
  read: boolean
  link?: string
}