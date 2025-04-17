# Collab-AI: AI-Powered Collaborative Development Environment

Collab-AI is a modern web application that combines real-time collaboration features with AI-powered code generation and assistance. Built with Next.js, it provides a seamless development experience with features like real-time code editing, AI code suggestions, and project management.

## Features

### Core Features
- Real-time collaborative code editing
- AI-powered code generation and assistance
- Project management and file organization
- Multiple project type support (React.js, Next.js, Express.js)
- Real-time chat with AI assistance
- User authentication and authorization
- File tree management with create/delete operations
- Code editor with syntax highlighting
- Live project preview

### Technical Features
- WebContainer integration for running code in the browser
- Real-time updates using Pusher
- MongoDB for data persistence
- NextAuth.js for authentication
- Material-UI for modern UI components
- Tailwind CSS for styling
- TypeScript support
- Responsive design

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Pusher account
- Google API key (for authentication)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URl="your_mongodb_connection_string"

# JWT Configuration
JWT_SECRET="your_jwt_secret"

# Google Authentication
GOOGLE_API_KEY="your_google_api_key"

# NextAuth Configuration
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

<!-- create a ai user that wouuld be responsible for the messages from ai  -->
# AI Configuration
AI_USER_ID="your_ai_user_id"
NEXT_PUBLIC_AI="your_ai_user_id"

# Pusher Configuration
PUSHER_APP_ID="your_pusher_app_id"
PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
PUSHER_CLUSTER="your_pusher_cluster"
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"

# Environment
NODE_ENV="development"
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/collab-ai.git
cd collab-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy the `.env.example` file to `.env`
- Fill in all required environment variables

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
collab-ai/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── controllers/         # API controllers
│   ├── lib/                 # Utility functions and configurations
│   ├── models/              # MongoDB models
│   ├── services/            # Business logic and services
│   └── styles/              # Global styles
├── public/                  # Static assets
├── .env                     # Environment variables
├── next.config.mjs          # Next.js configuration
├── tailwind.config.mjs      # Tailwind CSS configuration
└── package.json             # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Dependencies

### Core Dependencies
- Next.js 15.1.3
- React 19.0.0
- MongoDB 8.9.3
- Pusher 5.2.0
- Material-UI 6.3.0
- Tailwind CSS 3.4.1

### Development Dependencies
- JavaScript
- ESLint
- PostCSS
- Tailwind CSS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or open an issue in the GitHub repository.

## Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database solution
- Pusher for real-time functionality
- Material-UI for the UI components
- All contributors who have helped shape this project
