# Collab-AI: AI-Powered Collaborative Development Environment

Collab-AI is a full-stack web application that combines real-time collaborative code editing with AI-powered code generation. Multiple developers can work in the same project simultaneously, ask an AI assistant to generate or modify code, and instantly see changes propagated to every connected user — all in the browser.

---

## Features

### Core Features
- **Live Room** — Real-time collaborative Monaco editor powered by Liveblocks + Yjs CRDTs
- **AI Code Assistant** — Chat-based AI that reads your file tree and generates/modifies code
- **File Tree Management** — Create, delete, and organize files and folders per project
- **Project Types** — Bootstrap React.js, Next.js, or Express.js project templates
- **WebContainer** — Run and preview code directly in the browser (no server needed)
- **Real-time Chat** — Project-scoped chat with AI and teammates
- **User Management** — Add/remove project members with Pusher notifications
- **Authentication** — Credential-based login/signup with NextAuth.js

### Live Room Architecture
- **CRDT Sync**: Every keystroke is conflict-free replicated across all clients via Yjs
- **Apply Updates**: When AI or a teammate saves changes, all Live Room users see a prompt to apply the full updated file tree in one click — no file-by-file workflow
- **Single-click propagation**: One user clicking "Apply Updates" atomically updates all files for every connected user via a single Yjs transaction
- **Drift detection**: When a user opens the Live Room after being offline, it automatically compares the Liveblocks state against the latest MongoDB-saved content and shows the Apply Updates prompt if they differ
- **Sync guard**: Apply Updates is blocked until Liveblocks has fully synced, preventing race-condition content duplication
- **Offline save notification**: Manual saves from File Tree mode now fire a Pusher event so Live Room users are always notified

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URL="your_mongodb_connection_string"

# JWT
JWT_SECRET="your_jwt_secret"

# Google Gemini AI
GOOGLE_API_KEY="your_google_api_key"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"   # Change to your production URL when deploying

# AI Bot User (create a user in your DB to represent the AI)
AI_USER_ID="mongo_object_id_of_ai_user"
NEXT_PUBLIC_AI="mongo_object_id_of_ai_user"

# Pusher (server-side)
PUSHER_APP_ID="your_pusher_app_id"
PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
PUSHER_CLUSTER="your_pusher_cluster"

# Pusher (client-side)
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"

# Liveblocks
NEXT_LIVEBLOCKS_SECRET_KEY="your_liveblocks_secret_key"
```

> **Note**: `NEXTAUTH_URL` must be set to your production domain (e.g. `https://collab-ai-1.onrender.com`) when deploying. `localhost` will break OAuth callbacks in production.

---

## Installation

```bash
# 1. Clone
git clone https://github.com/satyam969/collab-ai.git
cd collab-ai

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in all values in .env

# 4. Start dev server
npm run dev
```

App is available at `http://localhost:3000`.

---

## Deployment (Render)

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo and select the `v-4` branch
3. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add all environment variables from `.env` in Render's dashboard
5. Set `NEXTAUTH_URL` to your Render URL (e.g. `https://your-app.onrender.com`)
6. Click **Deploy**

---

## Project Structure

```
collab-ai/
├── src/
│   ├── app/
│   │   ├── api/               # Next.js API routes
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── project/[id]/      # Project workspace page
│   ├── components/
│   │   ├── CollaborativeEditor.js   # Monaco + Yjs Live Room editor
│   │   ├── FileTreePanel.js         # File tree + editor panel
│   │   ├── ChatPanel.js             # AI & team chat
│   │   └── ProjectViewPanel.js      # WebContainer preview
│   ├── controllers/
│   │   └── message-controller.js   # AI & save logic, Pusher triggers
│   ├── lib/                   # Pusher client/server, Liveblocks, WebContainer
│   ├── models/                # MongoDB schemas (User, Project, Message)
│   └── services/              # Business logic
├── public/
├── .env
├── next.config.mjs
└── package.json
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Key Dependencies

| Package | Purpose |
|---|---|
| Next.js 15 | App framework (App Router) |
| React 19 | UI library |
| `@liveblocks/react` | Live Room presence & CRDT sync |
| `yjs` + `y-monaco` | CRDT engine + Monaco binding |
| `@monaco-editor/react` | Code editor (Live Room) |
| `react-ace` | Code editor (File Tree mode) |
| `pusher` / `pusher-js` | Real-time event bus |
| `next-auth` | Authentication |
| `mongoose` | MongoDB ORM |
| `@google/generative-ai` | Gemini AI API |
| `@webcontainer/api` | In-browser code execution |
| `@mui/material` | UI component library |

---

## Changelog

### v-4 (Latest)

#### Live Room — Core Fixes
- **Isolated Live Room state from File Tree**: Edits made in Live Room no longer bleed into the File Tree's state until the user explicitly clicks Save. The two modes are now fully independent.
- **Fixed initial empty flicker**: Monaco editor now displays `initialContent` immediately on mount (before Liveblocks finishes connecting) so the editor is never blank.
- **Added `key={selectedFileName}` to CollaborativeEditor**: Forces a full remount when switching files in Live Room, preventing state leakage between different files.

#### Live Room — Apply Updates Flow
- **Full file tree sync**: Clicking "Apply Updates" now applies every file in the pending fileTree in a single atomic Yjs transaction — not just the currently open file.
- **Single click for all users**: When one user clicks Apply Updates, all other users' editors update instantly via Yjs broadcast. Other users' toasts dismiss automatically via a shared Yjs `updateApplied` map.
- **Fixed duplication bug**: Replaced `editor.setValue()` approach with direct `yText.delete() + yText.insert()` inside a `doc.transact()` to prevent MonacoBinding diff errors from corrupting content.
- **Sync guard**: Apply Updates button is disabled (shows "Syncing…") until Liveblocks has fully connected, preventing the race condition where clicking early caused content duplication.
- **Loading overlay**: A spinner overlay appears on the editor while Liveblocks connects, preventing premature interaction.
- **Drift detection on mount**: When a user enters the Live Room, the `handleSync` callback compares the Yjs room content against the latest MongoDB content. If they differ (offline update scenario), the Apply Updates prompt appears automatically even without a Pusher event.
- **Updated toast message**: Changed from "AI generated new code" to "New updates available" since saves from teammates also trigger the prompt.

#### Notifications & Pusher
- **Manual save now notifies Live Room users**: `message-controller.js` now fires the `updatedfiletree` Pusher event on all saves (not just AI saves), so Live Room users see the Apply Updates prompt when a teammate saves from File Tree mode.
- **Login toast notifications**: Added MUI `Snackbar` + `Alert` on the login page — green toast on success, red toast on failure.
- **Save notification in Live Room**: Live Room users see a Snackbar notification when any user saves the project.

#### UX & General
- **"Save" button**: Works correctly in both File Tree mode (saves Ace editor content) and Live Room mode (saves the Yjs document content to MongoDB).
- **Branch v-4**: All changes tracked and pushed to the `v-4` branch on GitHub.

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request targeting the `main` branch

---

## License

MIT License — see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Liveblocks](https://liveblocks.io) for real-time collaboration infrastructure
- [Yjs](https://yjs.dev) for CRDT-based conflict-free editing
- [Next.js](https://nextjs.org) for the app framework
- [Pusher](https://pusher.com) for real-time event delivery
- [Google Gemini](https://ai.google.dev) for AI code generation
- [WebContainers](https://webcontainers.io) for in-browser code execution
