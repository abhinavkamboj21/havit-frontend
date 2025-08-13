import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { challengeAPI } from '../utils/api';
import { useAuth } from './AuthContext';

interface Challenge {
  id: number;
  challengeDate: string;
  wakeUpTime: string;
  forfeitAmount: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PROCESSED';
  statusDescription: string;
  isCompleted: boolean;
  isSuccessful: boolean;
  canCheckIn: boolean;
  isWithinGracePeriod: boolean;
  gracePeriodStartTime?: string;
  gracePeriodEndTime?: string;
  isOverdue: boolean;
  timeRemainingMinutes?: number;
  checkInTime?: string;
  verificationMethod?: string;
  winningsAmount?: number;
  failureReason?: string;
  actualForfeitAmount?: number;
  createdAt: string;
}

interface ChallengeStats {
  totalChallenges: number;
  successfulChallenges: number;
  failedChallenges: number;
  currentStreak: number;
  longestStreak: number;
  successRate: number;
}

interface ChallengeContextType {
  challenges: Challenge[];
  todayChallenge: Challenge | null;
  stats: ChallengeStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createChallenge: (challengeDate: string, wakeUpTime: string, forfeitAmount: number) => Promise<Challenge>;
  getChallenges: (page?: number, size?: number) => Promise<void>;
  getTodayChallenge: () => Promise<void>;
  getChallengeByDate: (date: string) => Promise<Challenge | null>;
  verifyChallenge: (challengeId: number, verificationData: any) => Promise<any>;
  cancelChallenge: (challengeId: number) => Promise<void>;
  refreshStats: () => Promise<void>;
  canCreateChallenge: (date: string) => Promise<boolean>;
  clearError: () => void;
  resetChallengeData: () => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};

interface ChallengeProviderProps {
  children: ReactNode;
}

