/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { toggleBookmark } from '../services/ideasService'

export default function useBookmark(initialBookmarks = [], currentUser) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setBookmarks(initialBookmarks)
  }, [initialBookmarks])

  const handleBookmark = useCallback(
    async (ideaId) => {
      if (!currentUser?.uid || isPending) {
        return
      }

      const isBookmarked = bookmarks.includes(ideaId)
      setIsPending(true)
      setBookmarks((currentBookmarks) =>
        isBookmarked
          ? currentBookmarks.filter((bookmarkId) => bookmarkId !== ideaId)
          : [...currentBookmarks, ideaId],
      )

      try {
        await toggleBookmark(ideaId, currentUser.uid)
        toast.success(isBookmarked ? 'Removed bookmark!' : 'Bookmarked!')
      } catch (error) {
        setBookmarks(initialBookmarks)
        toast.error(error.message || 'Could not update your bookmarks.')
      } finally {
        setIsPending(false)
      }
    },
    [bookmarks, currentUser, initialBookmarks, isPending],
  )

  return {
    bookmarks,
    isBookmarked: (ideaId) => bookmarks.includes(ideaId),
    isPending,
    handleBookmark,
  }
}
