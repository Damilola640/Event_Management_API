import styles from './Footer.module.css'

const footerLinks = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Cookies', 'Refunds'],
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <a href="#" className={styles.logo}>event<span>ly</span></a>
          <p>The modern platform for creating, managing, and selling tickets to events across Africa and beyond.</p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title} className={styles.col}>
            <h4>{title}</h4>
            <ul>
              {links.map(link => (
                <li key={link}><a href="#">{link}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <span className={styles.copy}>© 2026 Evently. All rights reserved.</span>
        <div className={styles.socials}>
          {['Twitter', 'Instagram', 'LinkedIn', 'WhatsApp'].map(s => (
            <a key={s} href="#">{s}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}
