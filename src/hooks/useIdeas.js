/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { subscribeIdeas } from '../services/ideasService'

function toMillis(value) {
  if (!value) {
    return 0
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis()
  }

  if (value.seconds) {
    return value.seconds * 1000
  }

  return new Date(value).getTime()
}

export default function useIdeas(filters = {}) {
  const { tag, stage, sortMode, searchQuery } = filters
  const [rawIdeas, setRawIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getTrendingScore = useCallback((idea) => {
    const daysSince = (Date.now() - idea.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24)
    const recency = Math.max(0, 7 - daysSince) * 5
    return ((idea.votes ?? []).length * 3) + ((idea.commentCount ?? 0) * 2) + recency
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')

    const unsubscribe = subscribeIdeas(
      { tag, stage },
      (ideas) => {
        setRawIdeas(
          ideas.map((idea) => ({
            ...idea,
            votes: idea.votes ?? [],
            commentCount: idea.commentCount ?? 0,
            trendingScore: getTrendingScore({
              ...idea,
              votes: idea.votes ?? [],
              commentCount: idea.commentCount ?? 0,
            }),
          })),
        )
        setLoading(false)
      },
      (snapshotError) => {
        setError(snapshotError.message || 'Unable to load ideas right now.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [getTrendingScore, stage, tag])

  const ideas = useMemo(() => {
    const normalizedQuery = searchQuery?.trim().toLowerCase() ?? ''

    const filteredIdeas = normalizedQuery
      ? rawIdeas.filter((idea) => {
          const searchableContent = [
            idea.title,
            idea.problem,
            idea.solution,
            idea.authorName,
            ...(idea.tags ?? []),
          ]
            .join(' ')
            .toLowerCase()

          return searchableContent.includes(normalizedQuery)
        })
      : rawIdeas

    const sortedIdeas = [...filteredIdeas]

    if (sortMode === 'newest') {
      sortedIdeas.sort((firstIdea, secondIdea) => toMillis(secondIdea.createdAt) - toMillis(firstIdea.createdAt))
      return sortedIdeas
    }

    sortedIdeas.sort((firstIdea, secondIdea) => secondIdea.trendingScore - firstIdea.trendingScore)
    return sortedIdeas
  }, [rawIdeas, searchQuery, sortMode])

  return { ideas, loading, error }
}
