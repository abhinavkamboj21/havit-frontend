import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChallenge } from '../context/ChallengeContext';
import { useNavigate } from 'react-router-dom';
import { walletAPI, challengeAPI, streaksAPI } from '../utils/api';
import { 
  Clock, 
  IndianRupee, 
  Target, 
  Calendar,
  ArrowRight,
  Trophy,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  CreditCard,
  Building,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Info
} from 'lucide-react';

// Helper function to get local date (timezone-aware)
const getLocalDate = () => {
  const now = new Date();
  return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

// Helper function to convert any date to local date string (timezone-aware)
const getLocalDateString = (date: Date) => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

// Calendar helper functions
const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const formatMonthYear = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const isSameDate = (date1: string, date2: Date) => {
  const d2Str = getLocalDateString(date2);
  return date1 === d2Str;
};

const getChallengeStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-500';
    case 'SUCCESS': return 'bg-green-500';
    case 'FAILED': return 'bg-red-500';
    case 'PROCESSED': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

// Helper function to check if challenge cancellation is allowed for a specific challenge date
const isCancellationAllowed = (challengeDate: string) => {
  const today = getLocalDate();
  
  // If the challenge is for today, lock cancellation
  // For a challenge on Aug 9th, cancellation is allowed until Aug 8th 11:59 PM
  // Once it becomes Aug 9th 12:00 AM, cancellation is locked
  if (challengeDate === today) {
    // Lock cancellation on the challenge day (from 00:00-23:59)
    return false;
  }
  
  // For future challenges (not today), cancellation is always allowed
  return true;
};

// Helper function to check if current time is within challenge completion window
const isWithinTimeWindow = (wakeUpTime: string) => {
  const now = new Date();
  
  // Parse wake-up time (e.g., "07:00")
  const [hours, minutes] = wakeUpTime.split(':').map(Number);
  
  // Create Date objects for the time window
  const wakeUpDateTime = new Date();
  wakeUpDateTime.setHours(hours, minutes, 0, 0);
  
  // Window: 15 minutes before to 10 minutes after wake-up time
  const windowStart = new Date(wakeUpDateTime.getTime() - 15 * 60 * 1000); // 15 min before
  const windowEnd = new Date(wakeUpDateTime.getTime() + 10 * 60 * 1000);   // 10 min after
  
  console.log('⏰ Time Window Check for wake-up time:', wakeUpTime);
  console.log('   Current Time:', now.toLocaleTimeString());
  console.log('   Wake-up Time:', wakeUpDateTime.toLocaleTimeString());
  console.log('   Window Start (15min before):', windowStart.toLocaleTimeString());
  console.log('   Window End (10min after):', windowEnd.toLocaleTimeString());
  console.log('   Is Within Window:', now >= windowStart && now <= windowEnd);
  console.log('   Minutes until window start:', Math.floor((windowStart.getTime() - now.getTime()) / 1000 / 60));
  console.log('   Minutes until window end:', Math.floor((windowEnd.getTime() - now.getTime()) / 1000 / 60));
  
  return now >= windowStart && now <= windowEnd;
};

// Helper function to format time into HH:MM:SS and human-readable format
const formatTimeHMS = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    humanReadable: `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s`
  };
};

