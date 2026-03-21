'use client';

import MainLayout from '@/components/Layouts/MainLayout';
import StatCard from '@/components/Cards/StatCard';
import { MOCK_ADMIN_STATS } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  Users, 
  Target, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

export default function AdminPage() {
  const stats = MOCK_ADMIN_STATS;

  const scoreDistributionData = stats.scoreDistribution.map(item => ({
    range: item.range,
    count: item.count,
    percentage: (item.count / stats.totalStudents) * 100
  }));

  const fieldData = stats.fieldBreakdown.map(item => ({
    field: item.field.length > 12 ? item.field.substring(0, 12) + '...' : item.field,
    count: item.count,
    avgScore: item.avgScore
  }));

  const COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#ef4444'];

  const trendData = [
    { month: 'Jan', avgScore: 6200, submissions: 45 },
    { month: 'Feb', avgScore: 6350, submissions: 52 },
    { month: 'Mar', avgScore: 6703, submissions: 38 },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            Admin Analytics Dashboard
          </h1>
          <p className="text-gray-400">
            System-wide performance metrics and insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            change={{ value: 15, type: 'increase' }}
            icon={<Users className="w-6 h-6 text-primary-500" />}
          />
          
          <StatCard
            title="Avg TruthID Score"
            value={stats.averageScore.toLocaleString()}
            change={{ value: 8, type: 'increase' }}
            icon={<Target className="w-6 h-6 text-primary-500" />}
          />
          
          <StatCard
            title="Active Assessments"
            value="12"
            change={{ value: 25, type: 'increase' }}
            icon={<Activity className="w-6 h-6 text-success" />}
          />
          
          <StatCard
            title="Monthly Growth"
            value="24%"
            change={{ value: 12, type: 'increase' }}
            icon={<TrendingUp className="w-6 h-6 text-success" />}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Distribution */}
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h3 className="text-xl font-semibold text-text-dark">Score Distribution</h3>
            </div>
            
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#4b5563' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#4b5563' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                    }}
                    formatter={(value, name) => [
                      name === 'count' ? `${value} students` : `${value}%`,
                      name === 'count' ? 'Count' : 'Percentage'
                    ]}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Field Breakdown */}
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <div className="flex items-center space-x-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-primary-500" />
              <h3 className="text-xl font-semibold text-text-dark">Field Distribution</h3>
            </div>
            
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={fieldData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {fieldData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-card-dark rounded-lg p-6 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h3 className="text-xl font-semibold text-text-dark">Monthly Performance Trends</h3>
            </div>
            
            <div className="text-sm text-gray-400">
              Last 3 months
            </div>
          </div>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#4b5563' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                  }}
                  formatter={(value, name) => [
                    name === 'avgScore' ? value.toLocaleString() : value,
                    name === 'avgScore' ? 'Average Score' : 'Submissions'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ fill: '#38bdf8', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Field Performance */}
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Field Performance</h3>
            <div className="space-y-4">
              {stats.fieldBreakdown.map((field, index) => (
                <div key={field.field} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-300">{field.field}</div>
                    <div className="text-xs text-gray-500">{field.count} students</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary-500">
                      {field.avgScore.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <h3 className="text-lg font-semibold text-text-dark mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">API Response Time</span>
                <span className="text-green-500 font-medium">245ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Database Performance</span>
                <span className="text-green-500 font-medium">Optimal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">AI Model Accuracy</span>
                <span className="text-green-500 font-medium">94.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Uptime</span>
                <span className="text-green-500 font-medium">99.9%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'New assessment completed', time: '5 min ago', type: 'success' },
                { action: 'TruthID generated', time: '12 min ago', type: 'info' },
                { action: 'Student profile updated', time: '1 hour ago', type: 'info' },
                { action: 'Weekly report generated', time: '2 hours ago', type: 'success' },
                { action: 'System backup completed', time: '4 hours ago', type: 'info' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 text-gray-300">{activity.action}</div>
                  <div className="text-gray-500 text-xs">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}