import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChallengeProvider } from './context/ChallengeContext';
import Navbar from './components/Navbar.tsx';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ChallengePage from './pages/ChallengePage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
// import AchievementsPage from './pages/AchievementsPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import EmailVerificationPage from './pages/EmailVerificationPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import WithdrawalPage from './pages/WithdrawalPage.tsx';
import WalletTransactionsPage from './pages/WalletTransactionsPage.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ProfileGuard from './components/ProfileGuard.tsx';

function App() {
  return (
    <AuthProvider>
      <ChallengeProvider>
        <Router>
          <div className="min-h-screen bg-morning-50 dark:bg-morning-900 dark:text-morning-50">
            <Navbar />
            <div className="mx-auto w-full max-w-5xl px-3 sm:px-4 md:px-6 lg:px-8">
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Email and Password Routes */}
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ProfileGuard>
                    <DashboardPage />
                  </ProfileGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/challenge" 
              element={
                <ProtectedRoute>
                  <ProfileGuard>
                    <ChallengePage />
                  </ProfileGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <ProfileGuard>
                    <SettingsPage />
                  </ProfileGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileGuard>
                    <ProfilePage />
                  </ProfileGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/withdraw" 
              element={
                <ProtectedRoute>
                  <ProfileGuard>
                    <WithdrawalPage />
                  </ProfileGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wallet/transactions" 
              element={
                <ProtectedRoute>
                  <ProfileGuard>
                    <WalletTransactionsPage />
                  </ProfileGuard>
                </ProtectedRoute>
              } 
            />
            {/* Achievements route temporarily disabled */}
            {/* <Route 
              path="/achievements" 
              element={
                <ProtectedRoute>
                  <ProfileGuard>
                    <AchievementsPage />
                  </ProfileGuard>
                </ProtectedRoute>
              } 
            /> */}
          </Routes>
            </div>
        </div>
      </Router>
      </ChallengeProvider>
    </AuthProvider>
  );
}

export default App;
