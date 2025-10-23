# OneDesk Frontend

A modern, real-time collaborative workspace platform built with Next.js 15, featuring team chat, task management, document collaboration, whiteboard, and video conferencing.

## 📸 Screenshots

### 🏠 Landing Page
![Landing Page](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/landing.png?raw=true)

### 🔐 Authentication & User Management
![Login Page](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/login%20page.png?raw=true)
![Settings](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/settings.png?raw=true)

### 🏢 Workspace Management
![Dashboard](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/dashboard.png?raw=true)
![Workspace](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/workspace.png?raw=true)

### 💬 Real-time Chat System
![Chat](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/chat.png?raw=true)

### 📋 Task Management (Kanban Board)
![Tasks](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/tasks.png?raw=true)

### 📝 Collaborative Document Editor
![Document Editor](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/tiptap%20editor.png?raw=true)

### 🎨 Interactive Whiteboard
![Whiteboard](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/whiteboard.png?raw=true)

### 📹 Video Conferencing
![Video Conferencing](https://github.com/Mrunalgaikwad002/OneDesk/blob/main/video%20conferencing.png?raw=true)

## 🚀 Features

### 🔐 Authentication & User Management
- **Secure Login/Signup** with JWT tokens
- **User Profiles** with avatar support
- **Session Management** with persistent login
- **OAuth Integration** ready (Google, GitHub, etc.)

### 🏢 Workspace Management
- **Create & Join Workspaces** with invite system
- **Role-based Access Control** (Admin, Member)
- **Workspace Dashboard** with activity overview
- **Member Management** and permissions

### 💬 Real-time Chat System
- **Workspace-level Chat Rooms** with multiple channels
- **Real-time Messaging** with Socket.io
- **Typing Indicators** and presence status
- **Message History** with pagination
- **File Sharing** and emoji reactions
- **Online/Offline Status** for team members

### 📋 Task Management (Kanban Board)
- **Drag & Drop Task Boards** with @hello-pangea/dnd
- **Multiple Task Lists** (To Do, In Progress, Done)
- **Real-time Task Updates** across all users
- **Task Assignment** and due dates
- **Cross-list Task Movement** with real-time sync
- **Task Creation & Editing** with rich descriptions

### 📝 Collaborative Document Editor
- **Real-time Document Editing** with Yjs
- **Multi-user Collaboration** with live cursors
- **Rich Text Editor** with React Quill
- **Document Versioning** and snapshots
- **Presence Indicators** showing active editors
- **Auto-save** and conflict resolution

### 🎨 Interactive Whiteboard
- **Real-time Drawing** with canvas API
- **Multiple Drawing Tools** (pen, shapes, text)
- **Color & Size Selection** for drawing
- **Undo/Redo Functionality** with history
- **Clear Board** and export options
- **Multi-user Drawing** with live sync

### 📹 Video Conferencing
- **WebRTC Video Calls** with simple-peer
- **1:1 and Group Calls** support
- **Camera & Microphone Controls** (mute/unmute)
- **Call Notifications** and incoming call UI
- **Screen Sharing** capabilities
- **Call History** and participant management

### 🔔 Notifications & Presence
- **Real-time Notifications** for messages, tasks, calls
- **Online/Offline Status** indicators
- **Activity Feed** with recent updates
- **Email Notifications** for important events
- **Push Notifications** (browser support)

### 🎨 Modern UI/UX
- **Responsive Design** for all devices
- **Dark/Light Theme** support
- **Glass Morphism** and gradient effects
- **Smooth Animations** and transitions
- **Custom Scrollbars** and modern components
- **Accessibility** compliant design

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks
- **Tailwind CSS** - Utility-first styling
- **Socket.io Client** - Real-time communication
- **Yjs** - Collaborative editing
- **React Quill** - Rich text editor
- **@hello-pangea/dnd** - Drag and drop
- **Simple-peer** - WebRTC video calls
- **Konva.js** - Canvas graphics (whiteboard)

### Backend Integration
- **RESTful APIs** for data management
- **WebSocket** for real-time features
- **JWT Authentication** for security
- **Supabase** for database and auth
- **File Upload** with Cloudinary integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd OneDesk/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=https://onedesk-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── workspaces/         # Workspace pages
│   │   │   └── [id]/          # Dynamic workspace routes
│   │   ├── login/             # Authentication pages
│   │   ├── signup/
│   │   └── settings/          # User settings
│   ├── components/            # Reusable components
│   ├── features/              # Feature-based components
│   │   └── dashboard/         # Dashboard components
│   ├── lib/                   # Utility libraries
│   │   ├── api.js            # API client
│   │   ├── auth.js           # Authentication utils
│   │   ├── socket.js         # Socket.io client
│   │   └── supabaseClient.js # Supabase client
│   └── styles/               # Global styles
├── public/                   # Static assets
├── .netlify/                # Netlify configuration
├── netlify.toml            # Netlify build settings
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

### Netlify Deployment

The project is configured for Netlify deployment with:
- **Automatic builds** from Git
- **Environment variables** support
- **Secrets scanning** disabled for public vars
- **Caching headers** for performance
- **SPA redirects** for client-side routing

## 🎯 Key Features Implementation

### Real-time Chat
```javascript
// Socket.io integration for real-time messaging
const socket = getSocket(token);
socket.emit('join_room', { roomId });
socket.on('new_message', handleMessage);
```

### Collaborative Documents
```javascript
// Yjs integration for real-time editing
const ydoc = new Y.Doc();
const provider = new WebsocketProvider(wsUrl, 'document-' + id, ydoc);
const ytext = ydoc.getText('content');
```

### Task Management
```javascript
// Drag and drop with real-time sync
<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="list-1">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {/* Task items */}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

### Video Conferencing
```javascript
// WebRTC integration for video calls
const peer = new SimplePeer({
  initiator: true,
  stream: localStream
});
peer.on('signal', (data) => {
  socket.emit('call_signal', { signal: data, to: userId });
});
```

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables
5. Deploy!

### Vercel
1. Import project to Vercel
2. Configure environment variables
3. Deploy automatically

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- Ensure backend CORS includes your frontend URL
- Check environment variables are set correctly

**Socket Connection Issues**
- Verify backend is running and accessible
- Check WebSocket URL configuration

**Build Failures**
- Clear `.next` folder and rebuild
- Check Node.js version compatibility
- Verify all dependencies are installed

**Authentication Issues**
- Verify JWT token is being stored correctly
- Check backend authentication endpoints
- Ensure Supabase configuration is correct

## 📚 API Integration

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/oauth` - OAuth authentication

### Workspace Endpoints
- `GET /api/workspaces` - List user workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace details

### Chat Endpoints
- `GET /api/chat/workspace/:id/rooms` - List chat rooms
- `POST /api/chat/workspace/:id/rooms` - Create chat room
- `GET /api/chat/rooms/:id/messages` - Get messages

### Task Endpoints
- `GET /api/tasks/workspace/:id/boards` - List task boards
- `POST /api/tasks/workspace/:id/boards` - Create board
- `POST /api/tasks/lists/:id/tasks` - Create task

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**OneDesk** - Unify your workflow with real-time collaboration! 🚀

