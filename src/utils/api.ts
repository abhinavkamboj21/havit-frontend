const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Helper function for authenticated requests
export const authenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };
  
  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  // Don't automatically redirect on 401, let the calling code handle it
  return response;
};

// Helper function for error handling
export const handleApiError = (response: Response, data: any) => {
  switch (response.status) {
    case 400:
      return data.error || 'Invalid request';
    case 401:
      return 'Please login again';
    case 403:
      return 'Access denied';
    case 404:
      return 'Resource not found';
    case 500:
      return 'Server error. Please try again later';
    default:
      return 'An unexpected error occurred';
  }
};

// Authentication APIs
export const authAPI = {
  // Email registration
  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Email login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Google OAuth
  googleAuth: async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },



  // Get user profile
  getProfile: async () => {
    const response = await authenticatedRequest('/auth/profile');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    console.log('🔍 getProfile API raw response:', data);
    
    // Check if data is wrapped in a 'data' property
    if (data.data) {
      console.log('📦 getProfile: Using data.data:', data.data);
      return data.data;
    }
    
    console.log('📦 getProfile: Using raw data:', data);
    return data;
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    const response = await authenticatedRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Logout
  logout: async () => {
    const response = await authenticatedRequest('/auth/logout', {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password?email=${email}`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password?token=${token}&newPassword=${newPassword}`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },
};

// Challenge Management APIs
export const challengeAPI = {
  // Create challenge
  createChallenge: async (challengeData: {
    challengeDate: string; // YYYY-MM-DD
    wakeUpTime: string; // HH:MM
    forfeitAmount: number; // 10-100
  }) => {
    const response = await authenticatedRequest('/challenges', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Get user challenges with pagination
  getChallenges: async (page: number = 0, size: number = 10) => {
    const response = await authenticatedRequest(`/challenges?page=${page}&size=${size}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Get challenge by ID
  getChallengeById: async (challengeId: number) => {
    const response = await authenticatedRequest(`/challenges/${challengeId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Get challenge by date
  getChallengeByDate: async (date: string) => {
    const response = await authenticatedRequest(`/challenges/date/${date}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Get challenges by status
  getChallengesByStatus: async (status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PROCESSED') => {
    const response = await authenticatedRequest(`/challenges/status/${status}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Verify challenge (check-in)
  verifyChallenge: async (verificationData: {
    challengeId: number;
    verificationMethod: 'PHOTO' | 'LOCATION' | 'MANUAL' | 'ALARM';
    checkInPhotoUrl?: string;
    checkInLocation?: string;
    notes?: string;
  }) => {
    const response = await authenticatedRequest('/challenges/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Cancel challenge
  cancelChallenge: async (challengeId: number) => {
    const response = await authenticatedRequest(`/challenges/${challengeId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Get user statistics
  getStats: async () => {
    const response = await authenticatedRequest('/challenges/stats');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Check if can create challenge
  canCreateChallenge: async (date: string) => {
    const response = await authenticatedRequest(`/challenges/can-create?date=${date}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Create test challenge (no restrictions)
  createTestChallenge: async (challengeData: {
    challengeDate: string; // YYYY-MM-DD
    wakeUpTime: string; // HH:MM
    forfeitAmount: number; // 10-100
    status?: string; // Optional status override
  }) => {
    const response = await authenticatedRequest('/test/challenges/create-test-challenge', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },
};

// Transaction display helper utility
export const getTransactionDisplayInfo = (transaction: any) => {
  const icons: { [key: string]: string } = {
    'CHALLENGE_FORFEIT': '🎯',
    'CHALLENGE_REFUND': '💰', 
    'CHALLENGE_WINNINGS': '🏆',
    'DEPOSIT': '📥',
    'WITHDRAWAL': '📤'
  };

  const colors: { [key: string]: string } = {
    'CHALLENGE_FORFEIT': 'text-orange-600',
    'CHALLENGE_REFUND': 'text-blue-600',
    'CHALLENGE_WINNINGS': 'text-green-600',
    'DEPOSIT': 'text-green-600',
    'WITHDRAWAL': 'text-red-600'
  };

  const titles: { [key: string]: string } = {
    'CHALLENGE_FORFEIT': 'Challenge Forfeit',
    'CHALLENGE_REFUND': 'Challenge Refund',
    'CHALLENGE_WINNINGS': 'Challenge Winnings',
    'DEPOSIT': 'Wallet Deposit',
    'WITHDRAWAL': 'Wallet Withdrawal'
  };

  return {
    icon: icons[transaction.type] || '💳',
    color: colors[transaction.type] || 'text-gray-600',
    title: titles[transaction.type] || transaction.description || transaction.type.replace('_', ' ')
  };
};

// Wallet Management APIs
export const walletAPI = {
  // Get wallet balance
  getBalance: async () => {
    const response = await authenticatedRequest('/wallet/balance');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data.data;
  },

  // Add funds (deposit) - Razorpay Integration
  deposit: async (depositData: {
    amount: number;
  }) => {
    const response = await authenticatedRequest('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data.data;
  },

  // Withdraw funds
  withdraw: async (withdrawalData: {
    amount: number;
    withdrawalMethod: 'BANK_TRANSFER' | 'UPI';
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
      bankName: string;
    };
    upiId?: string;
  }) => {
    const response = await authenticatedRequest('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data.data;
  },



  // Get transaction history
  getTransactions: async (params: {
    page?: number;
    size?: number;
    type?: 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'EARNING' | 'FORFEIT';
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await authenticatedRequest(`/wallet/transactions?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data.data;
  },

  // Get transaction details
  getTransactionDetails: async (transactionId: string) => {
    const response = await authenticatedRequest(`/wallet/transactions/${transactionId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data.data;
  },

  // Get payment methods and limits
  getPaymentMethods: async () => {
    const response = await authenticatedRequest('/wallet/payment-methods');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data.data;
  },

  // Get earnings summary
  getEarnings: async (params: {
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await authenticatedRequest(`/wallet/earnings?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data.data;
  },

  // Get wallet notifications
  getNotifications: async (params: {
    page?: number;
    size?: number;
    unreadOnly?: boolean;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await authenticatedRequest(`/wallet/notifications?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string) => {
    const response = await authenticatedRequest(`/wallet/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Verify payment with backend (using Razorpay polling)
  verifyPayment: async (orderId: string, paymentId: string) => {
    console.log('🔄 Verifying payment with backend:', { orderId, paymentId });

    const response = await authenticatedRequest('/wallet/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        orderId: orderId,
        paymentId: paymentId
      }).toString(),
    });

    const data = await response.json();
    console.log('📋 Payment verification response:', data);

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Withdrawal APIs
  validateWithdrawal: async (amount: number, withdrawalMethod: string) => {
    const response = await authenticatedRequest('/wallet/withdraw/validate', {
      method: 'POST',
      body: JSON.stringify({ amount, withdrawalMethod }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  processWithdrawal: async (withdrawalData: {
    amount: number;
    withdrawalMethod: string;
    upiId?: string;
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
      bankName: string;
    };
  }) => {
    const response = await authenticatedRequest('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },
};

// Email Verification APIs
export const emailAPI = {
  // Verify email with token
  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Resend verification email
  resendVerification: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification?email=${email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },
};

// Password Reset APIs
export const passwordResetAPI = {
  // Request password reset
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Verify reset token
  verifyResetToken: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string, confirmPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },
};

// SMS Verification APIs
export const smsAPI = {
  // Send SMS verification code
  sendSMSVerification: async (phoneNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/send-sms-verification?phoneNumber=${encodeURIComponent(phoneNumber)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  // Verify SMS code
  verifySMSCode: async (phoneNumber: string, code: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },
};

// Streaks API
export const streaksAPI = {
  getStreaks: async () => {
    const response = await authenticatedRequest('/streaks');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  getStatistics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await authenticatedRequest(`/streaks/statistics?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },
};

// Achievements API
export const achievementsAPI = {
  getAchievements: async (params: {
    page?: number;
    size?: number;
    category?: string;
    state?: 'locked' | 'in_progress' | 'unlocked' | 'claimed';
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.state) queryParams.append('state', params.state);

    const response = await authenticatedRequest(`/achievements?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  claimReward: async (achievementKey: string, tier: number) => {
    const response = await authenticatedRequest('/achievements/claim', {
      method: 'POST',
      body: JSON.stringify({ achievementKey, tier }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  getActivity: async (limit: number = 20) => {
    const response = await authenticatedRequest(`/achievements/activity?limit=${limit}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  getUnclaimed: async () => {
    const response = await authenticatedRequest('/achievements/unclaimed');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  getDefinitions: async () => {
    const response = await authenticatedRequest('/achievements/definitions');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },

  getStatistics: async () => {
    const response = await authenticatedRequest('/achievements/statistics');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(handleApiError(response, data));
    }

    return data;
  },
}; 