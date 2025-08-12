import { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetAPI } from '../utils/api';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('📧 Requesting password reset for:', email);
      const response = await passwordResetAPI.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        setMessage(response.message || 'Password reset email sent successfully! Please check your inbox.');
      } else {
        setError(response.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Failed to send reset email:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setSuccess(false);
    setMessage('');
    setError('');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-morning-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-cyan-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-morning-900 mb-2">
              Reset Your Password
            </h2>
            
            <p className="text-morning-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-morning-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-morning-900 mb-2">
                  Reset Link Sent! 📧
                </h3>
                <p className="text-morning-600 mb-4">
                  {message}
                </p>
                <p className="text-sm text-morning-500">
                  If you don't see the email in your inbox, please check your spam folder.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleTryAgain}
                  className="btn-secondary w-full"
                >
                  Send to Different Email
                </button>
                
                <Link
                  to="/login"
                  className="btn-outline w-full text-center inline-block"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-morning-100">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link
                to="/login"
                className="flex items-center space-x-1 text-morning-600 hover:text-morning-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
              
              <span className="text-morning-300">|</span>
              
              <Link
                to="/register"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-morning-500">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-cyan-600 hover:text-cyan-700 font-medium underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;