import styles from './Pricing.module.css'

const plans = [
  {
    name: 'Starter', price: 'Free', period: 'Forever, no card required', featured: false,
    features: ['Up to 3 events/month', '100 tickets per event', 'Basic analytics', 'Email confirmations', 'Public event page'],
    cta: 'Get started free',
  },
  {
    name: 'Professional', price: '₦12,500', period: 'per month, billed annually', featured: true, badge: 'Most popular',
    features: ['Unlimited events', 'Unlimited tickets', 'Full analytics dashboard', 'RSVP approval workflow', 'Team access (5 seats)', 'Custom event branding'],
    cta: 'Start free trial',
  },
  {
    name: 'Enterprise', price: 'Custom', period: 'Contact us for a quote', featured: false,
    features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'Unlimited team seats', 'On-premise option'],
    cta: 'Talk to sales',
  },
]

export default function Pricing() {
  return (
    <section className={styles.section} id="pricing">
      <div className={styles.header}>
        <span className="section-tag reveal" style={{ textAlign: 'center' }}>Simple pricing</span>
        <h2 className="section-h2 reveal" style={{ textAlign: 'center' }}>No surprises. Ever.</h2>
        <p className="section-sub reveal" style={{ margin: '0 auto', textAlign: 'center' }}>
          Start free, scale as you grow. All plans include core event creation and ticket management.
        </p>
      </div>

      <div className={styles.grid}>
        {plans.map((plan, i) => (
          <div key={i} className={`${styles.card} price-card reveal reveal-d${i} ${plan.featured ? styles.featured : ''}`}>
            {plan.badge && <span className={styles.badge}>{plan.badge}</span>}
            <div className={styles.planName}>{plan.name}</div>
            <div className={styles.price}>{plan.price}</div>
            <div className={styles.period}>{plan.period}</div>
            <ul className={styles.features}>
              {plan.features.map((f, j) => <li key={j}>{f}</li>)}
            </ul>
            <a href="#" className={`${styles.cta} ${plan.featured ? styles.ctaFeatured : ''}`}>{plan.cta}</a>
          </div>
        ))}
      </div>
    </section>
  )
}
