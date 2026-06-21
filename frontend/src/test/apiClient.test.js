import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { apiClient } from './apiClient';

vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
  };
  return { default: mockAxios };
});

describe('apiClient response interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ADD THESE TWO TESTS BELOW YOUR EXISTING ONES

  it('retries the request once after a successful token refresh on 401', async () => {
    const refreshResponse = { data: { access: 'new-access-token' } };
    const successResponse = { data: { result: 'ok' } };

    axios.post.mockResolvedValueOnce(refreshResponse);
    axios.get.mockRejectedValueOnce({
      response: { status: 401 },
      config: { url: '/protected-endpoint', _isRetry: false },
    });
    axios.get.mockResolvedValueOnce(successResponse);

    // Trigger the interceptor manually
    const result = await apiClient.get('/protected-endpoint');
    expect(result).toEqual(successResponse);
    expect(axios.post).toHaveBeenCalledWith(
      '/api/auth/refresh/',
      {},
      { withCredentials: true }
    );
  });

  it('logs out and redirects when token refresh fails on 401', async () => {
    axios.post.mockRejectedValueOnce(new Error('Refresh failed'));
    axios.get.mockRejectedValueOnce({
      response: { status: 401 },
      config: { url: '/protected-endpoint', _isRetry: false },
    });

    // Mock window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    await expect(apiClient.get('/protected-endpoint')).rejects.toBeDefined();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation;
  });
});