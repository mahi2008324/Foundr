/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useMemo, useState } from 'react'

const FeedContext = createContext(null)

export function FeedProvider({ children }) {
  const [activeTag, setActiveTag] = useState('All')
  const [activeStage, setActiveStage] = useState('all')
  const [sortMode, setSortMode] = useState('trending')
  const [searchQuery, setSearchQuery] = useState('')

  const value = useMemo(
    () => ({
      activeTag,
      setActiveTag,
      activeStage,
      setActiveStage,
      sortMode,
      setSortMode,
      searchQuery,
      setSearchQuery,
    }),
    [activeTag, activeStage, sortMode, searchQuery],
  )

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>
}

export function useFeed() {
  const context = useContext(FeedContext)

  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider')
  }

  return context
}
