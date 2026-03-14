import { useEffect, useRef } from 'react'

/**
 * Attaches an IntersectionObserver to add `.visible` to elements
 * that have the `.reveal` class once they scroll into view.
 */
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.12 }
    )

    const els = document.querySelectorAll('.reveal')
    els.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])
}

/**
 * Animates a numeric counter when its container enters the viewport.
 */
export function useCounterAnimation(stats) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        stats.forEach(({ selector, target, decimals = 0 }) => {
          const el = ref.current?.querySelector(selector)
          if (!el) return
          const suffix = el.dataset.suffix || ''
          let start = null
          const duration = 1800

          const step = (timestamp) => {
            if (!start) start = timestamp
            const progress = Math.min((timestamp - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            el.textContent = (eased * target).toFixed(decimals) + suffix
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return ref
}
