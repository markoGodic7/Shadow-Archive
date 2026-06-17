const RECENT_KEY = 'shadow-archive-recently-viewed';

export function getStoredRecentCards() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addRecentCard(card) {
  const current = getStoredRecentCards();
  const updated = [
    { id: card.id, name: card.name, image_url_small: card.image_url_small, viewed_at: new Date().toISOString() },
    ...current.filter((item) => item.id !== card.id),
  ].slice(0, 8);

  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  return updated;
}
