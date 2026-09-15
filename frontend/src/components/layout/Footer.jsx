import { APP_NAME, APP_TAGLINE } from '../../utils/constants';

export default function Footer({ minimal = false }) {
  const year = new Date().getFullYear();
  if (minimal) {
    return (
      <footer className="text-center text-muted small py-3">
        © {year} {APP_NAME} · {APP_TAGLINE}
      </footer>
    );
  }
  return (
    <footer className="border-top mt-auto" style={{ background: '#fff' }}>
      <div className="container py-4">
        <div className="row gy-3 align-items-center">
          <div className="col-md-6">
            <div className="fw-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{APP_NAME}</div>
            <div className="text-muted small">{APP_TAGLINE}</div>
          </div>
          <div className="col-md-6 text-md-end small text-muted">
            A mini-project · Department of Computer Science &amp; Applications,<br className="d-none d-md-block" />
            MIT World Peace University, Pune · © {year}
          </div>
        </div>
      </div>
    </footer>
  );
}
