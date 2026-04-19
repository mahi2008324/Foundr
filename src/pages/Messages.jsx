import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { getOrCreateChat, getUserChats, subscribeToMessages, sendMessage } from '../services/messagesService'

export default function Messages() {
  const { currentUser, userProfile } = useAuth()
  const location = useLocation()
  const passedUser = location.state?.user

  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  
  const bottomRef = useRef(null)

  // fetch user's chats on load
  useEffect(() => {
    let mounted = true
    if (!currentUser?.uid) return

    const loadChats = async () => {
      try {
        const userChats = await getUserChats(currentUser.uid)
        
        let targetChatId = null

        // handle direct connect from profile
        if (passedUser) {
          const selfUser = { 
            uid: currentUser.uid, 
            name: userProfile?.name || currentUser.displayName, 
            photoURL: userProfile?.photoURL || currentUser.photoURL, 
            lookingFor: userProfile?.lookingFor,
            skills: userProfile?.skills || []
          }
          targetChatId = await getOrCreateChat(selfUser, passedUser)
          
          // make sure we have the latest chat data
          const exists = userChats.find(c => c.id === targetChatId)
          if (!exists) {
            const upToDateChats = await getUserChats(currentUser.uid)
            if(mounted) setChats(upToDateChats)
          } else {
            if(mounted) setChats(userChats)
          }
        } else {
          if(mounted) setChats(userChats)
          if (userChats.length > 0) targetChatId = userChats[0].id
        }

        if (mounted && targetChatId) setActiveChatId(targetChatId)
        if (mounted) setLoadingChats(false)
      } catch (err) {
        console.error("Failed to load chats:", err)
        if (mounted) setLoadingChats(false)
      }
    }
    void loadChats()
    return () => { mounted = false }
  }, [currentUser, passedUser, userProfile])

  // listen for new messages live
  useEffect(() => {
    if (!activeChatId) return
    const unsubscribe = subscribeToMessages(activeChatId, (newMsgs) => {
      setMessages(newMsgs)
    })
    return () => unsubscribe()
  }, [activeChatId])

  // pin scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChatId || !currentUser?.uid) return

    const text = newMessage.trim()
    setNewMessage('')
    
    try {
      await sendMessage(activeChatId, currentUser.uid, text)
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  // get that other user's info
  const getOtherUser = (chat) => {
    if (!chat || !chat.users) return { name: 'Unknown User', role: 'Developer', photoURL: '', skills: [] }
    const otherUid = Object.keys(chat.users).find(uid => uid !== currentUser?.uid)
    if (!otherUid) return { name: 'Myself', role: 'Developer', photoURL: '', skills: [] }
    return chat.users[otherUid]
  }

  const activeChatInfo = chats.find(c => c.id === activeChatId)
  const otherUser = getOtherUser(activeChatInfo)

  const formatTime = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date()
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page-enter flex flex-col min-h-screen" style={{ background: 'var(--surface)' }}>
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* left nav - chat list */}
        <aside 
          className="md:w-80 flex flex-col rounded-[1.5rem] overflow-hidden shrink-0 h-[300px] md:h-full"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <h2 className="text-xl font-black text-white font-['Outfit',sans-serif]">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto hidden-scrollbar p-3 space-y-2">
            {loadingChats ? (
              <p className="text-sm p-4 text-center text-slate-500">Loading chats...</p>
            ) : chats.length === 0 ? (
              <p className="text-sm p-4 text-center text-slate-500">No active conversations. Match with someone!</p>
            ) : (
              chats.map(chat => {
                const companion = getOtherUser(chat)
                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group"
                    style={{
                      background: activeChatId === chat.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                      border: `1px solid ${activeChatId === chat.id ? 'rgba(99,102,241,0.2)' : 'transparent'}`
                    }}
                  >
                    <div className="relative shrink-0">
                      {companion.photoURL ? (
                        <img src={companion.photoURL} alt={companion.name} className="h-12 w-12 rounded-xl object-cover ring-2 ring-indigo-500/20" />
                      ) : (
                        <div 
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
                        >
                          {(companion.name || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{companion.name}</p>
                      <p className="text-[11px] truncate mt-0.5 capitalize" style={{ color: activeChatId === chat.id ? '#a5b4fc' : 'var(--text-muted)' }}>
                        {(companion.skills && companion.skills.length > 0) ? companion.skills.slice(0, 3).join(' • ') : (companion.role || 'Connected')}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* active chat space */}
        <section 
          className="flex-1 flex flex-col rounded-[1.5rem] overflow-hidden h-[500px] md:h-full relative"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {activeChatId ? (
            <>
              {/* top bar with user info */}
              <header 
                className="flex items-center justify-between p-5 border-b shrink-0"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  {otherUser.photoURL ? (
                     <img src={otherUser.photoURL} alt={otherUser.name} className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/20" />
                  ) : (
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
                    >
                      {(otherUser.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="leading-tight">
                    <h3 className="text-base font-bold text-white">{otherUser.name}</h3>
                    <p className="text-[11px] capitalize" style={{ color: 'var(--text-muted)' }}>
                      {otherUser.role}
                    </p>
                  </div>
                </div>
              </header>

              {/* message feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-3">👋</span>
                    <p className="text-sm text-slate-300 font-medium">Say hi to {otherUser.name}!</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>This is the beginning of a verified conversation.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.uid
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                        <div 
                          className={`max-w-[75%] px-4 py-3 text-[15px] ${isMe ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}`}
                          style={{
                            background: isMe ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : 'rgba(255,255,255,0.05)',
                            color: isMe ? 'white' : 'var(--text-primary)',
                            border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)'
                          }}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider mt-1.5 opacity-60" style={{ color: 'var(--text-secondary)' }}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* type and send */}
              <form onSubmit={handleSend} className="p-4 border-t h-20 shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={`Message ${otherUser.name}...`}
                    className="input-dark flex-1 rounded-full px-5 py-3.5 text-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-lg">↗</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <span className="text-3xl mb-2">💬</span>
              <p>Select a chat or match with a co-founder.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
