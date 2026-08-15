# Changelog — v-4 Branch

All notable changes made to Collab-AI in the `v-4` branch are documented here.

---

## [v-4] — 2026-08-16

### 🔐 Authentication
- **Login toast notifications** — Added success (`"Login successful!"`) and error toast alerts on the login page using MUI `Snackbar` + `Alert`. On success, the user is redirected after a 1-second delay so the toast is visible.

---

### 🖥️ Live Room — Core Architecture

#### State Isolation
- **Live Room content no longer bleeds into FileTree state** — The `CollaborativeEditor` now writes to a local `liveRoomContent` state in `FileTreePanel` instead of calling `handleFileContentChange` on every keystroke. The global fileTree state is only updated when the user explicitly clicks **Save**.

#### Initial Flicker Fix
- **Monaco editor no longer shows blank on mount** — `initialContent` (from MongoDB) is now injected into the editor immediately in `handleEditorDidMount`, giving instant feedback while Liveblocks syncs in the background.

#### File Switching Isolation
- **`key={selectedFileName}` added to `CollaborativeEditor`** — Forces a full remount when the user switches files, preventing content from the previous file leaking into the new file's Live Room session.

---

### 🔄 Apply Updates — Full Rework

#### Previous Bugs Fixed
| Bug | Root Cause | Fix |
|---|---|---|
| Content duplicated on Apply | `editor.setValue()` only updated local Monaco; MonacoBinding computed a bad diff | Replaced with direct Yjs `doc.transact()` |
| Double HTML on second Apply | Clicking before Liveblocks sync → new content inserted on top of incoming sync | Added `isSynced` gate — button is disabled/shows "Syncing…" until provider is ready |
| Every user had to click | Toast dismissal only ran locally | Added Yjs `updateApplied` map observer — all peers auto-dismiss when one user clicks |
| Only current file was updated | `applyExternalUpdate` used `fileId` only | Now receives full `pendingFileTree`, flattens it, and applies every file in one transaction |
| Offline users saw no prompt | `externalUpdateCount` only increments on Pusher event; offline users missed it | Added drift detection in `handleSync` — compares Yjs content vs DB content on connect; shows prompt if different |
| Manual saves not notified | `updatedfiletree` Pusher event only fired for AI saves | Added same Pusher trigger in `message-controller.js` for all manual `PATCH /api/messages` saves |

#### How Apply Updates Works Now (End-to-End)
1. AI or user saves changes to MongoDB
2. `message-controller.js` fires `updatedfiletree` Pusher event with full fileTree
3. All online clients receive it → `externalUpdateCount++` → `pendingFileTree` stored → toast shown
4. Offline users: on reconnect, Liveblocks syncs → `handleSync` detects content differs from DB → toast shown
5. Any **one** user clicks "Apply Updates":
   - `flattenFileTree(pendingFileTree)` extracts all `{ filePath: contents }` pairs
   - Single atomic `doc.transact()` deletes + reinserts every file's content in the shared Yjs doc
   - Liveblocks broadcasts to all peers — every Monaco editor updates instantly
   - `doc.getMap('updateApplied').set('lastApplied', Date.now())` fires
   - Every peer's observer calls `setShowUpdatePrompt(false)` — all toasts dismiss

---

### 🔔 Notifications & UX

- **Toast message updated** — Changed from `"AI generated new code for this file."` to `"New updates available for this file."` to correctly reflect that manual saves also trigger the prompt
- **Loading overlay in Live Room** — A full-screen spinner overlay (`"Connecting to Live Room…"`) now appears while `isSynced` is false, preventing accidental interactions before the Yjs document is loaded
- **Apply Updates button state** — Button shows `"Syncing…"` and is disabled while connecting; shows `"Apply Updates"` only when ready

---

### 📦 File Changes Summary

| File | Changes |
|---|---|
| `src/app/login/page.js` | Added MUI Snackbar/Alert toast for login success and error |
| `src/app/project/[id]/page.js` | Added `pendingFileTree` state; `handleSave` now accepts override content; passes `pendingFileTree` to `FileTreePanel` |
| `src/components/FileTreePanel.js` | Added `liveRoomContent` local state; `handleSaveClick` uses Live Room content for saves; passes `pendingFileTree` to `CollaborativeEditor`; `key={selectedFileName}` on `CollaborativeEditor` |
| `src/components/CollaborativeEditor.js` | Full rework: `isSynced` state, `initialContentRef`, loading overlay, drift detection, full-tree Apply Updates via Yjs transaction, `updateApplied` map for peer sync, disabled button until synced |
| `src/controllers/message-controller.js` | Added `updatedfiletree` Pusher trigger for manual saves (not just AI saves) |
| `README.md` | Complete rewrite with updated features, env vars (added `NEXT_LIVEBLOCKS_SECRET_KEY`), Render deployment guide, and updated tech stack |

---

### 🌿 Branch & Deployment

- All changes are on the **`v-4`** branch: [github.com/satyam969/collab-ai/tree/v-4](https://github.com/satyam969/collab-ai/tree/v-4)
- Production deployment: [collab-ai-1.onrender.com](https://collab-ai-1.onrender.com)
