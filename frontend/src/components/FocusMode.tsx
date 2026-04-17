import { useState } from 'react';
import { Shield, Clock, Bell, BellOff } from 'lucide-react';

export function FocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(25);
  const [settings, setSettings] = useState({
    blockNotifications: true,
    allowUrgentOnly: true,
    autoReply: true,
  });

  const toggleFocusMode = () => {
    setIsActive(!isActive);
    // TODO: Call API to activate/deactivate focus mode
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Focus Mode</h2>
      </div>

      {/* Main Toggle */}
      <div className={`p-8 rounded-2xl text-center transition-all ${
        isActive 
          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
          : 'bg-white border-2 border-gray-200'
      }`}>
        <div className="mb-6">
          <Shield className={`w-16 h-16 mx-auto ${isActive ? 'text-white' : 'text-gray-400'}`} />
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {isActive ? 'Focus Mode Active' : 'Focus Mode Inactive'}
        </h3>
        <p className={`mb-6 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
          {isActive 
            ? `Protecting your focus for ${duration} minutes` 
            : 'Block distractions and focus on deep work'}
        </p>
        <button
          onClick={toggleFocusMode}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            isActive
              ? 'bg-white text-blue-600 hover:bg-blue-50'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isActive ? 'End Focus Session' : 'Start Focus Mode'}
        </button>
      </div>

      {/* Duration Settings */}
      {!isActive && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Duration
          </h3>
          <div className="flex gap-3">
            {[15, 25, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  duration === mins
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold mb-4">Focus Settings</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {settings.blockNotifications ? (
              <BellOff className="w-5 h-5 text-gray-500" />
            ) : (
              <Bell className="w-5 h-5 text-gray-500" />
            )}
            <div>
              <div className="font-medium">Block Notifications</div>
              <div className="text-sm text-gray-500">Mute non-urgent notifications</div>
            </div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, blockNotifications: !settings.blockNotifications })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.blockNotifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.blockNotifications ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <div className="font-medium">Allow Urgent Only</div>
            <div className="text-sm text-gray-500">Still notify for high-priority items</div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, allowUrgentOnly: !settings.allowUrgentOnly })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.allowUrgentOnly ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.allowUrgentOnly ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <div className="font-medium">Auto-Reply</div>
            <div className="text-sm text-gray-500">Send auto-reply during focus time</div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, autoReply: !settings.autoReply })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.autoReply ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.autoReply ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}
