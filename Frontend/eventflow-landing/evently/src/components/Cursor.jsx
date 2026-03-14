import { useEffect, useRef } from 'react'
import styles from './Cursor.module.css'

export default function Cursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const move = (e) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }
    const expand = () => cursor.classList.add(styles.expand)
    const shrink = () => cursor.classList.remove(styles.expand)

    document.addEventListener('mousemove', move)
    document.querySelectorAll('a, button, .ev-card, .feat, .testi-card, .price-card').forEach(el => {
      el.addEventListener('mouseenter', expand)
      el.addEventListener('mouseleave', shrink)
    })
    return () => document.removeEventListener('mousemove', move)
  }, [])

  return <div ref={cursorRef} className={styles.cursor} />
}
