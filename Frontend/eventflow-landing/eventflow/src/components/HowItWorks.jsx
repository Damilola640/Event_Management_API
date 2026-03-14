import styles from './HowItWorks.module.css'

const steps = [
  { num: '1', alt: false, title: 'Create your event', desc: 'Fill out your event details — title, venue, date, ticket price, and capacity. Publish instantly or schedule for later.' },
  { num: '2', alt: true, title: 'Share & sell tickets', desc: 'Your event gets a shareable link and a live ticket page. Attendees RSVP or purchase — you get notified in real time.' },
  { num: '3', alt: false, title: 'Manage & analyze', desc: 'Approve RSVPs, track sales, communicate with attendees, and review performance analytics — all from one dashboard.' },
]

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how">
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className="section-tag reveal" style={{ textAlign: 'center' }}>Simple process</span>
          <h2 className="section-h2 reveal" style={{ textAlign: 'center' }}>Up and running<br />in three steps</h2>
        </div>
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={i} className={`${styles.step} reveal reveal-d${i}`}>
              <div className={`${styles.num} ${s.alt ? styles.numAlt : ''}`}>{s.num}</div>
              <h3 className={styles.h3}>{s.title}</h3>
              <p className={styles.p}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
