const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { Readable, Writable } = require('node:stream');

// Isolate all persistence behind in-memory doubles. No database/config is loaded.
function load(relative, mocks = {}) {
  const filename = path.resolve(__dirname, '..', relative);
  const module = { exports: {} };
  const actualRequire = createRequire(filename);
  vm.compileFunction(readFileSync(filename, 'utf8'),
    ['module', 'exports', 'require', '__dirname', 'process', 'console'], { filename })(
    module, module.exports,
    name => Object.hasOwn(mocks, name) ? mocks[name] : actualRequire(name),
    path.dirname(filename), { env: { NODE_ENV: 'production', VERCEL: '1' } },
    { log() {}, error() {} }
  );
  return module.exports;
}

function storageFixture({ disconnected = false, fail = false, midstream = false } = {}) {
  const bytes = Buffer.from('test-image-bytes');
  let stored;
  let finished = false;
  const bucket = {
    openUploadStream(filename, options) {
      stored = { _id: 'file-id', filename, contentType: options.contentType, metadata: options.metadata, length: bytes.length };
      const stream = new Writable({ write(chunk, encoding, done) { assert.deepEqual(chunk, bytes); done(); } });
      stream.id = stored._id;
      stream.on('finish', () => { finished = true; });
      return stream;
    },
    find(query) {
      return { limit: () => ({ toArray: async () => stored && query.filename === stored.filename && query['metadata.category'] === 'pets' ? [stored] : [] }) };
    },
    openDownloadStream(id) {
      assert.equal(id, stored._id);
      if (fail) return new Readable({ read() { this.destroy(new Error('Test stream failure')); } });
      if (midstream) return new Readable({ read() {
        if (this.sent) return;
        this.sent = true;
        this.push(bytes.subarray(0, 3));
        setTimeout(() => this.destroy(new Error('Test interrupted stream')), 10);
      } });
      return Readable.from([bytes]);
    }
  };
  const service = load('services/fileStorage.js', {
    mongoose: { connection: { db: {}, readyState: disconnected ? 0 : 1 }, mongo: { GridFSBucket: function () { return bucket; } } }
  });
  return { service, bytes, finished: () => finished };
}

async function serve(t, service) {
  const emptyRoute = (_req, _res, next) => next();
  const mocks = { './db': { connectToDatabase: () => { throw new Error('Tests must not connect'); } }, './services/fileStorage': service };
  for (const name of ['auth', 'users', 'pets', 'medicalRecords', 'petAccess', 'uploads', 'admin']) mocks[`./routes/${name}`] = emptyRoute;
  const app = load('server.js', mocks);
  app.set('env', 'test');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

for (const scenario of ['success', 'missing', 'disconnected', 'stream-error', 'midstream-error']) {
  test(`public image GET: ${scenario}`, async t => {
    const fixture = storageFixture({ disconnected: scenario === 'disconnected', fail: scenario === 'stream-error', midstream: scenario === 'midstream-error' });
    let url = '/uploads/pets/missing.png';
    if (!['missing', 'disconnected'].includes(scenario)) {
      const saved = await fixture.service.uploadBuffer({ buffer: fixture.bytes, originalName: 'Luna 🐾.PNG', mimetype: 'image/png', category: 'pets' });
      assert.equal(fixture.finished(), true, 'persistent upload finishes before returning its URL');
      assert.match(saved.url, /^\/uploads\/pets\/.*\.png$/);
      url = saved.url;
    }
    const base = await serve(t, fixture.service);
    if (scenario === 'midstream-error') {
      await assert.rejects(async () => { const response = await fetch(base + url); await response.arrayBuffer(); });
      return;
    }
    const response = await fetch(base + url); // Deliberately no Authorization header.
    if (scenario === 'success') {
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'image/png');
      assert.equal(response.headers.get('content-length'), String(fixture.bytes.length));
      assert.match(response.headers.get('content-disposition'), /filename\*=UTF-8''/);
      assert.match(response.headers.get('cache-control'), /immutable/);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), fixture.bytes);
    } else {
      assert.equal(response.status, scenario === 'missing' ? 404 : 500);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.match(response.headers.get('content-type'), /application\/json/);
      assert.equal(response.headers.get('content-disposition'), null);
      assert.ok((await response.json()).error);
    }
  });
}

