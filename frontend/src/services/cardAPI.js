import { apiClient } from './apiClient';

export async function searchCards(query = '', page = 1, limit = 20) {
  const { data } = await apiClient.get('/cards/search/', { params: { q: query, page, limit } });
  return data;
}

export async function fetchCardDetail(cardId) {
  const { data } = await apiClient.get(`/cards/${cardId}/`);
  return data;
}
