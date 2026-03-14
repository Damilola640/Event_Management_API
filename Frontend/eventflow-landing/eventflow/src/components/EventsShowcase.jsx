import styles from './EventsShowcase.module.css'

const events = [
  {
    tag: 'Conference', tagClass: 'orange', title: 'Lagos Tech Summit 2026',
    meta: 'Mar 20 · Landmark Centre, Lagos', progress: 72,
    sold: '360 sold', fill: 'fillOrange', price: '₦15,000', btnClass: 'btnOrange',
  },
  {
    tag: 'Concert', tagClass: 'gold', title: 'Afrobeat Night Out — Season 3',
    meta: 'Apr 19 · Eko Hotel & Suites, Lagos', progress: 95,
    sold: '950 sold · Almost full', fill: 'fillGold', price: '₦25,000', btnClass: 'btnGold',
  },
  {
    tag: 'Workshop', tagClass: 'green', title: 'Product Design Bootcamp',
    meta: 'Apr 5 · Victoria Island, Lagos', progress: 40,
    sold: '80 sold', fill: 'fillGreen', price: '₦10,000', btnClass: 'btnGreen',
  },
]

export default function EventsShowcase() {
  return (
    <section className={styles.section} id="events">
      <div className={styles.header}>
        <div>
          <span className={`${styles.tag} reveal`}>Live on Evently</span>
          <h2 className={`${styles.h2} reveal`}>Trending events</h2>
        </div>
        <a href="#" className={`${styles.allLink} reveal btn-ghost`} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
          See all events <span className="arrow">→</span>
        </a>
      </div>

      <div className={styles.cards}>
        {events.map((e, i) => (
          <div key={i} className={`${styles.card} ev-card reveal reveal-d${i}`}>
            <div className={styles.cardTop}>
              <span className={`${styles.evTag} ${styles[e.tagClass]}`}>{e.tag}</span>
              <div className={styles.liveDot} />
            </div>
            <div className={styles.title}>{e.title}</div>
            <div className={styles.meta}>{e.meta}</div>
            <div className={styles.progressBg}>
              <div className={`${styles.progressFill} ${styles[e.fill]}`} style={{ width: `${e.progress}%` }} />
            </div>
            <div className={styles.stats}>
              <span>{e.sold}</span><span>{e.progress}% full</span>
            </div>
            <div className={styles.footer}>
              <span className={styles.price}>{e.price}</span>
              <button className={`${styles.btn} ${styles[e.btnClass]}`}>Book now</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
