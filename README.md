# Task Management Board

A full-stack Kanban-style task management application built with React, TypeScript, Node.js, and MongoDB. Features drag-and-drop functionality, user authentication, and comprehensive task management capabilities.

## 🚀 Live Demo

The application provides a complete task management system with drag-and-drop Kanban boards, real-time updates, and team collaboration features.

## ✨ Key Features

### 🎯 Core Functionality
- **Kanban Board Interface**: Visual task management with customizable columns
- **Drag and Drop**: Seamless task movement between columns using @dnd-kit
  - Dedicated drag handle for each task card
  - Visual feedback during dragging
  - Automatic reordering within columns
- **Task Management**: Full CRUD operations for tasks
- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Project Management**: Multi-project support with team collaboration

### 📋 Task Features
- **Comprehensive Task Details**:
  - Title and description
  - Priority levels (Low, Medium, High, Urgent) with color coding
  - Status tracking (Todo, In Progress, In Review, Done)
  - Due dates with smart formatting (Today, Tomorrow, Overdue, etc.)
  - Multiple assignees with avatar display
  - Custom labels
  - Comments and activity history
  - Created by tracking

- **Task Card Display**:
  - Task ID badge
  - Title and description preview
  - Priority indicator with color-coded border
  - Assignee avatars (up to 4 shown, with overflow count)
  - Due date status with color indicators
  - Comment count
  - Labels (up to 3 shown)
  - Quick actions (Edit, Delete)
  - Drag handle for reordering

### 🎨 User Interface
- **Modal System**: Task detail view with full editing capabilities
  - Opens at root level (no z-index issues)
  - Click outside to close
  - Full task editing interface
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Feedback**: Toast notifications for all actions
- **Filter Bar**: Search and filter tasks by multiple criteria
- **Visual Indicators**:
  - Priority colors (Red: Urgent, Orange: High, Yellow: Medium, Green: Low)
  - Due date colors (Red: Overdue, Orange: Today, Yellow: Tomorrow, Blue: This week)

### 👥 Collaboration
- **Team Management**: Add/remove team members to projects
- **Role-based Access**: Owner, Admin, Member roles
- **User Assignment**: Assign multiple users to tasks
- **Activity Tracking**: See who created and modified tasks

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Redux Toolkit** for state management
- **@dnd-kit** for drag-and-drop functionality
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **Axios** for API calls
- **date-fns** for date formatting
- **React Toastify** for notifications

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT Authentication** (Access + Refresh tokens)
- **bcrypt** for password hashing
- **CORS** enabled
- **Docker** support for MongoDB

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose (for MongoDB)
- Git

### Quick Start

#### 1. Clone the repository
```bash
git clone <repository-url>
cd taskmanagementboard
```

#### 2. Backend Setup

Navigate to backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/taskmanagement
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
PORT=3000
```

Start MongoDB with Docker:
```bash
docker-compose up -d
```

Start development server:
```bash
npm start
```

Backend will run on `http://localhost:3000`

#### 3. Frontend Setup

Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🚦 Usage Guide

### Getting Started
1. **Register an account** on the login page
2. **Create your first project** using the "Create Project" button
3. **Default columns** (Todo, In Progress, Done) are created automatically
4. **Start adding tasks** using the "Add Task" button in any column

### Task Management
- **Create Task**: Click "Add Task" in any column
- **View Details**: Click on any task card to open the detail modal
- **Edit Task**: Click the edit button or open task and click "Edit Task"
- **Move Task**:
  - Drag using the handle (≡) on the left of each card
  - Drop in any column or position
- **Delete Task**: Click the trash icon on the task card
- **Assign Users**: Edit task and select team members
- **Add Labels**: Edit task and add custom labels
- **Set Priority**: Choose from Low, Medium, High, or Urgent
- **Set Due Date**: Pick a date from the calendar

### Project & Team Management
- **Add Team Members**: Click "Add Member" button in project header
- **Filter Tasks**: Use the filter bar to search by:
  - Text (title/description)
  - Status
  - Priority
  - Assignee
  - Due date range
  - Labels

