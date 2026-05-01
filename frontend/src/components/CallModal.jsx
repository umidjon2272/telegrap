import { useEffect, useRef } from 'react'
import styles from './CallModal.module.css'

export default function CallModal({ onEnd, callee, localStream, remoteStream }) {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.videos}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={styles.remoteVideo}
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={styles.localVideo}
          />
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{callee?.username || "Qo'ng'iroq"}</div>
          <div className={styles.status}>Video qo'ng'iroq davom etmoqda...</div>
        </div>
        <button className={styles.endBtn} onClick={onEnd}>
          📵 Tugatish
        </button>
      </div>
    </div>
  )
}