'use client';

import { useStudent } from '@/hooks/useStudent';
import MainLayout from '@/components/Layouts/MainLayout';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import RadarChartComponent from '@/components/Charts/RadarChart';
import { ScoreBarGroup } from '@/components/Charts/ScoreBar';
import { formatScore, getScoreColor } from '@/lib/calculations';
import { Shield, Award, TrendingUp, Eye } from 'lucide-react';

interface TruthIDPageProps {
  params: {
    id: string;
  };
}

export default function TruthIDPage({ params }: TruthIDPageProps) {
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

  if (error || !truthId) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-2">TruthID Profile Not Found</div>
          <p className="text-gray-400">{error || 'Unable to load TruthID profile'}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header - Employer View Notice */}
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-primary-500" />
            <div>
              <h3 className="font-semibold text-primary-400">Employer View</h3>
              <p className="text-sm text-gray-400">
                This is how employers will see this candidate profile (anonymized)
              </p>
            </div>
          </div>
        </div>

        {/* Candidate Header */}
        <div className="bg-card-dark rounded-lg p-8 card-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-dark mb-2">
                  Candidate #{params.id}
                </h1>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span>{student?.field || 'Technology Professional'}</span>
                  <span>•</span>
                  <span>Verified Profile</span>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <div 
                className="text-5xl font-bold mb-2"
                style={{ color: getScoreColor(truthId.score) }}
              >
                {formatScore(truthId.score)}
              </div>
              <div className="text-lg text-gray-400 mb-2">TruthID Score</div>
              <div className="text-sm text-gray-500">
                Generated {truthId.generatedAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card-dark rounded-lg p-6 card-shadow text-center">
            <Award className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-text-dark mb-1">
              {Math.round(truthId.lgs)}%
            </div>
            <div className="text-sm text-gray-400">Learning Growth Score</div>
            <div className="text-xs text-green-500 mt-1">Above Average</div>
          </div>
          
          <div className="bg-card-dark rounded-lg p-6 card-shadow text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-text-dark mb-1">
              {truthId.trend === 'up' ? '↗' : truthId.trend === 'down' ? '↘' : '→'}
            </div>
            <div className="text-sm text-gray-400">Performance Trend</div>
            <div className={`text-xs mt-1 ${
              truthId.trend === 'up' ? 'text-green-500' : 
              truthId.trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {truthId.trend === 'up' ? 'Improving' : 
               truthId.trend === 'down' ? 'Needs Focus' : 'Stable'}
            </div>
          </div>
          
          <div className="bg-card-dark rounded-lg p-6 card-shadow text-center">
            <Shield className="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-text-dark mb-1">A+</div>
            <div className="text-sm text-gray-400">Reliability Score</div>
            <div className="text-xs text-primary-500 mt-1">High Confidence</div>
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ScoreBarGroup 
            skillBreakdown={truthId.skillBreakdown}
            title="Competency Analysis"
            showWeights={false}
            size="lg"
          />
          
          <RadarChartComponent 
            skillBreakdown={truthId.skillBreakdown}
            title="Skills Profile"
          />
        </div>

        {/* Employer Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strengths */}
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <h3 className="text-xl font-semibold text-text-dark mb-4 flex items-center">
              <Award className="w-5 h-5 text-green-500 mr-2" />
              Key Strengths
            </h3>
            <div className="space-y-3">
              {truthId.strengths.map((strength, index) => (
                <div key={index} className="flex items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span className="text-gray-300">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <h3 className="text-xl font-semibold text-text-dark mb-4">Professional Summary</h3>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                This candidate demonstrates strong potential with a balanced skill profile. 
                The TruthID assessment indicates reliable performance capabilities and 
                positive growth trajectory.
              </p>
              
              <div className="bg-primary-500/10 rounded-lg p-4 border border-primary-500/20">
                <h4 className="font-medium text-primary-400 mb-2">Best Fit For:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Mid-level technical roles</li>
                  <li>• Team collaboration projects</li>
                  <li>• Growth-oriented positions</li>
                  <li>• Mentorship programs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Verification & Disclaimer */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-primary-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-primary-400 mb-2">TruthID Verification</h4>
              <div className="text-sm text-gray-400 space-y-2">
                <p>
                  This TruthID profile has been generated using AI-powered assessment algorithms 
                  and validated through comprehensive skill evaluation.
                </p>
                <p>
                  <strong>Profile ID:</strong> TG-{params.id}-{truthId.score}
                </p>
                <p>
                  <strong>Generated:</strong> {truthId.generatedAt.toLocaleDateString()} at {truthId.generatedAt.toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  TruthGrid assessments are designed to provide objective, bias-free candidate evaluation. 
                  This profile represents skills and potential at the time of assessment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information for Employers */}
        <div className="text-center">
          <div className="bg-card-dark rounded-lg p-6 card-shadow inline-block">
            <h4 className="font-semibold text-text-dark mb-2">Interested in this candidate?</h4>
            <p className="text-sm text-gray-400 mb-4">
              Contact TruthGrid to connect with verified talent
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors">
              Request Interview
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}