test('upload controller returns the persisted GridFS path', async () => {
  const fixture = storageFixture();
  const controller = load('controllers/uploadController.js', { '../services/fileStorage': fixture.service });
  let payload;
  await controller.uploadPetImage({ file: { buffer: fixture.bytes, originalname: 'pet.jpg', mimetype: 'image/jpeg' } }, { json: data => { payload = data; } });
  assert.equal(fixture.finished(), true);
  assert.match(payload.imageUrl, /^\/uploads\/pets\/.*\.jpg$/);
});

test('owner and veterinarian APIs return the same stored URL; unrelated edits preserve it and removal clears it', async () => {
  const owner = { _id: 'owner-a', name: 'Owner', email: 'owner@example.test', toString: () => 'owner-a' };
  const pet = { _id: 'pet-a', owner, name: 'Luna', photoUrl: 'https://legacy.example/luna.jpg', async save() { return this; } };
  let payload;
  const res = { json(data) { payload = data; return this; }, status() { return this; } };
  const Pet = { find: query => { assert.equal(query.owner, 'owner-a'); return { lean: async () => [pet] }; }, findById: async () => pet };
  const pets = load('controllers/petController.js', { '../models/Pet': Pet, '../models/MedicalRecord': {}, '../models/PetAccess': {} });
  await pets.getPets({ user: { _id: 'owner-a' } }, res);
  assert.equal(payload[0].photoUrl, pet.photoUrl);
  const access = load('controllers/petAccessController.js', {
    '../models/Pet': Pet, '../models/User': {},
    '../models/PetAccess': { find: () => ({ populate: async () => [{ pet }] }) }
  });
  await access.getPatients({ user: { _id: 'vet-a' } }, res);
  assert.equal(payload[0].photoUrl, pet.photoUrl);
  await pets.updatePet({ params: { id: pet._id }, user: { _id: 'owner-a' }, body: { name: 'Updated' } }, res);
  assert.equal(payload.photoUrl, 'https://legacy.example/luna.jpg');
  await pets.updatePet({ params: { id: pet._id }, user: { _id: 'owner-a' }, body: { photoUrl: '/uploads/pets/replaced.jpg' } }, res);
  assert.equal(payload.photoUrl, '/uploads/pets/replaced.jpg');
  await pets.updatePet({ params: { id: pet._id }, user: { _id: 'owner-a' }, body: { photoUrl: '' } }, res);
  assert.equal(payload.photoUrl, '');
});

test('serverless entry waits for connection before dispatch and retries on the next request after a failure', async () => {
  let resolveConnection;
  let dispatched = 0;
  let fail = false;
  const handler = load('api/index.js', {
    '../server': { handle: () => { dispatched++; } },
    '../db': { connectToDatabase: () => fail ? Promise.reject(new Error('Test connection failure')) : new Promise(resolve => { resolveConnection = resolve; }) }
  });
  const response = { setHeader() {}, end() {} };
  const pending = handler({ method: 'GET', path: '/uploads/pets/a.png' }, response);
  assert.equal(dispatched, 0);
  resolveConnection(); await pending;
  assert.equal(dispatched, 1);
  fail = true;
  await handler({ method: 'GET', path: '/uploads/pets/a.png' }, response);
  assert.equal(response.statusCode, 500);
  assert.equal(dispatched, 1);
  fail = false;
  const retry = handler({ method: 'GET', path: '/uploads/pets/a.png' }, response);
  resolveConnection(); await retry;
  assert.equal(dispatched, 2);
});
