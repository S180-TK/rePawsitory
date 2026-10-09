# Pet photo reliability investigation

Implemented locally on 2026-10-09. No commit, deployment, production database access, migration, or file deletion was performed.

## Findings established from the source

1. **Authentication was not reactive.** `AuthContext.js` existed but was not mounted. `useNavigation.js` kept a separate boolean/role, initialized signed out even when storage held a session. `PetHealthApp.jsx` relied on a 100 ms timer after login. `usePets.js` and `usePatients.js` depended only on a refetch counter, so identity changes alone neither cleared lists nor invalidated requests. Their existing mounted flags protected refetch/unmount, but not account changes without a refetch. Both hooks also discarded successful data on transient failures.
2. **Add Pet rendered twice.** `PetsPage.jsx` mounted two independent Add Pet forms with duplicated input IDs. In `AddPetModal.jsx`, the Change Photo action looked up a file input that was only rendered when there was no preview.
3. **Uploads could race saving, removal and replacement.** Neither form blocked save during upload or invalidated late upload responses. Add created object URLs without revoking them. Edit could retain a preview from another pet and sent `undefined` after removal, so JSON omitted `photoUrl` and the backend correctly preserved the old value.
4. **Some historical URL formats broke.** `getFileUrl` in `config.js` concatenated the API host directly with a relative path. A path such as `uploads/pets/a.jpg` therefore produced a malformed URL. Existing absolute HTTP/HTTPS URLs must remain absolute.
5. **GridFS is already persistent.** Multer buffers files in memory, `uploadBuffer` writes those buffers to GridFS and resolves after the upload stream finishes. `/uploads/:category/:filename` matches the returned URL. The Vercel entry point awaits the shared database connection before dispatch; local startup also connects before listening. Owner and veterinarian controllers both return the stored `photoUrl`. There was no evidence warranting replacement of GridFS or a database migration.
6. **Image error handling needed correction.** The stream set image content type, length and immutable cache headers before streaming. The global error handler could retain those headers on a failed download and did not delegate errors after headers were sent. An original filename containing characters outside the HTTP header character range could also fail header construction. These are backend failure paths verified with mocked storage and real local HTTP requests, not evidence of a particular production incident.

## Changes and file map

| Files | Purpose |
| --- | --- |
| `pet-health-frontend/src/App.js`, `contexts/AuthContext.js`, `hooks/useNavigation.js`, `pages/LoginPage.jsx`, `pages/PetHealthApp.jsx` | Activate the existing auth provider, restore sessions on refresh, respond to cross-tab session changes, remove delayed refetches/reload-based logout, and remount account-specific pages and forms when sessions change. Remove login/token debug output from the touched paths. |
| `hooks/useAuthenticatedList.js`, `hooks/usePets.js`, `hooks/usePatients.js` | Fetch with the current session, cancel obsolete requests, ignore late responses, clear data across sessions, retain successful lists on transient errors, clear unauthorized lists, and use saved API objects immediately after create/edit. |
| `config.js`, `components/PetPhoto.jsx` | Resolve relative and absolute URLs consistently; preserve the existing placeholder; retry failed images once and reset failure state for a replacement URL. Stored database values are not rewritten. |
| `hooks/usePetPhotoUpload.js`, `components/AddPetModal.jsx`, `components/EditPetModal.jsx` | Share upload validation/cancellation; prevent premature save; reject unusable upload responses; keep one accessible file input mounted; use persisted URLs for previews without object URLs; preserve unchanged photos and send an explicit empty string on removal. |
| `components/PageRouter.jsx`, `pages/PetsPage.jsx`, `pages/PatientsPage.jsx` | Pass saved pet updates to shared state, remove the duplicate modal, use current list objects in detail views, preserve visible lists during transient refresh failures, and wire the existing Settings link through its parent navigation. |
| `pet-health-backend/services/fileStorage.js`, `server.js`, `api/index.js` | Encode download filenames safely, close download streams on disconnect, use proper JSON/no-store error responses, delegate partial-stream failures, and mark missing-file and connection-error responses no-store. Successful uniquely named files keep immutable caching. Public image GETs remain unauthenticated. |
| Frontend `App.test.js`, `config.test.js`, `hooks/petSession.test.js`, `components/PetPhoto.test.jsx`, `components/PetPhotoForms.test.jsx`; backend `test/petPhotos.test.js`, `package.json` | Focused regression coverage and a backend test command using Node's built-in test runner. Replace the stale Create React App “learn react” test with the actual landing-page smoke test. |

Frontend paths in the table are relative to `pet-health-frontend/src` unless fully prefixed.

## Validation

