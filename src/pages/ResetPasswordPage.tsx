import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { passwordResetAPI } from '../utils/api';
import { Lock, CheckCircle, XCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      verifyToken(resetToken);
    } else {
      setTokenValid(false);
      setMessage('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const verifyToken = async (resetToken: string) => {
    try {
      console.log('🔍 Verifying reset token:', resetToken);
      const response = await passwordResetAPI.verifyResetToken(resetToken);
      
      if (response.success && response.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setMessage(response.message || 'Reset link is invalid or has expired.');
      }
    } catch (error: any) {
      console.error('❌ Token verification failed:', error);
      setTokenValid(false);
      setMessage('Invalid reset link. Please request a new password reset.');
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 5) {
      return 'Password must be at least 5 characters long';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 Resetting password with token:', token);
      const response = await passwordResetAPI.resetPassword(token, newPassword, confirmPassword);
      
      if (response.success) {
        setSuccess(true);
        setMessage(response.message || 'Password reset successfully! You can now login with your new password.');
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password reset successfully! Please login with your new password.' }
          });
        }, 3000);
      } else {
        setError(response.error || 'Password reset failed. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Password reset failed:', error);
      setError(error.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while verifying token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-morning-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-cyan-600 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-morning-900 mb-4">
              Verifying Reset Link
            </h2>
            
            <p className="text-morning-600 mb-6">
              Please wait while we verify your password reset link...
            </p>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-morning-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-morning-900 mb-4">
              Invalid Reset Link
            </h2>
            
            <p className="text-morning-600 mb-6">
              {message}
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="btn-primary w-full text-center inline-block"
              >
                Request New Reset Link
              </Link>
              
              <Link
                to="/login"
                className="btn-outline w-full text-center inline-block"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-morning-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-morning-900 mb-4">
              Password Reset Successfully! 🎉
            </h2>
            
            <p className="text-morning-600 mb-6">
              {message}
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-morning-500">
                Redirecting to login in 3 seconds...
              </p>
              
              <Link
                to="/login"
                className="btn-primary w-full text-center inline-block"
              >
                Continue to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-morning-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-cyan-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-morning-900 mb-2">
              Create New Password
            </h2>
            
            <p className="text-morning-600">
              Enter your new password below. Make sure it's at least 5 characters long.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-morning-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min 5 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field w-full pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-morning-400 hover:text-morning-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${newPassword.length >= 5 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={newPassword.length >= 5 ? 'text-green-600' : 'text-gray-500'}>
                      At least 5 characters
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-morning-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field w-full pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-morning-400 hover:text-morning-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password match indicator */}
              {confirmPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${newPassword === confirmPassword ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}>
                      {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || newPassword !== confirmPassword || newPassword.length < 5}
              className="btn-primary w-full"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-morning-100 text-center">
            <Link
              to="/login"
              className="text-morning-600 hover:text-morning-700 text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;