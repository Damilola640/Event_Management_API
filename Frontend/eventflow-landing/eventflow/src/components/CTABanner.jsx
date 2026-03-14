import styles from './CTABanner.module.css'

export default function CTABanner() {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.banner} reveal`}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <div className={styles.text}>
          <h2 className={styles.h2}>Ready to host your<br />next great event?</h2>
          <p className={styles.sub}>Join thousands of organizers already using Evently.</p>
        </div>
        <a href="#" className={styles.btn}>Create your first event →</a>
      </div>
    </div>
  )
}
