import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DocumentViewer from './pages/DocumentViewer';
import Library from './pages/Library';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Quizzes from './pages/Quizzes';
import Bookmarks from './pages/Bookmarks';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import Flashcards from './pages/Flashcards';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading EduMind...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-500">Loading EduMind...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        {/* Default route based on role */}
        <Route index element={
          !user ? <Navigate to="/login" /> :
          user.role === 'student' ? <Navigate to="/student" /> :
          user.role === 'faculty' ? <Navigate to="/faculty" /> :
          <Navigate to="/admin" />
        } />

        <Route path="/dashboard" element={
          !user ? <Navigate to="/login" /> :
          user.role === 'student' ? <Navigate to="/student" /> :
          user.role === 'faculty' ? <Navigate to="/faculty" /> :
          <Navigate to="/admin" />
        } />

        <Route path="/student/*" element={
          <PrivateRoute allowedRoles={['student']}>
            <StudentDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/faculty/*" element={
          <PrivateRoute allowedRoles={['faculty', 'admin']}>
            <FacultyDashboard />
          </PrivateRoute>
        } />

        <Route path="/bookmarks" element={
          <PrivateRoute>
            <Bookmarks />
          </PrivateRoute>
        } />
        <Route path="/leaderboard" element={
          <PrivateRoute>
            <Leaderboard />
          </PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute allowedRoles={['student']}>
            <History />
          </PrivateRoute>
        } />
        <Route path="/flashcards" element={
          <PrivateRoute allowedRoles={['student', 'faculty', 'researcher']}>
            <Flashcards />
          </PrivateRoute>
        } />
        <Route path="/admin/*" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute allowedRoles={['student', 'faculty', 'admin']}>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/document/:docId" element={
          <PrivateRoute>
            <DocumentViewer />
          </PrivateRoute>
        } />

        <Route path="/library" element={
          <PrivateRoute>
            <Library />
          </PrivateRoute>
        } />

        <Route path="/quizzes" element={
          <PrivateRoute allowedRoles={['student']}>
            <Quizzes />
          </PrivateRoute>
        } />
        
        <Route path="/upload" element={
          <PrivateRoute allowedRoles={['faculty', 'admin']}>
            <Upload />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
