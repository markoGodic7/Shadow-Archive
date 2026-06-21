import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { apiClient } from '../services/apiClient';

vi.mock('axios', () => {
  let responseErrorHandler = null;
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: {
      request: { use: vi.fn() },
      response: {
        use: vi.fn((_onSuccess, onError) => {
          responseErrorHandler = onError;
        }),
      },
    },
    get: vi.fn(),
    post: vi.fn(),
  };
  return {
    default: mockAxios,
    __getResponseErrorHandler: () => responseErrorHandler,
  };
});

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an axios instance with base URL and credentials', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: '/api',
        withCredentials: true,
      })
    );
  });

  it('retries the request once after a successful token refresh on 401', async () => {
    const refreshResponse = { data: { access: 'new-access-token' } };
    const successResponse = { data: { result: 'ok' } };

    // Import the mock to get the captured error handler
    const mock = await vi.importMock('axios');
    const errorHandler = mock.__getResponseErrorHandler();

    const originalRequest = {
      url: '/protected-endpoint',
      _retry: false,
      headers: {},
    };

    const error = {
      response: { status: 401 },
      config: originalRequest,
    };

    axios.post.mockResolvedValueOnce(refreshResponse);

    // Simulate the interceptor's behavior
    const result = await errorHandler(error);

    // Verify refresh was called via cookie
    expect(axios.post).toHaveBeenCalledWith(
      '/api/auth/refresh/',
      {},
      { withCredentials: true }
    );

    // Verify the request was retried with new token
    expect(originalRequest._retry).toBe(true);
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access-token');
  });

  it('logs out and redirects when token refresh fails on 401', async () => {
    const mock = await vi.importMock('axios');
    const errorHandler = mock.__getResponseErrorHandler();

    const originalRequest = {
      url: '/protected-endpoint',
      _retry: false,
      headers: {},
    };

    const error = {
      response: { status: 401 },
      config: originalRequest,
    };

    axios.post.mockRejectedValueOnce(new Error('Refresh failed'));

    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    await expect(errorHandler(error)).rejects.toBeDefined();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation;
  });
});