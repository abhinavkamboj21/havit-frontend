import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Clock, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Daily Wake-Up Challenges',
      description: 'Set your wake-up time and forfeit amount. Win money from others who oversleep!'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Build Consistent Habits',
      description: 'Track your streaks and watch your discipline grow with our gamified approach.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Peer-to-Peer Motivation',
      description: 'Connect with friends and compete on leaderboards for extra motivation.'
    }
  ];

  const benefits = [
    'Wake up early consistently',
    'Earn money from others\' failures',
    'Build lasting morning habits',
    'Join a community of early risers',
    'Track your progress with analytics',
    'Withdraw your earnings anytime'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Sun className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-morning-900 mb-6 leading-tight">
              Transform Your
              <span className="text-gradient block leading-tight">Morning Routine</span>
            </h1>
            <p className="text-xl text-morning-600 mb-8 max-w-2xl mx-auto">
              Hav-it uses peer-to-peer financial incentives to help you wake up early consistently. 
              Set daily challenges, earn from others' failures, and build lasting morning habits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-lg px-8 py-4 inline-flex items-center">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link to="/login" className="border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-lg px-8 py-4 inline-flex items-center">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-lg px-8 py-4 inline-flex items-center">
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
              How It Works
            </h2>
            <p className="text-xl text-morning-600 max-w-2xl mx-auto">
              Our unique approach combines behavioral psychology with financial incentives 
              to create powerful motivation for consistent wake-up habits.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-morning-100 p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-cyan-600">
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
              Why Choose Hav-it?
            </h2>
            <p className="text-xl text-morning-600">
              Join thousands of students and professionals who have transformed their mornings
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
            Ready to Transform Your Mornings?
          </h2>
          <p className="text-xl text-morning-600 mb-8">
            Join the community of early risers and start earning while building better habits.
          </p>
          {!isAuthenticated ? (
            <Link to="/register" className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-lg px-8 py-4 inline-flex items-center">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <Link to="/challenge" className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-lg px-8 py-4 inline-flex items-center">
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