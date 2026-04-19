/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addIdeaComment, subscribeComments } from '../services/ideasService'

export default function useComments(ideaId) {
  const { currentUser, userProfile } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ideaId) {
      setComments([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    const unsubscribe = subscribeComments(ideaId, (nextComments) => {
      setComments(nextComments)
      setLoading(false)
    })

    return unsubscribe
  }, [ideaId])

  const addComment = useCallback(async (targetIdeaId, text) => {
    if (!currentUser?.uid) {
      throw new Error('You must be signed in to comment.')
    }

    await addIdeaComment(targetIdeaId, {
      text,
      authorId: currentUser.uid,
      authorName: userProfile?.name ?? currentUser.displayName ?? 'Foundr Member',
      authorPhoto: userProfile?.photoURL ?? currentUser.photoURL ?? '',
    })
  }, [currentUser, userProfile])

  return { comments, loading, addComment }
}
