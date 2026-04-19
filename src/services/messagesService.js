import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from 'firebase/firestore'
import { db, isMockMode } from './firebase'

export async function getOrCreateChat(user1, user2) {
  if (isMockMode || !db) return 'mock_chat_id'

  // make chat ID always the same for these two
  const participants = [user1.uid, user2.uid].sort()
  const chatId = `${participants[0]}_${participants[1]}`

  const chatRef = doc(db, 'chats', chatId)
  const chatSnap = await getDoc(chatRef)

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants,
      users: {
        [user1.uid]: { 
          name: user1.name || 'User', 
          role: user1.lookingFor || 'Developer', 
          photoURL: user1.photoURL || '',
          skills: user1.skills || []
        },
        [user2.uid]: { 
          name: user2.name || 'User', 
          role: user2.lookingFor || 'Developer', 
          photoURL: user2.photoURL || '',
          skills: user2.skills || []
        },
      },
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
    })
  }

  return chatId
}

export async function getUserChats(userId) {
  if (isMockMode || !db) return []

  const chatsRef = collection(db, 'chats')
  const q = query(chatsRef, where('participants', 'array-contains', userId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })).sort((a, b) => {
    const aTime = a.lastMessageAt?.toMillis ? a.lastMessageAt.toMillis() : 0
    const bTime = b.lastMessageAt?.toMillis ? b.lastMessageAt.toMillis() : 0
    return bTime - aTime
  })
}

export function subscribeToMessages(chatId, callback) {
  if (isMockMode || !db) {
    callback([])
    return () => {}
  }

  const msgsRef = collection(db, `chats/${chatId}/messages`)
  const q = query(msgsRef, orderBy('createdAt', 'asc'))

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(messages)
  })
}

export async function sendMessage(chatId, senderId, text) {
  if (isMockMode || !db) return

  const msgsRef = collection(db, `chats/${chatId}/messages`)
  await addDoc(msgsRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  })

  // update the list view
  const chatRef = doc(db, 'chats', chatId)
  await setDoc(chatRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  }, { merge: true })
}
