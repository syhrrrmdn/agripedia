import { useState, useMemo } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── SVG Icon Components ── */
const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconUserPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
);
const IconKey = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
);
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconEyeOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconCopy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
);

/* ── Password Strength Helpers ── */
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Lemah', color: '#e04545' };
  if (score <= 3) return { level: 2, label: 'Sedang', color: '#f08a24' };
  return { level: 3, label: 'Kuat', color: '#177a3c' };
}

/* ── Main Modal ── */
export default function AuthModal({ reason, initialView = 'login', allowRegister = true, onSuccess, onClose }) {
  const [view, setView] = useState(initialView);

  const viewIcon = view === 'login' ? <IconLock /> : view === 'register' ? <IconUserPlus /> : <IconKey />;
  const viewTitle = view === 'login' ? 'Masuk ke Agripedia' : view === 'register' ? 'Buat akun baru' : 'Lupa password';
  const viewSubtitle = view === 'login'
    ? reason ?? 'Selamat datang kembali! Masuk untuk melanjutkan.'
    : view === 'register'
      ? 'Bergabung dengan komunitas pertanian terbaik Indonesia 🌱'
      : 'Tenang, kami bantu pulihkan akses akunmu.';

  return (
    <div className="auth-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className={`auth-card auth-card-animated`} onClick={(event) => event.stopPropagation()}>
        <button className="auth-close auth-close-enhanced" type="button" aria-label="Tutup" onClick={onClose}>
          <IconX />
        </button>

        <div className="auth-brand">
          <div className="auth-brand-deco" aria-hidden="true" />
          <div className="auth-logo">
            <span className="auth-logo-icon" aria-hidden="true">🌾</span>
            agri<b style={{ color: 'var(--orange)' }}>pedia</b>
          </div>
          <div className="auth-view-icon" aria-hidden="true">{viewIcon}</div>
          <h1>{viewTitle}</h1>
          <p>{viewSubtitle}</p>
        </div>

        <div className="auth-view-container" key={view}>
          {view === 'login' ? (
            <LoginForm
              onSuccess={onSuccess}
              onForgot={() => setView('forgot')}
              onRegister={allowRegister ? () => setView('register') : null}
            />
          ) : view === 'register' ? (
            <RegisterForm
              onSuccess={onSuccess}
              onLogin={() => setView('login')}
            />
          ) : (
            <ForgotForm onBack={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Field with icon ── */
function Field({ id, label, type = 'text', value, onChange, placeholder, autoComplete, hint, icon, showToggle }) {
  const [visible, setVisible] = useState(false);
  const resolvedType = showToggle ? (visible ? 'text' : 'password') : type;

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        {icon && <span className="auth-input-icon" aria-hidden="true">{icon}</span>}
        <input
          id={id}
          type={resolvedType}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={icon ? 'has-icon' : ''}
          style={showToggle ? { paddingRight: 42 } : undefined}
        />
        {showToggle && (
          <button
            type="button"
            className="auth-pw-toggle"
            tabIndex={-1}
            aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
      {hint ? <span className="auth-hint">{hint}</span> : null}
    </div>
  );
}

/* ── Password Strength Bar ── */
function PasswordStrength({ password }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;
  return (
    <div className="auth-pw-strength">
      <div className="auth-pw-strength-bar">
        <div
          className="auth-pw-strength-fill"
          style={{ width: `${(strength.level / 3) * 100}%`, background: strength.color }}
        />
      </div>
      <span className="auth-pw-strength-label" style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  );
}

/* ── Password Match Indicator ── */
function PasswordMatch({ password, confirm }) {
  if (!confirm) return null;
  const match = password === confirm;
  return (
    <div className={`auth-pw-match ${match ? 'match' : 'no-match'}`}>
      {match ? (
        <><span className="auth-pw-match-icon"><IconCheck /></span> Password cocok</>
      ) : (
        'Password belum cocok'
      )}
    </div>
  );
}

/* ── Login Form ── */
function LoginForm({ onSuccess, onForgot, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? 'Gagal masuk. Coba lagi.');
        return;
      }
      onSuccess(data.user);
    } catch {
      setError('Tidak dapat menghubungi server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {error ? <div className="auth-alert error" role="alert">{error}</div> : null}

      <Field
        id="auth-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="nama@email.com"
        value={email}
        onChange={setEmail}
        icon={<IconMail />}
      />
      <Field
        id="auth-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
        icon={<IconLock />}
        showToggle
      />

      <button type="button" className="auth-link auth-forgot-link" onClick={onForgot}>
        <IconKey /> Lupa password?
      </button>

      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? (
          <><span className="auth-spinner" aria-hidden="true" /> Memproses...</>
        ) : (
          'Masuk'
        )}
      </button>

      {onRegister ? (
        <>
          <div className="auth-divider">
            <span>atau</span>
          </div>
          <p className="auth-switch">
            Belum punya akun?{' '}
            <button type="button" className="auth-link inline" onClick={onRegister}>
              Daftar di sini
            </button>
          </p>
        </>
      ) : null}
    </form>
  );
}

/* ── Register Form ── */
function RegisterForm({ onSuccess, onLogin }) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('buyer');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!nama || !email || !password || !confirm) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('Format email tidak valid.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, role, password, confirm }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? 'Gagal mendaftar. Coba lagi.');
        return;
      }
      onSuccess(data.user);
    } catch {
      setError('Tidak dapat menghubungi server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {error ? <div className="auth-alert error" role="alert">{error}</div> : null}

      <Field
        id="reg-nama"
        label="Nama lengkap"
        autoComplete="name"
        placeholder="Contoh: Budi Santoso"
        value={nama}
        onChange={setNama}
        icon={<IconUser />}
      />
      <Field
        id="reg-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="nama@email.com"
        value={email}
        onChange={setEmail}
        icon={<IconMail />}
      />

      <div className="auth-field">
        <label>Saya ingin mendaftar sebagai</label>
        <div className="auth-role">
          <button
            type="button"
            className={role === 'buyer' ? 'active' : ''}
            onClick={() => setRole('buyer')}
          >
            <span className="auth-role-emoji" aria-hidden="true">🛒</span>
            <span className="auth-role-content">
              <strong>Pembeli</strong>
              <small>Cari & beli produk segar</small>
            </span>
          </button>
          <button
            type="button"
            className={role === 'penjual' ? 'active' : ''}
            onClick={() => setRole('penjual')}
          >
            <span className="auth-role-emoji" aria-hidden="true">🏪</span>
            <span className="auth-role-content">
              <strong>Penjual</strong>
              <small>Jual hasil panen kamu</small>
            </span>
          </button>
        </div>
      </div>

      <Field
        id="reg-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Minimal 6 karakter"
        value={password}
        onChange={setPassword}
        icon={<IconLock />}
        showToggle
      />
      <PasswordStrength password={password} />

      <Field
        id="reg-confirm"
        label="Konfirmasi password"
        type="password"
        autoComplete="new-password"
        placeholder="Ulangi password"
        value={confirm}
        onChange={setConfirm}
        icon={<IconLock />}
        showToggle
      />
      <PasswordMatch password={password} confirm={confirm} />

      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? (
          <><span className="auth-spinner" aria-hidden="true" /> Memproses...</>
        ) : (
          'Daftar'
        )}
      </button>

      <div className="auth-divider">
        <span>atau</span>
      </div>
      <p className="auth-switch">
        Sudah punya akun?{' '}
        <button type="button" className="auth-link inline" onClick={onLogin}>
          Masuk di sini
        </button>
      </p>
    </form>
  );
}

/* ── Forgot Password Form ── */
function ForgotForm({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!email) {
      setError('Email wajib diisi.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('Format email tidak valid.');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? 'Gagal memproses. Coba lagi.');
        return;
      }
      setResult(data);
    } catch {
      setError('Tidak dapat menghubungi server.');
    } finally {
      setBusy(false);
    }
  };

  const copyPassword = async () => {
    if (result?.newPassword) {
      try {
        await navigator.clipboard.writeText(result.newPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* fallback: selection-based copy is left to the user */
      }
    }
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {error ? <div className="auth-alert error" role="alert">{error}</div> : null}
      {result ? (
        <div className="auth-alert success auth-result-block" role="status">
          <div className="auth-result-icon" aria-hidden="true"><IconShield /></div>
          <p style={{ margin: '6px 0 0', fontWeight: 700 }}>{result.message}</p>
          {result.newPassword ? (
            <div className="auth-newpass">
              <span className="auth-newpass-label">Password baru:</span>
              <strong>{result.newPassword}</strong>
              <button type="button" className="auth-copy-btn" onClick={copyPassword}>
                {copied ? <><IconCheck /> Tersalin!</> : <><IconCopy /> Salin</>}
              </button>
              <span>Catat lalu masukkan saat login. Ganti setelah masuk.</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <Field
        id="forgot-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="nama@email.com"
        value={email}
        onChange={setEmail}
        icon={<IconMail />}
      />

      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? (
          <><span className="auth-spinner" aria-hidden="true" /> Memproses...</>
        ) : (
          'Kirim'
        )}
      </button>

      <div className="auth-divider">
        <span>kembali</span>
      </div>
      <p className="auth-switch">
        <button type="button" className="auth-link inline" onClick={onBack}>
          ← Kembali ke masuk
        </button>
      </p>
    </form>
  );
}
