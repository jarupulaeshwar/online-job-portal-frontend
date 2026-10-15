export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  for (let i = start; i < Math.min(totalPages, start + 5); i += 1) pages.push(i);
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="btn btn-ghost" disabled={page === 0} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </button>
      ))}
      <button type="button" className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
