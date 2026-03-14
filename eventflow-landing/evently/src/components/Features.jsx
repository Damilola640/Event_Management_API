import styles from './Features.module.css'

const features = [
  { icon: '🗓', iconClass: 'orange', title: 'Smart event creation', desc: 'Create detailed event listings with rich descriptions, custom categories, capacity settings, and scheduled publishing in minutes.' },
  { icon: '🎟', iconClass: 'dark', title: 'Ticket & RSVP management', desc: 'Sell tickets, manage RSVPs, approve or cancel bookings — all with real-time capacity tracking and automated confirmations.' },
  { icon: '📊', iconClass: 'gold', title: 'Live analytics dashboard', desc: 'Track ticket sales, revenue, RSVP rates, and attendee demographics in real time from a clean, intuitive admin panel.' },
  { icon: '🔐', iconClass: 'green', title: 'Secure auth & roles', desc: 'Role-based access control for your whole team. Organizers, staff, and admins each get exactly the permissions they need.' },
]

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <span className="section-tag reveal">Everything you need</span>
      <h2 className="section-h2 reveal">Built for serious<br />event organizers</h2>
      <p className="section-sub reveal">From intimate workshops to stadium concerts — Evently gives you the tools to pull it off flawlessly.</p>

      <div className={styles.grid}>
        {features.map((f, i) => (
          <div key={i} className={`${styles.feat} reveal reveal-d${i % 4}`}>
            <div className={`${styles.icon} ${styles['icon_' + f.iconClass]}`}>{f.icon}</div>
            <h3 className={styles.h3}>{f.title}</h3>
            <p className={styles.p}>{f.desc}</p>
            <span className={styles.accent}>Explore →</span>
          </div>
        ))}
      </div>
    </section>
  )
}
