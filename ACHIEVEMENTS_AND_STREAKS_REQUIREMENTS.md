# Backend Requirements: Achievements and Streaks System

## 1. Overview
Implement a comprehensive achievements and streaks system that:
- Tracks users' daily wake-up performance as streaks
- Awards achievements based on various milestones and behaviors
- Integrates seamlessly with the existing challenge verification system
- Provides wallet rewards for certain achievements
- Maintains detailed progress tracking and history

## 2. Core Definitions

### Streaks
- **Definition**: Consecutive days of successful wake-up challenges
- **Increment Rule**: +1 per calendar day when at least one challenge for that day is marked as SUCCESS
- **Break Rule**: Breaks when a scheduled challenge exists for a day and ALL challenges for that day are FAILED
- **Multiple Challenges**: Multiple successful challenges on the same day count as only 1 day toward streak
- **No Schedule Rule**: Days without scheduled challenges do NOT break the streak (configurable via `breakOnNoSchedule` flag)

### Achievements
- **Structure**: Multi-tiered achievements with progressive rewards
- **States**: `locked` | `in_progress` | `unlocked` | `claimed`
- **Categories**: Streaks, Consistency, Early Bird, High Stakes, Weekly Goals, etc.
- **Rewards**: Optional wallet credits (₹) for certain achievement tiers
- **Progress**: Real-time tracking toward next milestone

### Date/Time Handling
- Use user's local timezone for day boundary calculations
- Store timezone preference in user profile
- Calendar day = user's local date, not UTC

## 3. Database Schema

