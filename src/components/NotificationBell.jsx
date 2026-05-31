import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useNotifications from '../hooks/useNotifications'

function timeAgo(timestamp) {
  const date = timestamp?.toDate ? timestamp.toDate() : null
  if (!date) return 'Just now'

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return 'Just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function notificationText(notification) {
  if (notification.message) return notification.message

  const ideaTitle = notification.ideaTitle ? ` "${notification.ideaTitle}"` : ''
  if (notification.type === 'message') return 'sent you a message'
  if (notification.type === 'comment') return `commented on your idea${ideaTitle}`
  if (notification.type === 'upvote') return `liked your idea${ideaTitle}`
  if (notification.type === 'cofounder_request') return 'sent you a co-founder request'
  return 'sent you a notification'
}

function notificationPath(notification) {
  if (notification.type === 'message') return '/messages'
  if ((notification.type === 'comment' || notification.type === 'upvote') && notification.ideaId) {
    return `/idea/${notification.ideaId}`
  }
  if (notification.type === 'cofounder_request' && notification.fromUserId) {
    return `/profile/${notification.fromUserId}`
  }
  return '/'
}

function NotificationBell() {
  const navigate = useNavigate()
  const buttonRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead } = useNotifications()

  const displayCount = useMemo(() => (unreadCount > 9 ? '9+' : unreadCount.toString()), [unreadCount])

  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current)
  }, [])

  const handleNotificationClick = useCallback(async (notification) => {
    await markAsRead(notification.id)
    setIsOpen(false)
    navigate(notificationPath(notification))
  }, [markAsRead, navigate])

  const handleMarkAll = useCallback(async () => {
    await markAllAsRead()
    buttonRef.current?.focus()
  }, [markAllAsRead])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="notification-bell-button relative flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span className="text-base" aria-hidden="true">{'\uD83D\uDD14'}</span>
        <span className="sr-only">Notifications</span>
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black text-white" style={{ background: '#ef4444', border: '1px solid rgba(255,255,255,0.45)' }}>
            {displayCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-sm font-black text-white">Notifications</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAll} className="rounded-full px-3 py-1.5 text-xs font-semibold btn-ghost">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {error ? (
              <p className="px-3 py-8 text-center text-sm text-red-300">{error}</p>
            ) : loading ? (
              <p className="px-3 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>You are all caught up.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {notification.fromUserPhoto ? (
                    <img src={notification.fromUserPhoto} alt={notification.fromUserName} className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/20" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}>
                      {(notification.fromUserName || 'F').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-5 text-white">
                      <span className="font-bold">{notification.fromUserName || 'Foundr Member'}</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{notificationText(notification)}</span>
                    </p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(notification.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(NotificationBell)
