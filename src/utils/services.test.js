import { beforeEach, describe, expect, it, vi } from 'vitest';

const baseQueryMock = vi.fn();
const cookieGetMock = vi.fn();
const cookieSetMock = vi.fn();

vi.mock('@reduxjs/toolkit/query', () => ({
  fetchBaseQuery: vi.fn(() => baseQueryMock),
}));

vi.mock('js-cookie', () => ({
  default: {
    get: (...args) => cookieGetMock(...args),
    set: (...args) => cookieSetMock(...args),
    remove: vi.fn(),
  },
}));

vi.mock('antd', () => ({
  notification: {
    info: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  Translation: ({ children }) => children((key) => key),
}));

const createSessionStorageMock = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
};

describe('baseQueryWithReauth', () => {
  let baseQueryWithReauth;
  let dispatch;
  let state;
  let api;
  let locationAssignMock;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    baseQueryMock.mockReset();
    cookieGetMock.mockReset();
    cookieSetMock.mockReset();

    locationAssignMock = vi.fn();
    globalThis.window = {
      location: {
        pathname: '/dashboard',
        assign: locationAssignMock,
      },
    };
    globalThis.sessionStorage = createSessionStorageMock();

    globalThis.fetch = vi.fn();

    state = {
      user: {
        accessToken: 'expired-access-token',
        refreshToken: { token: 'refresh-token' },
        user: { id: '1' },
      },
    };
    dispatch = vi.fn();
    api = {
      dispatch,
      getState: () => state,
    };

    ({ baseQueryWithReauth } = await import('./services'));
  });

  it('retries request after successful refresh and resolves without returning 401', async () => {
    baseQueryMock.mockResolvedValueOnce({ error: { status: 401 } }).mockResolvedValueOnce({ data: { ok: true } });

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        accessToken: { token: 'new-access-token', ttl: 3600 },
        refreshToken: { token: 'new-refresh-token' },
      }),
    });

    const result = await baseQueryWithReauth({ url: 'events' }, api, {});

    expect(result).toEqual({ data: { ok: true } });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(baseQueryMock).toHaveBeenCalledTimes(2);
    expect(baseQueryMock.mock.calls[1][2]).toEqual(expect.objectContaining({ _isRetryRequest: true }));
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'user/clearUser' }));
  });

  it('clears session and redirects to login when refresh fails', async () => {
    baseQueryMock.mockResolvedValueOnce({ error: { status: 401 } });
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const result = await baseQueryWithReauth({ url: 'events' }, api, {});

    expect(result).toEqual({ error: { status: 401 } });
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'user/clearUser' }));
    expect(sessionStorage.getItem('sessionExpired')).toBe('true');
    expect(locationAssignMock).toHaveBeenCalledWith('/');
  });

  it('does not mark session as expired when no refresh token exists', async () => {
    state.user.refreshToken = undefined;
    cookieGetMock.mockReturnValue(undefined);
    baseQueryMock.mockResolvedValueOnce({ error: { status: 401 } });

    const result = await baseQueryWithReauth({ url: 'events' }, api, {});

    expect(result).toEqual({ error: { status: 401 } });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'user/clearUser' }));
    expect(sessionStorage.getItem('sessionExpired')).toBeNull();
    expect(locationAssignMock).toHaveBeenCalledWith('/');
  });

  it('does not retry or re-refresh already retried requests', async () => {
    baseQueryMock.mockResolvedValueOnce({ error: { status: 401 } });

    const result = await baseQueryWithReauth({ url: 'events' }, api, { _isRetryRequest: true });

    expect(result).toEqual({ error: { status: 401 } });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(baseQueryMock).toHaveBeenCalledTimes(1);
  });

  it('uses a single refresh flow for concurrent unauthorized requests', async () => {
    let requestCount = 0;
    baseQueryMock.mockImplementation(async () => {
      requestCount += 1;
      if (requestCount <= 2) {
        return { error: { status: 401 } };
      }
      return { data: { requestCount } };
    });

    let resolveRefreshRequest;
    globalThis.fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefreshRequest = resolve;
        }),
    );

    const resultsPromise = Promise.all([
      baseQueryWithReauth({ url: 'events-a' }, api, {}),
      baseQueryWithReauth({ url: 'events-b' }, api, {}),
    ]);
    while (!resolveRefreshRequest) {
      await Promise.resolve();
    }
    resolveRefreshRequest({
      ok: true,
      json: async () => ({
        accessToken: { token: 'new-access-token', ttl: 3600 },
        refreshToken: { token: 'new-refresh-token' },
      }),
    });
    const [firstResult, secondResult] = await resultsPromise;

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(firstResult).toEqual(expect.objectContaining({ data: expect.any(Object) }));
    expect(secondResult).toEqual(expect.objectContaining({ data: expect.any(Object) }));
  });
});
