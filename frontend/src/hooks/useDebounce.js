import { useState, useEffect } from 'react';

/** Returns a debounced copy of a rapidly-changing value (e.g. a search box). */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
