import { supabase } from '../../lib/supabase/client'

export type Notification = {
  id: string
  user_id: string
  idea_id: string | null
  notification_type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export async function getNotifications(): Promise<Notification[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Failed to get current user:', userError)
    throw new Error('Unable to identify the current user.')
  }

  if (!user) {
    throw new Error('You must be signed in to view notifications.')
  }

  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
        id,
        user_id,
        idea_id,
        notification_type,
        title,
        message,
        link,
        is_read,
        metadata,
        created_at
      `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load notifications:', error)
    throw new Error('Unable to load notifications.')
  }

  return (data ?? []) as Notification[]
}

export async function getUnreadNotificationCount(): Promise<number> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Failed to get current user:', userError)
    throw new Error('Unable to identify the current user.')
  }

  if (!user) {
    return 0
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Failed to count unread notifications:', error)
    throw new Error('Unable to load unread notification count.')
  }

  return count ?? 0
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
    })
    .eq('id', notificationId)

  if (error) {
    console.error('Failed to mark notification as read:', error)
    throw new Error('Unable to mark notification as read.')
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Failed to get current user:', userError)
    throw new Error('Unable to identify the current user.')
  }

  if (!user) {
    throw new Error('You must be signed in to update notifications.')
  }

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
    })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Failed to mark all notifications as read:', error)
    throw new Error('Unable to mark all notifications as read.')
  }
}