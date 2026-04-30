import styles from './CallModal.module.css'

export default function CallModal({ onEnd, callee }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.waves}>
          <div className={styles.wave} />
          <div className={styles.wave} />
          <div className={styles.wave} />
        </div>
        <div className={styles.avatar}>
          {callee?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div className={styles.name}>{callee?.username || 'Qo\'ng\'iroq'}</div>
        <div className={styles.status}>Qo'ng'iroq davom etmoqda...</div>
        <button className={styles.endBtn} onClick={onEnd}>
          📵 Tugatish
        </button>
      </div>
    </div>
  )
}
