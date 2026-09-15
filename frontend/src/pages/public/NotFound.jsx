import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container text-center py-5 my-5">
      <div className="display-1 fw-bold" style={{ color: 'var(--cp-border)', fontFamily: 'Space Grotesk' }}>404</div>
      <h3 className="fw-bold">This page wandered off the map</h3>
      <p className="text-muted">The page you are looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-2"><i className="bi bi-house me-2" />Back to home</Link>
    </div>
  );
}
