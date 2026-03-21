'use client';

import { useStudents } from '@/hooks/useStudent';
import { MOCK_TRUTHID_SCORES, MOCK_ADMIN_STATS } from '@/lib/mock-data';
import MainLayout from '@/components/Layouts/MainLayout';
import StatCard from '@/components/Cards/StatCard';
import StudentCard from '@/components/Cards/StudentCard';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { Users, Target, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { students, loading, error } = useStudents();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-2">Error loading dashboard</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            Welcome to TruthGrid Dashboard
          </h1>
          <p className="text-gray-400">
            Monitor student progress and AI-powered career assessments
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={MOCK_ADMIN_STATS.totalStudents}
            change={{ value: 12, type: 'increase' }}
            icon={<Users className="w-6 h-6 text-primary-500" />}
          />
          
          <StatCard
            title="Avg TruthID Score"
            value={MOCK_ADMIN_STATS.averageScore.toLocaleString()}
            change={{ value: 8, type: 'increase' }}
            icon={<Target className="w-6 h-6 text-primary-500" />}
          />
          
          <StatCard
            title="Students at Risk"
            value={MOCK_ADMIN_STATS.studentsAtRisk}
            change={{ value: 5, type: 'decrease' }}
            icon={<AlertTriangle className="w-6 h-6 text-warning" />}
          />
          
          <StatCard
            title="Healthy Students"
            value={MOCK_ADMIN_STATS.healthyStudents}
            change={{ value: 15, type: 'increase' }}
            icon={<CheckCircle className="w-6 h-6 text-success" />}
          />
        </div>

        {/* Student Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-text-dark">Recent Students</h2>
            <div className="flex items-center text-sm text-gray-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              Updated {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {students.map((student) => {
              const truthId = MOCK_TRUTHID_SCORES.find(t => t.studentId === student.id);
              return (
                <StudentCard
                  key={student.id}
                  student={student}
                  truthId={truthId}
                  showDetails={false}
                />
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card-dark rounded-lg p-6 card-shadow">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'New assessment submitted', student: 'Ridhi Jain', time: '2 hours ago', type: 'success' },
              { action: 'TruthID score updated', student: 'Arjun Sharma', time: '4 hours ago', type: 'info' },
              { action: 'Student marked as watch', student: 'Priya Mehta', time: '1 day ago', type: 'warning' },
              { action: 'Weekly report generated', student: 'Class BBA-2024', time: '2 days ago', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-800/50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-text-dark">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.student} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}