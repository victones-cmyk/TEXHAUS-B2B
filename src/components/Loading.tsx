interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'page';
  lines?: number;
}

export function Loading({ type = 'spinner', lines = 4 }: LoadingProps) {
  if (type === 'page') {
    return (
      <div style={{ padding: '6rem 0', maxWidth: '900px', margin: '0 auto' }}>
        <div className="skeleton-line" style={{ width: '60%', height: '2rem', marginBottom: '2rem' }} />
        <div className="skeleton-line" style={{ width: '100%', height: '300px', marginBottom: '2rem' }} />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton-line" style={{ width: `${85 + (i * 5) % 15}%`, marginBottom: '1rem' }} />
        ))}
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-line" style={{ width: '50%' }} />
            <div className="skeleton-line" style={{ width: '80%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
      <div className="spinner" />
    </div>
  );
}
