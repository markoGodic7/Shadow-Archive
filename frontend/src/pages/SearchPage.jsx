import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCards } from '../hooks/useCards';
import { addRecentCard, getStoredRecentCards } from '../utils/localStorage';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const { cards, loading, error } = useCards(term, page);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setTerm(query.trim());
  };

  const handleCardClick = (card) => {
    addRecentCard(card);
    navigate(`/cards/${card.id}`);
  };

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <h2>Search</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search cards"
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading cards…</p>}
      {error && <p role="alert">{error}</p>}
      <ul style={{ display: 'grid', gap: '0.75rem', padding: 0, listStyle: 'none' }}>
        {cards.map((card) => (
          <li key={card.id} style={{ border: '1px solid #ddd', padding: '0.75rem', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => handleCardClick(card)}
              style={{ border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
            >
              <strong>{card.name}</strong>
              <div>{card.type || 'Card'}</div>
            </button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={cards.length < 20}>
          Next
        </button>
      </div>
      <section>
        <h3>Recently viewed</h3>
        <ul>
          {getStoredRecentCards().map((card) => (
              <li key={card.id}>{card.name}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}