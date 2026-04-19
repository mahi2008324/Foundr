import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db, isMockMode } from './firebase'
import {
  generateMockId,
  getRawMockIdeas,
  normalizeMockBuildLogs,
  normalizeMockComments,
  saveMockIdeas,
  subscribeMockChanges,
} from './mockBackend'
import { getMockUsers, saveMockUsers } from './mockBackend'

function normalizeIdeaTimestamps(idea) {
  return {
    ...idea,
    createdAt: {
      toDate: () => new Date(idea.createdAt),
      toMillis: () => new Date(idea.createdAt).getTime(),
    },
    updatedAt: {
      toDate: () => new Date(idea.updatedAt),
      toMillis: () => new Date(idea.updatedAt).getTime(),
    },
  }
}

export async function createIdea(data) {
  if (isMockMode) {
    const ideas = getRawMockIdeas()
    const ideaId = generateMockId('idea')
    const timestamp = new Date().toISOString()
    const newIdea = {
      id: ideaId,
      title: data.title,
      problem: data.problem,
      solution: data.solution,
      stage: data.stage,
      tags: data.tags,
      lookingFor: data.lookingFor,
      authorId: data.authorId,
      authorName: data.authorName,
      authorPhoto: data.authorPhoto ?? '',
      isVerified: data.isVerified ?? false,
      votes: [],
      commentCount: 0,
      views: 0,
      aiFeedback: '',
      comments: [],
      buildLogs: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    saveMockIdeas([newIdea, ...ideas])
    saveMockUsers(
      getMockUsers().map((user) =>
        user.uid === data.authorId
          ? {
              ...user,
              ideasPosted: [...(user.ideasPosted ?? []), ideaId],
              updatedAt: timestamp,
            }
          : user,
      ),
    )

    return ideaId
  }

  const ideasRef = collection(db, 'ideas')
  const now = serverTimestamp()

  const ideaDocRef = await addDoc(ideasRef, {
    title: data.title,
    problem: data.problem,
    solution: data.solution,
    stage: data.stage,
    tags: data.tags,
    lookingFor: data.lookingFor,
    authorId: data.authorId,
    authorName: data.authorName,
    authorPhoto: data.authorPhoto ?? '',
    votes: [],
    commentCount: 0,
    views: 0,
    aiFeedback: '',
    createdAt: now,
    updatedAt: now,
  })

  await updateDoc(doc(db, 'users', data.authorId), {
    ideasPosted: arrayUnion(ideaDocRef.id),
    updatedAt: serverTimestamp(),
  })

  return ideaDocRef.id
}

export async function getIdeas(filters = {}) {
  if (isMockMode) {
    let ideas = getRawMockIdeas().map(normalizeIdeaTimestamps)

    if (filters.tag && filters.tag !== 'All') {
      ideas = ideas.filter((idea) => idea.tags.includes(filters.tag))
    }

    if (filters.stage && filters.stage !== 'all') {
      ideas = ideas.filter((idea) => idea.stage === filters.stage)
    }

    return ideas.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
  }

  const constraints = []

  if (filters.tag && filters.tag !== 'All') {
    constraints.push(where('tags', 'array-contains', filters.tag))
  }

  if (filters.stage && filters.stage !== 'all') {
    constraints.push(where('stage', '==', filters.stage))
  }

  const snapshot = await getDocs(query(collection(db, 'ideas'), ...constraints))
  return snapshot.docs.map((ideaDoc) => ({
    id: ideaDoc.id,
    ...ideaDoc.data(),
  }))
}

export async function getIdeaById(id) {
  if (isMockMode) {
    const idea = getRawMockIdeas().find((entry) => entry.id === id)
    return idea ? normalizeIdeaTimestamps(idea) : null
  }

  const snapshot = await getDoc(doc(db, 'ideas', id))

  if (!snapshot.exists()) {
    return null
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  }
}

export async function updateIdea(id, data) {
  if (isMockMode) {
    const ideas = getRawMockIdeas()
    saveMockIdeas(
      ideas.map((idea) =>
        idea.id === id
          ? {
              ...idea,
              ...Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                  key,
                  typeof value === 'number' ? value : value,
                ]),
              ),
              updatedAt: new Date().toISOString(),
            }
          : idea,
      ),
    )
    return
  }

  await updateDoc(doc(db, 'ideas', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteIdea(id) {
  if (isMockMode) {
    const ideas = getRawMockIdeas()
    const targetIdea = ideas.find((idea) => idea.id === id)
    saveMockIdeas(ideas.filter((idea) => idea.id !== id))

    if (targetIdea?.authorId) {
      saveMockUsers(
        getMockUsers().map((user) =>
          user.uid === targetIdea.authorId
            ? {
                ...user,
                ideasPosted: (user.ideasPosted ?? []).filter((ideaId) => ideaId !== id),
                updatedAt: new Date().toISOString(),
              }
            : user,
        ),
      )
    }

    return
  }

  const ideaRef = doc(db, 'ideas', id)
  const ideaSnapshot = await getDoc(ideaRef)

  if (!ideaSnapshot.exists()) {
    return
  }

  const ideaData = ideaSnapshot.data()
  const batch = writeBatch(db)

  const commentsSnapshot = await getDocs(collection(db, 'ideas', id, 'comments'))
  commentsSnapshot.forEach((commentDoc) => {
    batch.delete(commentDoc.ref)
  })

  const buildLogsSnapshot = await getDocs(collection(db, 'ideas', id, 'buildLogs'))
  buildLogsSnapshot.forEach((buildLogDoc) => {
    batch.delete(buildLogDoc.ref)
  })

  batch.delete(ideaRef)

  if (ideaData.authorId) {
    batch.update(doc(db, 'users', ideaData.authorId), {
      ideasPosted: arrayRemove(id),
      updatedAt: serverTimestamp(),
    })
  }

  await batch.commit()
}

export async function toggleVote(ideaId, userId) {
  if (isMockMode) {
    const ideas = getRawMockIdeas()
    saveMockIdeas(
      ideas.map((idea) => {
        if (idea.id !== ideaId) {
          return idea
        }

        const alreadyVoted = (idea.votes ?? []).includes(userId)
        return {
          ...idea,
          votes: alreadyVoted
            ? idea.votes.filter((voteId) => voteId !== userId)
            : [...(idea.votes ?? []), userId],
          updatedAt: new Date().toISOString(),
        }
      }),
    )
    return
  }

  const ideaRef = doc(db, 'ideas', ideaId)

  await runTransaction(db, async (transaction) => {
    const ideaSnapshot = await transaction.get(ideaRef)

    if (!ideaSnapshot.exists()) {
      throw new Error('Idea not found.')
    }

    const votes = ideaSnapshot.data().votes ?? []
    const alreadyVoted = votes.includes(userId)

    transaction.update(ideaRef, {
      votes: alreadyVoted ? arrayRemove(userId) : arrayUnion(userId),
      updatedAt: serverTimestamp(),
    })
  })
}

export async function toggleBookmark(ideaId, userId) {
  if (isMockMode) {
    saveMockUsers(
      getMockUsers().map((user) => {
        if (user.uid !== userId) {
          return user
        }

        const alreadyBookmarked = (user.bookmarks ?? []).includes(ideaId)
        return {
          ...user,
          bookmarks: alreadyBookmarked
            ? user.bookmarks.filter((bookmarkId) => bookmarkId !== ideaId)
            : [...(user.bookmarks ?? []), ideaId],
          updatedAt: new Date().toISOString(),
        }
      }),
    )
    return
  }

  const userRef = doc(db, 'users', userId)

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef)

    if (!userSnapshot.exists()) {
      throw new Error('User profile not found.')
    }

    const bookmarks = userSnapshot.data().bookmarks ?? []
    const alreadyBookmarked = bookmarks.includes(ideaId)

    transaction.update(userRef, {
      bookmarks: alreadyBookmarked ? arrayRemove(ideaId) : arrayUnion(ideaId),
      updatedAt: serverTimestamp(),
    })
  })
}

