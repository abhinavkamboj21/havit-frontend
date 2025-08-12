import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { achievementsAPI } from '../utils/api';
import { 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  DollarSign, 
  Calendar,
  Star,
  Lock,
  CheckCircle,
  Gift,
  TrendingUp,
  Zap,
  Crown,
  Award
} from 'lucide-react';

interface Achievement {
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tiers: Array<{
    tier: number;
    threshold: number;
    rewardAmount?: number;
  }>;
  userProgress: {
    current: number;
    unlockedTier: number;
    claimedTier: number;
    nextThreshold: number | null;
    state: 'locked' | 'in_progress' | 'unlocked' | 'claimed';
    unlockedAt?: string;
  };
}

const getAchievementIcon = (iconName: string, className: string = "w-6 h-6") => {
  const icons: { [key: string]: any } = {
    flame: <Flame className={className} />,
    trophy: <Trophy className={className} />,
    target: <Target className={className} />,
    clock: <Clock className={className} />,
    dollar: <DollarSign className={className} />,
    calendar: <Calendar className={className} />,
    star: <Star className={className} />,
    award: <Award className={className} />,
    crown: <Crown className={className} />,
    zap: <Zap className={className} />,
    check: <CheckCircle className={className} />,
    trending: <TrendingUp className={className} />
  };
  return icons[iconName] || <Trophy className={className} />;
};

const getStateColor = (state: string) => {
  switch (state) {
    case 'claimed': return 'text-green-600 bg-green-50 border-green-200';
    case 'unlocked': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'in_progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'locked': return 'text-gray-400 bg-gray-50 border-gray-200';
    default: return 'text-gray-400 bg-gray-50 border-gray-200';
  }
};

