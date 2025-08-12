import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Building, 
  Phone, 
  Clock,
  Edit3,
  Save,
  X,
  Camera
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    city: user?.city || '',
    occupation: user?.occupation || '',
    institution: user?.institutionName || '',
    emergencyContact: user?.emergencyContact || user?.phoneNumber || '',
    preferredWakeTime: user?.preferredWakeUpTime || '06:00'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // TODO: Save profile data to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.fullName || '',
      email: user?.email || '',
      city: user?.city || '',
      occupation: user?.occupation || '',
      institution: user?.institutionName || '',
      emergencyContact: user?.emergencyContact || user?.phoneNumber || '',
      preferredWakeTime: user?.preferredWakeUpTime || '06:00'
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-morning-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-morning-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-xl font-semibold text-morning-900 mb-2">
              {user?.fullName}
            </h3>
            <p className="text-morning-600 mb-4">
              Member since {new Date().toLocaleDateString()}
            </p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-morning-600">Current Streak:</span>
                <span className="font-semibold text-success-600">{user?.currentStreak || 0} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-morning-600">Success Rate:</span>
                <span className="font-semibold text-cyan-600">{user?.successRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-morning-600">Total Earnings:</span>
                <span className="font-semibold text-morning-900">₹{user?.totalEarnings || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-morning-900">
                Personal Information
              </h3>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-morning-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-morning-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-morning-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>City/Location</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-morning-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Occupation</span>
                    </div>
                  </label>
                  <select
                    name="occupation"
                    value={profileData.occupation}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  >
                    <option value="student">Student</option>
                    <option value="working-professional">Working Professional</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-morning-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Institution/Company</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={profileData.institution}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-morning-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Emergency Contact</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-morning-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Preferred Wake-up Time</span>
                  </div>
                </label>
                <input
                  type="time"
                  name="preferredWakeTime"
                  value={profileData.preferredWakeTime}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                />
              </div>
            </form>
          </div>

          {/* Account Settings moved to Settings page */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 