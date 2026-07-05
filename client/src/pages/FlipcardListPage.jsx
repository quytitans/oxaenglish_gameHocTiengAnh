import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { EditIcon, TrashIcon } from '../components/icons';

export default function FlipcardListPage() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function loadSets() {
    setLoading(true);
    api
      .get('/flashcard-sets')
      .then((res) => setSets(res.data.sets))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSets();
  }, []);

  function handleEdit(e, set) {
    e.stopPropagation();
    navigate(`/flipcard/${set.id}/edit`);
  }

  function handleDelete(e, set) {
    e.stopPropagation();
    if (!confirm(`Xóa bộ thẻ "${set.title}"? Hành động này không thể hoàn tác.`)) return;
    api.delete(`/flashcard-sets/${set.id}`).then(loadSets);
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Lật thẻ bài</h1>
        <Link to="/flipcard/new" className="btn btn-primary">
          + Tạo bộ thẻ mới
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Đang tải...</p>
      ) : sets.length === 0 ? (
        <div className="card" style={styles.emptyState}>
          <p>Chưa có bộ thẻ nào. Hãy tạo bộ thẻ đầu tiên!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {sets.map((s) => (
            <div
              key={s.id}
              className="card"
              style={styles.setCard}
              onClick={() => navigate(`/flipcard/${s.id}`)}
            >
              {s.canManage && (
                <div style={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                  <button
                    className="icon-btn icon-btn-edit"
                    onClick={(e) => handleEdit(e, s)}
                    title="Sửa bộ thẻ"
                    aria-label="Sửa bộ thẻ"
                  >
                    <EditIcon width={14} height={14} />
                  </button>
                  <button
                    className="icon-btn icon-btn-delete"
                    onClick={(e) => handleDelete(e, s)}
                    title="Xóa bộ thẻ"
                    aria-label="Xóa bộ thẻ"
                  >
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
              )}
              <div style={styles.setIcon}>🃏</div>
              <div style={styles.setTitle}>{s.title}</div>
              <div style={styles.setMeta}>{s.cardCount} thẻ</div>
              {s.visibility === 'private' && (
                <span style={styles.privateBadge}>🔒 Private</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px 20px', maxWidth: 1000, margin: '0 auto' },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: { fontSize: 22, margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 18,
  },
  setCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '26px 14px',
    border: '1px solid var(--color-border)',
    background: '#fff',
    fontFamily: 'inherit',
    textAlign: 'center',
    cursor: 'pointer',
  },
  cardActions: {
    position: 'absolute',
    top: 10,
    right: 10,
    display: 'flex',
    gap: 6,
  },
  setIcon: { fontSize: 32 },
  setTitle: { fontWeight: 700, fontSize: 15 },
  setMeta: { fontSize: 12, color: 'var(--color-text-muted)' },
  privateBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-accent-dark)',
    background: 'var(--color-accent-light)',
    padding: '2px 8px',
    borderRadius: 999,
  },
  emptyState: { padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' },
};