## 📁 Project Structure

```
taskmanagementboard/
├── backend/
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controller/       # Request handlers
│   │   ├── middleware/       # Auth and validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Server entry point
│   ├── docker-compose.yml   # MongoDB container
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API service layer
│   │   ├── componets/      # React components (note: typo in folder name)
│   │   │   ├── auth/       # Login/Register components
│   │   │   ├── common/     # Reusable components
│   │   │   ├── kanban/     # Board components
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   ├── TaskDetailModal.tsx
│   │   │   │   └── FilterBar.tsx
│   │   │   └── projects/   # Project components
│   │   ├── redux/          # State management
│   │   │   ├── hooks.ts
│   │   │   ├── store.ts
│   │   │   └── slices/
│   │   │       ├── authSlice.ts
│   │   │       ├── projectSlice.ts
│   │   │       ├── boardSlice.ts
│   │   │       └── taskSlice.ts
│   │   ├── types/          # TypeScript definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     - User registration
POST   /api/auth/login        - User login
POST   /api/auth/refresh      - Refresh access token
POST   /api/auth/logout       - Logout user
```

### Projects
```
GET    /api/projects          - Get user's projects
POST   /api/projects          - Create new project
GET    /api/projects/:id      - Get project details
PUT    /api/projects/:id      - Update project
DELETE /api/projects/:id      - Delete project
POST   /api/projects/:id/members     - Add member
DELETE /api/projects/:id/members/:userId - Remove member
```

### Board & Tasks
```
GET    /api/board/:projectId/columns  - Get columns
POST   /api/board/:projectId/columns  - Create column
GET    /api/board/:projectId/tasks    - Get all tasks
POST   /api/board/:projectId/tasks    - Create task
GET    /api/board/tasks/:id           - Get task details
PUT    /api/board/tasks/:id           - Update task
DELETE /api/board/tasks/:id           - Delete task
PUT    /api/board/tasks/:id/move      - Move task
POST   /api/board/tasks/:id/comments  - Add comment
DELETE /api/board/tasks/:id/comments/:commentId - Delete comment
```

## 🐛 Known Issues & Solutions

### Common Issues
1. **Modal not showing**: Fixed by rendering at root level outside overflow containers
2. **Drag not working**: Use the drag handle (≡ icon) on the left of each task
3. **Infinite loading**: Fixed by using existing Redux state instead of fetching
4. **Resource exhaustion**: Fixed by removing unnecessary API calls in useEffect

### Browser Compatibility
- Chrome: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Edge: ✅ Fully supported

## 🚀 Performance Optimizations

- **No unnecessary API calls**: Tasks are loaded once with the board
- **Efficient drag-and-drop**: Using @dnd-kit for optimal performance
- **Redux state management**: Centralized state prevents prop drilling
- **Vite build system**: Fast HMR and optimized production builds

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Protected Routes**: Middleware validation
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Parameterized queries with Mongoose

## 📈 Future Enhancements

- [ ] WebSocket support for real-time collaboration
- [ ] File attachments for tasks
- [ ] Email notifications
- [ ] Task templates
- [ ] Time tracking
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Export to CSV/PDF
- [ ] Calendar view
- [ ] Gantt chart view
- [ ] Slack/Discord integration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer Notes

### Testing the Application
1. **Create multiple projects** to test project switching
2. **Add team members** to test collaboration features
3. **Create tasks with different priorities** to see color coding
4. **Set various due dates** to test date formatting
5. **Drag tasks between columns** to test drag-and-drop
6. **Use filters** to test search functionality

### Development Tips
- Run `npm run dev` in frontend for hot reload
- Backend uses nodemon for auto-restart
- Check browser console for debugging
- Redux DevTools extension recommended
- MongoDB Compass for database inspection

## 📧 Support

For issues, questions, or suggestions, please open an issue in the GitHub repository.

---

Built with ❤️ using React, TypeScript, and Node.js