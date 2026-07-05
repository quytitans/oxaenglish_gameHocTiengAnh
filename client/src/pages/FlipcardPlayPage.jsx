import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

const CARD_MIN_WIDTH = 130;
const CARD_MIN_HEIGHT = 90;
const GAP = 12;
const MOBILE_BREAKPOINT = 768;
const MOBILE_ITEMS_PER_PAGE = 8;
const MOBILE_COLS = 2;
const SWIPE_THRESHOLD = 50;

// A plain useRef wouldn't re-trigger the effect once the grid div actually
// mounts (it's absent while `loading` is true), so track the node in state
// via a callback ref instead.
function useGridCapacity() {
  const [node, setNode] = useState(null);
  const [capacity, setCapacity] = useState({ cols: 1, rows: 1 });
  const ref = useCallback((el) => setNode(el), []);

  useEffect(() => {
    if (!node) return;

    function measure() {
      const { clientWidth, clientHeight } = node;
      const cols = Math.max(1, Math.floor((clientWidth + GAP) / (CARD_MIN_WIDTH + GAP)));
      const rows = Math.max(1, Math.floor((clientHeight + GAP) / (CARD_MIN_HEIGHT + GAP)));
      setCapacity({ cols, rows });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [ref, capacity];
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}

export default function FlipcardPlayPage() {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flipState, setFlipState] = useState({});
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(null);

  const isMobile = useIsMobile();
  const [gridRef, { cols, rows }] = useGridCapacity();
  const itemsPerPage = isMobile ? MOBILE_ITEMS_PER_PAGE : cols * rows;

  useEffect(() => {
    api
      .get(`/flashcard-sets/${id}`)
      .then((res) => setSet(res.data.set))
      .finally(() => setLoading(false));
  }, [id]);

  const totalPages = useMemo(() => {
    if (!set) return 1;
    return Math.max(1, Math.ceil(set.cards.length / itemsPerPage));
  }, [set, itemsPerPage]);

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [totalPages, page]);

  const pageCards = useMemo(() => {
    if (!set) return [];
    const start = page * itemsPerPage;
    return set.cards.slice(start, start + itemsPerPage);
  }, [set, page, itemsPerPage]);

  // Desktop: size the grid to whatever the current page actually needs (capped
  // by what fits) so a half-empty last page stretches its cards to fill the
  // available space instead of leaving dead space behind.
  // Mobile: keep a fixed 2xN grid always, so cards stay a consistent size and
  // a partial last page just leaves the remaining cells empty instead of
  // stretching the few remaining cards to fill the page.
  const activeCols = isMobile ? MOBILE_COLS : Math.min(cols, Math.max(1, pageCards.length));
  const activeRows = isMobile
    ? Math.ceil(MOBILE_ITEMS_PER_PAGE / MOBILE_COLS)
    : Math.max(1, Math.ceil(pageCards.length / activeCols));

  function goToPage(next) {
    setPage((p) => {
      const target = Math.min(totalPages - 1, Math.max(0, next(p)));
      if (target !== p) setDirection(target > p ? 1 : -1);
      return target;
    });
  }

  function handleCardClick(cardId) {
    setFlipState((prev) => ({ ...prev, [cardId]: ((prev[cardId] || 0) + 1) % 3 }));
  }

  function handleFlipAllBack() {
    setFlipState((prev) => {
      const next = { ...prev };
      pageCards.forEach((c) => {
        next[c.id] = 0;
      });
      return next;
    });
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (deltaX <= -SWIPE_THRESHOLD) {
      goToPage((p) => p + 1); // swipe left -> next page
    } else if (deltaX >= SWIPE_THRESHOLD) {
      goToPage((p) => p - 1); // swipe right -> previous page
    }
  }

  if (loading) return <div style={styles.centered}>Đang tải...</div>;
  if (!set) return <div style={styles.centered}>Không tìm thấy bộ thẻ</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerControls}>
          <Link to="/flipcard" className="btn btn-ghost-primary">
            Danh sách
          </Link>
          <button className="btn btn-accent" onClick={handleFlipAllBack}>
            Úp tất cả thẻ bài
          </button>
        </div>
        <h1 style={styles.title}>{set.title}</h1>
      </div>

      <div
        ref={gridRef}
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${activeCols}, 1fr)`,
          gridTemplateRows: `repeat(${activeRows}, 1fr)`,
          '--slide-dir': direction,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {pageCards.map((card) => {
          const state = flipState[card.id] || 0;
          return (
            <div
              key={card.id}
              className="flip-card-outer"
              onClick={() => handleCardClick(card.id)}
            >
              <div className={`flip-card-inner ${state !== 0 ? 'flipped' : ''}`}>
                <div className="flip-card-face flip-card-front">🍀</div>
                <div
                  className={`flip-card-face flip-card-back ${
                    state === 2 ? 'state-en' : 'state-vi'
                  }`}
                >
                  {state === 2 ? card.en : card.vi}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.pagination}>
        <button
          className="btn btn-secondary"
          onClick={() => goToPage((p) => p - 1)}
          disabled={page === 0}
        >
          ‹ Trước
        </button>
        <span style={styles.pageIndicator}>
          Trang {page + 1} / {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          onClick={() => goToPage((p) => p + 1)}
          disabled={page >= totalPages - 1}
        >
          Sau ›
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 20px',
    gap: 10,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    margin: 0,
    textAlign: 'center',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  grid: {
    flex: 1,
    minHeight: 0,
    display: 'grid',
    gap: GAP,
    touchAction: 'pan-y',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  pageIndicator: { fontSize: 14, color: 'var(--color-text-muted)', minWidth: 100, textAlign: 'center' },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--color-text-muted)',
  },
};
