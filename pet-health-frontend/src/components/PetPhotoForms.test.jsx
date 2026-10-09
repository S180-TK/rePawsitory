import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import AddPetModal from './AddPetModal';
import EditPetModal from './EditPetModal';
import PetsPage from '../pages/PetsPage';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
const pet = { _id: 'pet-a', name: 'Luna', species: 'Dog', dateOfBirth: '2020-01-01', photoUrl: '/uploads/pets/old.jpg' };
const reply = data => ({ ok: true, json: async () => data });
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const choose = () => fireEvent.change(screen.getByLabelText('Pet photo'), { target: { files: [new File(['image'], 'pet.png', { type: 'image/png' })] } });
beforeEach(() => {
  localStorage.setItem('token', 'test-owner-token');
  localStorage.setItem('user', JSON.stringify({ id: 'owner', role: 'owner' }));
  global.fetch = jest.fn();
});
afterEach(() => { localStorage.clear(); jest.restoreAllMocks(); });

test('Add blocks submission until upload finishes and saves the persistent URL', async () => {
  const upload = deferred();
  fetch.mockReturnValueOnce(upload.promise);
  const onSave = jest.fn().mockResolvedValue(undefined);
  render(<AddPetModal isOpen onSave={onSave} onClose={() => {}} />, { wrapper });
  fireEvent.change(screen.getByLabelText(/Pet Name/), { target: { value: 'Luna' } });
  fireEvent.change(screen.getByLabelText(/Date of Birth/), { target: { value: '2020-01-01' } });
  choose();
  expect(screen.getByRole('button', { name: 'Save Pet' })).toBeDisabled();
  fireEvent.submit(screen.getByRole('button', { name: 'Save Pet' }).closest('form'));
  expect(onSave).not.toHaveBeenCalled();
  await act(async () => upload.resolve(reply({ imageUrl: '/uploads/pets/new.png' })));
  expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('/uploads/pets/new.png'));
  expect(screen.getAllByLabelText('Pet photo')).toHaveLength(1);
  const clickInput = jest.spyOn(screen.getByLabelText('Pet photo'), 'click');
  fireEvent.click(screen.getByRole('button', { name: 'Change Photo' }));
  expect(clickInput).toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save Pet' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ photoUrl: '/uploads/pets/new.png' })));
});

test.each(['remove', 'close', 'unmount'])('late upload cannot restore photo after %s', async action => {
  const upload = deferred();
  fetch.mockReturnValueOnce(upload.promise);
  const props = { isOpen: true, onSave: jest.fn(), onClose: jest.fn() };
  const view = render(<AddPetModal {...props} />, { wrapper });
  choose();
  const signal = fetch.mock.calls[0][1].signal;
  if (action === 'remove') fireEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
  if (action === 'close') {
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    view.rerender(<AddPetModal {...props} isOpen={false} />);
    view.rerender(<AddPetModal {...props} />);
  }
  if (action === 'unmount') view.unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => upload.resolve(reply({ imageUrl: '/uploads/pets/late.png' })));
  expect(screen.queryByRole('img')).toBeNull();
});

test('latest upload wins even if an earlier request ignores cancellation', async () => {
  const first = deferred(); const second = deferred();
  fetch.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  render(<AddPetModal isOpen onSave={jest.fn()} onClose={jest.fn()} />, { wrapper });
  choose(); choose();
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
  await act(async () => second.resolve(reply({ imageUrl: 'uploads/pets/new.png' })));
  await act(async () => first.resolve(reply({ imageUrl: 'uploads/pets/old.png' })));
  expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('/uploads/pets/new.png'));
});

test.each([{ ok: false, status: 500 }, reply({}), reply({ imageUrl: 'blob:temporary' })])('failed/unusable upload prevents accidental photo-less save', async response => {
  fetch.mockResolvedValue(response);
  render(<AddPetModal isOpen onSave={jest.fn()} onClose={jest.fn()} />, { wrapper });
  choose();
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Failed to upload image'));
  expect(screen.getByRole('button', { name: 'Save Pet' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
  expect(screen.getByRole('button', { name: 'Save Pet' })).toBeEnabled();
});

test.each(['unchanged', 'removed', 'replaced'])('Edit persists %s photo and uses the saved API response', async mode => {
  const updatedUrl = mode === 'removed' ? '' : mode === 'replaced' ? '/uploads/pets/new.png' : pet.photoUrl;
  const onSave = jest.fn();
  fetch.mockImplementation(async (_url, options) => options.method === 'POST'
    ? reply({ imageUrl: updatedUrl }) : reply({ ...pet, photoUrl: updatedUrl, name: 'Updated' }));
  const { container } = render(<EditPetModal isOpen pet={pet} onSave={onSave} onClose={jest.fn()} />, { wrapper });
  fireEvent.change(document.querySelector('input[name="name"]'), { target: { value: 'Updated' } });
  if (mode === 'removed') fireEvent.click(screen.getByRole('button', { name: 'Remove image' }));
  if (mode === 'replaced') {
    choose();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled());
  }
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ _id: pet._id, photoUrl: updatedUrl })));
  const update = fetch.mock.calls.find(([, options]) => options.method === 'PUT');
  if (mode === 'unchanged') expect(JSON.parse(update[1].body)).not.toHaveProperty('photoUrl');
  else expect(JSON.parse(update[1].body).photoUrl).toBe(updatedUrl);
  expect(container).toBeInTheDocument();
});

test('switching edit targets clears the previous photo preview', () => {
  const props = { isOpen: true, onSave: jest.fn(), onClose: jest.fn() };
  const { rerender } = render(<EditPetModal {...props} pet={pet} />, { wrapper });
  expect(screen.getByRole('img')).toBeInTheDocument();
  rerender(<EditPetModal {...props} pet={{ ...pet, _id: 'pet-b', photoUrl: '' }} />);
  expect(screen.queryByRole('img')).toBeNull();
});

test('My Pets opens one Add modal and one file input', async () => {
  fetch.mockResolvedValue(reply({ user: { profileCompleted: true } }));
  render(<PetsPage pets={[]} addPet={jest.fn()} setCurrentPage={jest.fn()} />, { wrapper });
  await act(async () => {});
  fireEvent.click(screen.getByRole('button', { name: 'Add New Pet' }));
  expect(screen.getAllByRole('heading', { name: 'Add New Pet' })).toHaveLength(1);
  expect(screen.getAllByLabelText('Pet photo')).toHaveLength(1);
});
