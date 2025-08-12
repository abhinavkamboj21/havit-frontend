import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../utils/api';

interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  balance: number;
  currentStreak: number;
  longestStreak: number;
  totalSuccessfulWakeUps: number;
  totalChallenges: number;
  totalEarnings: number;
  totalLosses: number;
  successRate: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePictureUrl?: string;
  // Additional profile fields
  city?: string;
  occupation?: string;
  institutionName?: string;
  emergencyContact?: string;
  preferredWakeUpTime?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem('token');
    console.log('🔍 AuthContext: Checking for token on app load:', token ? 'Token found' : 'No token');
    
    if (token) {
      console.log('🔄 AuthContext: Token found, refreshing user...');
      refreshUser();
    } else {
      // No token found, user is not authenticated
      console.log('❌ AuthContext: No token found, user not authenticated');
      setUser(null);
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 refreshUser: Starting with token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.log('❌ refreshUser: No token found, setting user to null');
        setUser(null);
        setLoading(false);
        return;
      }
      
      console.log('📡 refreshUser: Calling getProfile API...');
      const userData = await authAPI.getProfile();
      console.log('✅ refreshUser: User data fetched successfully:', userData);
      setUser(userData);
    } catch (error) {
      console.error('❌ refreshUser: Failed to refresh user:', error);
      // Clear invalid token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      console.log('🏁 refreshUser: Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      console.log('Login response:', response); // Debug log
      
      // Store token and user data
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        console.log('Token stored:', response.token); // Debug log
        
        // Create basic user data from login response
        const userData = {
          id: response.userId,
          email: response.email,
          fullName: response.fullName,
          phoneNumber: response.phoneNumber,
          balance: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalSuccessfulWakeUps: 0,
          totalChallenges: 0,
          totalEarnings: 0,
          totalLosses: 0,
          successRate: 0,
          isEmailVerified: response.isEmailVerified || false,
          isPhoneVerified: response.isPhoneVerified || false,
          profilePictureUrl: undefined,
        };
        console.log('User data set from login response:', userData); // Debug log
        setUser(userData);
        
        // Try to get full profile data in background (don't block login)
        try {
          const fullProfile = await authAPI.getProfile();
          console.log('Full profile loaded:', fullProfile);
          setUser(fullProfile);
        } catch (profileError) {
          console.warn('Could not load full profile, using basic data:', profileError);
          // Keep using the basic user data from login response
        }
      } else {
        console.error('No token in response:', response);
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      console.log('🔄 AuthContext: Starting registration API call');
      const response = await authAPI.register(userData);
      console.log('📡 AuthContext: Registration API response:', response);
      
      if (!response.token) {
        console.error('❌ AuthContext: No token in registration response');
        throw new Error('Registration failed - no token received');
      }
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      console.log('💾 AuthContext: Token and user data stored');
      
      // Fetch full user profile
      console.log('🔄 AuthContext: Refreshing user profile');
      await refreshUser();
      console.log('✅ AuthContext: Registration completed successfully');
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      console.log('🔐 googleLogin called with idToken:', idToken ? 'Present' : 'Missing');
      const response = await authAPI.googleAuth(idToken);
      console.log('📡 Google auth API response:', response);
      
      // Store token and user data
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        console.log('💾 Token stored in localStorage');
        
        // Create user data from Google auth response
        const userData = {
          id: response.userId,
          email: response.email,
          fullName: response.fullName,
          phoneNumber: response.phoneNumber || '',
          balance: response.balance || 0,
          currentStreak: response.currentStreak || 0,
          longestStreak: response.longestStreak || 0,
          totalSuccessfulWakeUps: response.totalSuccessfulWakeUps || 0,
          totalChallenges: response.totalChallenges || 0,
          totalEarnings: response.totalEarnings || 0,
          totalLosses: response.totalLosses || 0,
          successRate: response.successRate || 0,
          isEmailVerified: response.isEmailVerified || true, // Google users are email verified
          isPhoneVerified: response.isPhoneVerified || false,
          profilePictureUrl: response.profilePictureUrl || undefined,
        };
        console.log('👤 User data set from Google response:', userData);
        setUser(userData);
        
        // Try to get full profile data in background (don't block login)
        try {
          const fullProfile = await authAPI.getProfile();
          console.log('📊 Full profile loaded:', fullProfile);
          setUser(fullProfile);
        } catch (profileError) {
          console.warn('⚠️ Could not load full profile, using Google response data:', profileError);
          // Keep using the user data from Google response
        }
        
        console.log('✅ Google login completed successfully');
      } else {
        console.error('❌ No token in Google auth response:', response);
        throw new Error('Google authentication failed - no token received');
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };



  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // The navigate function was removed from AuthContext, so this line is removed.
      // If navigation is needed after logout, it should be handled by the component
      // that uses the AuthContext, or the AuthProvider should manage navigation state.
    }
  };

  // Helper function to check if profile is complete
  const checkProfileComplete = (userData: User | null): boolean => {
    if (!userData) return false;
    
    // Basic required fields for a complete profile
    const hasBasicInfo = !!(
      userData.fullName &&
      userData.email
    );
    
    // Check if onboarding is complete - require key onboarding fields
    const hasOnboardingInfo = !!(
      userData.phoneNumber &&
      userData.city &&
      userData.occupation
    );
    
    // Profile is complete only if both basic info and onboarding are done
    console.log('🔍 Profile completion check:', {
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      city: userData.city,
      occupation: userData.occupation,
      hasBasicInfo,
      hasOnboardingInfo,
      isComplete: hasBasicInfo && hasOnboardingInfo
    });
    
    return hasBasicInfo && hasOnboardingInfo;
  };

  const value = {
    user,
    isAuthenticated: !!user && !loading,
    isProfileComplete: checkProfileComplete(user),
    login,
    register,
    googleLogin,
    logout,
    loading,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 