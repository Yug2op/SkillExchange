import { Suspense } from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import LoginPage from './pages/auth/Login.jsx';
import RegisterPage from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MeProfile from './pages/profile/Me.jsx';
import { useMe } from '@/hooks/useMe';
import { useLogout } from '@/hooks/useLogout';
import ChangePassword from './pages/auth/ChangePassword.jsx';
import SearchUsersPage from './pages/users/Search.jsx';
import MatchesPage from './pages/users/Matches.jsx';
import UserDetailPage from './pages/users/UserDetail.jsx';
import RequestExchange from './pages/exchanges/RequestExchange.jsx';
import ExchangesPage from './pages/exchanges/List';
import ExchangeDetailPage from './pages/exchanges/Detail';
import ChatPage from './pages/chat';

export default function App() {
  const { data: user, isLoading: meLoading } = useMe();
  const { mutate: doLogout, isPending: loggingOut } = useLogout();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-semibold">SkillExchange</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/search">Search</Link>
            <Link to="/matches">Matches</Link>
            <Link to="/chat">Chat</Link>
            <Link to="/exchanges">Exchanges</Link>

            {!meLoading && user ? (
              <>
                <Link to="/me" className="px-3 py-1.5 rounded-md border hover:bg-accent">Profile</Link>
                <button
                  onClick={() => doLogout()}
                  disabled={loggingOut}
                  className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-60"
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <Link to="/login" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/search" element={<SearchUsersPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/exchanges/request/:id" element={<RequestExchange />} />
            <Route path="/exchanges" element={<ExchangesPage />} />
            <Route path="/exchanges/:id" element={<ExchangeDetailPage />} />

            {/* Chat Routes */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:chatId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/me"
              element={
                <ProtectedRoute>
                  <MeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<div className="p-6">404 Not Found</div>} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}