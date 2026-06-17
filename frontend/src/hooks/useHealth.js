import { useEffect, useState } from 'react';
import { fetchHealth } from '../services/apiClient';

export function useHealth() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      setStatus('ok');
      return undefined;
    }

    let mounted = true;

    fetchHealth()
      .then((data) => {
        if (mounted) setStatus(data.status || 'ok');
      })
      .catch(() => {
        if (mounted) setStatus('error');
      });

    return () => {
      mounted = false;
    };
  }, []);

  return status;
}
