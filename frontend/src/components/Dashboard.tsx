import { useState, useEffect } from 'react';
import { 
  Activity, Zap, Clock, TrendingUp, CheckCircle, AlertCircle, 
  BarChart3, PieChart, Calendar, Mail, Workflow
} from 'lucide-react';

interface Stats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  timeSaved: number;
  avgExecutionTime: number;
}

interface ExecutionTrend {
  date: string;
  count: number;
  success: number;
  failed: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalWorkflows: 5,
    activeWorkflows: 3,
    totalExecutions: 128,
    successRate: 96.5,
    timeSaved: 42,
    avgExecutionTime: 2.3
  });

  const [trends, setTrends] = useState<ExecutionTrend[]>([
    { date: '周一', count: 12, success: 11, failed: 1 },
    { date: '周二', count: 18, success: 18, failed: 0 },
    { date: '周三', count: 15, success: 14, failed: 1 },
    { date: '周四', count: 22, success: 21, failed: 1 },
    { date: '周五', count: 28, success: 27, failed: 1 },
    { date: '周六', count: 8, success: 8, failed: 0 },
    { date: '周日', count: 5, success: 5, failed: 0 },
  ]);

  const maxCount = Math.max(...trends.map(t => t.count));

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Dashboard</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span>Online</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          icon={<Workflow className="w-6 h-6 text-blue-500" />}
          label="总工作流"
          value={stats.totalWorkflows}
          trend="+2 本周"
          trendUp={true}
        />
        <StatCard 
          icon={<Zap className="w-6 h-6 text-yellow-500" />}
          label="活跃工作流"
          value={stats.activeWorkflows}
          trend="60% 活跃率"
          trendUp={true}
        />
        <StatCard 
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          label="总执行次数"
          value={stats.totalExecutions}
          trend="+24 本周"
          trendUp={true}
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
          label="成功率"
          value={`${stats.successRate}%`}
          trend="+1.2%"
          trendUp={true}
        />
        <StatCard 
          icon={<Clock className="w-6 h-6 text-orange-500" />}
          label="节省时间"
          value={`${stats.timeSaved}h`}
          trend="本周节省"
          trendUp={true}
        />
        <StatCard 
          icon={<Activity className="w-6 h-6 text-red-500" />}
          label="平均耗时"
          value={`${stats.avgExecutionTime}s`}
          trend="-0.5s 优化"
          trendUp={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">执行趋势</h3>
            </div>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
              <option>最近7天</option>
              <option>最近30天</option>
              <option>最近90天</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2">
            {trends.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1">
                  {/* Success bar */}
                  <div 
                    className="w-full bg-green-500 rounded-t transition-all duration-500"
                    style={{ height: `${(day.success / maxCount) * 150}px` }}
                  />
                  {/* Failed bar */}
                  <div 
                    className="w-full bg-red-400 rounded-b transition-all duration-500"
                    style={{ height: `${(day.failed / maxCount) * 150}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{day.date}</span>
                <span className="text-xs font-semibold text-gray-700">{day.count}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-600">成功</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded" />
              <span className="text-gray-600">失败</span>
            </div>
          </div>
        </div>

        {/* Workflow Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900">工作流类型分布</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            <DistributionBar 
              label="定时任务"
              icon={<Clock className="w-4 h-4" />}
              count={3}
              total={5}
              color="bg-blue-500"
            />
            <DistributionBar 
              label="邮件触发"
              icon={<Mail className="w-4 h-4" />}
              count={1}
              total={5}
              color="bg-green-500"
            />
            <DistributionBar 
              label="手动执行"
              icon={<Zap className="w-4 h-4" />}
              count={1}
              total={5}
              color="bg-yellow-500"
            />
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">💡 AI 优化建议</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 晨间摘要工作流可优化执行时间至 8:30</li>
              <li>• 建议为高频工作流启用缓存</li>
              <li>• 本周可节省约 8 小时处理时间</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">最近活动</h3>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-800">查看全部</button>
        </div>
        
        <div className="space-y-3">
          <ActivityItem 
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            title="Morning Digest 执行成功"
            time="2 分钟前"
            detail="处理了 5 封邮件，生成摘要 320 字"
          />
          <ActivityItem 
            icon={<Mail className="w-5 h-5 text-blue-500" />}
            title="收到高优先级邮件"
            time="15 分钟前"
            detail="来自 boss@company.com，已自动标记"
          />
          <ActivityItem 
            icon={<Zap className="w-5 h-5 text-yellow-500" />}
            title="Auto-Reply 已触发"
            time="1 小时前"
            detail="非工作时间自动回复已发送"
          />
          <ActivityItem 
            icon={<Calendar className="w-5 h-5 text-purple-500" />}
            title="Weekly Report 已生成"
            time="昨天 18:00"
            detail="本周工作汇总已发送至邮箱"
          />
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ icon, label, value, trend, trendUp }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">{icon}</div>
        <span className={`text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function DistributionBar({ label, icon, count, total, color }: {
  label: string;
  icon: React.ReactNode;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = (count / total) * 100;
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-24 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
          style={{ width: `${percentage}%` }}
        >
          <span className="text-xs text-white font-medium">{count}</span>
        </div>
      </div>
      <span className="text-sm text-gray-500 w-12 text-right">{percentage.toFixed(0)}%</span>
    </div>
  );
}

function ActivityItem({ icon, title, time, detail }: {
  icon: React.ReactNode;
  title: string;
  time: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{detail}</p>
      </div>
    </div>
  );
}
