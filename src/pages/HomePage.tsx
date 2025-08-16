import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Clock, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Get Paid to Wake Up',
      description: 'Earn real rewards when you wake up on time. Oversleep? Your stake covers the pool.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Real-Money Accountability',
      description: 'Put meaningful stakes behind your goal. The right incentive turns intention into action.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community & Streaks',
      description: 'Stay consistent with streaks and a supportive community on the same journey.'
    }
  ];

  const benefits = [
    'Earn when you wake up on time',
    'Lose a small stake if you don\'t – powerful motivation',
    'Lock in a simple wake-up window (no endless snoozing)',
    'Join a community that keeps you accountable',
    'Track streaks and improvement over time',
    'Cash out to your wallet when you win'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <div className="w-20 h-20 icon-chip rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sun className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-morning-900 mb-6 leading-tight">
              Get paid to
              <span className="text-gradient block leading-tight">wake up on time</span>
            </h1>
            <p className="text-xl text-morning-600 mb-8 max-w-2xl mx-auto">
              Put money on the line, wake up on time, and get rewarded. Miss your wake-up? Your stake fuels the prize pool. 
              Simple, fair, and designed to end snoozing for good.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn-primary inline-flex items-center">
                    Start Waking & Earning
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link to="/login" className="btn-outline inline-flex items-center">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn-primary inline-flex items-center">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-morning-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-morning-600 max-w-2xl mx-auto mb-6">
              Set a wake-up time, choose your stake, and keep your streak alive. Wake up on time to earn – oversleep and you fund the winners.
            </p>
            <Link to="/how-it-works" className="btn-outline inline-flex items-center">
              Learn More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-morning-100 p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 icon-chip rounded-xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-morning-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-morning-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 to-morning-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-morning-900 mb-4">
              Why people love Havit
            </h2>
            <p className="text-xl text-morning-600">
              Clear incentives. No gimmicks. Just consistent mornings and real rewards for showing up.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                  <span className="text-morning-700">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {benefits.slice(3).map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                  <span className="text-morning-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold text-morning-900 mb-6">
            Put your money where your morning is
          </h2>
          <p className="text-xl text-morning-600 mb-8">
            Pick a wake-up time. Set a stake. Get paid when you follow through.
          </p>
          {!isAuthenticated ? (
            <Link to="/register" className="btn-primary inline-flex items-center">
              Start Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <Link to="/challenge" className="btn-primary inline-flex items-center">
              Set Your Next Challenge
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage; 