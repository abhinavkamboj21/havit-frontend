import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { initializeGoogleAuth, cleanupGoogleContainers } from '../utils/googleAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  // Get verification message from location state
  // const verificationMessage = (location.state as any)?.message;

  // Clean up any stray Google buttons when component mounts
  useEffect(() => {
    cleanupGoogleContainers();
  }, []);

  // Initialize Google button when Google tab is selected
  useEffect(() => {
    if (authMethod === 'google') {
      const initGoogleButton = async () => {
        try {
          await initializeGoogleAuth();
          
          // Initialize Google Sign-In
          window.google.accounts.id.initialize({
            client_id: '892033335017-gjlqssdvv999hut26f7fmfpn1ct5ss3h.apps.googleusercontent.com',
            callback: async (response: any) => {
              try {
                console.log('🎉 Google OAuth response received:', response);
                console.log('📝 Response credential:', response.credential ? 'Present' : 'Missing');
                
                if (response.credential) {
                  console.log('🔐 Calling googleLogin with credential...');
                  await googleLogin(response.credential);
                  console.log('✅ Google login successful, navigating to:', from);
                  navigate(from, { replace: true });
                } else {
                  console.error('❌ No credential received from Google');
                  setError('No credential received from Google');
                }
              } catch (error: any) {
                console.error('❌ Google login error in callback:', error);
                setError(`Google authentication failed: ${error.message || 'Unknown error'}`);
              }
            },
          });

          // Render the button after a short delay to ensure DOM is ready
          setTimeout(() => {
            const buttonContainer = document.getElementById('google-signin-button');
            if (buttonContainer) {
              window.google.accounts.id.renderButton(buttonContainer, {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: 300,
              });
            }
          }, 100);
        } catch (error) {
          console.error('Failed to initialize Google button:', error);
        }
      };

      initGoogleButton();
    }
  }, [authMethod, googleLogin, navigate, from]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Clear any auth redirect message before attempting login
      if (sessionStorage.getItem('authRedirectMessage')) {
        sessionStorage.removeItem('authRedirectMessage');
      }
      await login(email, password);
      // Note: ProfileGuard will handle redirect to onboarding if profile is incomplete
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      // If backend redirected us here with a message
      const redirectMsg = sessionStorage.getItem('authRedirectMessage');
      if (redirectMsg) {
        setError(redirectMsg);
        sessionStorage.removeItem('authRedirectMessage');
      }
    } finally {
      setIsLoading(false);
    }
  };









  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-morning-600 hover:text-cyan-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-display font-bold text-morning-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-morning-600">
            Sign in to continue your morning journey
          </p>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex space-x-1 bg-morning-100 p-1 rounded-lg">
          <button
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'email'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-morning-600 hover:text-morning-900'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setAuthMethod('google')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'google'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-morning-600 hover:text-morning-900'
            }`}
          >
            Google
          </button>
        </div>

        <div className="card">
          {/* TODO: Re-enable when email verification is implemented */}
          {/* {verificationMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>{verificationMessage}</span>
              </div>
              <p className="text-sm mt-2">
                <Link to="/verify-email" className="text-blue-600 hover:text-blue-700 underline">
                  Didn't receive the email? Click here to resend.
                </Link>
              </p>
            </div>
          )} */}
          
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-morning-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-morning-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-morning-400 hover:text-morning-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-morning-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-morning-700">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-cyan-600 hover:text-cyan-500">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}



          {authMethod === 'google' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-morning-600 mb-6">
                  Sign in quickly and securely with your Google account
                </p>
              </div>

              {/* Google Sign-In Button Container */}
              <div id="google-signin-button" className="flex justify-center"></div>

              <div className="text-center text-sm text-morning-600">
                Click the Google button above to sign in
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-morning-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-600 hover:text-cyan-500 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 