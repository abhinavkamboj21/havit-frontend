import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { emailAPI } from '../utils/api';
import { CheckCircle, XCircle, Mail, RotateCcw, ArrowRight } from 'lucide-react';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      console.log('🔄 Verifying email with token:', token);
      const response = await emailAPI.verifyEmail(token);
      
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Email verified successfully! Welcome to Hav-it! 🎉');
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Email verified! Please login to continue.' }
          });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.error || 'Email verification failed.');
      }
    } catch (error: any) {
      console.error('❌ Email verification failed:', error);
      setStatus('error');
      setMessage(error.message || 'Verification failed. Please try again.');
    }
  };

  const resendEmail = async () => {
    const email = localStorage.getItem('registrationEmail');
    if (!email) {
      alert('Registration email not found. Please register again.');
      navigate('/register');
      return;
    }

    setLoading(true);
    try {
      console.log('📧 Resending verification email to:', email);
      const response = await emailAPI.resendVerification(email);
      
      if (response.success) {
        alert(response.message || 'Verification email sent successfully! Please check your inbox.');
      } else {
        alert(response.error || 'Failed to resend email. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Failed to resend email:', error);
      alert(error.message || 'Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleBackToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-morning-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-cyan-600 animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-morning-900 mb-4">
                Verifying Your Email
              </h2>
              
              <p className="text-morning-600 mb-6">
                Please wait while we verify your email address...
              </p>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-morning-900 mb-4">
                Email Verified! 🎉
              </h2>
              
              <p className="text-morning-600 mb-6">
                {message}
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-morning-500">
                  Redirecting to login in 3 seconds...
                </p>
                
                <button
                  onClick={handleBackToLogin}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <span>Continue to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-morning-900 mb-4">
                Verification Failed
              </h2>
              
              <p className="text-morning-600 mb-6">
                {message}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={resendEmail}
                  disabled={loading}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Sending...' : 'Resend Verification Email'}</span>
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleBackToLogin}
                    className="btn-outline flex-1"
                  >
                    Back to Login
                  </button>
                  
                  <button
                    onClick={handleBackToRegister}
                    className="btn-outline flex-1"
                  >
                    Register Again
                  </button>
                </div>
              </div>
            </>
          )}
          
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-morning-500">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={resendEmail}
              disabled={loading}
              className="text-cyan-600 hover:text-cyan-700 font-medium underline"
            >
              {loading ? 'sending...' : 'resend verification email'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;