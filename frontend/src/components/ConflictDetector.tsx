import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, RefreshCw, Shield } from 'lucide-react';

interface Conflict {
  type: string;
  severity: 'high' | 'medium' | 'low';
  workflow_ids: string[];
  description: string;
  suggestion: string;
}

export function ConflictDetector() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/conflicts/mock');
      const data = await response.json();
      if (data.success) {
        setConflicts(data.conflicts);
      }
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    await loadConflicts();
    setTimeout(() => setScanning(false), 1000);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'low': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'circular_dependency': 'Circular Dependency',
      'resource_race': 'Resource Race',
      'time_overlap': 'Time Overlap',
      'redundant_action': 'Redundant Action'
    };
    return labels[type] || type;
  };

  const highCount = conflicts.filter(c => c.severity === 'high').length;
  const mediumCount = conflicts.filter(c => c.severity === 'medium').length;
  const lowCount = conflicts.filter(c => c.severity === 'low').length;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Conflict Detector</h2>
            <p className="text-sm text-slate-400">AI-powered workflow analysis</p>
          </div>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Scan
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-slate-400">High</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{highCount}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Medium</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{mediumCount}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Low</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{lowCount}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Health</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {conflicts.length === 0 ? '100%' : `${Math.max(0, 100 - conflicts.length * 15)}%`}
          </p>
        </div>
      </div>

      {/* Conflicts List */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : conflicts.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white mb-2">No Conflicts Found</h3>
          <p className="text-slate-400">Your workflows are running smoothly!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conflicts.map((conflict, index) => (
            <div
              key={index}
              className={`bg-slate-900/50 backdrop-blur-sm border rounded-xl p-4 ${getSeverityColor(conflict.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getSeverityIcon(conflict.severity)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getSeverityColor(conflict.severity)}`}>
                      {conflict.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-400">{getTypeLabel(conflict.type)}</span>
                  </div>
                  <p className="text-white mb-2">{conflict.description}</p>
                  <div className="bg-slate-950/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Suggestion:</p>
                    <p className="text-sm text-slate-300">{conflict.suggestion}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {conflict.workflow_ids.map(id => (
                      <span key={id} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                        Workflow #{id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
