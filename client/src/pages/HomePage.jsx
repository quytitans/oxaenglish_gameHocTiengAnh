import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Chọn một trò chơi</h1>
      <div style={styles.grid}>
        <div className="card" style={{ ...styles.gameCard, ...styles.disabled }}>
          <div style={styles.icon}>📝</div>
          <div style={styles.gameName}>Quiz - Trắc nghiệm</div>
          <span style={styles.badge}>Coming Soon</span>
        </div>

        <button
          className="card"
          style={styles.gameCard}
          onClick={() => navigate('/flipcard')}
        >
          <div style={styles.icon}>🃏</div>
          <div style={styles.gameName}>Lật thẻ bài</div>
          <span style={styles.badgePlay}>Chơi ngay</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 20px', maxWidth: 900, margin: '0 auto' },
  title: { fontSize: 22, marginBottom: 24 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 20,
  },
  gameCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '32px 16px',
    border: '1px solid var(--color-border)',
    background: '#fff',
    fontFamily: 'inherit',
  },
  disabled: { opacity: 0.6, cursor: 'not-allowed' },
  icon: { fontSize: 42 },
  gameName: { fontSize: 16, fontWeight: 700 },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    color: '#9a9a9a',
    background: '#f1f1f1',
    padding: '4px 10px',
    borderRadius: 999,
  },
  badgePlay: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-primary-dark)',
    background: 'var(--color-primary-light)',
    padding: '4px 10px',
    borderRadius: 999,
  },
};
