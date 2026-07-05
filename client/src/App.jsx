import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import FlipcardListPage from './pages/FlipcardListPage';
import FlipcardCreatePage from './pages/FlipcardCreatePage';
import FlipcardPlayPage from './pages/FlipcardPlayPage';

// Strip the trailing slash Vite adds to BASE_URL ("/oxaenglish/" -> "/oxaenglish");
// an empty string here correctly means "no prefix" for local dev.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flipcard"
                element={
                  <ProtectedRoute>
                    <FlipcardListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flipcard/new"
                element={
                  <ProtectedRoute>
                    <FlipcardCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flipcard/:id"
                element={
                  <ProtectedRoute>
                    <FlipcardPlayPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
