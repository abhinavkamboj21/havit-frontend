import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { smsAPI } from '../utils/api';
import { User, Phone, Calendar, MapPin, Briefcase, Building, MessageSquare, CheckCircle, RotateCcw } from 'lucide-react';

const OnboardingPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    occupation: '',
    institutionName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // SMS Verification states
  const [smsVerification, setSmsVerification] = useState({
    sent: false,
    verified: false,
    loading: false,
    code: '',
    error: '',
    cooldown: 0
  });
  
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Pre-fill data from existing user profile
  useState(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: '',
        gender: '',
        city: '',
        occupation: '',
        institutionName: ''
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format phone number automatically
    if (name === 'phoneNumber') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length === 10 && /^[6-9]\d{9}$/.test(formattedValue)) {
        formattedValue = `+91${formattedValue}`;
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      
      // Reset SMS verification if phone number changes
      if (name === 'phoneNumber') {
        setSmsVerification({
          sent: false,
          verified: false,
          loading: false,
          code: '',
          error: '',
          cooldown: 0
        });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // SMS Verification functions
  const sendSMSVerification = async () => {
    if (!formData.phoneNumber || formData.phoneNumber.length < 13) {
      setSmsVerification(prev => ({
        ...prev,
        error: 'Please enter a valid 10-digit phone number'
      }));
      return;
    }

    setSmsVerification(prev => ({
      ...prev,
      loading: true,
      error: ''
    }));

    try {
      console.log('📱 Sending SMS verification to:', formData.phoneNumber);
      const response = await smsAPI.sendSMSVerification(formData.phoneNumber);
      console.log('✅ SMS sent successfully:', response);

      setSmsVerification(prev => ({
        ...prev,
        sent: true,
        loading: false,
        cooldown: 60 // 60 second cooldown
      }));

      // Start cooldown timer
      const timer = setInterval(() => {
        setSmsVerification(prev => {
          if (prev.cooldown <= 1) {
            clearInterval(timer);
            return { ...prev, cooldown: 0 };
          }
          return { ...prev, cooldown: prev.cooldown - 1 };
        });
      }, 1000);

    } catch (error: any) {
      console.error('❌ SMS sending failed:', error);
      setSmsVerification(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to send SMS. Please try again.'
      }));
    }
  };

  const verifySMSCode = async () => {
    if (!smsVerification.code || smsVerification.code.length !== 6) {
      setSmsVerification(prev => ({
        ...prev,
        error: 'Please enter a valid 6-digit code'
      }));
      return;
    }

    setSmsVerification(prev => ({
      ...prev,
      loading: true,
      error: ''
    }));

    try {
      console.log('🔍 Verifying SMS code:', smsVerification.code);
      const response = await smsAPI.verifySMSCode(formData.phoneNumber, smsVerification.code);
      console.log('✅ SMS verification successful:', response);

      setSmsVerification(prev => ({
        ...prev,
        verified: true,
        loading: false
      }));

    } catch (error: any) {
      console.error('❌ SMS verification failed:', error);
      setSmsVerification(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Invalid code. Please try again.'
      }));
    }
  };

  const handleSMSCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
    setSmsVerification(prev => ({
      ...prev,
      code,
      error: ''
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          setError('Full name is required');
          return false;
        }
        if (!formData.phoneNumber.trim()) {
          setError('Phone number is required');
          return false;
        }
        // TODO: Re-enable SMS verification when Twilio keys are ready
        // if (!smsVerification.verified) {
        //   setError('Please verify your phone number before proceeding');
        //   return false;
        // }
        break;
      case 2:
        if (!formData.dateOfBirth) {
          setError('Date of birth is required');
          return false;
        }
        if (!formData.gender) {
          setError('Gender is required');
          return false;
        }
        if (!formData.city.trim()) {
          setError('City is required');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Import and use the centralized API function
      const { authAPI } = await import('../utils/api');
      
      console.log('✅ Updating profile with data:', formData);
      await authAPI.updateProfile(formData);
      console.log('✅ Profile updated successfully');
      
      // Refresh user data
      await refreshUser();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Profile update error:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-morning-900 mb-2">
          👋 Let's get to know you!
        </h2>
        <p className="text-morning-600">
          Help us personalize your morning journey
        </p>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-morning-700 mb-2">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-morning-700 mb-2">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="9876543210"
            maxLength={10}
            required
          />
        </div>
        <p className="text-xs text-morning-500 mt-1">
          🇮🇳 Enter 10-digit number (we'll add +91 automatically)
        </p>
        
        {/* SMS Verification Section - TEMPORARILY DISABLED */}
        {formData.phoneNumber && formData.phoneNumber.length >= 13 && (
          <div className="mt-4 space-y-3">
            {/* TODO: Re-enable SMS verification when Twilio keys are ready */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                📱 Phone verification temporarily disabled. You can proceed without verification.
              </p>
            </div>
          </div>
        )}
        
        {/* COMMENTED OUT - Original SMS Verification UI */}
        {false && formData.phoneNumber && formData.phoneNumber.length >= 13 && (
          <div className="mt-4 space-y-3">
            {!smsVerification.sent ? (
              <button
                type="button"
                onClick={sendSMSVerification}
                disabled={smsVerification.loading}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{smsVerification.loading ? 'Sending...' : 'Send Verification Code'}</span>
              </button>
            ) : (
              <div className="space-y-3">
                {!smsVerification.verified ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700 mb-2">
                        📱 Verification code sent to {formData.phoneNumber}
                      </p>
                      <div className="relative">
                        <input
                          type="text"
                          value={smsVerification.code}
                          onChange={handleSMSCodeChange}
                          className="input-field text-center text-lg tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={verifySMSCode}
                        disabled={smsVerification.loading || smsVerification.code.length !== 6}
                        className="flex-1 btn-primary flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{smsVerification.loading ? 'Verifying...' : 'Verify Code'}</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={sendSMSVerification}
                        disabled={smsVerification.loading || smsVerification.cooldown > 0}
                        className="px-4 py-2 text-sm text-cyan-600 hover:text-cyan-700 disabled:text-gray-400"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {smsVerification.cooldown > 0 ? `${smsVerification.cooldown}s` : 'Resend'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Phone number verified! ✅</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {smsVerification.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {smsVerification.error}
              </div>
            )}
          </div>
        )}
      </div>

      
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-morning-900 mb-2">
          📍 Tell us more about you
        </h2>
        <p className="text-morning-600">
          This helps us customize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-morning-700 mb-2">
            Date of Birth *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-morning-700 mb-2">
            Gender *
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-morning-700 mb-2">
          City *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="Enter your city"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="occupation" className="block text-sm font-medium text-morning-700 mb-2">
          Occupation
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
          <input
            id="occupation"
            name="occupation"
            type="text"
            value={formData.occupation}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="Your profession"
          />
        </div>
      </div>

      <div>
        <label htmlFor="institutionName" className="block text-sm font-medium text-morning-700 mb-2">
          Institution/Company
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-morning-400" />
          <input
            id="institutionName"
            name="institutionName"
            type="text"
            value={formData.institutionName}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="Where do you work/study?"
          />
        </div>
      </div>


    </div>
  );

  return (
    <div className="min-h-screen bg-morning-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-cyan-500' : 'bg-gray-300'}`} />
          <div className={`w-8 h-1 ${currentStep > 1 ? 'bg-cyan-500' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-cyan-500' : 'bg-gray-300'}`} />
        </div>

        <div className="card">
          <form onSubmit={currentStep === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}

            <div className="flex justify-between mt-8 pt-6 border-t border-morning-100">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn-secondary"
                >
                  Previous
                </button>
              )}
              
              <div className="ml-auto">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`btn-primary ${currentStep === 1 ? 'w-full' : ''}`}
                >
                  {isLoading ? 'Saving...' : currentStep === 2 ? 'Complete Setup' : 'Next'}
                </button>
                {/* TODO: Re-enable when Twilio is ready */}
                {/* {currentStep === 1 && !smsVerification.verified && formData.phoneNumber && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Please verify your phone number to continue
                  </p>
                )} */}
              </div>
            </div>
          </form>
        </div>

        <div className="text-center text-sm text-morning-600">
          Step {currentStep} of 2
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;