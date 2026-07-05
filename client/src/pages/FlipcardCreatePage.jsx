import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const emptyForm = { title: '', content: '', visibility: 'public' };

export default function FlipcardCreatePage() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/flashcard-sets', form);
      navigate(`/flipcard/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu thất bại, vui lòng kiểm tra định dạng');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm(emptyForm);
    setError('');
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Thiết kế nội dung game</h1>

      <form className="card" style={styles.card} onSubmit={handleSave}>
        <label style={styles.label}>Title</label>
        <input
          className="input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Tiêu đề bộ thẻ"
          required
        />

        <label style={styles.label}>Nội dung</label>
        <textarea
          className="input"
          style={styles.textarea}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Xin chào|Hello;Tạm biệt|Goodbye;Cảm ơn|Thank you"
          rows={8}
          required
        />
        <p style={styles.hint}>
          Mỗi nhóm câu cách nhau bằng dấu chấm phẩy (;), theo cấu trúc{' '}
          <code>câu tiếng việt|câu tiếng anh</code>
        </p>

        <label style={styles.label}>Chế độ hiển thị</label>
        <div style={styles.visibilityRow}>
          <button
            type="button"
            className={`btn ${form.visibility === 'public' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setForm({ ...form, visibility: 'public' })}
          >
            🌐 Public
          </button>
          <button
            type="button"
            className={`btn ${form.visibility === 'private' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setForm({ ...form, visibility: 'private' })}
          >
            🔒 Private
          </button>
        </div>
        <p style={styles.hint}>
          {form.visibility === 'public'
            ? 'Public: tất cả người dùng đều thấy và chơi được bộ thẻ này.'
            : 'Private: chỉ mình bạn thấy và chơi được bộ thẻ này.'}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.actions}>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: { padding: '32px 20px', maxWidth: 640, margin: '0 auto' },
  title: { fontSize: 22, marginBottom: 20 },
  card: { padding: 24, display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 6 },
  textarea: { resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 },
  hint: { fontSize: 12, color: 'var(--color-text-muted)', margin: '8px 0 0' },
  visibilityRow: { display: 'flex', gap: 10 },
  error: {
    color: 'var(--color-danger)',
    fontSize: 13,
    marginTop: 12,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
};
