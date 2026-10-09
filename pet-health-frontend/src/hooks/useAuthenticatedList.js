import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

// Keep successful data during transient failures, but never across sessions.
export const useAuthenticatedList = (path, enabled) => {
  const { token, user, sessionId } = useAuth();
  const identity = user?.id || user?._id;
  const scope = `${sessionId}:${identity}:${token}:${enabled}`;
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const [state, setState] = useState({ scope, items: [], loading: enabled, error: null });
  const [revision, setRevision] = useState(0);
  const request = useRef(null);
  const refetch = useCallback(() => {
    request.current?.abort();
    setRevision(value => value + 1);
  }, []);

  useEffect(() => {
    currentScope.current = scope;
    const controller = new AbortController();
    request.current = controller;
    const active = () => !controller.signal.aborted && currentScope.current === scope;
    setState(previous => ({
      scope, items: previous.scope === scope && enabled ? previous.items : [],
      loading: Boolean(enabled && token && identity), error: null
    }));
    if (enabled && token && identity) {
      (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}${path}`, {
            headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
            cache: 'no-store'
          });
          if (!response.ok) {
            const error = new Error(`Request failed with status ${response.status}`);
            error.status = response.status;
            throw error;
          }
          const items = await response.json();
          if (!Array.isArray(items)) throw new Error('Invalid list response');
          if (active()) setState({ scope, items, loading: false, error: null });
        } catch (error) {
          if (active()) setState(previous => ({
            ...previous, loading: false, error,
            items: [401, 403].includes(error.status) ? [] : previous.items
          }));
        }
      })();
    }
    return () => controller.abort();
  }, [path, enabled, token, identity, scope, revision]);

  const upsert = useCallback(item => {
    // A pending GET must not overwrite a successful save with an older snapshot.
    request.current?.abort();
    setState(previous => ({
      ...previous, loading: false, error: null,
      items: previous.items.some(existing => existing._id === item._id)
        ? previous.items.map(existing => existing._id === item._id ? item : existing)
        : [...previous.items, item]
    }));
  }, []);
  useEffect(() => () => { currentScope.current = null; }, []);
  const isCurrent = () => currentScope.current === scope;
  const visible = state.scope === scope ? state : { items: [], loading: enabled, error: null };
  return { ...visible, refetch, upsert, isCurrent, token };
};
