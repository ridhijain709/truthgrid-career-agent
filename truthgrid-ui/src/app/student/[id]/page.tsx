'use client';

import { useStudent } from '@/hooks/useStudent';
import MainLayout from '@/components/Layouts/MainLayout';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import SignalBadge from '@/components/UI/SignalBadge';
import RadarChartComponent from '@/components/Charts/RadarChart';
import LineChartComponent from '@/components/Charts/LineChart';
import { ScoreBarGroup } from '@/components/Charts/ScoreBar';
import { formatScore, getScoreColor, getRecommendations } from '@/lib/calculations';
import { 
  GraduationCap, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

interface StudentProfilePageProps {
  params: {
    id: string;
  };
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  const { student, truthId, loading, error } = useStudent(params.id);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (error || !student || !truthId) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-2">Student not found</div>
          <p className="text-gray-400">{error || 'Unable to load student profile'}</p>
        </div>
      </MainLayout>
    );
  }

  const recommendations = getRecommendations(truthId.skillBreakdown);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-card-dark rounded-lg p-8 card-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center">
                <span className="text-primary-500 font-bold text-2xl">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-dark mb-2">
                  {student.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-400">
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {student.field}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {student.institution}, {student.city}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Year {student.year}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color: getScoreColor(truthId.score) }}
              >
                {formatScore(truthId.score)}
              </div>
              <div className="text-sm text-gray-400 mb-3">TruthID Score</div>
              <SignalBadge signal={truthId.signalStatus} size="lg" showDescription />
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6 pt-6 border-t border-gray-700 flex flex-wrap gap-6 text-sm text-gray-400">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {student.email}
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              {student.phone}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card-dark rounded-lg p-6 card-shadow text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-dark">{truthId.lgs}%</div>
            <div className="text-sm text-gray-400">Learning Growth Score</div>
          </div>
          
          <div className="bg-card-dark rounded-lg p-6 card-shadow text-center">
            <Award className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-dark">{truthId.strengths.length}</div>
            <div className="text-sm text-gray-400">Key Strengths</div>
          </div>
          
          <div className="bg-card-dark rounded-lg p-6 card-shadow text-center">
            <Target className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-dark">{truthId.developmentAreas.length}</div>
            <div className="text-sm text-gray-400">Development Areas</div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ScoreBarGroup 
            skillBreakdown={truthId.skillBreakdown}
            title="Skill Assessment Breakdown"
            showWeights={true}
            size="lg"
          />
          
          <RadarChartComponent 
            skillBreakdown={truthId.skillBreakdown}
            title="Skills Radar"
          />
        </div>

        {/* Trend Analysis */}
        <LineChartComponent 
          title="Performance Trend Analysis"
          showControls={true}
        />

        {/* Insights and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Insights */}
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <h3 className="text-xl font-semibold text-text-dark mb-4">AI Generated Insights</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              {truthId.insights}
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-400 mb-2">Key Strengths</h4>
                <ul className="space-y-1">
                  {truthId.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-400 mb-2">Development Areas</h4>
                <ul className="space-y-1">
                  {truthId.developmentAreas.map((area, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <h3 className="text-xl font-semibold text-text-dark mb-4">Recommended Actions</h3>
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="p-4 bg-primary-500/10 rounded-lg border border-primary-500/20">
                  <p className="text-sm text-gray-300">{recommendation}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Last updated: {truthId.generatedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}