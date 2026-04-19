/* eslint-disable react-refresh/only-export-components */

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db, isMockMode } from '../services/firebase'
import {
  createMockUserAccount,
  createUserProfile,
  getUserProfile,
  updateUserProfile as updateUserProfileDocument,
} from '../services/usersService'
import {
  getMockUsers,
  getMockSessionUserId,
  setMockSessionUserId,
  subscribeMockChanges,
} from '../services/mockBackend'

const AuthContext = createContext(null)
const googleProvider = new GoogleAuthProvider()

async function upsertUserProfile(user, overrides = {}) {
  if (!user) {
    return
  }

  await createUserProfile(user.uid, {
    name: overrides.name ?? user.displayName ?? 'Foundr Member',
    email: user.email ?? '',
    photoURL: overrides.photoURL ?? user.photoURL ?? '',
    password: overrides.password ?? '',
  })
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const signup = async (email, password, name) => {
    if (isMockMode) {
      const newUser = await createMockUserAccount({ name, email, password })
      setMockSessionUserId(newUser.uid)
      setCurrentUser({
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.name,
        photoURL: newUser.photoURL,
      })
      setUserProfile(newUser)
      return newUser
    }

    const credentials = await createUserWithEmailAndPassword(auth, email, password)

    await updateProfile(credentials.user, {
      displayName: name,
    })

    await upsertUserProfile(
      {
        ...credentials.user,
        displayName: name,
      },
      { name, password },
    )

    return credentials.user
  }

  const login = async (email, password) => {
    if (isMockMode) {
      const profile = await getUserProfile(
        getMockUsers().find(
          (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
        )?.uid ?? '',
      )

      if (!profile) {
        throw new Error('Invalid email or password.')
      }

      setMockSessionUserId(profile.uid)
      setCurrentUser({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.name,
        photoURL: profile.photoURL,
      })
      setUserProfile(profile)
      return profile
    }

    const credentials = await signInWithEmailAndPassword(auth, email, password)
    return credentials.user
  }

  const loginWithGoogle = async () => {
    if (isMockMode) {
      const googleDemoUser = await createMockUserAccount({
        name: 'Google Demo Builder',
        email: `google-demo-${Date.now()}@foundr.demo`,
        password: 'password123',
      })
      setMockSessionUserId(googleDemoUser.uid)
      setCurrentUser({
        uid: googleDemoUser.uid,
        email: googleDemoUser.email,
        displayName: googleDemoUser.name,
        photoURL: googleDemoUser.photoURL,
      })
      setUserProfile(googleDemoUser)
      return googleDemoUser
    }

    const credentials = await signInWithPopup(auth, googleProvider)
    await upsertUserProfile(credentials.user)
    return credentials.user
  }

  const logout = () => {
    if (isMockMode) {
      setMockSessionUserId('')
      setCurrentUser(null)
      setUserProfile(null)
      return Promise.resolve()
    }

    return signOut(auth)
  }

  useEffect(() => {
    if (isMockMode) {
      const syncSession = async () => {
        const sessionUid = getMockSessionUserId()

        if (!sessionUid) {
          setCurrentUser(null)
          setUserProfile(null)
          setLoading(false)
          return
        }

        const profile = await getUserProfile(sessionUid)
        setCurrentUser(
          profile
            ? {
                uid: profile.uid,
                email: profile.email,
                displayName: profile.name,
                photoURL: profile.photoURL,
              }
            : null,
        )
        setUserProfile(profile)
        setLoading(false)
      }

      void syncSession()
      return subscribeMockChanges(() => {
        void syncSession()
      })
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await upsertUserProfile(user)
      } else {
        setUserProfile(null)
      }

      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (isMockMode || !db || !currentUser?.uid) {
      return undefined
    }

    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (snapshot) => {
      setUserProfile(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)
    })

    return unsubscribe
  }, [currentUser?.uid])

  const updateUserProfile = async (data) => {
    if (!currentUser?.uid) {
      throw new Error('You must be logged in to update your profile.')
    }

    await updateUserProfileDocument(currentUser.uid, data)
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
