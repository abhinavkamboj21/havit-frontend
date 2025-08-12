import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { initializeGoogleAuth, cleanupGoogleContainers } from '../utils/googleAuth';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    occupation: '',
    institutionName: '',
    preferredWakeUpTime: '07:00',
    sleepChallenges: ['Hitting snooze', 'Late night scrolling']
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

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
                  console.log('✅ Google registration successful, navigating to dashboard...');
                  // Google users go directly to dashboard, ProfileGuard will handle onboarding if needed
                  navigate('/dashboard');
                } else {
                  console.error('❌ No credential received from Google');
                  setError('No credential received from Google');
                }
              } catch (error: any) {
                console.error('❌ Google registration error in callback:', error);
                setError(`Google registration failed: ${error.message || 'Unknown error'}`);
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
  }, [authMethod, googleLogin, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Prepare user data for registration (simplified API requirements)
      const userData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        preferredWakeUpTime: formData.preferredWakeUpTime,
        sleepChallenges: formData.sleepChallenges
      };

      console.log('🔄 Starting registration with data:', { ...userData, password: '[HIDDEN]' });

      // Store email for potential verification resend
      localStorage.setItem('registrationEmail', userData.email);
      
      console.log('📧 Email stored for verification:', userData.email);
      
      await register(userData);
      
      console.log('✅ Registration successful, navigating to dashboard');
      
      // TODO: Re-enable email verification when SendGrid is configured
      // For now, skip email verification and go directly to dashboard
      // ProfileGuard will handle redirect to onboarding if profile is incomplete
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Registration failed:', err);
      console.error('❌ Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // Check if it's a network error (backend not running)
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const errorMsg = 'Unable to connect to server. Please check if the backend is running and try again.';
        setError(errorMsg);
        alert(`❌ Registration Failed!\n\n${errorMsg}\n\nPlease start your backend server on port 8080 and try again.`);
      } else {
        const errorMsg = err.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        alert(`❌ Registration Failed!\n\n${errorMsg}\n\nPlease check the console for more details.`);
      }
      
      // Don't navigate anywhere on error - stay on registration page
      return;
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
          
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-display font-bold text-morning-900 mb-2">
            Join Hav-it
          </h2>
          <p className="text-morning-600">
            Create your account and start your morning transformation journey
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
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {authMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-morning-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-morning-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-morning-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10"
                    placeholder="Create a password (min 8 characters)"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-morning-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-morning-400 hover:text-morning-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              

              <button
                type="submit"
                disabled={isLoading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full flex justify-center items-center"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}



          {authMethod === 'google' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-morning-600 mb-6">
                  Sign up quickly and securely with your Google account
                </p>
              </div>

              {/* Google Sign-In Button Container */}
              <div id="google-signin-button" className="flex justify-center"></div>

              <div className="text-center text-sm text-morning-600">
                Click the Google button above to sign up
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-morning-600">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-600 hover:text-cyan-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 