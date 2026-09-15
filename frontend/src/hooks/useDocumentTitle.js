import { useEffect } from 'react';
import { APP_NAME } from '../utils/constants';

/** Sets document.title and restores nothing (title is overwritten per page). */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