### Table: `user_streaks`
```sql
CREATE TABLE user_streaks (
    user_id BIGINT PRIMARY KEY,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_success_date DATE,
    current_run_start_date DATE,
    total_successful_days INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Table: `achievement_definitions`
```sql
CREATE TABLE achievement_definitions (
    achievement_key VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    criteria JSON NOT NULL,
    tiers JSON NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `user_achievements`
```sql
CREATE TABLE user_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_key VARCHAR(100) NOT NULL,
    current_progress INT DEFAULT 0,
    unlocked_tier INT DEFAULT 0,
    unlocked_at TIMESTAMP NULL,
    claimed_tier INT DEFAULT 0,
    claimed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_achievement (user_id, achievement_key),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_key) REFERENCES achievement_definitions(achievement_key)
);
```

### Table: `streak_events` (Audit Trail)
```sql
CREATE TABLE streak_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    challenge_id BIGINT NOT NULL,
    challenge_date DATE NOT NULL,
    result ENUM('SUCCESS', 'FAILED') NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);
```

## 4. JSON Schema Examples

### Achievement Criteria JSON
```json
{
  "type": "TOTAL_COMPLETIONS",
  "threshold": 10
}

{
  "type": "STREAK_DAYS",
  "threshold": 7
}

{
  "type": "EARLY_TIME_COMPLETIONS",
  "before": "05:00",
  "threshold": 5
}

{
  "type": "HIGH_FORFEIT_COMPLETIONS",
  "minForfeit": 50,
  "threshold": 3
}

{
  "type": "PERFECT_WEEK",
  "requiredDays": 7
}
```

### Achievement Tiers JSON
```json
[
  {
    "tier": 1,
    "threshold": 3,
    "rewardAmount": 0
  },
  {
    "tier": 2,
    "threshold": 7,
    "rewardAmount": 25
  },
  {
    "tier": 3,
    "threshold": 14,
    "rewardAmount": 50
  }
]
```

## 5. Event System Integration

### Challenge Verification Event
When a challenge is verified (existing flow), emit internal event:
```json
{
  "event": "CHALLENGE_VERIFIED",
  "data": {
    "userId": 123,
    "challengeId": 456,
    "challengeDate": "2025-08-10",
    "wakeUpTime": "06:30",
    "result": "SUCCESS",
    "forfeitAmount": 25,
    "verificationTime": "2025-08-10T06:35:00Z"
  }
}
```

### Event Handler Responsibilities
1. **Idempotency**: Use `challengeId` to ensure each challenge is processed only once
2. **Streak Updates**: Calculate and update user streak counters
3. **Achievement Progress**: Update progress for all relevant achievements
4. **Tier Unlocking**: Check if any achievement tiers are newly unlocked
5. **Wallet Rewards**: Credit wallet for reward-bearing achievements via existing wallet service

## 6. API Endpoints

### GET `/api/v1/streaks`
**Authentication**: Required  
**Description**: Get user's current streak information

**Response**:
```json
{
  "success": true,
  "data": {
    "currentStreak": 4,
    "longestStreak": 12,
    "lastSuccessDate": "2025-08-10",
    "currentRunStartDate": "2025-08-07",
    "totalSuccessfulDays": 28,
    "timezone": "Asia/Kolkata"
  }
}
```

### GET `/api/v1/achievements`
**Authentication**: Required  
**Description**: Get user's achievements with progress

**Query Parameters**:
- `category` (optional): Filter by category
- `state` (optional): Filter by state (locked|in_progress|unlocked|claimed)
- `page` (default: 0): Page number
- `size` (default: 20): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "key": "STREAK_BEGINNER",
        "name": "Streak Starter",
        "description": "Maintain a wake-up streak",
        "category": "Streaks",
        "icon": "flame",
        "tiers": [
          { "tier": 1, "threshold": 3, "rewardAmount": 0 },
          { "tier": 2, "threshold": 7, "rewardAmount": 25 }
        ],
        "userProgress": {
          "current": 4,
          "unlockedTier": 1,
          "claimedTier": 0,
          "nextThreshold": 7,
          "state": "unlocked",
          "unlockedAt": "2025-08-08T07:00:00Z"
        }
      }
    ],
    "pagination": {
      "totalElements": 15,
      "totalPages": 1,
      "currentPage": 0,
      "pageSize": 20
    }
  }
}
```

### POST `/api/v1/achievements/claim`
**Authentication**: Required  
**Description**: Claim reward for unlocked achievement tier

**Request Body**:
```json
{
  "achievementKey": "STREAK_BEGINNER",
  "tier": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "achievementKey": "STREAK_BEGINNER",
    "tier": 1,
    "rewardAmount": 25,
    "newWalletBalance": 1525.00,
    "claimedAt": "2025-08-10T08:30:00Z"
  }
}
```

**Error Cases**:
- `400`: Invalid tier or achievement key
- `404`: Achievement not found
- `409`: Tier already claimed
- `422`: Tier not yet unlocked

### GET `/api/v1/achievements/activity`
**Authentication**: Required  
**Description**: Get recent achievement activity/timeline

**Query Parameters**:
- `limit` (default: 20): Number of recent events

**Response**:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "type": "TIER_UNLOCKED",
        "achievementKey": "TOTAL_COMPLETIONS",
        "achievementName": "Consistent Performer",
        "tier": 2,
        "timestamp": "2025-08-10T07:00:00Z"
      },
      {
        "type": "PROGRESS_MADE",
        "achievementKey": "EARLY_BIRD",
        "achievementName": "Early Riser",
        "progressDelta": 1,
        "currentProgress": 3,
        "nextThreshold": 5,
        "timestamp": "2025-08-10T06:30:00Z"
      },
      {
        "type": "REWARD_CLAIMED",
        "achievementKey": "STREAK_BEGINNER",
        "achievementName": "Streak Starter",
        "tier": 1,
        "rewardAmount": 25,
        "timestamp": "2025-08-09T15:22:00Z"
      }
    ]
  }
}
```

### POST `/api/v1/admin/streaks/recalculate`
**Authentication**: Admin only  
**Description**: Recalculate streaks and achievements for testing/correction

**Request Body**:
```json
{
  "userId": 123,
  "fromDate": "2025-08-01",
  "toDate": "2025-08-10"
}
```

### GET `/api/v1/achievements/definitions`
**Authentication**: Optional  
**Description**: Get static achievement definitions (for caching)

**Response**:
```json
{
  "success": true,
  "data": {
    "definitions": [
      {
        "key": "STREAK_BEGINNER",
        "name": "Streak Starter",
        "description": "Maintain a wake-up streak",
        "category": "Streaks",
        "icon": "flame",
        "tiers": [
          { "tier": 1, "threshold": 3, "rewardAmount": 0 },
          { "tier": 2, "threshold": 7, "rewardAmount": 25 }
        ]
      }
    ]
  }
}
```

## 7. Wallet Integration

### New Transaction Type
Add `ACHIEVEMENT_REWARD` to existing wallet transaction types:
- `type`: `ACHIEVEMENT_REWARD`
- `credit`: `true`
- `description`: `"Achievement reward: {achievement_name} (Tier {tier})"`
- `reference`: `"achievement_{achievement_key}_tier_{tier}"`

