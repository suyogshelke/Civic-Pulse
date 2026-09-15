/** The Civic-Pulse logo mark: a pulse/heartbeat glyph in a rounded tile. */
export default function BrandMark({ size = 34 }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 13h4l2-6 4 12 3-9 2 3h5" fill="none" stroke="#4dd0e1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
