'use client';

import MainLayout from '@/components/Layouts/MainLayout';
import StatCard from '@/components/Cards/StatCard';
import StudentCard from '@/components/Cards/StudentCard';
import { MOCK_WEEKLY_REPORT, MOCK_TRUTHID_SCORES } from '@/lib/mock-data';
import { 
  FileBarChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function WeeklyReportPage() {
  const report = MOCK_WEEKLY_REPORT;

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            Weekly Class Intelligence Report
          </h1>
          <p className="text-gray-400">
            Performance overview for {report.week}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Class Average"
            value={report.classAverage.toLocaleString()}
            change={{ value: 5, type: 'increase' }}
            icon={<FileBarChart className="w-6 h-6 text-primary-500" />}
          />
          
          <StatCard
            title="Students Improving"
            value={report.trends.improving}
            change={{ value: 20, type: 'increase' }}
            icon={<TrendingUp className="w-6 h-6 text-success" />}
          />
          
          <StatCard
            title="Students Declining"
            value={report.trends.declining}
            change={{ value: 10, type: 'decrease' }}
            icon={<TrendingDown className="w-6 h-6 text-error" />}
          />
          
          <StatCard
            title="Students Stable"
            value={report.trends.stable}
            icon={<Users className="w-6 h-6 text-warning" />}
          />
        </div>

        <div className="bg-card-dark rounded-lg p-6 card-shadow">
          <h2 className="text-xl font-semibold text-text-dark mb-6">Performance Distribution</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-text-dark">{report.topPerformers.length}</div>
              <div className="text-sm text-gray-400">Top Performers</div>
              <div className="text-xs text-green-500 mt-1">Score: 7000+</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-text-dark">0</div>
              <div className="text-sm text-gray-400">Average Performers</div>
              <div className="text-xs text-yellow-500 mt-1">Score: 4000-6999</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-text-dark">{report.studentsAtRisk.length}</div>
              <div className="text-sm text-gray-400">Need Attention</div>
              <div className="text-xs text-red-500 mt-1">Score: Less than 4000</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-dark">Top Performers This Week</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {report.topPerformers.map((student) => {
              const truthId = MOCK_TRUTHID_SCORES.find(t => t.studentId === student.id);
              return (
                <StudentCard
                  key={student.id}
                  student={student}
                  truthId={truthId}
                  showDetails={true}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-dark">Students Needing Attention</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {report.studentsAtRisk.map((student) => {
              const truthId = MOCK_TRUTHID_SCORES.find(t => t.studentId === student.id);
              return (
                <StudentCard
                  key={student.id}
                  student={student}
                  truthId={truthId}
                  showDetails={true}
                />
              );
            })}
          </div>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>Report generated on {new Date().toLocaleDateString()}</p>
          <p>Next report will be available on {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
      </div>
    </MainLayout>
  );
}