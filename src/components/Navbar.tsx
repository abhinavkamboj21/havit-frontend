import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChallenge } from '../context/ChallengeContext';
import { Sun, User, LogOut, Menu, X, ChevronDown, Settings, Plus, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

// Helper function to get local date (timezone-aware)
const getLocalDate = () => {
  const now = new Date();
  return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

const Navbar = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const { createChallenge, loading } = useChallenge();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  // Create Challenge Modal State
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    date: '',
    wakeUpTime: '07:00',
    forfeitAmount: 25
  });

  // Initialize form with tomorrow's date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowLocalDate = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setChallengeForm(prev => ({
      ...prev,
      date: tomorrowLocalDate
    }));
  }, []);

  // Handle Create Challenge
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Pre-validate wallet balance
      if (!user || user.balance <= 50) {
        alert(`Insufficient balance! You need at least ₹50 to create challenges.\n\nCurrent Balance: ₹${user?.balance || 0}\nRequired: ₹50\n\nPlease add funds to your wallet first.`);
        setShowCreateChallenge(false);
        return;
      }

      if (challengeForm.forfeitAmount > user.balance) {
        alert(`Forfeit amount (₹${challengeForm.forfeitAmount}) exceeds your available balance (₹${user.balance}).\n\nPlease reduce the forfeit amount or add more funds to your wallet.`);
        return;
      }

      console.log('💰 Pre-validation passed - Creating challenge with forfeit deduction...');
      console.log(`Current Balance: ₹${user.balance}, Forfeit: ₹${challengeForm.forfeitAmount}`);

      await createChallenge(
        challengeForm.date, 
        challengeForm.wakeUpTime, 
        challengeForm.forfeitAmount
      );
      
      // Show success message with forfeit deduction info
      alert(`🎯 Challenge created successfully!\n\n💰 Forfeit amount (₹${challengeForm.forfeitAmount}) has been deducted from your wallet.\n\nYour challenge is now active. Good luck!`);
      
      // Refresh user balance immediately
      console.log('🔄 Refreshing user balance after challenge creation...');
      await refreshUser();
      
      setShowCreateChallenge(false);
      // Reset form
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowLocalDate = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      setChallengeForm({
        date: tomorrowLocalDate,
        wakeUpTime: '07:00',
        forfeitAmount: 25
      });
    } catch (error: any) {
      console.error('❌ Challenge creation failed:', error);
      
      // Handle specific wallet-related errors
      if (error.message?.includes('Insufficient balance')) {
        alert(`❌ ${error.message}\n\nPlease add funds to your wallet and try again.`);
        setShowCreateChallenge(false);
      } else if (error.message?.includes('exceeds available balance')) {
        alert(`❌ ${error.message}\n\nPlease reduce the forfeit amount or add more funds.`);
      } else {
        alert(`❌ Failed to create challenge: ${error.message}\n\nPlease try again.`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      setIsUserDropdownOpen(false);
      
      // Clear any cached data and prevent back button access
      window.history.replaceState(null, '', '/login');
      
      // Force a page reload to clear any cached state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout API fails
      window.location.href = '/login';
    }
  };

  return (
    <nav className="bg-white dark:bg-morning-800 shadow-soft border-b border-morning-100 dark:border-morning-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gradient">
              Havit
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-morning-700 hover:text-cyan-600 transition-colors ${
                    location.pathname === '/dashboard' ? 'text-cyan-600 font-medium' : ''
                  }`}
                >
                  Dashboard
                </Link>
                {/* Wallet Transactions link styled like Dashboard */}
                <Link
                  to="/wallet/transactions"
                  className={`text-morning-700 hover:text-cyan-600 transition-colors ${
                    location.pathname === '/wallet/transactions' ? 'text-cyan-600 font-medium' : ''
                  }`}
                >
                  Transactions
                </Link>
                
                {/* Achievements link */}
                <Link
                  to="/achievements"
                  className={`text-morning-700 hover:text-cyan-600 transition-colors ${
                    location.pathname === '/achievements' ? 'text-cyan-600 font-medium' : ''
                  }`}
                >
                  Achievements
                </Link>
                
                {/* Create Challenge Button */}
                <button
                  onClick={() => setShowCreateChallenge(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Challenge</span>
                </button>
                
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={async () => {
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                      // Refresh user profile data when dropdown is opened
                      if (!isUserDropdownOpen) {
                        console.log('🔄 Profile button clicked - refreshing user data...');
                        try {
                          await refreshUser();
                          console.log('✅ User profile refreshed successfully');
                        } catch (error) {
                          console.error('❌ Failed to refresh user profile:', error);
                        }
                      }
                    }}
                    className="flex items-center space-x-2 text-morning-700 hover:text-cyan-600 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden lg:block">{user?.fullName || 'User'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-morning-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-morning-100">
                        <p className="text-sm font-medium text-morning-900">{user?.fullName}</p>
                        <p className="text-xs text-morning-600">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-morning-700 hover:bg-morning-50 transition-colors"
                        onClick={async () => {
                          setIsUserDropdownOpen(false);
                          // Refresh user profile data when profile link is clicked
                          console.log('🔄 Desktop profile link clicked - refreshing user data...');
                          try {
                            await refreshUser();
                            console.log('✅ User profile refreshed successfully');
                          } catch (error) {
                            console.error('❌ Failed to refresh user profile:', error);
                          }
                        }}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-morning-700 hover:bg-morning-50 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      
                      <div className="border-t border-morning-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-outline"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-morning-700 hover:text-cyan-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-morning-100">
            {isAuthenticated ? (
              <div className="space-y-4">
                <Link
                  to="/dashboard"
                  className="block text-morning-700 hover:text-cyan-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/wallet/transactions"
                  className="block text-morning-700 hover:text-cyan-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Transactions
                </Link>
                <Link
                  to="/achievements"
                  className="block text-morning-700 hover:text-cyan-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Achievements
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowCreateChallenge(true);
                  }}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Challenge</span>
                </button>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-morning-700 hover:text-cyan-600 transition-colors"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    // Refresh user profile data when profile link is clicked
                    console.log('🔄 Mobile profile link clicked - refreshing user data...');
                    try {
                      await refreshUser();
                      console.log('✅ User profile refreshed successfully');
                    } catch (error) {
                      console.error('❌ Failed to refresh user profile:', error);
                    }
                  }}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 text-morning-700 hover:text-cyan-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-error-600 hover:text-error-700 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="block btn-outline text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block btn-primary text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isUserDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserDropdownOpen(false)}
        />
      )}

      {/* Create Challenge Modal */}
      {showCreateChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-morning-900 mb-4">Create New Challenge</h3>
            
            {/* Balance Warning */}
            {user && user.balance <= 50 && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Insufficient Balance!</span>
                </div>
                <p className="text-sm">You need at least ₹50 to create challenges. Current balance: ₹{user.balance}</p>
              </div>
            )}
            
            {user && user.balance > 50 && user.balance <= 100 && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Low Balance</span>
                </div>
                <p className="text-sm">Current balance: ₹{user.balance}. Consider adding funds for more challenges.</p>
              </div>
            )}
            
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-morning-700 mb-2">
                  Challenge Date
                </label>
                <input
                  type="date"
                  value={challengeForm.date}
                  min={getLocalDate()}
                  max={(() => {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 7);
                    return new Date(maxDate.getTime() - (maxDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                  })()}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, date: e.target.value }))}
                  className="input-field"
                  required
                />
                <p className="text-xs text-morning-500 mt-1">You can create challenges up to 7 days in advance</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-morning-700 mb-2">
                  Wake-up Time
                </label>
                <select
                  value={challengeForm.wakeUpTime}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, wakeUpTime: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Select wake-up time</option>
                  <option value="04:00">4:00 AM</option>
                  <option value="04:30">4:30 AM</option>
                  <option value="05:00">5:00 AM</option>
                  <option value="05:30">5:30 AM</option>
                  <option value="06:00">6:00 AM</option>
                  <option value="06:30">6:30 AM</option>
                  <option value="07:00">7:00 AM</option>
                </select>
                <p className="text-xs text-morning-500 mt-1">30-minute time slots between 4:00 AM and 7:00 AM</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-morning-700 mb-2">
                  Forfeit Amount
                </label>
                <input
                  type="number"
                  value={challengeForm.forfeitAmount}
                  min={10}
                  max={user ? Math.min(user.balance, 100) : 100}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, forfeitAmount: Number(e.target.value) }))}
                  className={`input-field ${challengeForm.forfeitAmount > (user?.balance || 0) ? 'border-red-500' : ''}`}
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-morning-500">₹10 - ₹{user ? Math.min(user.balance, 100) : 100}</p>
                  {user && (
                    <p className="text-xs text-morning-600">
                      Available: ₹{user.balance} | Remaining: ₹{Math.max(0, user.balance - challengeForm.forfeitAmount)}
                    </p>
                  )}
                </div>
                {challengeForm.forfeitAmount > (user?.balance || 0) && (
                  <p className="text-xs text-red-600 mt-1">
                    Forfeit amount exceeds available balance!
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateChallenge(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !user || user.balance <= 50 || challengeForm.forfeitAmount > user.balance}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 
                   !user || user.balance <= 50 ? 'Insufficient Balance' :
                   challengeForm.forfeitAmount > user.balance ? 'Amount Too High' :
                   'Create Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 