// Helper function to get time remaining until window opens/closes
const getTimeWindowInfo = (wakeUpTime: string) => {
  const now = new Date();
  const [hours, minutes] = wakeUpTime.split(':').map(Number);
  
  const wakeUpDateTime = new Date();
  wakeUpDateTime.setHours(hours, minutes, 0, 0);
  
  const windowStart = new Date(wakeUpDateTime.getTime() - 15 * 60 * 1000);
  const windowEnd = new Date(wakeUpDateTime.getTime() + 10 * 60 * 1000);
  
  if (now < windowStart) {
    // Before window opens
    const totalSecondsUntilStart = Math.floor((windowStart.getTime() - now.getTime()) / 1000);
    const timeFormat = formatTimeHMS(totalSecondsUntilStart);
    
    return {
      status: 'before',
      message: `Completion window opens in ${timeFormat.humanReadable}`,
      hoursRemaining: timeFormat.hours,
      minutesRemaining: timeFormat.minutes,
      secondsRemaining: timeFormat.seconds,
      totalSeconds: totalSecondsUntilStart,
      formattedTime: timeFormat.formatted,
      humanReadableTime: timeFormat.humanReadable
    };
  } else if (now > windowEnd) {
    // After window closes
    return {
      status: 'after',
      message: 'Completion window has closed',
      hoursRemaining: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      totalSeconds: 0,
      formattedTime: '00:00:00',
      humanReadableTime: '00h:00m:00s'
    };
  } else {
    // Within window - show countdown timer
    const totalSecondsUntilEnd = Math.floor((windowEnd.getTime() - now.getTime()) / 1000);
    const timeFormat = formatTimeHMS(totalSecondsUntilEnd);
    
    return {
      status: 'within',
      message: `${timeFormat.humanReadable} remaining`,
      hoursRemaining: timeFormat.hours,
      minutesRemaining: timeFormat.minutes,
      secondsRemaining: timeFormat.seconds,
      totalSeconds: totalSecondsUntilEnd,
      formattedTime: timeFormat.formatted,
      humanReadableTime: timeFormat.humanReadable
    };
  }
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
    const { 
    todayChallenge, 
    stats, 
    challenges, 
    loading, 
    error,

    getChallenges,
    getTodayChallenge,
    verifyChallenge,
    cancelChallenge,
    clearError,
    refreshStats
  } = useChallenge();
  

  const [verificationMethod, setVerificationMethod] = useState<'PHOTO' | 'MANUAL'>('MANUAL');
  
  // State for real-time time window updates
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Wallet modal states
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState('');
  // Local verifying state to control action buttons
  const [verifying, setVerifying] = useState(false);
  // Toggle to show all history items
  const [showAllHistory, setShowAllHistory] = useState(false);
  // Verification info visibility
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);
  const [isVerificationInfoHovered, setIsVerificationInfoHovered] = useState(false);
  
  // Calendar modal state
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Streaks state
  const [streaks, setStreaks] = useState<any>(null);

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCalendarMonth(new Date());
  };
  
  // Add funds form
  const [addFundsForm, setAddFundsForm] = useState({
    amount: ''
  });
  
  // Withdraw form
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    withdrawalMethod: 'BANK_TRANSFER' as 'BANK_TRANSFER' | 'UPI',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: '',
    upiId: ''
  });

  // Debug: Watch for user balance changes
  useEffect(() => {
    console.log('👤 User object changed:', user);
    console.log('💰 Current balance:', user?.balance);
  }, [user]);

  // Debug: Watch for challenge data changes
  useEffect(() => {
    const now = new Date();
    const utcToday = new Date().toISOString().split('T')[0];
    const localToday = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    console.log('🕐 Current Date/Time Info:');
    console.log('   📅 UTC Date:', utcToday);
    console.log('   📅 Local Date:', localToday);
    console.log('   🌍 Timezone Offset:', now.getTimezoneOffset(), 'minutes');
    console.log('   ⏰ Local Time:', now.toLocaleString());
    console.log('   ⏰ UTC Time:', now.toISOString());
    
    const today = getLocalDate(); // Using consistent local date helper
    console.log('📅 Using date for comparison:', today);
    console.log('📋 Today\'s challenge from context:', todayChallenge);
    console.log('📊 All challenges:', challenges.map(c => ({ id: c.id, date: c.challengeDate, status: c.status })));
    
    const todaysFromList = challenges.find(c => c.challengeDate === today);
    console.log('🔍 Today\'s challenge from list:', todaysFromList);
    
    // Also check if there's a challenge for August 9th specifically
    const aug9Challenge = challenges.find(c => c.challengeDate === '2025-08-09');
    console.log('🔍 Challenge for Aug 9th:', aug9Challenge);
  }, [todayChallenge, challenges]);

  // Real-time updates for time window - update every second for ticking timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for real-time ticking timer

    return () => clearInterval(timer);
  }, []);

  // Load streaks data
  useEffect(() => {
    const loadStreaks = async () => {
      if (!user) return;
      
      try {
        const response = await streaksAPI.getStreaks();
        console.log('🔥 Streaks data loaded:', response);
        setStreaks(response.data);
      } catch (error: any) {
        console.error('❌ Failed to load streaks:', error);
      }
    };

    loadStreaks();
  }, [user]);





  // Test function to create a challenge using test API (no restrictions)
  const handleCreateTestChallenge = async () => {
    try {
      const now = new Date();
      const testWakeUpTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
      const testTimeString = testWakeUpTime.toTimeString().slice(0, 5); // HH:MM format
      const today = getLocalDate();
      
      console.log('🧪 Creating test challenge using test API:');
      console.log('   Current time:', now.toLocaleTimeString());
      console.log('   Test wake-up time:', testTimeString);
      console.log('   Challenge date:', today);
      
      alert(`🧪 Creating test challenge for testing time window feature!\n\nWake-up time: ${testTimeString}\nWindow opens at: ${new Date(testWakeUpTime.getTime() - 15 * 60 * 1000).toLocaleTimeString()}\nWindow closes at: ${new Date(testWakeUpTime.getTime() + 5 * 60 * 1000).toLocaleTimeString()}\n\nThis will help you test the time window completion button!`);
      
      // Use the new test API endpoint which bypasses time restrictions
      const response = await challengeAPI.createTestChallenge({
        challengeDate: today,
        wakeUpTime: testTimeString,
        forfeitAmount: 25,
        status: 'PENDING'
      });
      
      console.log('✅ Test challenge API response:', response);
      
      // Refresh data after creation
      await Promise.all([
        refreshUser(),
        getChallenges(0, 10),
        getTodayChallenge()
      ]);
      
      alert(`✅ Test challenge created successfully!\n\nChallenge ID: ${response.challengeId}\nStatus: ${response.status}\nForfeit Deducted: ₹${response.forfeitDeducted}\n\nCheck the "Today's Challenge" section to see the time window feature in action.`);
      
    } catch (error: any) {
      console.error('❌ Failed to create test challenge:', error);
      alert(`❌ Failed to create test challenge: ${error.message}\n\nPlease ensure you have sufficient wallet balance (₹25+ required).`);
    }
  };

  // const handleQuickCompletion = async (challenge: any) => {};

  const handleVerifyChallenge = async (challengeOverride?: any) => {
    const today = getLocalDate();
    const challenge = challengeOverride || todayChallenge || challenges.find(c => c.challengeDate === today);
    if (!challenge) {
      console.warn('⚠️ No challenge found for today to verify');
      alert('No challenge found for today to verify.');
      return;
    }
    
    try {
      setVerifying(true);
      console.log('🔍 Verifying challenge with AI-driven verification...', { challengeId: challenge.id, verificationMethod });
      const result = await verifyChallenge(challenge.id, {
        verificationMethod,
        checkInLocation: 'Home',
        notes: 'Woke up on time!'
      });
      
      console.log('✅ Challenge verification result:', result);
      
      // Handle AI verification results
      if (result.data && result.data.isSuccessful) {
        // Challenge succeeded - show winnings
        const winnings = result.data.winningsAmount || 0;
        alert(`🎉 Challenge Completed Successfully!\n\n🏆 Congratulations! You've earned ₹${winnings.toFixed(2)}\n\nThis includes your original forfeit amount plus a share from the daily pool. Amazing work on maintaining your wake-up schedule!`);
        
        console.log(`💰 Challenge winnings: ₹${winnings}`);
      } else if (result.data && !result.data.isSuccessful) {
        // Challenge failed - show refund info
        const forfeitAmount = challenge.forfeitAmount || 0;
        const refundAmount = forfeitAmount * 0.85; // 85% refund
        alert(`😔 Challenge Not Completed\n\n💰 Don't worry! You'll receive ₹${refundAmount.toFixed(2)} as a refund (85% of your forfeit amount).\n\nBetter luck next time! Keep trying and you'll get there. 💪`);
        
        console.log(`💸 Challenge refund: ₹${refundAmount} (85% of ₹${forfeitAmount})`);
      }
      
      // Refresh user balance and challenge data
      console.log('🔄 Refreshing user data after challenge verification...');
      await Promise.all([
        refreshUser(),
        refreshStats()
      ]);
      
    } catch (error: any) {
      console.error('❌ Challenge verification failed:', error);
      alert(`❌ Failed to verify challenge: ${error.message}\n\nPlease try again or contact support if the issue persists.`);
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelChallenge = async (challengeId: number) => {
    try {
      await cancelChallenge(challengeId);
    } catch (error) {
      console.error('Failed to cancel challenge:', error);
    }
  };

  // Wallet functions
  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletLoading(true);
    setWalletError('');

    try {
      const depositData = {
        amount: parseFloat(addFundsForm.amount)
      };

      console.log('🚀 Calling backend deposit API with data:', depositData);
      
      const response = await walletAPI.deposit(depositData);
      
      console.log('💰 Backend API Response:', response);

      if (response.orderId) {
        // Initialize Razorpay checkout with order details
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_V3xIRiVV7cvytT', // Your Razorpay Key ID
          amount: response.amount * 100, // Amount in paisa (multiply by 100)
          currency: 'INR',
          name: 'Hav-it',
          description: 'Add funds to wallet',
          image: '/favicon.ico', // Your logo
          order_id: response.orderId,
          handler: async function (razorpayResponse: any) {
            // Payment completed on Razorpay - verify with backend
            console.log('✅ Razorpay Payment Completed!', razorpayResponse);
            console.log('📋 Payment Details:', {
              payment_id: razorpayResponse.razorpay_payment_id,
              order_id: razorpayResponse.razorpay_order_id,
              signature: razorpayResponse.razorpay_signature
            });
            
            // Call backend verification API
            console.log('🔄 Verifying payment with backend...');
            
            try {
              const verificationResult = await walletAPI.verifyPayment(
                razorpayResponse.razorpay_order_id,
                razorpayResponse.razorpay_payment_id
              );
              
              console.log('📊 Payment verification result:', verificationResult);
              
              if (verificationResult.success) {
                console.log('✅ Payment verified successfully!');
                
                // Show success message
                alert('✅ Payment completed successfully! Updating your wallet balance...');
                
                // Refresh user data to update balance
                console.log('🔄 Refreshing user data to update balance...');
                console.log('💰 Current user balance before refresh:', user?.balance);
                await refreshUser();
                console.log('✅ User data refreshed successfully!');
                
                // Also refresh challenge stats which might include updated balance info
                console.log('🔄 Refreshing challenge stats...');
                await refreshStats();
                console.log('✅ Challenge stats refreshed successfully!');
                
                // Check the balance after refresh with a small delay to ensure state update
                setTimeout(() => {
                  console.log('💰 Updated user balance after refresh:', user?.balance);
                  console.log('📊 Updated user object:', user);
                }, 500);
                
                // Reset form and close modal after balance update
                setAddFundsForm({ amount: '' });
                setShowAddFunds(false);
                
                // Show final confirmation
                setTimeout(() => {
                  alert('💰 Your wallet balance has been updated successfully!');
                }, 500);
              } else {
                console.log('❌ Payment verification failed');
                alert(`❌ Payment verification failed: ${verificationResult.message || 'Unknown error'}\n\nOrder ID: ${razorpayResponse.razorpay_order_id}\nPayment ID: ${razorpayResponse.razorpay_payment_id}\n\nPlease contact support if you believe this is an error.`);
              }
              
            } catch (error: any) {
              console.error('❌ Payment verification error:', error);
              
              // Show detailed error to user
              const errorMessage = `❌ Unable to verify payment status.

Order ID: ${razorpayResponse.razorpay_order_id}
Payment ID: ${razorpayResponse.razorpay_payment_id}
Error: ${error.message}

Your payment may have been processed successfully on Razorpay's side. Please check your wallet balance or contact support if needed.`;
              
              alert(errorMessage);
            }
          },
          prefill: {
            name: user?.fullName || '',
            email: user?.email || '',
            contact: user?.phoneNumber || ''
          },
          notes: {
            transaction_id: response.transactionId,
            user_id: user?.id || ''
          },
          theme: {
            color: '#0891b2' // Cyan color matching your theme
          }
        };

        // Load Razorpay script and open checkout
        if (!(window as any).Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            const rzp = new (window as any).Razorpay(options);
            
            rzp.on('payment.failed', function (response: any) {
              console.error('❌ Payment failed:', response);
              setWalletError(`Payment failed: ${response.error.description}`);
            });
            
            rzp.open();
          };
          document.body.appendChild(script);
        } else {
          const rzp = new (window as any).Razorpay(options);
          
          rzp.on('payment.failed', function (response: any) {
            console.error('❌ Payment failed:', response);
            setWalletError(`Payment failed: ${response.error.description}`);
          });
          
          rzp.open();
        }

        // Show success message for order creation
        alert(`💰 Payment order created successfully!\n\nOrder ID: ${response.orderId}\nTransaction ID: ${response.transactionId}\nAmount: ₹${depositData.amount}\n\nRazorpay checkout will open now with all payment options.`);
        
      } else {
        // Handle case where order creation failed
        setWalletError('Failed to create payment order. Please try again.');
        console.error('❌ No order ID in response:', response);
      }

      // Reset form and close modal
      setAddFundsForm({
        amount: ''
      });
      setShowAddFunds(false);
      
    } catch (error: any) {
      console.error('❌ Backend API call failed:', error);
      setWalletError(error.message || 'Failed to call backend deposit API. Please check your connection and try again.');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletLoading(true);
    setWalletError('');

    try {
      await walletAPI.withdraw({
        amount: parseFloat(withdrawForm.amount),
        withdrawalMethod: withdrawForm.withdrawalMethod,
        bankDetails: withdrawForm.withdrawalMethod === 'BANK_TRANSFER' ? {
          accountNumber: withdrawForm.accountNumber,
          ifscCode: withdrawForm.ifscCode,
          accountHolderName: withdrawForm.accountHolderName,
          bankName: withdrawForm.bankName
        } : undefined,
        upiId: withdrawForm.withdrawalMethod === 'UPI' ? withdrawForm.upiId : undefined
      });

      // Reset form and close modal
      setWithdrawForm({
        amount: '',
        withdrawalMethod: 'BANK_TRANSFER',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
        upiId: ''
      });
      setShowWithdraw(false);
      
      alert('Withdrawal request submitted successfully! You will receive a confirmation shortly.');
    } catch (error: any) {
      setWalletError(error.message || 'Failed to process withdrawal');
    } finally {
      setWalletLoading(false);
    }
  };

  const userStats = [
    {
      icon: <Flame className="w-6 h-6" />,
      title: 'Current Streak',
      value: `${streaks?.currentStreak || stats?.currentStreak || user?.currentStreak || 0} days`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Longest Streak',
      value: `${streaks?.longestStreak || 0} days`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Success Rate',
      value: `${stats?.successRate || user?.successRate || 0}%`,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Total Challenges',
      value: `${stats?.totalChallenges || user?.totalChallenges || 0}`,
      color: 'text-morning-600',
      bgColor: 'bg-morning-50'
    }
  ];

  const quickActions = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'View Calendar',
      description: 'See all your challenges',
      action: () => setShowCalendar(true),
      color: 'text-morning-600',
      bgColor: 'bg-morning-50'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Analytics',
      description: 'View detailed statistics',
      action: () => {},
      color: 'text-morning-600',
      bgColor: 'bg-morning-50'
    }
  ];





  // Helper function to get next upcoming challenge
  const getNextChallenge = () => {
    const today = getLocalDate();
    return challenges
      .filter(challenge => challenge.challengeDate > today && challenge.status === 'PENDING')
      .sort((a, b) => new Date(a.challengeDate).getTime() - new Date(b.challengeDate).getTime())[0];
  };

  // Helper function to get all pending challenges (including today)
  const getPendingChallenges = () => {
    const today = getLocalDate();
    return challenges.filter(challenge => 
      challenge.challengeDate >= today && challenge.status === 'PENDING'
    );
  };

  // Show loading state while authentication is being established
  if (authLoading || (isAuthenticated && loading && !stats && !todayChallenge && challenges.length === 0)) {
    return (
      <div className="min-h-screen bg-morning-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-morning-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-morning-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-morning-900 mb-2">
            Good Morning, {user?.fullName?.split(' ')[0] || 'Champion'}!
          </h1>
          <p className="text-morning-600">
            Ready to conquer another day? Let's make it count!
          </p>
          {/* 🧪 DEBUG: Test Button - Remove this in production */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              🧪 <strong>Testing Mode:</strong> Create a test challenge with wake-up time in 2 minutes to test the time window completion feature
            </p>
            <button
              onClick={handleCreateTestChallenge}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Creating...' : '🧪 Create Test Challenge (2min wake-up)'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-error-400 hover:text-error-600">
              ×
            </button>
          </div>
        )}

        {/* Wallet Balance - Featured Section */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 p-8 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 rounded-full bg-white bg-opacity-20 backdrop-blur-sm">
                      <IndianRupee className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-cyan-100 text-sm font-medium uppercase tracking-wider">Wallet Balance</p>
                      <p className="text-white text-xs opacity-90">Available to withdraw</p>
                    </div>
                  </div>
                  <div className="mb-4">
                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-sm">{(user?.balance ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => navigate('/withdraw')}
                      className="px-6 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg text-white font-medium transition-all duration-200 border border-white border-opacity-30"
                    >
                      Withdraw
                    </button>
                    <button 
                      onClick={() => setShowAddFunds(true)}
                      className="px-6 py-2 bg-white text-cyan-600 hover:bg-cyan-50 rounded-lg font-medium transition-all duration-200"
                    >
                      Add Funds
                    </button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-white opacity-80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Challenge Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Today's Challenge */}
          <div>
            <h2 className="text-xl font-semibold text-morning-900 mb-4">Today's Challenge</h2>
            <div className="card">
            {(() => {
              const today = getLocalDate();
              // If todayChallenge is selected via context logic, use it; else derive from today's list
              const todaysList = challenges.filter(c => c.challengeDate === today);
              let derived: any | null = null;
              if (!todayChallenge && todaysList.length > 0) {
                const parseTime = (t: string) => { const [hh, mm] = t.split(':').map(Number); return hh * 60 + mm; };
                const isWithinWindow = (c: any) => (c as any).isWithinGracePeriod || (c as any).canCheckIn;
                const pending = todaysList.filter(c => c.status === 'PENDING');
                const inWindow = pending.filter(isWithinWindow);
                if (inWindow.length > 0) derived = inWindow.sort((a,b)=>parseTime(a.wakeUpTime)-parseTime(b.wakeUpTime))[0];
                else if (pending.length > 0) derived = pending.sort((a,b)=>parseTime(a.wakeUpTime)-parseTime(b.wakeUpTime))[0];
                else {
                  const completed = todaysList.filter(c => c.status === 'COMPLETED' || c.status === 'PROCESSED');
                  derived = completed.sort((a,b)=>parseTime(b.wakeUpTime)-parseTime(a.wakeUpTime))[0] || null;
                }
              }
              const fallbackTodayChallenge = todayChallenge || derived || todaysList[0];
              
              // Calculate status for fallback challenge
              const getTodayStatus = (challenge: any) => {
                if (!challenge) return null;
                
                switch (challenge.status) {
                  case 'PENDING': {
                    // Backend no longer uses 'ACTIVE'. Treat PENDING within the time window as active.
                    const inWindow = isWithinTimeWindow(challenge.wakeUpTime);
                    if (inWindow) {
                      return {
                        icon: <AlertCircle className="w-5 h-5" />,
                        text: 'Time to Wake Up!',
                        color: 'text-cyan-600',
                        bgColor: 'bg-cyan-50'
                      };
                    }
                    return {
                      icon: <Clock className="w-5 h-5" />,
                      text: 'Challenge Pending',
                      color: 'text-warning-600',
                      bgColor: 'bg-warning-50'
                    };
                  }
                  // 'ACTIVE' state removed in backend; treat time-window PENDING as active
                  case 'COMPLETED':
                    if (challenge.isSuccessful) {
                      return {
                        icon: <CheckCircle className="w-5 h-5" />,
                        text: 'Challenge Completed!',
                        color: 'text-success-600',
                        bgColor: 'bg-success-50'
                      };
                    } else {
                      return {
                        icon: <XCircle className="w-5 h-5" />,
                        text: 'Challenge Failed',
                        color: 'text-error-600',
                        bgColor: 'bg-error-50'
                      };
                    }
                  default:
                    return null;
                }
              };
              
              const currentTodayStatus = getTodayStatus(fallbackTodayChallenge);
              
              if (fallbackTodayChallenge) {
                console.log('🎯 Displaying today\'s challenge:', fallbackTodayChallenge);
              }
              
              return fallbackTodayChallenge ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {currentTodayStatus && (
                      <div className={`p-2 rounded-lg ${currentTodayStatus.bgColor}`}>
                        <div className={currentTodayStatus.color}>
                          {currentTodayStatus.icon}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-morning-900">
                        Wake up at {fallbackTodayChallenge.wakeUpTime}
                      </h3>
                      <p className="text-sm text-morning-600">
                        Forfeit: ₹{fallbackTodayChallenge.forfeitAmount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {currentTodayStatus && (
                      <span className={`text-sm font-medium ${currentTodayStatus.color}`}>
                        {currentTodayStatus.text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}

                {fallbackTodayChallenge.status === 'PENDING' && (() => {
                  // Use currentTime to ensure real-time updates (dependency on currentTime state)
                  currentTime; // Trigger re-render when currentTime changes
                  const timeWindowInfo = getTimeWindowInfo(fallbackTodayChallenge.wakeUpTime);
                  const isInWindow = isWithinTimeWindow(fallbackTodayChallenge.wakeUpTime);
                  const canCancel = isCancellationAllowed(fallbackTodayChallenge.challengeDate);
                  
                  console.log('🎯 Today\'s Challenge Time Window Render:');
                  console.log('   Challenge ID:', fallbackTodayChallenge.id);
                  console.log('   Wake-up Time:', fallbackTodayChallenge.wakeUpTime);
                  console.log('   Time Window Info:', timeWindowInfo);
                  console.log('   Is In Window:', isInWindow);
                  console.log('   Can Cancel:', canCancel);
                  console.log('   Current Time:', new Date().toLocaleTimeString());
                  
                  return (
                    <div className="space-y-3">
                      {/* Time Window Information */}
                      <div className={`p-4 rounded-lg border ${
                        timeWindowInfo.status === 'within' 
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : timeWindowInfo.status === 'before'
                          ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}>
                        
                        {/* Window is OPEN - Show prominent ticking timer */}
                        {timeWindowInfo.status === 'within' && (
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                                ✅ COMPLETION WINDOW OPEN
                              </span>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                            
                            {/* Large Ticking Timer */}
                            <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-300 rounded-2xl p-6 mb-3 shadow-lg">
                              <div className="text-3xl sm:text-4xl md:text-5xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700 mb-2 tracking-tight">
                                {timeWindowInfo.humanReadableTime}
                              </div>
                              <div className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                                ⏰ Time Remaining
                              </div>
                            </div>
                            
                            <p className="text-sm font-medium">
                              🚀 Quick completion available! Mark as completed with one click.
                            </p>
                            
                            {/* Urgency indicator */}
                            {timeWindowInfo.totalSeconds <= 60 && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 rounded-xl shadow-md">
                                <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 animate-pulse uppercase tracking-wide">
                                  🚨 LESS THAN 1 MINUTE LEFT!
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Window is BEFORE - Show countdown to opening */}
                {timeWindowInfo.status === 'before' && (
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <Clock className="w-4 h-4 text-cyan-600" />
                              <span className="text-sm font-medium text-cyan-800">Completion window opens in:</span>
                            </div>
                            
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 p-6 mb-3 shadow-xl">
                              {/* Background Pattern - matching wallet component */}
                              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                              <div className="absolute -top-2 -right-2 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white bg-opacity-5 rounded-full"></div>
                              
                              {/* Content */}
                              <div className="relative z-10 text-center">
                                <div className="text-4xl font-bold font-sans text-white mb-2 tracking-tight">
                                  {timeWindowInfo.humanReadableTime}
                                </div>
                                <div className="text-xs font-semibold text-cyan-100 uppercase tracking-wider">
                                  Until Window Opens
                                </div>
                              </div>
                            </div>
                            
                    <p className="text-xs text-cyan-700 bg-cyan-50 rounded-lg p-2">
                      💡 Window: {new Date((fallbackTodayChallenge as any).gracePeriodStartTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' '}–{' '}
                      {new Date((fallbackTodayChallenge as any).gracePeriodEndTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' '}Get ready!
                    </p>
                          </div>
                        )}
                        
                        {/* Window is CLOSED */}
                        {timeWindowInfo.status === 'after' && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">{timeWindowInfo.message}</span>
                          </div>
                        )}
                      </div>

                      {/* Cancellation Lock Notice */}
                      {!canCancel && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium text-orange-800">
                              🔒 Challenge cancellation locked on challenge day
                            </span>
                          </div>
                          <p className="text-xs text-orange-700 mt-1">
                            Cancellation was only allowed until 11:59 PM the night before. Your challenge is now locked in!
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        {isInWindow ? (
                          <>
                            {/* Primary action: Check In Now (moved here) */}
                            <button
                              onClick={() => handleVerifyChallenge(fallbackTodayChallenge)}
                              disabled={loading}
                              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 active:scale-95 transition-transform duration-150 ease-out text-white rounded-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 flex-1 text-lg font-bold py-4"
                            >
                              {verifying ? 'Verifying...' : 'Check In Now!'}
                            </button>
                            {/* Cancel button removed as requested; lock state handled below */}
                          </>
                        ) : (
                          <>
                            {/* Cancel button removed for non-window state as well */}
                          </>
                        )}
                      </div>

                      {/* Detailed verification / Locked area */}
                      {isInWindow ? (
                        <>
                        <div className="mt-3 flex items-center gap-2 flex-nowrap overflow-x-auto w-full">
                          <button
                            onClick={() => setVerificationMethod('MANUAL')}
                            className={`flex items-center space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-xs sm:text-sm shrink-0 transition-colors ${
                              verificationMethod === 'MANUAL' 
                                ? 'bg-cyan-50 border-cyan-200 text-cyan-700' 
                                : 'bg-white border-morning-200 text-morning-600'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Manual</span>
                          </button>
                          <button
                            onClick={() => setVerificationMethod('PHOTO')}
                            className={`flex items-center space-x-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-xs sm:text-sm shrink-0 transition-colors ${
                              verificationMethod === 'PHOTO' 
                                ? 'bg-cyan-50 border-cyan-200 text-cyan-700' 
                                : 'bg-white border-morning-200 text-morning-600'
                            }`}
                          >
                            <Camera className="w-4 h-4" />
                            <span className="hidden sm:inline">Photo</span>
                          </button>
                          {!canCancel && (
                            <span className="bg-gray-300 text-gray-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-not-allowed whitespace-nowrap shrink-0">
                              🔒 <span className="hidden sm:inline">Cancellation </span>Locked
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setShowVerificationInfo((v: boolean) => !v)}
                            onMouseEnter={() => setIsVerificationInfoHovered(true)}
                            onMouseLeave={() => setIsVerificationInfoHovered(false)}
                            className="text-xs text-morning-500 hover:text-morning-700 inline-flex items-center gap-1"
                          >
                            <Info className="w-3.5 h-3.5" />
                            What do these options mean?
                          </button>
                          {(showVerificationInfo || isVerificationInfoHovered) && (
                            <div className="mt-1 text-xs text-morning-600 bg-morning-50 border border-morning-200 rounded-md p-2">
                              <div><span className="font-medium">Manual</span>: quick check-in without photo proof.</div>
                              <div><span className="font-medium">Photo</span>: upload a photo as proof for verification(still in development).</div>
                            </div>
                          )}
                        </div>
                        </>
                      ) : (
                        <div className="mt-3 flex items-center flex-wrap gap-2">
                          <button
                            className="bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex-1 text-lg py-4"
                            disabled={true}
                            title="Check-in locked outside the time window"
                          >
                            🔒 Locked
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {fallbackTodayChallenge.status === 'COMPLETED' && fallbackTodayChallenge.isSuccessful && (
                  <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                      <p className="text-success-700 font-medium">
                        🎉 Congratulations! You completed your challenge! You will receive your winnings in your wallet by 2 PM.
                      </p>
                  </div>
                )}

                {fallbackTodayChallenge.status === 'COMPLETED' && !fallbackTodayChallenge.isSuccessful && (
                  <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                    <p className="text-error-700 font-medium">
                      😔 {fallbackTodayChallenge.failureReason} - ₹{fallbackTodayChallenge.actualForfeitAmount} forfeit
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-morning-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-morning-900 mb-2">
                  No Challenge Today
                </h3>
                <p className="text-morning-600">
                  Use the "Create Challenge" button in the navigation bar to start building your morning routine!
                </p>
              </div>
            );
            })()}
            </div>
          </div>

          {/* Upcoming Challenges */}
          <div>
            <h2 className="text-xl font-semibold text-morning-900 mb-4">Upcoming Challenges</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {challenges
                .filter(challenge => {
                  const today = getLocalDate();
                  return challenge.challengeDate > today && challenge.status === 'PENDING';
                })
                .slice(0, 5)
                .map((challenge) => (
                <div key={challenge.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg icon-chip">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-morning-900">
                          {new Date(challenge.challengeDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-morning-600">
                          Wake up at {challenge.wakeUpTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-morning-600">
                        Forfeit: ₹{challenge.forfeitAmount}
                      </p>
                      {(() => {
                        const canCancel = isCancellationAllowed(challenge.challengeDate);
                        
                        // If cancellation is locked (challenge date is today), show locked button
                        if (!canCancel) {
                          return (
                            <button
                              className="bg-gray-300 text-gray-500 px-2 py-1 rounded text-xs font-medium mt-1 cursor-not-allowed"
                              disabled={true}
                              title="Cancellation locked on challenge day"
                            >
                              🔒 Locked
                            </button>
                          );
                        }
                        
                        // Normal cancel button (red)
                        return (
                          <button
                            onClick={() => handleCancelChallenge(challenge.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium mt-1 transition-colors focus:ring-1 focus:ring-red-500 focus:ring-offset-1"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
              
              {challenges.filter(challenge => {
                const today = getLocalDate();
                return challenge.challengeDate > today && challenge.status === 'PENDING';
              }).length === 0 && (
                <div className="card text-center py-8">
                  <Calendar className="w-12 h-12 text-morning-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-morning-900 mb-2">
                    No Upcoming Challenges
                  </h3>
                  <p className="text-morning-600">
                    Use the "Create Challenge" button in the navigation bar to plan ahead!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Challenge Pledges Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-morning-900 mb-4">Challenge Pledges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Money Pledged on Next Challenge */}
            <div className="card border-l-4 border-cyan-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-morning-600 mb-1 font-medium">Next Challenge Pledge</p>
                  <p className="text-3xl font-bold text-cyan-600">
                    ₹{getNextChallenge()?.forfeitAmount || 0}
                  </p>
                  <p className="text-xs text-morning-500 mt-2">
                    {getNextChallenge() 
                      ? `Due ${new Date(getNextChallenge()!.challengeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'No upcoming challenges'
                    }
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-cyan-50">
                  <Target className="w-7 h-7 text-cyan-600" />
                </div>
              </div>
            </div>

            {/* Total Pledged Amount */}
            <div className="card border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-morning-600 mb-1 font-medium">Total Pledged</p>
                  <p className="text-3xl font-bold text-orange-600">
                    ₹{getPendingChallenges().reduce((total, challenge) => total + challenge.forfeitAmount, 0)}
                  </p>
                  <p className="text-xs text-morning-500 mt-2">
                    {getPendingChallenges().length} active challenges
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-orange-50">
                  <AlertCircle className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {userStats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-morning-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-morning-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-morning-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="card hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-center space-x-4 mb-3">
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <div className={action.color}>
                      {action.icon}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-morning-400 ml-auto" />
                </div>
                <h3 className="font-semibold text-morning-900 mb-1">{action.title}</h3>
                <p className="text-sm text-morning-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Challenges */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-morning-900">Challenge History</h2>
            <button
              onClick={() => setShowAllHistory((v: boolean) => !v)}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              {showAllHistory ? 'Show Less' : 'View All'}
            </button>
          </div>
          <div className="space-y-4">
            {challenges
              .filter(challenge => challenge.status === 'COMPLETED' || challenge.status === 'PROCESSED')
              .sort((a, b) => {
                const toDate = (c: any) => {
                  const time = (c.wakeUpTime && c.wakeUpTime.length === 5) ? `${c.wakeUpTime}:00` : c.wakeUpTime;
                  return new Date(`${c.challengeDate}T${time}`);
                };
                return toDate(b).getTime() - toDate(a).getTime(); // DESC by wake time (and date)
              })
              .slice(0, showAllHistory ? 50 : 5)
              .map((challenge) => (
              <div key={challenge.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      challenge.isSuccessful ? 'bg-success-50' : 
                      challenge.status === 'PENDING' ? 'bg-warning-50' : 'bg-error-50'
                    }`}>
                      {challenge.isSuccessful ? (
                        <CheckCircle className="w-5 h-5 text-success-600" />
                      ) : challenge.status === 'PENDING' ? (
                        <Clock className="w-5 h-5 text-warning-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-error-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-morning-900">
                        {new Date(challenge.challengeDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-morning-600">
                        {challenge.wakeUpTime} • ₹{challenge.forfeitAmount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      challenge.isSuccessful ? 'text-success-600' : 
                      challenge.status === 'PENDING' ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {challenge.isSuccessful ? 'COMPLETED' : challenge.status === 'PENDING' ? 'PENDING' : 'FAILED'}
                    </p>
                    {challenge.isSuccessful && challenge.winningsAmount && (
                      <p className="text-xs text-success-600">+₹{challenge.winningsAmount}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {challenges.filter(challenge => challenge.status === 'COMPLETED' || challenge.status === 'PROCESSED').length === 0 && !loading && (
              <div className="card text-center py-8">
                <Trophy className="w-12 h-12 text-morning-400 mx-auto mb-4" />
                <p className="text-morning-600">No completed challenges yet. Complete your first challenge to see it here!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-morning-100">
              <h3 className="text-xl font-bold text-morning-900">Challenge Calendar</h3>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-morning-400 hover:text-morning-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between p-4 border-b border-morning-100">
              <button
                onClick={goToPreviousMonth}
                className="flex items-center space-x-2 px-3 py-2 text-morning-700 hover:bg-morning-50 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-4">
                <h4 className="text-lg font-semibold text-morning-900">
                  {formatMonthYear(calendarMonth)}
                </h4>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors"
                >
                  Today
                </button>
              </div>

              <button
                onClick={goToNextMonth}
                className="flex items-center space-x-2 px-3 py-2 text-morning-700 hover:bg-morning-50 rounded-lg transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-morning-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const daysInMonth = getDaysInMonth(calendarMonth);
                  const firstDayOfMonth = getFirstDayOfMonth(calendarMonth);
                  const today = new Date();
                  const calendarDays = [];

                  // Empty cells for days before month starts
                  for (let i = 0; i < firstDayOfMonth; i++) {
                    calendarDays.push(
                      <div key={`empty-${i}`} className="h-24 border border-morning-100 bg-morning-25"></div>
                    );
                  }

                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const currentDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                    const dateStr = getLocalDateString(currentDate);
                    const isToday = isSameDate(dateStr, today);
                    
                    // Find challenges for this day
                    const dayChallenges = challenges.filter(challenge => challenge.challengeDate === dateStr);
                    
                    calendarDays.push(
                      <div 
                        key={day} 
                        className={`h-24 border border-morning-100 p-1 ${isToday ? 'bg-cyan-50 border-cyan-300' : 'bg-white hover:bg-morning-25'} transition-colors relative`}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-cyan-700' : 'text-morning-900'}`}>
                          {day}
                          {isToday && <span className="text-xs text-cyan-600 ml-1">(Today)</span>}
                        </div>
                        
                        {/* Challenge indicators */}
                        <div className="space-y-1">
                          {dayChallenges.slice(0, 2).map((challenge) => (
                            <div
                              key={challenge.id}
                              className="flex items-center space-x-1 text-xs"
                              title={`${challenge.wakeUpTime} - ${challenge.status} (₹${challenge.forfeitAmount})`}
                            >
                              <div className={`w-2 h-2 rounded-full ${getChallengeStatusColor(challenge.status)}`}></div>
                              <span className="text-morning-700 truncate">
                                {challenge.wakeUpTime}
                              </span>
                            </div>
                          ))}
                          {dayChallenges.length > 2 && (
                            <div className="text-xs text-morning-500">
                              +{dayChallenges.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return calendarDays;
                })()}
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-morning-50 rounded-lg">
                <h5 className="text-sm font-medium text-morning-900 mb-3">Challenge Status Legend:</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-morning-700">Pending</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-morning-700">Success</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-morning-700">Failed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-morning-700">Processed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-morning-900 mb-4">Add Funds to Wallet</h3>
            
            <div className="mb-4 bg-cyan-50 border border-cyan-200 text-cyan-700 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Powered by Razorpay</span>
              </div>
              <p className="text-sm mt-1">Pay with UPI, Cards, Net Banking, Wallets & more</p>
              <p className="text-xs mt-1 opacity-75">All payment methods available at checkout</p>
            </div>
            
            {walletError && (
              <div className="mb-4 bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg">
                {walletError}
              </div>
            )}
            
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-morning-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100000"
                  step="1"
                  value={addFundsForm.amount}
                  onChange={(e) => setAddFundsForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-morning-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-lg"
                  placeholder="Enter amount (₹10 - ₹1,00,000)"
                  required
                />
                <p className="text-xs text-morning-500 mt-1">Choose from multiple payment options at checkout</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 py-2 px-4 border border-morning-300 text-morning-700 rounded-lg hover:bg-morning-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walletLoading}
                  className="flex-1 py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {walletLoading ? 'Calling Backend API...' : 'Add Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-morning-900 mb-4">Withdraw from Wallet</h3>
            
            {walletError && (
              <div className="mb-4 bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg">
                {walletError}
              </div>
            )}
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-morning-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  max="25000"
                  step="1"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-morning-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter amount (₹100 - ₹25,000)"
                  required
                />
                <p className="text-xs text-morning-500 mt-1">Processing fee: ₹5 for Bank Transfer, ₹2 for UPI</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-morning-700 mb-2">
                  Withdrawal Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="BANK_TRANSFER"
                      checked={withdrawForm.withdrawalMethod === 'BANK_TRANSFER'}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, withdrawalMethod: e.target.value as 'BANK_TRANSFER' }))}
                      className="text-cyan-600"
                    />
                    <Building className="w-5 h-5 text-cyan-600" />
                    <span>Bank Transfer (24-48 hours)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="UPI"
                      checked={withdrawForm.withdrawalMethod === 'UPI'}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, withdrawalMethod: e.target.value as 'UPI' }))}
                      className="text-cyan-600"
                    />
                    <Smartphone className="w-5 h-5 text-cyan-600" />
                    <span>UPI Transfer (Instant)</span>
                  </label>
                </div>
              </div>

              {withdrawForm.withdrawalMethod === 'BANK_TRANSFER' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-morning-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={withdrawForm.accountHolderName}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      className="w-full px-3 py-2 border border-morning-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="As per bank records"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-morning-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={withdrawForm.accountNumber}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-morning-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-morning-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={withdrawForm.ifscCode}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-morning-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="HDFC0001234"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-morning-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={withdrawForm.bankName}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-3 py-2 border border-morning-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="HDFC Bank"
                      required
                    />
                  </div>
                </>
              )}

              {withdrawForm.withdrawalMethod === 'UPI' && (
                <div>
                  <label className="block text-sm font-medium text-morning-700 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={withdrawForm.upiId}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, upiId: e.target.value }))}
                    className="w-full px-3 py-2 border border-morning-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="user@paytm"
                    required
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-2 px-4 border border-morning-300 text-morning-700 rounded-lg hover:bg-morning-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walletLoading}
                  className="flex-1 py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {walletLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;