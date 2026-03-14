import styles from './Hero.module.css'

const cards = [
  { type: 'hcard-back2', label: 'Workshop', title: 'Design Thinking Bootcamp' },
  { type: 'hcard-back', label: 'Concert', title: 'Afrobeat Night Out', badge: 'Almost full', badgeClass: 'amber' },
]

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bgShape} />
      <div className={styles.bgShape2} />

      <div className={styles.left}>
        <div className={styles.tag}>
          <span className={styles.dot} />
          Now live in Nigeria & across Africa
        </div>

        <h1 className={styles.h1}>
          Events that<br />
          <em>move people.</em><br />
          <span>Managed simply.</span>
        </h1>

        <p className={styles.sub}>
          Create, publish, and sell tickets to unforgettable events — all from one elegant platform built for modern organizers.
        </p>

        <div className={styles.actions}>
          <a href="#" className="btn-primary">Start for free</a>
          <a href="#events" className="btn-ghost">
            Browse events <span className="arrow">→</span>
          </a>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.cardStack}>
          <div className={`${styles.hcard} ${styles.hcardBack2}`}>
            <div className={styles.cardLabel}>Workshop</div>
            <div className={styles.cardTitle}>Design Thinking Bootcamp</div>
          </div>

          <div className={`${styles.hcard} ${styles.hcardBack}`}>
            <div className={styles.cardLabel}>Concert</div>
            <div className={styles.cardTitle}>Afrobeat Night Out</div>
            <span className={`${styles.badge} ${styles.badgeAmber}`}>Almost full</span>
          </div>

          <div className={`${styles.hcard} ${styles.hcardMain}`}>
            <div className={styles.cardLabel}>Conference · Lagos</div>
            <div className={styles.cardTitle}>Lagos Tech Summit 2026</div>
            <div className={styles.cardMeta}>📍 Landmark Centre &nbsp;·&nbsp; Mar 20, 2026</div>
            <div className={styles.barWrap}>
              <div className={styles.bar} style={{ width: '72%' }} />
            </div>
            <div className={styles.statRow}>
              <span>360 tickets sold</span><span>72% full</span>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.badge}>Published ✓</span>
              <div className={styles.avatars}>
                <div className={styles.avatar} style={{ background: '#E6F1FB', color: '#185FA5' }}>CO</div>
                <div className={styles.avatar} style={{ background: '#faeeda', color: '#854F0B' }}>TA</div>
                <div className={styles.avatar} style={{ background: '#eaf3de', color: '#3B6D11' }}>AN</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
