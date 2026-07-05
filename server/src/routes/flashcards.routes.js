const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// "Xin chào|Hello;Tạm biệt|Goodbye" -> [{ vi: 'Xin chào', en: 'Hello' }, ...]
function parseContent(content) {
  const groups = String(content || '')
    .split(';')
    .map((g) => g.trim())
    .filter((g) => g.length > 0);

  if (groups.length === 0) {
    throw new Error('Nội dung không được để trống');
  }

  return groups.map((group, index) => {
    const parts = group.split('|');
    if (parts.length !== 2) {
      throw new Error(
        `Nhóm câu số ${index + 1} sai định dạng, cần đúng "câu tiếng việt|câu tiếng anh"`
      );
    }
    const [vi, en] = parts.map((p) => p.trim());
    if (!vi || !en) {
      throw new Error(`Nhóm câu số ${index + 1} thiếu nội dung tiếng Việt hoặc tiếng Anh`);
    }
    return { vi, en };
  });
}

router.get('/', (req, res) => {
  const sets = db
    .prepare(
      `SELECT s.id, s.title, s.created_at,
              (SELECT COUNT(*) FROM flashcards f WHERE f.set_id = s.id) AS card_count
       FROM flashcard_sets s
       ORDER BY s.created_at DESC`
    )
    .all();

  res.json({
    sets: sets.map((s) => ({
      id: s.id,
      title: s.title,
      createdAt: s.created_at,
      cardCount: s.card_count,
    })),
  });
});

router.get('/:id', (req, res) => {
  const set = db.prepare('SELECT * FROM flashcard_sets WHERE id = ?').get(req.params.id);
  if (!set) return res.status(404).json({ message: 'Game not found' });

  const cards = db
    .prepare('SELECT id, vi, en FROM flashcards WHERE set_id = ? ORDER BY order_index ASC')
    .all(set.id);

  res.json({ set: { id: set.id, title: set.title, createdAt: set.created_at, cards } });
});

router.post('/', (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title là bắt buộc' });
  }

  let cards;
  try {
    cards = parseContent(content);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  const insertSet = db.prepare('INSERT INTO flashcard_sets (title, created_by) VALUES (?, ?)');
  const insertCard = db.prepare(
    'INSERT INTO flashcards (set_id, vi, en, order_index) VALUES (?, ?, ?, ?)'
  );

  db.exec('BEGIN');
  let setId;
  try {
    const info = insertSet.run(title.trim(), req.user.id);
    setId = info.lastInsertRowid;
    cards.forEach((card, index) => insertCard.run(setId, card.vi, card.en, index));
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  res.status(201).json({ id: setId });
});

module.exports = router;
