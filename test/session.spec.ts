import { describe, it, expect } from 'vitest';
import pinia from '../src/stores';
import { setActivePinia } from 'pinia';
import { useSessionStore } from '../src/stores/session';

describe('session store', () => {
  setActivePinia(pinia);
  it('persists token info', () => {
    const store = useSessionStore();
    store.setToken({ baseUrl: 'url', accessToken: 'token', userId: 'uid', deviceId: 'did' });
    expect(store.isLogin).toBe(true);
    expect(store.baseUrl).toBe('url');
  });
});
