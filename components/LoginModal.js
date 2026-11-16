import { useState } from 'react';

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'Admin — akses penuh' },
  { username: 'penjual', password: 'penjual123', role: 'Penjual — kelola produk' },
  { username: 'buyer', password: 'buyer123', role: 'Pembeli — lihat & pesan' },
];

export default function LoginModal({ reason, onSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
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

  const useAccount = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="modal-backdrop show" role="dialog" aria-modal="true" onClick={onClose}>
      <form className="modal" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>Masuk ke Agripedia</h2>
          <button className="close" type="button" aria-label="Tutup" onClick={onClose}>
            ×
          </button>
        </div>

        {reason ? <p className="login-reason">{reason}</p> : null}
        {error ? (
          <div className="login-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="form-grid">
          <div className="field full">
            <label htmlFor="loginUsername">Nama pengguna</label>
            <input
              id="loginUsername"
              autoComplete="username"
              placeholder="admin"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="field full">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" type="button" onClick={onClose}>
            Batal
          </button>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Memeriksa...' : 'Masuk'}
          </button>
        </div>

        <div className="demo-accounts">
          <strong>Akun demo</strong> — klik untuk mengisi otomatis.
          {DEMO_ACCOUNTS.map((account) => (
            <button type="button" className="demo-account" key={account.username} onClick={() => useAccount(account)}>
              <code>
                {account.username} / {account.password}
              </code>
              <span>{account.role}</span>
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
