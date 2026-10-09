import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { usePets } from './usePets';
import { usePatients } from './usePatients';

const wrapper = ({ children }) => <React.StrictMode><AuthProvider>{children}</AuthProvider></React.StrictMode>;
const owner = { id: 'owner-a', role: 'owner' };
const vet = { id: 'vet-b', role: 'vet' };
const reply = items => ({ ok: true, json: async () => items });
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
beforeEach(() => { localStorage.clear(); global.fetch = jest.fn(); });
afterEach(() => jest.restoreAllMocks());
const useSession = () => ({ auth: useAuth(), pets: usePets(), patients: usePatients() });

test('reacts to login, uses current credentials and rejects late account responses', async () => {
  const old = deferred();
  fetch.mockReturnValueOnce(old.promise).mockResolvedValueOnce(reply([{ _id: 'patient', photoUrl: '/uploads/pets/vet.jpg' }]));
  const { result } = renderHook(useSession, { wrapper });
  expect(fetch).not.toHaveBeenCalled();
  act(() => result.current.auth.login(owner, 'test-owner-token'));
  const oldSignal = fetch.mock.calls[0][1].signal;
  act(() => result.current.auth.login(vet, 'test-vet-token'));
  expect(result.current.pets.pets).toEqual([]);
  expect(oldSignal.aborted).toBe(true);
  await waitFor(() => expect(result.current.patients.patients).toHaveLength(1));
  await act(async () => old.resolve(reply([{ _id: 'private-owner-pet' }])));
  expect(result.current.pets.pets).toEqual([]);
  expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer test-vet-token');
  act(() => result.current.auth.logout());
  expect(result.current.patients.patients).toEqual([]);
  expect(localStorage.getItem('token')).toBeNull();
});

test('restores a saved session and photo after remount (refresh)', async () => {
  localStorage.setItem('token', 'test-owner-token');
  localStorage.setItem('user', JSON.stringify(owner));
  fetch.mockResolvedValue(reply([{ _id: 'pet', photoUrl: '/uploads/pets/saved.jpg' }]));
  const first = renderHook(useSession, { wrapper });
  await waitFor(() => expect(first.result.current.pets.pets).toHaveLength(1));
  first.unmount();
  const next = renderHook(useSession, { wrapper });
  await waitFor(() => expect(next.result.current.pets.pets[0]?.photoUrl).toBe('/uploads/pets/saved.jpg'));
});

test('retains photos on transient refresh failure but clears unauthorized data', async () => {
  fetch.mockResolvedValueOnce(reply([{ _id: 'pet', photoUrl: '/uploads/pets/a.jpg' }]))
    .mockResolvedValueOnce({ ok: false, status: 500 }).mockResolvedValueOnce({ ok: false, status: 403 });
  const { result } = renderHook(useSession, { wrapper });
  act(() => result.current.auth.login(owner, 'test-owner-token'));
  await waitFor(() => expect(result.current.pets.pets).toHaveLength(1));
  act(() => result.current.pets.refetch());
  await waitFor(() => expect(result.current.pets.error?.status).toBe(500));
  expect(result.current.pets.pets[0].photoUrl).toBe('/uploads/pets/a.jpg');
  act(() => result.current.pets.refetch());
  await waitFor(() => expect(result.current.pets.error?.status).toBe(403));
  expect(result.current.pets.pets).toEqual([]);
});

test('latest refetch wins and successful edits cannot be overwritten by pending GETs', async () => {
  const old = deferred();
  fetch.mockReturnValueOnce(old.promise).mockResolvedValueOnce(reply([{ _id: 'pet', photoUrl: 'new.jpg' }]));
  const { result } = renderHook(useSession, { wrapper });
  act(() => result.current.auth.login(owner, 'test-owner-token'));
  act(() => result.current.pets.refetch());
  await waitFor(() => expect(result.current.pets.pets[0]?.photoUrl).toBe('new.jpg'));
  await act(async () => old.resolve(reply([{ _id: 'pet', photoUrl: 'old.jpg' }])));
  expect(result.current.pets.pets[0].photoUrl).toBe('new.jpg');
  const pending = deferred();
  fetch.mockReturnValueOnce(pending.promise);
  act(() => result.current.pets.refetch());
  act(() => result.current.pets.updatePet({ _id: 'pet', photoUrl: 'edited.jpg' }));
  await act(async () => pending.resolve(reply([{ _id: 'pet', photoUrl: 'new.jpg' }])));
  expect(result.current.pets.pets[0].photoUrl).toBe('edited.jpg');
});

test('late POST completion does not add an old account pet to a new session', async () => {
  const post = deferred();
  fetch.mockResolvedValueOnce(reply([])).mockReturnValueOnce(post.promise).mockResolvedValueOnce(reply([]));
  const { result } = renderHook(useSession, { wrapper });
  act(() => result.current.auth.login(owner, 'test-owner-token'));
  await waitFor(() => expect(result.current.pets.loading).toBe(false));
  let saved;
  act(() => { saved = result.current.pets.addPet({ name: 'Pet', photoUrl: 'a.jpg' }); });
  act(() => result.current.auth.login({ id: 'owner-b', role: 'owner' }, 'test-other-token'));
  await act(async () => { post.resolve(reply({ _id: 'old-account-pet' })); await saved; });
  expect(result.current.pets.pets).toEqual([]);
});

test('storage logout clears mounted account data', async () => {
  fetch.mockResolvedValue(reply([{ _id: 'pet' }]));
  const { result } = renderHook(useSession, { wrapper });
  act(() => result.current.auth.login(owner, 'test-owner-token'));
  await waitFor(() => expect(result.current.pets.pets).toHaveLength(1));
  act(() => {
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  });
  expect(result.current.auth.isAuthenticated).toBe(false);
  expect(result.current.pets.pets).toEqual([]);
});

test('creating while the initial list is pending keeps the other pets after revalidation', async () => {
  const initial = deferred();
  const created = { _id: 'new', photoUrl: 'new.jpg' };
  const existing = { _id: 'existing', photoUrl: 'existing.jpg' };
  fetch.mockReturnValueOnce(initial.promise)
    .mockResolvedValueOnce(reply(created))
    .mockResolvedValueOnce(reply([existing, created]));
  const { result } = renderHook(useSession, { wrapper });
  act(() => result.current.auth.login(owner, 'test-owner-token'));
  await act(async () => result.current.pets.addPet({ name: 'New pet', photoUrl: 'new.jpg' }));
  await waitFor(() => expect(result.current.pets.pets).toHaveLength(2));
  await act(async () => initial.resolve(reply([existing])));
  expect(result.current.pets.pets).toEqual([existing, created]);
});