export function subscribeIdeas(filters, callback, errorCallback) {
  if (isMockMode) {
    const publish = async () => {
      try {
        const ideas = await getIdeas(filters)
        callback(ideas)
      } catch (error) {
        errorCallback?.(error)
      }
    }

    void publish()
    return subscribeMockChanges(() => {
      void publish()
    })
  }

  const constraints = []

  if (filters.tag && filters.tag !== 'All') {
    constraints.push(where('tags', 'array-contains', filters.tag))
  }

  if (filters.stage && filters.stage !== 'all') {
    constraints.push(where('stage', '==', filters.stage))
  }

  const ideasQuery = query(collection(db, 'ideas'), ...constraints)
  return onSnapshot(
    ideasQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((ideaDoc) => ({
          id: ideaDoc.id,
          ...ideaDoc.data(),
        })),
      )
    },
    errorCallback,
  )
}

export function subscribeComments(ideaId, callback) {
  if (isMockMode) {
    const publish = () => {
      const idea = getRawMockIdeas().find((entry) => entry.id === ideaId)
      callback(normalizeMockComments(idea?.comments ?? []))
    }

    publish()
    return subscribeMockChanges(publish)
  }

  const commentsQuery = query(collection(db, 'ideas', ideaId, 'comments'), orderBy('createdAt', 'desc'))
  return onSnapshot(commentsQuery, (snapshot) => {
    callback(snapshot.docs.map((commentDoc) => ({ id: commentDoc.id, ...commentDoc.data() })))
  })
}

