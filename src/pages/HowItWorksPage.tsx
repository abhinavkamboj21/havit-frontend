import { Link } from 'react-router-dom';
import { 
  Clock, 
  Wallet, 
  Trophy, 
  Target, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Settings,
  HelpCircle,
  ArrowRight,
  IndianRupee,
  Plus,
  User
} from 'lucide-react';

const HowItWorksPage = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8 text-cyan-600" />,
      title: "Create Challenges",
      description: "Set your wake-up time and forfeit amount. Choose between manual verification or photo proof.",
      details: [
        "Select date for the challenge",
        "Set your preferred wake-up time (e.g., 6:00 AM)",
        "Choose forfeit amount (₹50, ₹100, ₹200, etc.)",
        "Challenge is scheduled for the morning of the selected date"
      ]
    },
    {
      icon: <Clock className="w-8 h-8 text-cyan-600" />,
      title: "Verification Window",
      description: "You have a 25-minute window to verify your challenge completion.",
      details: [
        "Window opens: 15 minutes before your wake-up time",
        "Window closes: 10 minutes after your wake-up time",
        "Example: For 6:00 AM wake-up, verify between 5:45 AM - 6:10 AM",
        "Outside this window, verification is locked"
      ]
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-cyan-600" />,
      title: "Complete Verification",
      description: "Verify your challenge using your chosen method within the time window.",
      details: [
        "Manual: Mark as completed (self-verification)",
        "Photo: Take a photo as proof of being awake",
        "Verification must be done within the time window",
        "If you succeed, you will receive your original forfeit amount + winnings in your wallet by 2 PM",
        "If you fail, you will lose your forfeit amount"
      ]
    },
    {
      icon: <Wallet className="w-8 h-8 text-cyan-600" />,
      title: "Wallet & Rewards",
      description: "Manage your deposits, track winnings, and withdraw your earnings.",
      details: [
        "Deposit money securely using Razorpay (UPI, cards, net banking)",
        "Winnings include your forfeit + share from daily pool",
        "Track all transactions in Wallet section",
        "Withdraw to UPI or bank account (24-48 hours)"
      ]
    },
    {
      icon: <Trophy className="w-8 h-8 text-cyan-600" />,
      title: "Streaks & Achievements",
      description: "Build momentum with consecutive successful wake-ups and unlock achievements.",
      details: [
        "Current streak: Days in a row you've woken up on time",
        "Longest streak: Your best consecutive performance",
        "Achievements unlock as you reach milestones(coming soon)",
        "Earn bonus for consistency and dedication(coming soon)"
      ]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-cyan-600" />,
      title: "Progress Tracking",
      description: "Monitor your performance with detailed statistics and challenge history.",
      details: [
        "View today's challenge status and time remaining",
        "See complete challenge history with results",
        "Track success rate and improvement over time",
        "Monitor wallet balance and transaction history"
      ]
    }
  ];

  const sections = [
    {
      name: "Dashboard",
      path: "/dashboard",
      description: "Main hub showing today's challenge, wallet balance, and quick stats",
      icon: <Target className="w-5 h-5" />
    },
    {
      name: "Create Challenge",
      path: "/create-challenge",
      description: "Set up new wake-up challenges with custom time and amount",
      icon: <Plus className="w-5 h-5" />
    },
    {
      name: "Wallet",
      path: "/wallet/transactions",
      description: "View balance, deposit money, and track all transactions",
      icon: <Wallet className="w-5 h-5" />
    },
    {
      name: "Profile",
      path: "/profile",
      description: "View and edit your personal information",
      icon: <User className="w-5 h-5" />
    },
    {
      name: "Settings",
      path: "/settings",
      description: "Manage account settings, password, and preferences",
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-display font-bold text-morning-900 mb-4">
          How Hav-it Works
        </h1>
        <p className="text-xl text-morning-600 max-w-2xl mx-auto">
          Your complete guide to understanding how to use Hav-it and achieve your morning goals
        </p>
      </div>

      {/* Quick Start Guide */}
      <div className="card mb-12">
        <h2 className="text-2xl font-semibold text-morning-900 mb-6 flex items-center">
          <Clock className="w-6 h-6 mr-3 text-cyan-600" />
          Quick Start Guide
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-morning-50 rounded-lg">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-cyan-600">1</span>
            </div>
            <h3 className="font-semibold text-morning-900 mb-2">Create Account</h3>
            <p className="text-sm text-morning-600">Sign up and complete your profile setup</p>
          </div>
          <div className="text-center p-4 bg-morning-50 rounded-lg">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-cyan-600">2</span>
            </div>
            <h3 className="font-semibold text-morning-900 mb-2">Add Money</h3>
            <p className="text-sm text-morning-600">Deposit funds to your wallet for challenges</p>
          </div>
          <div className="text-center p-4 bg-morning-50 rounded-lg">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-cyan-600">3</span>
            </div>
            <h3 className="font-semibold text-morning-900 mb-2">Set Challenge</h3>
            <p className="text-sm text-morning-600">Choose wake-up time and forfeit amount</p>
          </div>
          <div className="text-center p-4 bg-morning-50 rounded-lg">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-cyan-600">4</span>
            </div>
            <h3 className="font-semibold text-morning-900 mb-2">Wake Up & Verify</h3>
            <p className="text-sm text-morning-600">Complete verification within the time window</p>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-morning-900 mb-6 text-center">
          Core Features Explained
        </h2>
        <div className="space-y-8">
          {features.map((feature, index) => (
            <div key={index} className="card">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-morning-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-morning-600 mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-morning-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Sections */}
      <div className="card mb-12">
        <h2 className="text-2xl font-semibold text-morning-900 mb-6 text-center">
          App Sections & Navigation
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {sections.map((section, index) => (
            <Link
              key={index}
              to={section.path}
              className="p-4 border border-morning-200 rounded-lg hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-cyan-600 group-hover:text-cyan-700">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-morning-900 group-hover:text-cyan-700">
                      {section.name}
                    </h3>
                    <p className="text-sm text-morning-600">
                      {section.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-morning-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Important Tips */}
      <div className="card mb-12">
        <h2 className="text-2xl font-semibold text-morning-900 mb-6 flex items-center">
          <AlertCircle className="w-6 h-6 mr-3 text-warning-500" />
          Important Tips & Best Practices
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-morning-900">Set Realistic Goals</h4>
                <p className="text-sm text-morning-600">Start with a wake-up time that's achievable for you</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-morning-900">Prepare the Night Before</h4>
                <p className="text-sm text-morning-600">Set your alarm and prepare for success</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-morning-900">Use the Verification Window</h4>
                <p className="text-sm text-morning-600">Don't wait until the last minute to verify</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-morning-900">Track Your Progress</h4>
                <p className="text-sm text-morning-600">Monitor streaks and celebrate achievements</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-morning-900">Manage Your Wallet</h4>
                <p className="text-sm text-morning-600">Keep track of deposits, winnings, and withdrawals</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-morning-900">Stay Consistent</h4>
                <p className="text-sm text-morning-600">Regular challenges build lasting habits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-morning-900 mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="border-b border-morning-200 pb-4">
            <h3 className="font-medium text-morning-900 mb-2">
              What happens if I miss the verification window?
            </h3>
            <p className="text-sm text-morning-600">
              If you don't verify within the time window, your challenge is marked as failed and you lose your forfeit amount.
            </p>
          </div>
          <div className="border-b border-morning-200 pb-4">
            <h3 className="font-medium text-morning-900 mb-2">
              How do I get my winnings?
            </h3>
            <p className="text-sm text-morning-600">
              Winnings are automatically credited to your wallet by 2:00 PM on the day of successful completion.
            </p>
          </div>
          <div className="border-b border-morning-200 pb-4">
            <h3 className="font-medium text-morning-900 mb-2">
              Can I change my wake-up time after creating a challenge?
            </h3>
            <p className="text-sm text-morning-600">
              No, once a challenge is created, the wake-up time cannot be changed. Plan carefully before setting your challenge.
            </p>
          </div>
          <div className="border-b border-morning-200 pb-4">
            <h3 className="font-medium text-morning-900 mb-2">
              What's the difference between manual and photo verification?
            </h3>
            <p className="text-sm text-morning-600">
              Manual verification is self-verification, while photo verification requires you to take a photo as proof of being awake.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-morning-900 mb-2">
              How do streaks work?
            </h3>
            <p className="text-sm text-morning-600">
              Your current streak counts consecutive days of successful wake-ups. Your longest streak tracks your best performance ever.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <Link
          to="/dashboard"
          className="btn-primary inline-flex items-center space-x-2"
        >
          <span>Start Your First Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-morning-600 mt-4">
          Ready to transform your mornings? Create your first challenge now!
        </p>
      </div>
    </div>
  );
};

export default HowItWorksPage; 