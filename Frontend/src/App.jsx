import { Suspense, useEffect, lazy } from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';

// ✅ Lazy load all pages - only load when needed
const Home = lazy(() => import('./pages/Home.jsx'));
const LoginPage = lazy(() => import('./pages/auth/Login.jsx'));
const RegisterPage = lazy(() => import('./pages/auth/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail.jsx'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword.jsx'));

// User pages
const SearchUsersPage = lazy(() => import('./pages/users/Search.jsx'));
const MatchesPage = lazy(() => import('./pages/users/Matches.jsx'));
const UserDetailPage = lazy(() => import('./pages/users/UserDetail.jsx'));

// Exchange pages
const RequestExchange = lazy(() => import('./pages/exchanges/RequestExchange.jsx'));
const ExchangesPage = lazy(() => import('./pages/exchanges/List.jsx'));
const ExchangeDetailPage = lazy(() => import('./pages/exchanges/Detail.jsx'));

// Review pages
const ReviewsListPage = lazy(() => import('./pages/reviews/List.jsx'));
const ReviewDetailPage = lazy(() => import('./pages/reviews/Detail.jsx'));
const CreateReviewPage = lazy(() => import('./pages/reviews/Create.jsx'));

// Profile pages
const MeProfile = lazy(() => import('./pages/profile/Me.jsx'));
const EditProfile = lazy(() => import('./pages/profile/Editprofile.jsx'));

// Chat pages
const ChatPage = lazy(() => import('./pages/chat/index.jsx'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement.jsx'));
const SkillsManagement = lazy(() => import('./pages/admin/SkillsManagement.jsx'));

// Other pages
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));

// ✅ Keep these core components eagerly loaded (not lazy)
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Navbar from './components/Navbar.jsx';
import { ChatProvider } from './contexts/ChatContext.jsx';
import { useMe } from '@/hooks/useMe';
import { useLogout } from '@/hooks/useLogout';
import { useTheme } from './hooks/useTheme.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';

export default function App() {
  const { data: user, isLoading: meLoading } = useMe();
  const { mutate: doLogout, isPending: loggingOut } = useLogout();
  useTheme();

  return (
    <ErrorBoundary>
      <ChatProvider>
        <div className="min-h-dvh bg-background text-foreground">
          <header>
            {/* Only show Navbar when user is authenticated or loading */}
            {<Navbar />}
          </header>

          <main className='overflow-x-hidden'>
            <Suspense 
              fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading page...</span>
                </div>
              }
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* User Routes */}
                <Route path="/search" element={<SearchUsersPage />} />
                <Route path="/matches" element={<MatchesPage />} />
                <Route path="/users/:id" element={<UserDetailPage />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Exchange Routes */}
                <Route path="/exchanges/request/:id" element={<RequestExchange />} />
                <Route path="/exchanges" element={<ExchangesPage />} />
                <Route path="/exchanges/:id" element={<ExchangeDetailPage />} />

                {/* Review Routes */}
                <Route path="/reviews" element={<ReviewsListPage />} />
                <Route path="/reviews/create/:exchangeId" element={<CreateReviewPage />} />
                <Route path="/reviews/:id" element={<ReviewDetailPage />} />

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

                {/* Profile Routes */}
                <Route
                  path="/me"
                  element={
                    <ProtectedRoute>
                      <MeProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <ProtectedRoute>
                      <EditProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Settings & Notifications */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path='/admin/dashboard'
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path='/admin/users'
                  element={
                    <AdminRoute>
                      <UserManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path='/admin/skills'
                  element={
                    <AdminRoute>
                      <SkillsManagement />
                    </AdminRoute>
                  }
                />

                {/* Error Routes */}
                <Route path="/404" element={<div className="p-6">404 Not Found</div>} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </ChatProvider>
    </ErrorBoundary>
  );
}