import { useState, useEffect } from 'react';
import { Sparkles, Zap, DollarSign, Shield, Layout, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';

interface Suggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  current_value: string;
  suggested_value: string;
  impact: string;
  estimated_improvement: string;
}

export function AIOptimizer() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<string[]>([]);

  useEffect(() => {
    loadOptimizations();
  }, []);

  const loadOptimizations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/optimizer/mock');
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to load optimizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (title: string) => {
    setApplied([...applied, title]);
    setTimeout(() => {
      setApplied(applied.filter(t => t !== title));
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'cost': return <DollarSign className="w-5 h-5 text-green-400" />;
      case 'reliability': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'simplicity': return <Layout className="w-5 h-5 text-purple-400" />;
      default: return <Sparkles className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'cost': return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'reliability': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'simplicity': return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Optimizer</h2>
            <p className="text-sm text-slate-400">Smart workflow improvements</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{summary.total}</p>
            <p className="text-xs text-slate-400">Suggestions</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-2xl font-bold text-green-400">{summary.potential_performance_gain}</p>
            </div>
            <p className="text-xs text-slate-400">Performance</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-2xl font-bold text-emerald-400">{summary.potential_cost_savings}</p>
            </div>
            <p className="text-xs text-slate-400">Cost Savings</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-400">{summary.high_priority}</p>
            <p className="text-xs text-slate-400">High Priority</p>
          </div>
        </div>
      )}

      {/* Suggestions List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`bg-slate-900/50 backdrop-blur-sm border rounded-xl p-5 ${getTypeColor(suggestion.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-950/50 rounded-lg">
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">{suggestion.type}</span>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-1">{suggestion.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{suggestion.description}</p>
                  
                  {/* Before/After */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-950/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Current</p>
                      <p className="text-sm text-slate-300">{suggestion.current_value}</p>
                    </div>
                    <div className="bg-slate-950/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Suggested</p>
                      <p className="text-sm text-white flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        {suggestion.suggested_value}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Impact</p>
                      <p className="text-sm text-slate-300">{suggestion.impact}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Improvement</p>
                      <p className="text-lg font-bold text-emerald-400">{suggestion.estimated_improvement}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleApply(suggestion.title)}
                  disabled={applied.includes(suggestion.title)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-violet-500 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-slate-300"
                >
                  {applied.includes(suggestion.title) ? (
                    <><CheckCircle className="w-4 h-4" /></>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
