# Collab-AI: AI-Powered Collaborative Development Environment

Collab-AI is a modern web application that combines real-time collaboration with AI-powered code generation. Built with Next.js App Router, it lets teams write, edit, and run code together in real time — with an integrated AI assistant that can scaffold entire project structures on demand.

---

## ✨ Features

### Core Features
- 🤖 **AI Code Generation** — Ask the AI to build features, add pages, or fix bugs directly in chat
- 🖥️ **Live Room** — Real-time collaborative code editing powered by Liveblocks + Yjs CRDTs
- 📁 **File Tree Management** — Create, delete, and navigate files and directories
- 💬 **Real-time Chat** — Chat with teammates and the AI in the same panel
- 🔔 **Smart Notifications** — Toast alerts for saves, AI updates, and room events
- 🧑‍💻 **Multi-user Presence** — See who else is in the Live Room with cursor awareness
- 🌐 **Live Project Preview** — Run your project in-browser via WebContainers
- 🔐 **Authentication** — Secure login/signup with NextAuth.js (Credentials provider)

### Live Room Deep Dive
- **Conflict-free Editing** — Yjs CRDT engine ensures no two edits ever conflict
- **Apply Updates** — When AI or a teammate saves changes, all Live Room users see a prompt to apply the update to the shared room in one click
- **One-click Sync** — Clicking "Apply Updates" once syncs **all changed files** to every user instantly — no one else needs to click
- **Offline Drift Detection** — If a user was offline when an update was saved, the system detects the mismatch on reconnect and shows the Apply Updates prompt automatically
- **Manual Save Notifications** — When any user saves from File Tree mode, Live Room users are notified via Pusher
- **Loading Overlay** — A spinner is shown while Liveblocks connects, preventing race-condition clicks

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | Material-UI, Tailwind CSS |
| Code Editor | Monaco Editor (Live Room), Ace Editor (File Tree) |
| Real-time Collab | Liveblocks + Yjs + y-monaco |
| Real-time Events | Pusher (server & client) |
| AI | Google Gemini API |
| Database | MongoDB (Mongoose) |
| Auth | NextAuth.js (Credentials provider) |
| In-browser Runtime | WebContainers API |

---

## 🔧 Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Pusher account
- Liveblocks account
- Google Gemini API key

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URL="your_mongodb_connection_string"

# JWT
JWT_SECRET="your_jwt_secret"

# Google Gemini AI
GOOGLE_API_KEY="your_gemini_api_key"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"   # Use your live URL in production

# AI Bot User (create a dedicated user in your DB for AI messages)
AI_USER_ID="your_ai_user_mongo_id"
NEXT_PUBLIC_AI="your_ai_user_mongo_id"

# Pusher
PUSHER_APP_ID="your_pusher_app_id"
PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
PUSHER_CLUSTER="your_pusher_cluster"
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"

# Liveblocks
NEXT_LIVEBLOCKS_SECRET_KEY="your_liveblocks_secret_key"

# Server Port (optional — Render sets this automatically)
PORT=10000
```

---

## 🚀 Installation

```bash
# 1. Clone the repo
git clone https://github.com/satyam969/collab-ai.git
cd collab-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env   # fill in all values

# 4. Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## ☁️ Deploying on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
2. Connect your GitHub repo and select the branch to deploy
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add all environment variables from your `.env` under **Environment**
   - ⚠️ Set `NEXTAUTH_URL` to your Render URL (e.g. `https://your-app.onrender.com`)
   - Do **not** add `PORT` — Render injects it automatically
5. Click **Deploy**

---

## 📁 Project Structure

```
collab-ai/
├── src/
│   ├── app/
│   │   ├── api/              # Next.js API routes
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   └── project/[id]/     # Main project workspace page
│   ├── components/
│   │   ├── CollaborativeEditor.js  # Monaco + Yjs Live Room editor
│   │   ├── FileTreePanel.js        # File tree, editor switcher, save logic
│   │   ├── ChatPanel.js            # Real-time chat with AI
│   │   └── ProjectViewPanel.js     # WebContainer preview
│   ├── controllers/
│   │   └── message-controller.js  # AI + save Pusher events
│   ├── lib/                  # Pusher client/server, Liveblocks config
│   ├── models/               # Mongoose models
│   └── services/             # Business logic
├── public/
├── .env
├── next.config.mjs
└── package.json
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🔑 Key Dependencies

```json
{
  "next": "^15",
  "react": "^19",
  "@liveblocks/react": "latest",
  "@liveblocks/yjs": "latest",
  "yjs": "latest",
  "y-monaco": "latest",
  "@monaco-editor/react": "latest",
  "pusher": "^5",
  "pusher-js": "^8",
  "mongoose": "^8",
  "next-auth": "^4",
  "@mui/material": "^6",
  "@webcontainer/api": "latest"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — framework
- [Liveblocks](https://liveblocks.io/) — real-time collaboration infrastructure
- [Yjs](https://yjs.dev/) — CRDT engine
- [Pusher](https://pusher.com/) — real-time events
- [MongoDB](https://mongodb.com/) — database
- [Google Gemini](https://deepmind.google/technologies/gemini/) — AI engine
- [Material-UI](https://mui.com/) — UI components
