import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db, isMockMode } from './firebase'

const allowedTypes = ['message', 'comment', 'upvote', 'cofounder_request']

export async function createNotification(data) {
  if (!data?.toUserId || !data?.fromUserId || data.toUserId === data.fromUserId) {
    return
  }

  if (!allowedTypes.includes(data.type)) {
    throw new Error('Invalid notification type.')
  }

  if (isMockMode || !db) {
    return
  }

  await addDoc(collection(db, 'notifications'), {
    toUserId: data.toUserId,
    fromUserId: data.fromUserId,
    fromUserName: data.fromUserName || 'Foundr Member',
    fromUserPhoto: data.fromUserPhoto || '',
    type: data.type,
    ideaId: data.ideaId || '',
    ideaTitle: data.ideaTitle || '',
    message: data.message || '',
    read: false,
    createdAt: serverTimestamp(),
  })
}

export function subscribeUnreadNotifications(userId, callback, errorCallback) {
  if (!userId || isMockMode || !db) {
    callback([])
    return () => {}
  }

  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('toUserId', '==', userId),
    where('read', '==', false),
    limit(25),
  )

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      callback(
        snapshot.docs
          .map((notificationDoc) => ({
            id: notificationDoc.id,
            ...notificationDoc.data(),
          }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
            const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
            return bTime - aTime
          }),
      )
    },
    errorCallback,
  )
}

export async function markNotificationAsRead(notificationId) {
  if (!notificationId || isMockMode || !db) {
    return
  }

  await updateDoc(doc(db, 'notifications', notificationId), {
    read: true,
  })
}

export async function markAllNotificationsAsRead(userId) {
  if (!userId || isMockMode || !db) {
    return
  }

  const snapshot = await getDocs(query(
    collection(db, 'notifications'),
    where('toUserId', '==', userId),
    where('read', '==', false),
  ))

  if (snapshot.empty) {
    return
  }

  const batch = writeBatch(db)
  snapshot.docs.forEach((notificationDoc) => {
    batch.update(notificationDoc.ref, { read: true })
  })
  await batch.commit()
}

export async function getNotificationActor(userId) {
  if (!userId || isMockMode || !db) {
    return null
  }

  const userSnapshot = await getDoc(doc(db, 'users', userId))
  if (!userSnapshot.exists()) {
    return null
  }

  const user = userSnapshot.data()
  return {
    uid: user.uid || userSnapshot.id,
    name: user.name || 'Foundr Member',
    photoURL: user.photoURL || '',
  }
}
