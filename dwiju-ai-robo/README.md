# Dwiju AI Robo - Project Documentation

## Project Overview
Dwiju AI Robo is a comprehensive AI platform featuring 1950+ capabilities across 14 categories, including chat, voice, vision, and hardware integration.

## Architecture

### Frontend (Next.js 15 + TypeScript)
- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS 4
- **UI Components**: Custom components with Framer Motion
- **3D Graphics**: Three.js with React Three Fiber
- **State Management**: React hooks and context

### Backend (Node.js + Express)
- **Server**: Express.js with TypeScript support
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **API Integration**: OpenAI, Google Cloud, ElevenLabs
- **Real-time**: Socket.IO for live features

### Key Features Implemented

#### ✅ Completed
1. **Project Foundation**
   - Next.js project with TypeScript
   - Express.js backend server
   - MongoDB database models
   - Environment configuration

2. **Core Components**
   - Responsive landing page
   - 3D hero section with Three.js
   - Chat interface with real-time messaging
   - Category grid for 14 feature categories
   - Footer with navigation

3. **Backend Infrastructure**
   - User authentication system
   - Chat session management
   - Feature management system
   - Rate limiting and security
   - Error handling middleware

4. **Database Models**
   - User model with profiles and preferences
   - Feature model with permanent numbering
   - Chat session model with message history

#### 🔄 In Progress
- OpenAI integration (endpoint created, needs testing)
- Voice input/output functionality
- Admin panel interface

#### ⏳ Planned
- Computer vision and OCR
- Hardware integration (Raspberry Pi)
- Multi-language support
- Production deployment

## File Structure

```
dwiju-ai-robo/
├── src/                          # Frontend source code
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   ├── categories/           # Category pages
│   │   └── page.tsx              # Homepage
│   ├── components/               # React components
│   │   ├── chat/                 # Chat interface
│   │   ├── ui/                   # UI components
│   │   └── [various].tsx         # Main components
│   └── lib/                      # Utility libraries
├── server/                       # Backend server
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   └── index.js                  # Main server file
├── hardware/                     # Hardware integration
│   ├── pi/                       # Raspberry Pi scripts
│   └── arduino/                  # Arduino code
├── docs/                         # Documentation
├── tests/                        # Test files
└── env.example                   # Environment variables template
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Chat
- `POST /api/chat` - Send chat message
- `GET /api/chat/sessions` - Get chat sessions
- `GET /api/chat/sessions/:id` - Get specific session
- `DELETE /api/chat/sessions/:id` - Delete session

### Features
- `GET /api/features` - Get all features
- `GET /api/features/categories` - Get categories
- `POST /api/features` - Create feature (Admin)
- `PUT /api/features/:id` - Update feature
- `DELETE /api/features/:id` - Delete feature

### Health
- `GET /api/health` - Health check endpoint

## Environment Variables

See `env.example` for complete list. Key variables:
- `OPENAI_API_KEY` - OpenAI API key
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)

## Getting Started

1. **Clone and Install**
   ```bash
   cd dwiju-ai-robo
   npm install --legacy-peer-deps
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Start Development**
   ```bash
   # Frontend (Next.js)
   npm run dev

   # Backend (Express)
   npm run server:dev
   ```

## Next Steps

1. **Testing Integration**
   - Test OpenAI API integration
   - Implement voice features
   - Add vision/OCR capabilities

2. **Feature Import**
   - Create feature import system
   - Load 1950+ features from provided list
   - Build category pages

3. **Admin Panel**
   - Complete admin interface
   - Feature management system
   - User management

4. **Hardware Integration**
   - Raspberry Pi setup scripts
   - Camera streaming
   - Arduino sensor integration

## Support

For questions or issues:
1. Check this documentation
2. Review the TODO list
3. Check API documentation in `/docs/api/`

---
**Status**: Foundation Complete ✅ | Core Features In Progress 🔄
**Next Milestone**: Voice & Vision Integration