export async function addIdeaComment(ideaId, comment) {
  if (isMockMode) {
    const ideas = getRawMockIdeas()
    const timestamp = new Date().toISOString()
    saveMockIdeas(
      ideas.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              comments: [
                {
                  id: generateMockId('comment'),
                  ...comment,
                  createdAt: timestamp,
                },
                ...(idea.comments ?? []),
              ],
              commentCount: (idea.commentCount ?? 0) + 1,
              updatedAt: timestamp,
            }
          : idea,
      ),
    )
    return
  }

  await addDoc(collection(db, 'ideas', ideaId, 'comments'), {
    ...comment,
    createdAt: serverTimestamp(),
  })

  await updateDoc(doc(db, 'ideas', ideaId), {
    commentCount: increment(1),
    updatedAt: serverTimestamp(),
  })
}

export function subscribeBuildLogs(ideaId, callback) {
  if (isMockMode) {
    const publish = () => {
      const idea = getRawMockIdeas().find((entry) => entry.id === ideaId)
      callback(normalizeMockBuildLogs(idea?.buildLogs ?? []))
    }

    publish()
    return subscribeMockChanges(publish)
  }

  const buildLogsQuery = query(collection(db, 'ideas', ideaId, 'buildLogs'), orderBy('createdAt', 'desc'))
  return onSnapshot(buildLogsQuery, (snapshot) => {
    callback(snapshot.docs.map((logDoc) => ({ id: logDoc.id, ...logDoc.data() })))
  })
}

export async function addIdeaBuildLog(ideaId, buildLog) {
  if (isMockMode) {
    const ideas = getRawMockIdeas()
    const timestamp = new Date().toISOString()
    saveMockIdeas(
      ideas.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              buildLogs: [
                {
                  id: generateMockId('log'),
                  ...buildLog,
                  createdAt: timestamp,
                },
                ...(idea.buildLogs ?? []),
              ],
              updatedAt: timestamp,
            }
          : idea,
      ),
    )
    return
  }

  await addDoc(collection(db, 'ideas', ideaId, 'buildLogs'), {
    ...buildLog,
    createdAt: serverTimestamp(),
  })
}