### Reward Processing
When claiming achievement rewards:
1. Validate tier is unlocked but not claimed
2. Create wallet transaction via existing wallet service
3. Update achievement claimed status
4. Return updated wallet balance in response

## 8. Initial Achievement Catalog

### Streaks Category
- **STREAK_BEGINNER**: 3, 7, 14 days (Rewards: 0, 25, 50)
- **STREAK_CHAMPION**: 30, 60, 100 days (Rewards: 100, 200, 500)

### Consistency Category  
- **TOTAL_COMPLETIONS**: 10, 25, 50, 100 wake-ups (Rewards: 10, 25, 75, 200)
- **MONTHLY_PERFECT**: Complete all challenges in a month (Reward: 100)

### Early Bird Category
- **EARLY_RISER**: 5, 15, 30 wake-ups before 5:00 AM (Rewards: 20, 50, 150)
- **SUNRISE_WARRIOR**: 10 wake-ups before 4:30 AM (Reward: 100)

### High Stakes Category
- **BIG_BETTOR**: 3, 10 completions with forfeit ≥ ₹50 (Rewards: 25, 100)
- **ALL_IN**: 5 completions with forfeit ≥ ₹100 (Reward: 200)

### Weekly Goals Category
- **PERFECT_WEEK**: 7 consecutive successful days (Reward: 50)
- **WEEKEND_WARRIOR**: Complete weekend challenges 4 weeks in a row (Reward: 75)

### Milestone Category
- **FIRST_SUCCESS**: Complete first challenge (Reward: 10)
- **COMEBACK_KID**: Achieve 7-day streak after breaking a 14+ day streak (Reward: 100)

## 9. Business Rules

### Processing Rules
- **Idempotency**: Each `challengeId` processed exactly once
- **Real-time**: Updates processed immediately on challenge verification
- **Backfill Safe**: Recalculation endpoint handles historical corrections
- **Timezone Aware**: All date calculations use user's local timezone

### Claiming Rules
- **Sequential**: Must claim lower tiers before higher tiers
- **Time Limit**: No expiration on claims (optional: add 30-day expiry)
- **Reward Limits**: Daily claim limit of ₹500 per user (configurable)

### Performance Considerations
- **Caching**: Cache `/achievements` and `/streaks` responses (60s TTL)
- **Batch Processing**: Process multiple achievement updates in single transaction
- **Indexes**: Index on `user_id`, `achievement_key`, `updated_at` for queries

## 10. Configuration

### Environment Variables
```
ACHIEVEMENTS_BREAK_ON_NO_SCHEDULE=false
ACHIEVEMENTS_DAILY_CLAIM_LIMIT=500
ACHIEVEMENTS_CACHE_TTL_SECONDS=60
ACHIEVEMENTS_TIMEZONE_DEFAULT=Asia/Kolkata
```

### Feature Flags
- `achievements_enabled`: Master toggle for entire system
- `achievement_rewards_enabled`: Toggle for wallet rewards
- `achievement_notifications_enabled`: Toggle for push notifications

## 11. Testing Requirements

### Unit Tests
- Streak calculation logic with various scenarios
- Achievement progress updates
- Timezone boundary cases
- Idempotency validation

### Integration Tests
- End-to-end challenge verification → achievement unlock
- Wallet integration for rewards
- API endpoint responses

### Test Data Scenarios
- Multiple challenges same day
- Timezone edge cases (11:30 PM - 1:30 AM)
- Streak breaks and recoveries
- Achievement tier progressions
- Backfill/recalculation accuracy

### Admin Tools
- Seed test data for different achievement states
- Manual achievement unlock/reset for testing
- Streak manipulation for demo purposes

## 12. Migration Plan

### Phase 1: Core Infrastructure
1. Create database tables
2. Implement event system integration
3. Basic streak calculation

### Phase 2: Achievement Engine
1. Achievement definitions and progress tracking
2. Tier unlocking logic
3. Basic APIs

### Phase 3: Rewards and Polish
1. Wallet integration for rewards
2. Activity timeline
3. Admin tools and testing endpoints

### Phase 4: Advanced Features
1. Push notifications for unlocks
2. Social sharing for achievements
3. Leaderboards and comparisons

## 13. Success Metrics
- Achievement unlock rate
- Reward claim rate
- User retention correlation with achievement activity
- Average time between unlock and claim
- Most/least popular achievement categories

---

**This document provides the complete backend specification for implementing achievements and streaks. Once implemented, the frontend will integrate these APIs to display streak counters, achievement progress, and reward claiming flows.**