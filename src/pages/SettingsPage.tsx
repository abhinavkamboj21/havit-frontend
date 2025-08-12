import { useEffect, useState } from 'react';
import { Moon, Sun, Bell, Shield, Trash2, KeyRound } from 'lucide-react';

const SettingsPage = () => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = stored ? stored === 'dark' : prefersDark;
    setIsDark(initialDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-morning-900 mb-2">Settings</h1>
        <p className="text-morning-600">Manage your account, preferences, and appearance</p>
      </div>

      {/* Appearance */}
      <div className="card mb-6">
        <h3 className="text-xl font-semibold text-morning-900 mb-6">Appearance</h3>
        <div className="flex items-center justify-between p-4 bg-morning-50 rounded-lg">
          <div>
            <h4 className="font-medium text-morning-900">Dark Theme</h4>
            <p className="text-sm text-morning-600">Toggle between light and dark mode</p>
          </div>
          <button
            onClick={() => setIsDark((v) => !v)}
            className="btn-outline flex items-center space-x-2"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Account Settings moved from Profile */}
      <div className="card">
        <h3 className="text-xl font-semibold text-morning-900 mb-6">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-morning-50 rounded-lg">
            <div>
              <h4 className="font-medium text-morning-900">Change Password</h4>
              <p className="text-sm text-morning-600">Update your account password</p>
            </div>
            <button className="btn-outline flex items-center space-x-2">
              <KeyRound className="w-4 h-4" />
              <span>Change</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-morning-50 rounded-lg">
            <div>
              <h4 className="font-medium text-morning-900">Notification Settings</h4>
              <p className="text-sm text-morning-600">Manage your notification preferences</p>
            </div>
            <button className="btn-outline flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Configure</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-morning-50 rounded-lg">
            <div>
              <h4 className="font-medium text-morning-900">Privacy Settings</h4>
              <p className="text-sm text-morning-600">Control your profile visibility</p>
            </div>
            <button className="btn-outline flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Manage</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-error-50 rounded-lg">
            <div>
              <h4 className="font-medium text-morning-900">Delete Account</h4>
              <p className="text-sm text-morning-600">Permanently delete your account</p>
            </div>
            <button className="btn-outline text-error-600 border-error-300 hover:bg-error-50 flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

