import { useEffect, useMemo, useState } from 'react';
import { searchCards } from '../services/cardAPI';

export function useCards(query = '', page = 1) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!query || !query.trim()) {
        setCards([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchCards(query, page, 20);
        if (mounted) {
          setCards(data.results || []);
          setError('');
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Unable to load cards');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [query, page]);

  return useMemo(() => ({ cards, loading, error }), [cards, loading, error]);
}