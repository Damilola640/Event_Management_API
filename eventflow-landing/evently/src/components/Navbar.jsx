import { useEffect, useState } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#" className={styles.logo}>event<span>ly</span></a>
      <ul className={styles.links}>
        <li><a href="#features">Features</a></li>
        <li><a href="#how">How it works</a></li>
        <li><a href="#events">Events</a></li>
        <li><a href="#pricing">Pricing</a></li>
      </ul>
      <div className={styles.actions}>
        <a href="#" className={styles.signIn}>Sign in</a>
        <a href="#" className={styles.cta}>Get started free</a>
      </div>
    </nav>
  )
}
