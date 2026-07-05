import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PinInput from '../components/PinInput';

export default function LoginPage() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length !== 4) {
      setError('Vui lòng nhập đủ 4 số');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(account, password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <form className="card" style={styles.card} onSubmit={handleSubmit} autoComplete="off">
        <div style={styles.logo}>OX</div>
        <h1 style={styles.title}>OXA English</h1>
        <p style={styles.subtitle}>Đăng nhập để bắt đầu học</p>

        <label style={styles.label}>Tài khoản</label>
        <input
          className="input"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="Username hoặc số điện thoại"
          autoComplete="off"
          autoFocus
          required
        />

        <label style={styles.label}>Mật khẩu (4 số)</label>
        <PinInput value={password} onChange={setPassword} />

        {error && <div style={styles.error}>{error}</div>}

        <button className="btn btn-primary" style={styles.submit} disabled={submitting}>
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #f0fbfa 0%, #ffffff 60%)',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  logo: {
    width: 56,
    height: 56,
    margin: '0 auto 12px',
    borderRadius: 16,
    background: 'var(--color-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: -0.5,
  },
  title: { textAlign: 'center', margin: 0, fontSize: 22, color: '#1a1a1a' },
  subtitle: {
    textAlign: 'center',
    margin: '0 0 18px',
    color: 'var(--color-text-muted)',
    fontSize: 14,
  },
  label: { fontSize: 13, fontWeight: 600, marginTop: 10, marginBottom: 6 },
  error: {
    color: 'var(--color-danger)',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  submit: { marginTop: 20, width: '100%', padding: '12px' },
};
