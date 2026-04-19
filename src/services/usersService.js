import { updateProfile } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, isMockMode, storage } from './firebase'
import {
  generateMockId,
  getMockUsers,
  saveMockUsers,
} from './mockBackend'

export async function createUserProfile(uid, data) {
  if (isMockMode) {
    const users = getMockUsers()
    const existingUser = users.find((user) => user.uid === uid)
    const payload = {
      uid,
      name: data.name ?? existingUser?.name ?? 'Foundr Member',
      email: data.email ?? existingUser?.email ?? '',
      password: data.password ?? existingUser?.password ?? '',
      photoURL: data.photoURL ?? existingUser?.photoURL ?? '',
      bio: data.bio ?? existingUser?.bio ?? 'Student builder exploring bold ideas in public.',
      college: data.college ?? existingUser?.college ?? '',
      skills: data.skills ?? existingUser?.skills ?? [],
      lookingFor: data.lookingFor ?? existingUser?.lookingFor ?? 'both',
      ideasPosted: data.ideasPosted ?? existingUser?.ideasPosted ?? [],
      bookmarks: data.bookmarks ?? existingUser?.bookmarks ?? [],
      isVerified: data.isVerified ?? existingUser?.isVerified ?? false,
      createdAt: existingUser?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const nextUsers = existingUser
      ? users.map((user) => (user.uid === uid ? payload : user))
      : [...users, payload]
    saveMockUsers(nextUsers)
    return payload
  }

  const userRef = doc(db, 'users', uid)
  const existingSnapshot = await getDoc(userRef)
  const existingData = existingSnapshot.exists() ? existingSnapshot.data() : {}

  const payload = {
    uid,
    name: data.name ?? existingData.name ?? 'Foundr Member',
    email: data.email ?? existingData.email ?? '',
    photoURL: data.photoURL ?? existingData.photoURL ?? '',
    bio: data.bio ?? existingData.bio ?? 'Student builder exploring bold ideas in public.',
    college: data.college ?? existingData.college ?? '',
    skills: data.skills ?? existingData.skills ?? [],
    lookingFor: data.lookingFor ?? existingData.lookingFor ?? 'both',
    ideasPosted: data.ideasPosted ?? existingData.ideasPosted ?? [],
    bookmarks: data.bookmarks ?? existingData.bookmarks ?? [],
    isVerified: data.isVerified ?? existingData.isVerified ?? false,
    createdAt: existingData.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(userRef, payload, { merge: true })
  return payload
}

export async function getUserProfile(uid) {
  if (isMockMode) {
    return getMockUsers().find((user) => user.uid === uid) ?? null
  }

  const userSnapshot = await getDoc(doc(db, 'users', uid))

  if (!userSnapshot.exists()) {
    return null
  }

  return {
    id: userSnapshot.id,
    ...userSnapshot.data(),
  }
}

export async function updateUserProfile(uid, data) {
  if (isMockMode) {
    const users = getMockUsers()
    saveMockUsers(
      users.map((user) =>
        user.uid === uid
          ? { ...user, ...data, updatedAt: new Date().toISOString() }
          : user,
      ),
    )
    return
  }

  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function uploadProfilePhoto(uid, file) {
  if (isMockMode) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Could not read the selected image.'))
      reader.readAsDataURL(file)
    })
  }

  const storageRef = ref(storage, `profile-photos/${uid}/${Date.now()}-${file.name}`)
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)

  if (auth.currentUser && auth.currentUser.uid === uid) {
    await updateProfile(auth.currentUser, {
      photoURL: downloadURL,
    })
  }

  return downloadURL
}

export async function getMatchableUsers() {
  if (isMockMode) {
    return getMockUsers().filter((user) => Boolean(user.lookingFor))
  }

  const usersQuery = query(
    collection(db, 'users'),
    where('lookingFor', 'in', ['cofounder', 'feedback', 'both']),
  )
  const snapshot = await getDocs(usersQuery)

  return snapshot.docs.map((userDoc) => ({
    id: userDoc.id,
    ...userDoc.data(),
  }))
}

export async function createMockUserAccount({ name, email, password }) {
  const users = getMockUsers()
  const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase())

  if (existingUser) {
    throw new Error('An account with this email already exists.')
  }

  const uid = generateMockId('user')
  await createUserProfile(uid, {
    name,
    email,
    password,
  })

  return getMockUsers().find((user) => user.uid === uid)
}
