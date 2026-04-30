import styles from './IncomingCall.module.css'

export default function IncomingCall({ callerId, onAccept, onReject }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.ring}>📞</div>
        <div className={styles.text}>Kiruvchi qo'ng'iroq</div>
        <div className={styles.callerId}>{callerId}</div>
        <div className={styles.actions}>
          <button className={styles.rejectBtn} onClick={onReject}>📵 Rad</button>
          <button className={styles.acceptBtn} onClick={onAccept}>📞 Qabul</button>
        </div>
      </div>
    </div>
  )
}
