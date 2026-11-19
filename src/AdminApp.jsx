import { Navigate, Route, Routes } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import ResetPassword from './pages/admin/ResetPassword';
import Dashboard from './pages/admin/Dashboard';
import AdminLandingPage from './pages/admin/AdminLandingPage';
import AdminPortfolio from './pages/admin/AdminPortfolio';
import ProjectForm from './pages/admin/ProjectForm';
import AdminBlog from './pages/admin/AdminBlog';
import BlogForm from './pages/admin/BlogForm';
import AdminMessages from './pages/admin/AdminMessages';
import Settings from './pages/admin/Settings';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route
        path="dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="landing-page"
        element={<ProtectedRoute><AdminLandingPage /></ProtectedRoute>}
      />
      <Route
        path="portfolio/new"
        element={<ProtectedRoute><ProjectForm key="new" /></ProtectedRoute>}
      />
      <Route
        path="portfolio/edit/:id"
        element={<ProtectedRoute><ProjectForm key="edit" /></ProtectedRoute>}
      />
      <Route
        path="portfolio"
        element={<ProtectedRoute><AdminPortfolio key="list" /></ProtectedRoute>}
      />
      <Route
        path="blog/new"
        element={<ProtectedRoute><BlogForm key="new" /></ProtectedRoute>}
      />
      <Route
        path="blog/edit/:id"
        element={<ProtectedRoute><BlogForm key="edit" /></ProtectedRoute>}
      />
      <Route
        path="blog"
        element={<ProtectedRoute><AdminBlog key="list" /></ProtectedRoute>}
      />
      <Route
        path="messages"
        element={<ProtectedRoute><AdminMessages /></ProtectedRoute>}
      />
      <Route
        path="settings"
        element={<ProtectedRoute><Settings /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
