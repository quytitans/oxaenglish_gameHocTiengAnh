import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { EditIcon, KeyIcon, TrashIcon } from '../components/icons';

const emptyForm = { username: '', password: '' };

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createForm, setCreateForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ username: '' });

  const [resetId, setResetId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  function loadUsers() {
    setLoading(true);
    api
      .get('/users')
      .then((res) => setUsers(res.data.users))
      .catch(() => setError('Không tải được danh sách tài khoản'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Instant, on-change filtering — no search button needed.
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [users, search]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!/^\d{4}$/.test(createForm.password)) {
      setError('Mật khẩu phải gồm đúng 4 chữ số');
      return;
    }
    setCreating(true);
    try {
      await api.post('/users', createForm);
      setCreateForm(emptyForm);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo tài khoản thất bại');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(u) {
    setEditingId(u.id);
    setEditForm({ username: u.username });
  }

  async function handleSaveEdit(id) {
    setError('');
    try {
      await api.put(`/users/${id}`, editForm);
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    }
  }

  async function handleResetPassword(id) {
    setError('');
    if (!/^\d{4}$/.test(resetPassword)) {
      setError('Mật khẩu mới phải gồm đúng 4 chữ số');
      return;
    }
    try {
      await api.post(`/users/${id}/reset-password`, { password: resetPassword });
      setResetId(null);
      setResetPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Xóa tài khoản "${u.username}"? Hành động này không thể hoàn tác.`)) return;
    setError('');
    try {
      await api.delete(`/users/${u.id}`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa tài khoản thất bại');
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Quản lý tài khoản</h1>

      <div className="card" style={styles.createCard}>
        <h2 style={styles.sectionTitle}>Tạo tài khoản mới</h2>
        <form onSubmit={handleCreate} style={styles.createForm}>
          <input
            className="input"
            style={{ flex: 2 }}
            placeholder="Username"
            value={createForm.username}
            onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
            required
          />
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Password (4 số)"
            inputMode="numeric"
            maxLength={4}
            value={createForm.password}
            onChange={(e) =>
              setCreateForm({ ...createForm, password: e.target.value.replace(/\D/g, '').slice(0, 4) })
            }
            required
          />
          <button className="btn btn-primary" disabled={creating}>
            {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </form>
        <p style={styles.createHint}>Tài khoản mới tạo sẽ luôn có quyền User.</p>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <input
        className="input"
        style={styles.search}
        placeholder="Tìm kiếm theo username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card" style={styles.tableCard}>
        {loading ? (
          <div style={styles.emptyState}>Đang tải...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={styles.emptyState}>Không tìm thấy tài khoản nào</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Vai trò</th>
                <th style={styles.th}>Ngày tạo</th>
                <th style={styles.th}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  {editingId === u.id ? (
                    <>
                      <td style={styles.td}>
                        <input
                          className="input"
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        />
                      </td>
                      <td style={styles.td}>
                        <span style={u.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                          {u.role}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(u.createdAt)}</td>
                      <td style={{ ...styles.td, ...styles.actions }}>
                        <button className="btn btn-primary" onClick={() => handleSaveEdit(u.id)}>
                          Lưu
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditingId(null)}>
                          Hủy
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={styles.td}>{u.username}</td>
                      <td style={styles.td}>
                        <span
                          style={u.role === 'admin' ? styles.roleAdmin : styles.roleUser}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(u.createdAt)}</td>
                      <td style={{ ...styles.td, ...styles.actions }}>
                        <button
                          className="icon-btn icon-btn-edit"
                          onClick={() => startEdit(u)}
                          title="Sửa thông tin"
                          aria-label="Sửa thông tin"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="icon-btn icon-btn-key"
                          onClick={() => {
                            setResetId(resetId === u.id ? null : u.id);
                            setResetPassword('');
                          }}
                          title="Đổi mật khẩu"
                          aria-label="Đổi mật khẩu"
                        >
                          <KeyIcon />
                        </button>
                        <button
                          className="icon-btn icon-btn-delete"
                          onClick={() => handleDelete(u)}
                          disabled={u.id === currentUser.id}
                          title="Xóa tài khoản"
                          aria-label="Xóa tài khoản"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {resetId && (
        <div style={styles.resetRow}>
          <input
            className="input"
            style={{ maxWidth: 160 }}
            placeholder="Mật khẩu mới (4 số)"
            inputMode="numeric"
            maxLength={4}
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
            autoFocus
          />
          <button className="btn btn-primary" onClick={() => handleResetPassword(resetId)}>
            Xác nhận
          </button>
          <button className="btn btn-secondary" onClick={() => setResetId(null)}>
            Hủy
          </button>
        </div>
      )}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  return iso.replace('T', ' ').slice(0, 16);
}

const styles = {
  page: { padding: '32px 20px', maxWidth: 1000, margin: '0 auto' },
  title: { fontSize: 22, marginBottom: 20 },
  sectionTitle: { fontSize: 15, margin: '0 0 12px' },
  createCard: { padding: 20, marginBottom: 20 },
  createForm: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  createHint: { fontSize: 12, color: 'var(--color-text-muted)', margin: '10px 0 0' },
  search: { marginBottom: 16, maxWidth: 320 },
  tableCard: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 13,
    color: 'var(--color-text-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    borderBottom: '1px solid var(--color-border)',
  },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  emptyState: { padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' },
  roleAdmin: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--color-primary-dark)',
    background: 'var(--color-primary-light)',
    padding: '3px 10px',
    borderRadius: 999,
  },
  roleUser: {
    fontSize: 12,
    fontWeight: 700,
    color: '#666',
    background: '#f1f1f1',
    padding: '3px 10px',
    borderRadius: 999,
  },
  errorBanner: {
    background: '#fdecec',
    color: 'var(--color-danger)',
    padding: '10px 14px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  resetRow: {
    display: 'flex',
    gap: 10,
    marginTop: 16,
    alignItems: 'center',
  },
};
