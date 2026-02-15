import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components
import { Register } from './componets/register/Registercart';
import { Login } from './componets/login/logincart';
import ProjectList from './componets/projects/ProjectList';
import { ProtectedRoute } from './componets/auth/ProtectedRoute';
import { NavigationProvider } from './componets/NavigationProvider';
import { KanbanBoard } from './componets/kanban/KanbanBoard';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useAppSelector } from './redux/hooks';

// Layout component with navigation
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const handleLogout = async () => {
    const { logout } = await import('./redux/slices/authSlice');
    const { store } = await import('./redux/store');
    await store.dispatch(logout());
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Task Management Board</h1>
            {user && (
              <span className="text-sm opacity-90">Welcome, {user.name}</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    </>
  );
};

// App Router component
const AppRouter: React.FC = () => {
  // Initialize authentication on mount
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NavigationProvider>
        <MainLayout>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/projects" replace />
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-screen">
                    <Login />
                    <p className="mt-4 text-gray-600">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-blue-600 hover:underline">
                        Register here
                      </Link>
                    </p>
                  </div>
                )
              }
            />

            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/projects" replace />
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-screen">
                    <Register />
                    <p className="mt-4 text-gray-600">
                      Already have an account?{' '}
                      <Link to="/login" className="text-blue-600 hover:underline">
                        Login here
                      </Link>
                    </p>
                  </div>
                )
              }
            />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/board/:projectId" element={<KanbanBoard />} />
              {/* Add more protected routes here as needed */}
              {/* <Route path="/projects/:id" element={<ProjectDetail />} /> */}
            </Route>

            {/* Default route */}
            <Route
              path="/"
              element={
                <Navigate to={isAuthenticated ? "/projects" : "/login"} replace />
              }
            />

            {/* 404 route */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Page not found</p>
                    <Link to="/" className="text-blue-600 hover:underline">
                      Go to home
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </MainLayout>
      </NavigationProvider>
    </BrowserRouter>
  );
};

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <AppRouter />
    </>
  );
}

export default App;