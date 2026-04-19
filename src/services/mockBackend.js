const USERS_KEY = 'foundr_mock_users'
const IDEAS_KEY = 'foundr_mock_ideas'
const SESSION_KEY = 'foundr_mock_session'

function nowIso() {
  return new Date().toISOString()
}

function emitChange(type, payload) {
  window.dispatchEvent(new CustomEvent('foundr:mock-change', { detail: { type, payload } }))
}

function makeTimestamp(value) {
  const isoValue = value ?? nowIso()
  return {
    iso: isoValue,
    toDate: () => new Date(isoValue),
    toMillis: () => new Date(isoValue).getTime(),
  }
}

function normalizeIdea(idea) {
  return {
    ...idea,
    createdAt: makeTimestamp(idea.createdAt),
    updatedAt: makeTimestamp(idea.updatedAt),
  }
}

function normalizeComment(comment) {
  return {
    ...comment,
    createdAt: makeTimestamp(comment.createdAt),
  }
}

function normalizeBuildLog(log) {
  return {
    ...log,
    createdAt: makeTimestamp(log.createdAt),
  }
}

function readJson(key, fallback) {
  const rawValue = window.localStorage.getItem(key)

  if (!rawValue) {
    return fallback
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function ensureMockData() {
  const existingUsers = readJson(USERS_KEY, null)
  const existingIdeas = readJson(IDEAS_KEY, null)

  if (existingUsers && existingIdeas) {
    return
  }

  const demoUserId = 'demo-user-riya'
  const secondUserId = 'demo-user-arjun'
  const ideaOneId = 'idea-sprintlab'
  const ideaTwoId = 'idea-dormcart'

  writeJson(USERS_KEY, [
    {
      uid: demoUserId,
      name: 'Riya Kapoor',
      email: 'riya@foundr.demo',
      password: 'password123',
      photoURL: '',
      bio: 'Student founder building accountability tools for deep work and peer momentum.',
      college: 'Delhi University',
      skills: ['Product', 'Design', 'AI'],
      lookingFor: 'both',
      ideasPosted: [ideaOneId],
      bookmarks: [ideaTwoId],
      isVerified: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      uid: secondUserId,
      name: 'Arjun Menon',
      email: 'arjun@foundr.demo',
      password: 'password123',
      photoURL: '',
      bio: 'Engineering student interested in campus logistics, growth loops, and shipping fast MVPs.',
      college: 'VIT Chennai',
      skills: ['Backend', 'Marketing', 'Product'],
      lookingFor: 'cofounder',
      ideasPosted: [ideaTwoId],
      bookmarks: [ideaOneId],
      isVerified: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ])

  writeJson(IDEAS_KEY, [
    {
      id: ideaOneId,
      title: 'SprintLab for student accountability',
      problem:
        'Students want to study consistently but struggle to maintain accountability, momentum, and focused work sessions with peers.',
      solution:
        'SprintLab pairs students into structured deep-work sessions with live check-ins, AI recaps, and progress prompts after every sprint.',
      stage: 'building',
      tags: ['EdTech', 'Social'],
      lookingFor: 'feedback',
      authorId: demoUserId,
      authorName: 'Riya Kapoor',
      authorPhoto: '',
      isVerified: false,
      votes: [secondUserId],
      commentCount: 1,
      views: 4,
      aiFeedback: '',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      comments: [
        {
          id: 'comment-1',
          text: 'I like the accountability angle. Would students use this outside exam season?',
          authorId: secondUserId,
          authorName: 'Arjun Menon',
          authorPhoto: '',
          createdAt: nowIso(),
        },
      ],
      buildLogs: [
        {
          id: 'log-1',
          week: 1,
          title: 'Validated the first workflow',
          content: 'Interviewed 12 students and prototyped the sprint join flow.',
          authorId: demoUserId,
          createdAt: nowIso(),
        },
      ],
    },
    {
      id: ideaTwoId,
      title: 'DormCart for shared campus errands',
      problem:
        'Campus students waste time coordinating snack runs, quick deliveries, and shared errands across hostels and apartments.',
      solution:
        'DormCart batches nearby errands, routes student couriers intelligently, and creates shared delivery drops for campus clusters.',
      stage: 'idea',
      tags: ['FinTech', 'Social', 'Other'],
      lookingFor: 'cofounder',
      authorId: secondUserId,
      authorName: 'Arjun Menon',
      authorPhoto: '',
      isVerified: false,
      votes: [demoUserId],
      commentCount: 0,
      views: 2,
      aiFeedback: '',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      comments: [],
      buildLogs: [],
    },
  ])
}

export function getMockUsers() {
  ensureMockData()
  return readJson(USERS_KEY, [])
}

export function saveMockUsers(users) {
  writeJson(USERS_KEY, users)
  emitChange('users', users)
}

export function getMockIdeas() {
  ensureMockData()
  return readJson(IDEAS_KEY, []).map(normalizeIdea)
}

export function getRawMockIdeas() {
  ensureMockData()
  return readJson(IDEAS_KEY, [])
}

export function saveMockIdeas(ideas) {
  writeJson(IDEAS_KEY, ideas)
  emitChange('ideas', ideas)
}

export function subscribeMockChanges(listener) {
  const handler = () => listener()
  window.addEventListener('foundr:mock-change', handler)
  return () => window.removeEventListener('foundr:mock-change', handler)
}

export function getMockSessionUserId() {
  ensureMockData()
  return window.localStorage.getItem(SESSION_KEY) ?? ''
}

export function setMockSessionUserId(uid) {
  if (uid) {
    window.localStorage.setItem(SESSION_KEY, uid)
  } else {
    window.localStorage.removeItem(SESSION_KEY)
  }
  emitChange('session', uid)
}

export function generateMockId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function normalizeMockComments(comments = []) {
  return comments.map(normalizeComment).sort(
    (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis(),
  )
}

export function normalizeMockBuildLogs(buildLogs = []) {
  return buildLogs.map(normalizeBuildLog).sort(
    (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis(),
  )
}
