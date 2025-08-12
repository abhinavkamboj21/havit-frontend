import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProfileGuardProps {
  children: React.ReactNode;
}

const ProfileGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isProfileComplete, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🛡️ ProfileGuard check:', {
      isAuthenticated,
      loading,
      isProfileComplete,
      pathname: location.pathname,
      user: user ? {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        city: user.city,
        occupation: user.occupation
      } : null
    });

    // Only redirect if user is authenticated, not loading, and profile is incomplete
    // Also don't redirect if already on onboarding page
    if (
      isAuthenticated && 
      !loading && 
      !isProfileComplete && 
      location.pathname !== '/onboarding'
    ) {
      console.log('🔄 Profile incomplete, redirecting to onboarding...');
      navigate('/onboarding', { replace: true });
    } else if (isAuthenticated && !loading && isProfileComplete) {
      console.log('✅ Profile complete, staying on current page');
    }
  }, [isAuthenticated, loading, isProfileComplete, location.pathname, navigate, user]);

  // Show loading while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // If authenticated and profile is incomplete, don't render the children
  // (user will be redirected to onboarding)
  if (isAuthenticated && !isProfileComplete && location.pathname !== '/onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Render children if profile is complete or on onboarding page
  return <>{children}</>;
};

export default ProfileGuard;