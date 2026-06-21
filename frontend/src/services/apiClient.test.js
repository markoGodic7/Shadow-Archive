import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('creates an axios client using the configured API base URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');

    const createSpy = vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }));
    vi.doMock('axios', () => ({
      default: { create: createSpy, post: vi.fn() },
    }));

    await import('./apiClient');

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'https://api.example.test' })
    );
  });

  it('fetches the backend health endpoint', async () => {
    const getMock = vi.fn().mockResolvedValue({ data: { status: 'ok' } });
    vi.doMock('axios', () => ({
      default: {
        create: vi.fn(() => ({
          get: getMock,
          post: vi.fn(),
          interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
          },
        })),
        post: vi.fn(),
      },
    }));

    const { fetchHealth } = await import('./apiClient');

    await expect(fetchHealth()).resolves.toEqual({ status: 'ok' });
    expect(getMock).toHaveBeenCalledWith('/health/');
  });
});
