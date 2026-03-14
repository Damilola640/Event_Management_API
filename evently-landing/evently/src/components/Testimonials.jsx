import styles from './Testimonials.module.css'

const testimonials = [
  {
    quote: 'Evently completely changed how we manage our annual tech conference. The dashboard is clean and intuitive — our team adopted it instantly.',
    name: 'Chioma Obi', role: 'CEO, TechPulse Lagos', initials: 'CO',
    avatarBg: '#E6F1FB', avatarColor: '#185FA5',
  },
  {
    quote: 'We sold out our concert in 48 hours. The ticket management and RSVP approval flow is exactly what we needed — no technical headaches.',
    name: 'Tunde Adeyemi', role: 'Event Director, Afrovibes', initials: 'TA',
    avatarBg: '#faeeda', avatarColor: '#854F0B',
  },
  {
    quote: 'The analytics alone make it worth it. I can see ticket sales in real time, which helps me make smarter decisions during the campaign.',
    name: 'Amaka Nwosu', role: 'Founder, CreativeHub Abuja', initials: 'AN',
    avatarBg: '#eaf3de', avatarColor: '#3B6D11',
  },
]

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <span className="section-tag reveal">Real organizers</span>
      <h2 className="section-h2 reveal">Loved by event creators<br />across Africa</h2>

      <div className={styles.grid}>
        {testimonials.map((t, i) => (
          <div key={i} className={`${styles.card} testi-card reveal reveal-d${i}`}>
            <div className={styles.stars}>★★★★★</div>
            <p className={styles.quote}>"{t.quote}"</p>
            <div className={styles.author}>
              <div className={styles.avatar} style={{ background: t.avatarBg, color: t.avatarColor }}>
                {t.initials}
              </div>
              <div>
                <div className={styles.name}>{t.name}</div>
                <div className={styles.role}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
