import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHealth } from './useHealth';

vi.mock('../services/apiClient', () => ({
  fetchHealth: vi.fn().mockResolvedValue({ status: 'ok' }),
}));

describe('useHealth', () => {
  it('returns ok when the backend health check succeeds', async () => {
    const { result } = renderHook(() => useHealth());

    await waitFor(() => expect(result.current).toBe('ok'));
  });
});
