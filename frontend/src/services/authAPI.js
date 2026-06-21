import { apiClient } from './apiClient';

export async function registerUser(username, email, password, passwordConfirm) {
  const { data } = await apiClient.post('/auth/register/', {
    username,
    email,
    password,
    password_confirm: passwordConfirm,
  });
  return data;
}

export async function loginUser(username, password) {
  const { data } = await apiClient.post('/auth/login/', { username, password });
  return data;
}

export async function logoutUser(refreshToken) {
  const { data } = await apiClient.post('/auth/logout/', { refresh: refreshToken });
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me/');
  return data;
}

export async function refreshAccessToken(refreshToken) {
  const { data } = await apiClient.post('/auth/refresh/', { refresh: refreshToken });
  return data;
}

export async function migrateGuestData(deviceId, recentCards) {
  const { data } = await apiClient.post('/auth/migrate-guest/', {
    device_id: deviceId,
    recent_cards: recentCards,
  });
  return data;
}
