import { Inbox, Workflow, Settings, User, Shield, Sparkles, LayoutDashboard, Zap, MessageSquare, LayoutGrid, History, AlertTriangle, Wand2, Mic, Mail, Plus } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  connectedEmails: string[];
  onAddEmail: () => void;
}

export function Sidebar({ activeTab, onTabChange, connectedEmails, onAddEmail }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'priority', label: 'AI Priority', icon: Zap },
    { id: 'reply', label: 'AI Reply', icon: MessageSquare },
    { id: 'templates', label: 'Templates', icon: LayoutGrid },
    { id: 'history', label: 'History', icon: History },
    { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
    { id: 'optimizer', label: 'AI Optimize', icon: Wand2 },
    { id: 'meetings', label: 'Meetings', icon: Mic },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'create', label: 'AI Create', icon: Sparkles },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'focus', label: 'Focus', icon: Shield },
  ];

  return (
    <div className="w-72 bg-slate-950 border-r border-slate-800 h-full flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">FocusFlow</h1>
            <p className="text-xs text-slate-400">AI Workflow Automation</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">
          Main
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-white border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                isActive ? 'bg-violet-500/20' : 'bg-slate-800 group-hover:bg-slate-700'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : ''}`} />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Email Section */}
      <div className="px-4 space-y-1">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Email Accounts
          </span>
          <button
            onClick={onAddEmail}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        {connectedEmails.length > 0 ? (
          <div className="space-y-1">
            {connectedEmails.map((email, index) => (
              <div key={index} className="px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-400 truncate">{email}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-4 bg-slate-900/30 rounded-xl border border-slate-800 text-center">
            <Mail className="w-5 h-5 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 mb-2">No email accounts connected</p>
            <button
              onClick={onAddEmail}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Connect Email
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-3">
        {/* Notification Center */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm text-slate-400">Notifications</span>
          <NotificationCenter />
        </div>
        
        {/* Settings */}
        <button 
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">User</p>
            <p className="text-xs text-slate-500">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
