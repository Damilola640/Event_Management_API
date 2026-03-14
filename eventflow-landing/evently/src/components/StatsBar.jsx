import { useEffect, useRef, useState } from 'react'
import styles from './StatsBar.module.css'

const stats = [
  { value: 48, suffix: 'K+', label: 'Events organized' },
  { value: 3.2, suffix: 'M', label: 'Tickets sold', decimal: 1 },
  { value: 99, suffix: '%', label: 'Uptime guaranteed' },
  { value: 120, suffix: '+', label: 'Cities reached' },
]

function useCounter(target, decimal = 0, active) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = null
    const duration = 1800
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(parseFloat((eased * target).toFixed(decimal)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, decimal])
  return count
}

function StatItem({ value, suffix, label, decimal = 0, active }) {
  const count = useCounter(value, decimal, active)
  return (
    <div className={styles.item}>
      <div className={styles.num}>
        {decimal ? count.toFixed(decimal) : Math.round(count)}<span>{suffix}</span>
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  )
}

export default function StatsBar() {
  const ref = useRef(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); observer.disconnect() } }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.bar} ref={ref}>
      {stats.map((s, i) => <StatItem key={i} {...s} active={active} />)}
    </div>
  )
}