export const ChallengeProvider: React.FC<ChallengeProviderProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  
  const resetChallengeData = () => {
    setChallenges([]);
    setTodayChallenge(null);
    setStats(null);
    setError(null);
    setLoading(false);
  };

  const createChallenge = async (challengeDate: string, wakeUpTime: string, forfeitAmount: number): Promise<Challenge> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎯 Creating challenge:', { challengeDate, wakeUpTime, forfeitAmount });
      const response = await challengeAPI.createChallenge({
        challengeDate,
        wakeUpTime,
        forfeitAmount
      });
      
      const newChallenge = response.challenge;
      console.log('✅ Challenge created successfully:', newChallenge);
      
      // Update local state
      setChallenges(prev => [newChallenge, ...prev]);
      
      // If it's today's challenge, update todayChallenge
      const today = new Date().toISOString().split('T')[0];
      if (challengeDate === today) {
        setTodayChallenge(newChallenge);
      }
      
      return newChallenge;
    } catch (err: any) {
      console.error('❌ Challenge creation failed:', err);
      setError(err.message || 'Failed to create challenge');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getChallenges = async (page: number = 0, size: number = 10): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching challenges:', { page, size });
      const response = await challengeAPI.getChallenges(page, size);
      console.log('✅ Challenges fetched:', response);
      
      if (page === 0) {
        setChallenges(response.challenges);
      } else {
        setChallenges(prev => [...prev, ...response.challenges]);
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch challenges:', err);
      setError(err.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const getTodayChallenge = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Fetching today\'s challenge for:', today);
      
      const response = await challengeAPI.getChallengeByDate(today);
      console.log('✅ Today\'s challenge response:', response);
      const list = response.challenges || (response.challenge ? [response.challenge] : []);
      if (!list || list.length === 0) {
        setTodayChallenge(null);
      } else {
        // Derive active challenge per priority
        const parseTime = (t: string) => {
          const [hh, mm] = t.split(':').map(Number);
          return hh * 60 + mm;
        };
        const isWithinWindow = (c: any) => c.isWithinGracePeriod || c.canCheckIn;

        const pending = list.filter((c: any) => c.status === 'PENDING');
        const inWindow = pending.filter(isWithinWindow);
        let selected: any | null = null;
        if (inWindow.length > 0) {
          selected = inWindow.sort((a: any, b: any) => parseTime(a.wakeUpTime) - parseTime(b.wakeUpTime))[0];
        } else if (pending.length > 0) {
          // next upcoming pending today
          selected = pending.sort((a: any, b: any) => parseTime(a.wakeUpTime) - parseTime(b.wakeUpTime))[0];
        } else {
          // most recent completed today (by wake time desc)
          const completed = list.filter((c: any) => c.status === 'COMPLETED' || c.status === 'PROCESSED');
          selected = completed.sort((a: any, b: any) => parseTime(b.wakeUpTime) - parseTime(a.wakeUpTime))[0] || null;
        }
        setTodayChallenge(selected);
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch today\'s challenge:', err);
      setError(err.message || 'Failed to load today\'s challenge');
      setTodayChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  const getChallengeByDate = async (date: string): Promise<Challenge | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📅 Fetching challenge for date:', date);
      const response = await challengeAPI.getChallengeByDate(date);
      console.log('✅ Challenge by date response:', response);
      const list = response.challenges || (response.challenge ? [response.challenge] : []);
      return list && list.length > 0 ? list[0] : null;
    } catch (err: any) {
      console.error('❌ Failed to fetch challenge by date:', err);
      setError(err.message || 'Failed to load challenge');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyChallenge = async (challengeId: number, verificationData: any): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('✅ Verifying challenge:', challengeId, verificationData);
      const response = await challengeAPI.verifyChallenge({
        challengeId,
        ...verificationData
      });
      console.log('✅ Challenge verification response:', response);
      
      // Update local state
      const updatedChallenge = response.challenge;
      setChallenges(prev => 
        prev.map(c => c.id === challengeId ? updatedChallenge : c)
      );
      
      // Update today's challenge if it's the one being verified
      if (todayChallenge && todayChallenge.id === challengeId) {
        setTodayChallenge(updatedChallenge);
      }
      
      return response;
    } catch (err: any) {
      console.error('❌ Challenge verification failed:', err);
      setError(err.message || 'Failed to verify challenge');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelChallenge = async (challengeId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚫 Cancelling challenge:', challengeId);
      await challengeAPI.cancelChallenge(challengeId);
      console.log('✅ Challenge cancelled successfully');
      
      // Remove from local state
      setChallenges(prev => prev.filter(c => c.id !== challengeId));
      
      // Clear today's challenge if it was cancelled
      if (todayChallenge && todayChallenge.id === challengeId) {
        setTodayChallenge(null);
      }
    } catch (err: any) {
      console.error('❌ Challenge cancellation failed:', err);
      setError(err.message || 'Failed to cancel challenge');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching challenge statistics...');
      const response = await challengeAPI.getStats();
      console.log('✅ Stats fetched:', response);
      
      setStats(response);
    } catch (err: any) {
      console.error('❌ Failed to fetch stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const canCreateChallenge = async (date: string): Promise<boolean> => {
    try {
      console.log('🔍 Checking if can create challenge for:', date);
      const response = await challengeAPI.canCreateChallenge(date);
      console.log('✅ Can create challenge response:', response);
      
      return response.canCreate;
    } catch (err: any) {
      console.error('❌ Failed to check challenge creation:', err);
      return false;
    }
  };

  // Load initial data only when authenticated
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated || authLoading) {
        console.log('🔄 Waiting for authentication before loading challenge data...');
        // Clear data when not authenticated
        if (!authLoading && !isAuthenticated) {
          resetChallengeData();
        }
        return;
      }
      
      try {
        console.log('🔐 User authenticated, loading challenge data...');
        await Promise.all([
          getChallenges(0, 10),
          getTodayChallenge(),
          refreshStats()
        ]);
        console.log('✅ Initial challenge data loaded successfully');
      } catch (error: any) {
        console.error('❌ Failed to load initial challenge data:', error);
        // Only show error if it's not an authentication error
        const errorMessage = error?.message || error?.toString() || '';
        if (!errorMessage.includes('401') && !errorMessage.includes('Unauthorized')) {
          setError('Failed to load challenge data. Please try refreshing the page.');
        }
      }
    };

    loadInitialData();
  }, [isAuthenticated, authLoading]);

  const value = {
    challenges,
    todayChallenge,
    stats,
    loading,
    error,
    createChallenge,
    getChallenges,
    getTodayChallenge,
    getChallengeByDate,
    verifyChallenge,
    cancelChallenge,
    refreshStats,
    canCreateChallenge,
    clearError,
    resetChallengeData,
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
};