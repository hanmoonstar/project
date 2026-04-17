import { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, Clock, Calendar, Filter, Download } from 'lucide-react';

interface Execution {
  id: string;
  workflow_name: string;
  status: 'success' | 'failed' | 'running';
  started_at: string;
  completed_at?: string;
  duration?: number;
  result?: string;
}

export function ExecutionHistory() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockExecutions: Execution[] = [
      {
        id: '1',
        workflow_name: 'Morning Digest',
        status: 'success',
        started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        completed_at: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
        duration: 120,
        result: 'Processed 5 emails'
      },
      {
        id: '2',
        workflow_name: 'Urgent Alert',
        status: 'success',
        started_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2 + 5000).toISOString(),
        duration: 5,
        result: '1 urgent email detected'
      },
      {
        id: '3',
        workflow_name: 'Weekly Report',
        status: 'failed',
        started_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 + 30000).toISOString(),
        duration: 30,
        result: 'API timeout'
      },
      {
        id: '4',
        workflow_name: 'Client Follow-up',
        status: 'success',
        started_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 48 + 8000).toISOString(),
        duration: 8,
        result: '3 tasks created'
      },
      {
        id: '5',
        workflow_name: 'Morning Digest',
        status: 'success',
        started_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 150000).toISOString(),
        duration: 150,
        result: 'Processed 12 emails'
      }
    ];
    setExecutions(mockExecutions);
    setLoading(false);
  };

  const filteredExecutions = executions.filter(e => 
    filter === 'all' || e.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-400 animate-pulse" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const groupByDate = (executions: Execution[]) => {
    const groups: Record<string, Execution[]> = {};
    executions.forEach(e => {
      const date = formatDate(e.started_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    });
    return groups;
  };

  const groupedExecutions = groupByDate(filteredExecutions);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <History className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">History</h2>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{executions.length}</p>
          <p className="text-xs text-slate-400">Total Runs</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-400">{executions.filter(e => e.status === 'success').length}</p>
          <p className="text-xs text-slate-400">Successful</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-400">{executions.filter(e => e.status === 'failed').length}</p>
          <p className="text-xs text-slate-400">Failed</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        {(['all', 'success', 'failed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
              filter === f
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExecutions).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-300">{date}</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              
              <div className="space-y-3">
                {items.map((execution, index) => (
                  <div
                    key={execution.id}
                    className="flex items-start gap-4 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all"
                  >
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(execution.status)}`}>
                        {getStatusIcon(execution.status)}
                      </div>
                      {index < items.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-800 mt-2" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-white">{execution.workflow_name}</h3>
                        <span className="text-xs text-slate-500">{formatTime(execution.started_at)}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                        {execution.duration && (
                          <span className="text-slate-500">
                            {execution.duration}s
                          </span>
                        )}
                      </div>
                      
                      {execution.result && (
                        <p className="text-sm text-slate-400 mt-2">{execution.result}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
