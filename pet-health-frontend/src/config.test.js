import { API_BASE_URL, getFileUrl } from './config';

test.each([
  ['/uploads/pets/a.jpg', `${API_BASE_URL}/uploads/pets/a.jpg`],
  ['uploads/pets/a.jpg', `${API_BASE_URL}/uploads/pets/a.jpg`],
  [' https://legacy.example/a.jpg ', 'https://legacy.example/a.jpg'],
  ['http://legacy.example/a.jpg', 'http://legacy.example/a.jpg'],
  ['HTTPS://legacy.example/a.jpg', 'HTTPS://legacy.example/a.jpg'],
  ['', ''], [null, ''], [undefined, ''], ['   ', ''],
  ['http://', ''], ['blob:temporary', ''], ['javascript:alert(1)', '']
])('resolves %s without altering stored data', (input, expected) => {
  expect(getFileUrl(input)).toBe(expected);
});
