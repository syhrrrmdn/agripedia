import { useEffect, useRef, useState } from 'react';
import { roleLabel } from '@/lib/roles';

const MENU = [
  ['landing', 'Beranda'],
  ['catalog', 'Katalog'],
  ['education', 'Edukasi'],
];

function initialsOf(nama) {
  return String(nama ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Topbar({ view, user, onNavigate, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const goToDashboard = () => {
    setMenuOpen(false);
    onNavigate('dashboard');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="topbar">
      <div className="shell nav">
        <button
          type="button"
          className="brand brand-btn"
          onClick={() => onNavigate('landing')}
          aria-label="Kembali ke beranda"
        >
          agri<b>pedia</b>
        </button>
        <nav className="navlinks" aria-label="Navigasi utama">
          {MENU.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={view === key ? 'active' : ''}
              aria-current={view === key ? 'page' : undefined}
              onClick={() => onNavigate(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="user-area">
          {user ? (
            <div className="profile-wrap" ref={menuRef}>
              <button
                type="button"
                className={`user-chip profile-btn${menuOpen ? ' open' : ''}`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <div className="user-avatar">{initialsOf(user.nama)}</div>
                <div className="user-meta">
                  <strong>{user.nama}</strong>
                  <span>{roleLabel(user.role)}</span>
                </div>
                <svg
                  className={`chev${menuOpen ? ' up' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {menuOpen ? (
                <div className="profile-menu" role="menu" onClick={() => setMenuOpen(false)}>
                  <div className="profile-menu-head">
                    <strong>{user.nama}</strong>
                    <span>{roleLabel(user.role)}</span>
                  </div>
                  <button type="button" role="menuitem" className="profile-item" onClick={goToDashboard}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="7" height="9" rx="1.5" />
                      <rect x="14" y="3" width="7" height="5" rx="1.5" />
                      <rect x="14" y="12" width="7" height="9" rx="1.5" />
                      <rect x="3" y="16" width="7" height="5" rx="1.5" />
                    </svg>
                    Dashboard
                  </button>
                  <button type="button" role="menuitem" className="profile-item danger" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <path d="M16 17l5-5-5-5" />
                      <path d="M21 12H9" />
                    </svg>
                    Keluar
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button type="button" className="btn small" onClick={onLogin}>
              Masuk
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
