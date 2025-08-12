import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, DollarSign, Calendar, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const ChallengePage = () => {
  const { user } = useAuth();
  const [wakeTime, setWakeTime] = useState('06:00');
  const [forfeitAmount, setForfeitAmount] = useState('20');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const forfeitOptions = [
    { value: '10', label: '₹10' },
    { value: '20', label: '₹20' },
    { value: '50', label: '₹50' },
    { value: '100', label: '₹100' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setIsLoading(false);
    }, 2000);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-morning-900 mb-4">
            Challenge Set Successfully!
          </h2>
          <p className="text-morning-600 mb-6">
            Your wake-up challenge for tomorrow has been set. Good luck!
          </p>
          <div className="bg-cyan-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-morning-700">Wake-up Time:</span>
              <span className="font-semibold text-morning-900">{wakeTime}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-morning-700">Forfeit Amount:</span>
              <span className="font-semibold text-morning-900">₹{forfeitAmount}</span>
            </div>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="btn-primary"
          >
            Set Another Challenge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-morning-900 mb-4">
          Set Your Challenge
        </h1>
        <p className="text-morning-600">
          Choose your wake-up time and forfeit amount for tomorrow
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Wake-up Time */}
          <div>
            <label className="block text-sm font-medium text-morning-700 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-cyan-600" />
                <span>Wake-up Time</span>
              </div>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="input-field text-center text-lg"
                  min="05:00"
                  max="11:00"
                  required
                />
                <p className="text-sm text-morning-600 mt-2">
                  Choose between 5:00 AM - 11:00 AM
                </p>
              </div>
              <div className="bg-morning-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-warning-600" />
                  <span className="text-sm font-medium text-morning-900">Important</span>
                </div>
                <p className="text-xs text-morning-600">
                  You have a 5-minute grace period after your set time to check in
                </p>
              </div>
            </div>
          </div>

          {/* Forfeit Amount */}
          <div>
            <label className="block text-sm font-medium text-morning-700 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-cyan-600" />
                <span>Forfeit Amount</span>
              </div>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {forfeitOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForfeitAmount(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    forfeitAmount === option.value
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-morning-200 bg-white text-morning-700 hover:border-cyan-300'
                  }`}
                >
                  <span className="text-lg font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-morning-600 mt-2">
              This amount will be deducted if you miss your wake-up time
            </p>
          </div>

          {/* Challenge Summary */}
          <div className="bg-gradient-to-r from-cyan-50 to-morning-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-morning-900 mb-4">
              Challenge Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-morning-700">Wake-up Time:</span>
                <span className="font-semibold text-morning-900">{wakeTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-morning-700">Forfeit Amount:</span>
                <span className="font-semibold text-morning-900">₹{forfeitAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-morning-700">Grace Period:</span>
                <span className="font-semibold text-morning-900">5 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-morning-700">Current Balance:</span>
                <span className="font-semibold text-cyan-600">₹{user?.balance || 0}</span>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-morning-50 rounded-lg p-4">
            <h4 className="font-medium text-morning-900 mb-3">Challenge Rules:</h4>
            <ul className="text-sm text-morning-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>You must check in within 5 minutes of your wake-up time</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>If you succeed, you'll earn money from others who failed</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>If you fail, your forfeit amount will be distributed to successful participants</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>You can withdraw your earnings anytime</span>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {isLoading ? (
              'Setting Challenge...'
            ) : (
              <>
                Set Challenge for Tomorrow
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChallengePage; 