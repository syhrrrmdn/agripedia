import { roleLabel } from '@/lib/roles';

const MENU = [
  ['landing', 'Beranda'],
  ['catalog', 'Katalog'],
  ['education', 'Edukasi'],
  ['dashboard', 'Dashboard'],
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
  return (
    <header className="topbar">
      <div className="shell nav">
        <button type="button" className="brand brand-btn" onClick={() => onNavigate('landing')} aria-label="Kembali ke beranda">
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
            <>
              <div className="user-chip">
                <div className="user-avatar">{initialsOf(user.nama)}</div>
                <div className="user-meta">
                  <strong>{user.nama}</strong>
                  <span>{roleLabel(user.role)}</span>
                </div>
              </div>
              <button type="button" className="btn secondary small" onClick={onLogout}>
                Keluar
              </button>
            </>
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
