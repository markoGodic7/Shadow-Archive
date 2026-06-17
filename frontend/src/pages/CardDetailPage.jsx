import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCardDetail } from '../services/cardAPI';
import { addRecentCard } from '../utils/localStorage';

export default function CardDetailPage() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchCardDetail(id);
        if (mounted) {
          setCard(data);
          addRecentCard(data);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Unable to load card');
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (error) return <section role="alert">{error}</section>;
  if (!card) return <section>Loading card…</section>;

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <h2>{card.name}</h2>
      <p>{card.type || 'Card'}</p>
      <p>{card.desc || ''}</p>
      {card.image_url && <img src={card.image_url} alt={card.name} style={{ maxWidth: '320px' }} />}
    </section>
  );
}