- **Frontend:** 34 tests passed using `CI=true npm test -- --watchAll=false --runInBand` in `pet-health-frontend`.
- **Backend:** 8 tests passed using `npm test` in `pet-health-backend`. MongoDB and model dependencies are replaced with in-memory doubles; a loopback HTTP server checks real Express responses. No database connection is made. The restricted sandbox initially prohibited listening on loopback; the same tests passed with local-listener permission after correcting a content-type failure they exposed.
- **Build:** `npm run build` passed. Existing unused-code lint warnings remain in PetsPage, SettingsPage and SharingPage; installed browser compatibility data is stale. No dependency updates were made.
- **Browser:** ran the real frontend on localhost against an isolated synthetic API. Confirmed a relative URL without a leading slash resolves to the correct host/path and decodes to a 400-pixel-wide image in My Pets, owner View Details, My Pets after refresh, My Patients after owner logout/vet login, and veterinarian View Records. The fixture server recorded successful image 200 responses and subsequent 304 cache validations. Role-specific navigation changed correctly, and logout removed the signed-in view.
- **Automated upload/edit coverage:** pending saves, superseding uploads, removal/close/unmount races, unusable/error responses, unchanged/replaced/removed photo payloads, changing edit targets, persistent file-input availability, and exactly one Add modal.
- **Automated session coverage:** saved-session restoration, owner/vet switching, late GET/POST responses, overlapping refetches, transient 500 vs authorization 403, cross-tab logout, and edits winning over an older pending GET.
- **Automated server coverage:** persistent upload completion, image bytes/type/length, Unicode filename headers, public image access, 404 vs 500, pre-stream and midstream failures, connection-before-dispatch, and matching owner/vet photo fields.

## Limits and remaining concerns

The original production incident was not reproduced. No real owner/veterinarian credentials or failing production image URL were provided. Atlas contents, deployed environment health, and production cache behavior remain unverified. Browser upload/replacement and actual veterinarian access granting still need end-to-end verification against a dedicated test database; automated tests cover these photo payload/race behaviors with mocks.

Historical disk-only uploads cannot be recovered by a frontend URL fix if their actual file was lost before GridFS storage was introduced. A confirmed missing file requires recovery from a backup or a deliberate re-upload. This patch does not rewrite records or delete orphaned GridFS files. Canceling a request after the server has already stored its upload can leave an unreferenced file; cleanup is intentionally outside this task.

The shared API connection helper already retries failed connections on later requests. It and all production database configuration are unchanged. Successful replacement uploads already receive different filenames/URLs, so the fix does not add cache-busting parameters to every render.

## Manual verification with dedicated test accounts

1. Sign in as an owner with a complete profile. Add a test pet and upload a photo. While throttling the network, confirm Save is disabled until upload finishes. Save and check My Pets, View Details, then refresh and check again.
2. Grant an approved test veterinarian access using Share Records. Log out and sign in as that veterinarian. Check My Patients and View Records, navigate back and forth, and refresh.
3. Switch between owner, veterinarian and a second owner. Confirm each sees only the correct lists and that open forms/details from the previous session are gone. With the network throttled, switch while a list is still loading and confirm its late response never appears.
4. As the owner, replace the photo and save. Check the list/details, refresh, then sign in as the vet and check both patient views. Edit the pet's name without changing its photo; confirm the same URL/photo persists. Remove the photo, save and refresh; confirm the placeholder remains.
5. Start an upload, then remove it or close the form before completion. Reopen and confirm the canceled image has not returned. Repeat with two successive selections and confirm the last one wins.
6. In browser DevTools Network, preserve the log and inspect the image request. Compare the API's `photoUrl` with the rendered image `src`. Temporarily block the image request to confirm the placeholder appears without losing the stored URL. Unblock it and revisit the page; confirm it loads.

When a photo fails, classify the evidence before changing data:

| Evidence | Interpretation / next check |
| --- | --- |
| API `photoUrl` is empty | Check the pet's saved value and upload/save request; no image GET is expected. |
| API URL exists but `img.src` has the wrong host/path | URL construction or an already malformed historical value. Inspect without rewriting records automatically. |
| Image GET 404 | Correctly routed file was not found (including lost historical uploads); inspect the exact filename/category and storage inventory. |
| Image GET 401/403 | Deployed middleware, proxy or access policy differs from this public image route. |
| Image GET 500 | Check deployed connection/storage logs; this is distinct from a missing file. |
| Network/partial-body failure | Check connectivity and GridFS stream/chunk health; the UI should fall back without altering `photoUrl`. |
| Image GET 200 or 304 with decoded image | Serving/cache validation succeeded; inspect React list/session data if the displayed selection is wrong. |

Never copy authorization headers, tokens or database connection strings into screenshots or issue reports.
