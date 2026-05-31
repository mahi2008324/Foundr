/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeUnreadNotifications,
} from '../services/notificationsService'

export default function useNotifications() {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    setError('')
    const unsubscribe = subscribeUnreadNotifications(
      currentUser.uid,
      (nextNotifications) => {
        setNotifications(nextNotifications)
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'Unable to load notifications.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [currentUser])

  const markAsRead = useCallback(async (notificationId) => {
    await markNotificationAsRead(notificationId)
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!currentUser?.uid) return
    await markAllNotificationsAsRead(currentUser.uid)
  }, [currentUser])

  return {
    notifications,
    unreadCount: notifications.length,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  }
}
