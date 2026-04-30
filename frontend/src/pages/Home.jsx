import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import CallModal from '../components/CallModal'
import IncomingCall from '../components/IncomingCall'
import styles from './Home.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Home() {
  const { user, logout } = useAuth()
  const { socket, onlineUsers } = useSocket()
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [inCall, setInCall] = useState(false)
  const [incomingCall, setIncomingCall] = useState(null)
  const messagesEndRef = useRef(null)

  // WebRTC refs
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteAudioRef = useRef(null)

  // Search
  useEffect(() => {
    if (search.trim().length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`${API}/api/users/search?q=${search}`)
        setSearchResults(res.data)
      } catch {}
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Load messages when user selected
  useEffect(() => {
    if (!selectedUser) return
    axios.get(`${API}/api/messages/${selectedUser._id}`)
      .then(res => setMessages(res.data))
      .catch(() => {})
  }, [selectedUser])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Socket events
  useEffect(() => {
    if (!socket) return

    socket.on('message:receive', (msg) => {
      if (
        selectedUser &&
        (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)
      ) {
        setMessages(prev => [...prev, msg])
      }
    })

    socket.on('message:sent', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    // Incoming call
    socket.on('call:incoming', async ({ callerId, offer }) => {
      try {
        const callerRes = await axios.get(`${API}/api/users/search?q=${callerId}`)
        // We'll store raw callerId
      } catch {}
      setIncomingCall({ callerId, offer })
    })

    socket.on('call:accepted', async ({ answer }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    socket.on('ice:candidate', async ({ candidate }) => {
      if (pcRef.current && candidate) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    socket.on('call:ended', () => {
      endCallCleanup()
    })

    socket.on('call:unavailable', () => {
      alert('Foydalanuvchi hozir mavjud emas')
      endCallCleanup()
    })

    return () => {
      socket.off('message:receive')
      socket.off('message:sent')
      socket.off('call:incoming')
      socket.off('call:accepted')
      socket.off('ice:candidate')
      socket.off('call:ended')
      socket.off('call:unavailable')
    }
  }, [socket, selectedUser])

  const sendMessage = () => {
    if (!text.trim() || !selectedUser || !socket) return
    socket.emit('message:send', {
      senderId: user._id,
      receiverId: selectedUser._id,
      text: text.trim(),
    })
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ─── WebRTC ───────────────────────────────────────────────

  const createPeerConnection = useCallback((targetId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && socket) {
        socket.emit('ice:candidate', { targetId, candidate })
      }
    }

    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0]
      }
    }

    return pc
  }, [socket])

  const startCall = async () => {
    if (!selectedUser || !socket) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      const pc = createPeerConnection(selectedUser._id)
      stream.getTracks().forEach(track => pc.addTrack(track, stream))
      pcRef.current = pc
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('call:start', {
        callerId: user._id,
        receiverId: selectedUser._id,
        offer,
      })
      setInCall(true)
    } catch (err) {
      alert('Mikrofonga ruxsat berilmadi yoki xato yuz berdi')
    }
  }

  const acceptCall = async () => {
    if (!incomingCall || !socket) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      const pc = createPeerConnection(incomingCall.callerId)
      stream.getTracks().forEach(track => pc.addTrack(track, stream))
      pcRef.current = pc
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('call:accept', { callerId: incomingCall.callerId, answer })
      setInCall(true)
      setIncomingCall(null)
    } catch (err) {
      alert('Qo\'ng\'iroqni qabul qilishda xato')
    }
  }

  const rejectCall = () => {
    if (incomingCall && socket) {
      socket.emit('call:end', { targetId: incomingCall.callerId })
    }
    setIncomingCall(null)
  }

  const endCallCleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    setInCall(false)
    setIncomingCall(null)
  }

  const endCall = () => {
    if (selectedUser && socket) {
      socket.emit('call:end', { targetId: selectedUser._id })
    }
    endCallCleanup()
  }

  const isOnline = (userId) => onlineUsers.includes(userId)
  const formatTime = (date) => new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={styles.app}>
      <audio ref={remoteAudioRef} autoPlay />

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.myProfile}>
            <div className={styles.avatar}>{user.username[0].toUpperCase()}</div>
            <div>
              <div className={styles.myName}>{user.username}</div>
              <div className={styles.myPhone}>{user.phone}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Chiqish">⬡</button>
        </div>

        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="Username yoki telefon..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.userList}>
          {search.length >= 2 ? (
            searchResults.length > 0 ? searchResults.map(u => (
              <div
                key={u._id}
                className={`${styles.userItem} ${selectedUser?._id === u._id ? styles.active : ''}`}
                onClick={() => { setSelectedUser(u); setSearch(''); setSearchResults([]) }}
              >
                <div className={styles.avatarSm}>{u.username[0].toUpperCase()}</div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{u.username}</div>
                  <div className={styles.userPhone}>{u.phone}</div>
                </div>
                {isOnline(u._id) && <div className={styles.onlineDot} />}
              </div>
            )) : (
              <div className={styles.noResults}>Topilmadi</div>
            )
          ) : (
            selectedUser ? (
              <div className={`${styles.userItem} ${styles.active}`}>
                <div className={styles.avatarSm}>{selectedUser.username[0].toUpperCase()}</div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{selectedUser.username}</div>
                  <div className={styles.userPhone}>{selectedUser.phone}</div>
                </div>
                {isOnline(selectedUser._id) && <div className={styles.onlineDot} />}
              </div>
            ) : (
              <div className={styles.noResults}>Foydalanuvchi qidiring</div>
            )
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={styles.main}>
        {selectedUser ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                <div className={styles.avatarMd}>{selectedUser.username[0].toUpperCase()}</div>
                <div>
                  <div className={styles.chatName}>{selectedUser.username}</div>
                  <div className={styles.chatStatus}>
                    {isOnline(selectedUser._id) ? '🟢 Online' : '⚫ Offline'}
                  </div>
                </div>
              </div>
              <button
                className={`${styles.callBtn} ${inCall ? styles.callActive : ''}`}
                onClick={inCall ? endCall : startCall}
                disabled={!isOnline(selectedUser._id) && !inCall}
                title={inCall ? "Tugatish" : "Qo'ng'iroq"}
              >
                {inCall ? '📵' : '📞'}
              </button>
            </div>

            <div className={styles.messages}>
              {messages.map((msg) => {
                const isMine = msg.sender === user._id
                return (
                  <div key={msg._id} className={`${styles.msgRow} ${isMine ? styles.mine : styles.theirs}`}>
                    <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheirs}`}>
                      <span className={styles.msgText}>{msg.text}</span>
                      <span className={styles.msgTime}>{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <input
                className={styles.msgInput}
                placeholder="Xabar yozing..."
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className={styles.sendBtn}
                onClick={sendMessage}
                disabled={!text.trim()}
              >
                ➤
              </button>
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>💬</div>
            <h2>Suhbat boshlash uchun</h2>
            <p>Chap paneldan foydalanuvchi qidiring va tanlang</p>
          </div>
        )}
      </div>

      {/* Call modals */}
      {inCall && <CallModal onEnd={endCall} callee={selectedUser} />}
      {incomingCall && !inCall && (
        <IncomingCall
          callerId={incomingCall.callerId}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}
    </div>
  )
}
