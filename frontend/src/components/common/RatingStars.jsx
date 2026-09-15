import { useState } from 'react';

/** Read-only or interactive 5-star rating. */
export default function RatingStars({ value = 0, onChange, size = '1.05rem', readOnly = true }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <span className="rating-stars" style={{ fontSize: size }} role={readOnly ? 'img' : 'radiogroup'} aria-label={`Rating: ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`bi ${n <= active ? 'bi-star-fill' : 'bi-star'} ${readOnly ? '' : 'cursor-pointer'}`}
          onMouseEnter={readOnly ? undefined : () => setHover(n)}
          onMouseLeave={readOnly ? undefined : () => setHover(0)}
          onClick={readOnly ? undefined : () => onChange?.(n)}
          role={readOnly ? undefined : 'radio'}
          aria-checked={readOnly ? undefined : n === value}
          tabIndex={readOnly ? undefined : 0}
          onKeyDown={readOnly ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') onChange?.(n); }}
        />
      ))}
    </span>
  );
}
