/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { toggleVote } from '../services/ideasService'

export default function useVote(initialVotes = [], currentUser) {
  const [votes, setVotes] = useState(initialVotes)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setVotes(initialVotes)
  }, [initialVotes])

  const handleVote = useCallback(
    async (ideaId) => {
      if (!currentUser?.uid || isPending) {
        return
      }

      const userId = currentUser.uid
      const hasVoted = votes.includes(userId)

      setIsPending(true)
      setVotes((currentVotes) =>
        hasVoted ? currentVotes.filter((voteId) => voteId !== userId) : [...currentVotes, userId],
      )

      try {
        await toggleVote(ideaId, userId)
        toast.success('Voted!')
      } catch (error) {
        setVotes(initialVotes)
        toast.error(error.message || 'Could not update your vote.')
      } finally {
        setIsPending(false)
      }
    },
    [currentUser, initialVotes, isPending, votes],
  )

  return {
    votes,
    voteCount: votes.length,
    hasVoted: currentUser?.uid ? votes.includes(currentUser.uid) : false,
    isPending,
    handleVote,
  }
}
