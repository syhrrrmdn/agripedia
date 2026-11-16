import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({ reason, initialView = 'login', allowRegister = true, onSuccess, onClose }) {
  const [view, setView] = useState(initialView);

  return (
    <div className="auth-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="auth-card" onClick={(event) => event.stopPropagation()}>
        <button className="auth-close" type="button" aria-label="Tutup" onClick={onClose}>
          ×
        </button>

        <div className="auth-brand">
          <div className="auth-logo">agri</div>
          <h1>{view === 'login' ? 'Masuk ke Agripedia' : view === 'register' ? 'Buat akun baru' : 'Lupa password'}</h1>
          <p>
            {view === 'login'
              ? reason ?? 'Masuk untuk mengelola katalog dan edukasi.'
              : view === 'register'
                ? 'Daftar untuk mulai berdagang atau berbelanja.'
                : 'Masukkan email, kami akan buatkan password baru.'}
          </p>
        </div>

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
  );
}

function Field({ id, label, type = 'text', value, onChange, placeholder, autoComplete, hint }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <span className="auth-hint">{hint}</span> : null}
    </div>
  );
}

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
      />
      <Field
        id="auth-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={setPassword}
      />

      <button type="button" className="auth-link" onClick={onForgot}>
        Lupa password?
      </button>

      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? 'Memproses...' : 'Masuk'}
      </button>

      {onRegister ? (
        <p className="auth-switch">
          Belum punya akun?{' '}
          <button type="button" className="auth-link inline" onClick={onRegister}>
            Daftar di sini
          </button>
        </p>
      ) : null}
    </form>
  );
}

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
      />
      <Field
        id="reg-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="nama@email.com"
        value={email}
        onChange={setEmail}
      />

      <div className="auth-field">
        <label>Saya ingin mendaftar sebagai</label>
        <div className="auth-role">
          <button
            type="button"
            className={role === 'buyer' ? 'active' : ''}
            onClick={() => setRole('buyer')}
          >
            Pembeli
          </button>
          <button
            type="button"
            className={role === 'penjual' ? 'active' : ''}
            onClick={() => setRole('penjual')}
          >
            Penjual
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
      />
      <Field
        id="reg-confirm"
        label="Konfirmasi password"
        type="password"
        autoComplete="new-password"
        placeholder="Ulangi password"
        value={confirm}
        onChange={setConfirm}
      />

      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? 'Memproses...' : 'Daftar'}
      </button>

      <p className="auth-switch">
        Sudah punya akun?{' '}
        <button type="button" className="auth-link inline" onClick={onLogin}>
          Masuk di sini
        </button>
      </p>
    </form>
  );
}

function ForgotForm({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

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

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {error ? <div className="auth-alert error" role="alert">{error}</div> : null}
      {result ? (
        <div className="auth-alert success" role="status">
          {result.message}
          {result.newPassword ? (
            <div className="auth-newpass">
              Password baru: <strong>{result.newPassword}</strong>
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
      />

      <button className="auth-submit" type="submit" disabled={busy}>
        {busy ? 'Memproses...' : 'Kirim'}
      </button>

      <p className="auth-switch">
        <button type="button" className="auth-link inline" onClick={onBack}>
          Kembali ke masuk
        </button>
      </p>
    </form>
  );
}