const AchievementsPage = () => {
  const { user, refreshUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  const categories = ['All', 'Streaks', 'Consistency', 'Early Bird', 'High Stakes', 'Weekly Goals', 'Milestone'];

  // Load achievements data
  useEffect(() => {
    const loadAchievements = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError('');
        const response = await achievementsAPI.getAchievements({ size: 50 });
        console.log('🏆 Achievements data loaded:', response);
        setAchievements(response.data.achievements || []);
      } catch (error: any) {
        console.error('❌ Failed to load achievements:', error);
        setError(error.message || 'Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [user]);

  // Claim reward function
  const handleClaimReward = async (achievementKey: string, tier: number) => {
    try {
      setClaimingReward(achievementKey);
      setError('');
      
      console.log('🎁 Claiming reward:', { achievementKey, tier });
      const response = await achievementsAPI.claimReward(achievementKey, tier);
      console.log('✅ Reward claimed successfully:', response);
      
      // Show success message
      const rewardAmount = response.data.rewardAmount;
      if (rewardAmount > 0) {
        alert(`🎉 Reward claimed! ₹${rewardAmount} has been added to your wallet.`);
        // Refresh user data to update wallet balance
        await refreshUser();
      } else {
        alert('🎉 Achievement unlocked!');
      }
      
      // Reload achievements to reflect claimed status
      const updatedAchievements = await achievementsAPI.getAchievements({ size: 50 });
      setAchievements(updatedAchievements.data.achievements || []);
      
    } catch (error: any) {
      console.error('❌ Failed to claim reward:', error);
      setError(error.message || 'Failed to claim reward');
    } finally {
      setClaimingReward(null);
    }
  };

  // Filter achievements by category
  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'All' || achievement.category === selectedCategory
  );

  // Group achievements by state for better organization
  const groupedAchievements = {
    unlocked: filteredAchievements.filter(a => a.userProgress.state === 'unlocked'),
    in_progress: filteredAchievements.filter(a => a.userProgress.state === 'in_progress'),
    claimed: filteredAchievements.filter(a => a.userProgress.state === 'claimed'),
    locked: filteredAchievements.filter(a => a.userProgress.state === 'locked'),
  };

  const renderProgressBar = (achievement: Achievement) => {
    const { current, nextThreshold } = achievement.userProgress;
    const currentTier = achievement.tiers[achievement.userProgress.unlockedTier] || achievement.tiers[0];
    const progressTarget = nextThreshold || currentTier.threshold;
    const progressPercent = Math.min((current / progressTarget) * 100, 100);

    return (
      <div className="mt-3">
        <div className="flex items-center justify-between text-sm text-morning-600 mb-1">
          <span>Progress: {current} / {progressTarget}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-morning-200 rounded-full h-2">
          <div 
            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  };

  const renderAchievement = (achievement: Achievement) => {
    const { userProgress } = achievement;
    const currentTier = achievement.tiers[userProgress.unlockedTier];
    const nextTier = achievement.tiers[userProgress.unlockedTier + 1];
    const canClaim = userProgress.state === 'unlocked' && userProgress.unlockedTier > userProgress.claimedTier;

    return (
      <div key={achievement.key} className={`card ${getStateColor(userProgress.state)} border`}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${userProgress.state === 'locked' ? 'bg-gray-200' : 'bg-white'}`}>
            {userProgress.state === 'locked' ? (
              <Lock className="w-6 h-6 text-gray-400" />
            ) : (
              getAchievementIcon(achievement.icon)
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-morning-900">{achievement.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                userProgress.state === 'claimed' ? 'bg-green-100 text-green-800' :
                userProgress.state === 'unlocked' ? 'bg-blue-100 text-blue-800' :
                userProgress.state === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {userProgress.state === 'claimed' ? 'Claimed' :
                 userProgress.state === 'unlocked' ? 'Ready to Claim' :
                 userProgress.state === 'in_progress' ? 'In Progress' :
                 'Locked'}
              </span>
            </div>
            
            <p className="text-morning-600 text-sm mt-1">{achievement.description}</p>
            
            {/* Show current tier info */}
            {currentTier && (
              <div className="mt-2 text-sm">
                <span className="text-morning-700 font-medium">
                  Tier {currentTier.tier}: {currentTier.threshold} required
                </span>
                {currentTier.rewardAmount && currentTier.rewardAmount > 0 && (
                  <span className="ml-2 text-green-600 font-medium">
                    (₹{currentTier.rewardAmount} reward)
                  </span>
                )}
              </div>
            )}
            
            {/* Show next tier info */}
            {nextTier && userProgress.state !== 'locked' && (
              <div className="mt-1 text-sm text-morning-500">
                Next: Tier {nextTier.tier} at {nextTier.threshold}
                {nextTier.rewardAmount && nextTier.rewardAmount > 0 && (
                  <span className="text-green-600"> (₹{nextTier.rewardAmount})</span>
                )}
              </div>
            )}
            
            {/* Progress bar for in-progress achievements */}
            {userProgress.state === 'in_progress' && renderProgressBar(achievement)}
            
            {/* Claim button for unlocked achievements */}
            {canClaim && (
              <div className="mt-4">
                <button
                  onClick={() => handleClaimReward(achievement.key, userProgress.unlockedTier)}
                  disabled={claimingReward === achievement.key}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>
                    {claimingReward === achievement.key ? 'Claiming...' : 
                     currentTier?.rewardAmount ? `Claim ₹${currentTier.rewardAmount}` : 'Claim Achievement'}
                  </span>
                </button>
              </div>
            )}
            
            {/* Claimed status */}
            {userProgress.state === 'claimed' && (
              <div className="mt-3 flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-morning-600">Loading achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-morning-900 mb-2">🏆 Achievements</h1>
        <p className="text-morning-600">Track your progress and earn rewards for your wake-up journey</p>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-morning-900 mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-cyan-500 text-white'
                  : 'bg-morning-100 text-morning-700 hover:bg-morning-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Sections */}
      {groupedAchievements.unlocked.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-morning-900 mb-4 flex items-center space-x-2">
            <Gift className="w-5 h-5 text-blue-600" />
            <span>Ready to Claim ({groupedAchievements.unlocked.length})</span>
          </h2>
          <div className="space-y-4">
            {groupedAchievements.unlocked.map(renderAchievement)}
          </div>
        </div>
      )}

      {groupedAchievements.in_progress.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-morning-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <span>In Progress ({groupedAchievements.in_progress.length})</span>
          </h2>
          <div className="space-y-4">
            {groupedAchievements.in_progress.map(renderAchievement)}
          </div>
        </div>
      )}

      {groupedAchievements.claimed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-morning-900 mb-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Completed ({groupedAchievements.claimed.length})</span>
          </h2>
          <div className="space-y-4">
            {groupedAchievements.claimed.map(renderAchievement)}
          </div>
        </div>
      )}

      {groupedAchievements.locked.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-morning-900 mb-4 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-gray-500" />
            <span>Locked ({groupedAchievements.locked.length})</span>
          </h2>
          <div className="space-y-4">
            {groupedAchievements.locked.map(renderAchievement)}
          </div>
        </div>
      )}

      {filteredAchievements.length === 0 && !loading && (
        <div className="card text-center py-8">
          <Trophy className="w-12 h-12 text-morning-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-morning-900 mb-2">No achievements found</h3>
          <p className="text-morning-600">
            {selectedCategory === 'All' 
              ? 'Start completing challenges to unlock achievements!'
              : `No achievements in ${selectedCategory} category yet.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;