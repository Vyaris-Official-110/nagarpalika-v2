import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useCandidateAuth } from '../context/CandidateAuthContext'
import LoginModal from './LoginModal'
import SiteMarquee from './SiteMarquee'

const NAV = [
  { path: '/',        key: 'nav.home',       fallback: 'HOME' },
  { path: '/about',   key: 'nav.about',      fallback: 'ABOUT' },
  { path: '/notices', key: 'nav.notices',    fallback: 'NOTICES' },
  { path: '/results', key: 'nav.results',    fallback: 'RESULT' },
  {
    key: 'nav.registration', fallback: 'REGISTRATION',
    children: [
      { path: '/otr',      key: 'nav.otr',      fallback: 'One-Time Registration (OTR)' },
      { path: '/careers',  key: 'nav.careers',  fallback: 'Advertisements / ભરતી' },
    ],
  },
  {
    key: 'nav.apply', fallback: 'ONLINE APPLICATION',
    children: [
      { path: '/apply',       key: 'nav.apply.form',  fallback: 'Apply Online' },
      { path: '/callletter',  key: 'nav.callletter',  fallback: 'Call Letter' },
      { path: '/application', key: 'nav.appstatus',   fallback: 'Application Status' },
    ],
  },
  { path: '/help',    key: 'nav.help',       fallback: 'HELP' },
  { path: '/contact', key: 'nav.contact',    fallback: 'CONTACT' },
]

function Dropdown({ item, pathname, t }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isActive = item.children.some(c => pathname === c.path)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={`nav-dropdown${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className={`nav-dropdown-btn${isActive ? ' active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {t(item.key) || item.fallback}
        <span className="nav-chevron" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="nav-dropdown-menu" role="menu">
          {item.children.map(child => (
            <Link
              key={child.path}
              to={child.path}
              role="menuitem"
              className={pathname === child.path ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {t(child.key) || child.fallback}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { lang, setLang, t } = useLang()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { candidate, logout } = useCandidateAuth()
  const [showLogin, setShowLogin] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <>
      <div className="tricolor">
        <span className="saffron" />
        <span className="white" />
        <span className="green" />
      </div>

      <div className="brand-bar">
        <img src="/assets/gov-gujarat-emblem.svg" alt="Government of Gujarat emblem" />
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <div className="brand-title">{t('brand.title')}</div>
          <div className="brand-sub">
            <span>{t('brand.sub')}</span>
            {' · '}
            <span className="guj">ગુજરાત સરકાર · શહેરી વિકાસ વિભાગ</span>
          </div>
        </div>
        <div className="brand-utility">
          <a href="#main">{t('util.skip')}</a>
          <span className="sep">|</span>
          <a href="#">{t('util.screen')}</a>
          <span className="sep">|</span>
          <a href="#">{t('util.az')}</a>
          <span className="sep">|</span>
          <div className="lang-toggle" role="group" aria-label="Language">
            {[['en', 'EN'], ['hi', 'हिं'], ['gu', 'ગુ']].map(([code, label]) => (
              <button
                key={code}
                type="button"
                className={lang === code ? 'active' : ''}
                onClick={() => setLang(code)}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="sep">|</span>
          {candidate ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--ojas-saffron-soft)', fontSize: 12, fontWeight: 700 }}>
                {candidate.registrationId || candidate.name || 'Candidate'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'var(--ojas-red)', border: 'none', color: '#fff',
                  padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              style={{
                background: 'var(--ojas-saffron)', border: 'none', color: '#fff',
                padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Login / Register
            </button>
          )}
        </div>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>

      <nav className="nav-row" aria-label="Main navigation">
        {NAV.map(item =>
          item.children ? (
            <Dropdown key={item.key} item={item} pathname={pathname} t={t} />
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={pathname === item.path ? 'active' : ''}
            >
              {t(item.key) || item.fallback}
            </Link>
          )
        )}
      </nav>

      <SiteMarquee />
    </>
  )
}
