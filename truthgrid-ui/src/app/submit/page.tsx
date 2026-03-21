'use client';

import { useState } from 'react';
import MainLayout from '@/components/Layouts/MainLayout';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { useApp } from '@/context/AppContext';
import { apiClient } from '@/lib/api';
import { AssessmentSubmission } from '@/types';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Star
} from 'lucide-react';
import clsx from 'clsx';

export default function SubmitAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addNotification } = useApp();

  const [formData, setFormData] = useState<AssessmentSubmission>({
    basicInfo: {
      name: '',
      field: '',
      institution: '',
      city: '',
      year: 1,
      email: '',
      phone: '',
    },
    selfAssessment: {
      programming: 5,
      problemSolving: 5,
      communication: 5,
      leadership: 5,
      teamwork: 5,
      creativity: 5,
      adaptability: 5,
      timeManagement: 5,
    },
    projectHistory: {
      projects: [],
    },
    behavior: {
      workStyle: '',
      motivationFactors: [],
      careerGoals: '',
      challenges: '',
    },
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      await apiClient.submitAssessment(formData);
      setSubmitted(true);
      addNotification({
        type: 'success',
        title: 'Assessment Submitted',
        message: 'Your assessment has been successfully submitted. TruthID generation will begin shortly.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'There was an error submitting your assessment. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (section: keyof AssessmentSubmission, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  if (submitted) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-text-dark mb-4">
            Assessment Submitted Successfully!
          </h1>
          <p className="text-gray-400 mb-8">
            Thank you for completing the TruthGrid assessment. Your TruthID score will be generated within 24 hours.
          </p>
          <div className="bg-card-dark rounded-lg p-6 card-shadow">
            <h3 className="font-semibold text-text-dark mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-300 text-left">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                AI analysis of your responses (2-4 hours)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                TruthID score calculation and insights generation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Email notification with your results
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Access to personalized career recommendations
              </li>
            </ul>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            TruthGrid Career Assessment
          </h1>
          <p className="text-gray-400">
            Complete this comprehensive assessment to receive your personalized TruthID score
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-gray-400">{currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-card-dark rounded-lg p-8 card-shadow">
          {currentStep === 1 && (
            <BasicInfoStep
              data={formData.basicInfo}
              onChange={(data) => updateFormData('basicInfo', data)}
            />
          )}

          {currentStep === 2 && (
            <SelfAssessmentStep
              data={formData.selfAssessment}
              onChange={(data) => updateFormData('selfAssessment', data)}
            />
          )}

          {currentStep === 3 && (
            <ProjectHistoryStep
              data={formData.projectHistory}
              onChange={(data) => updateFormData('projectHistory', data)}
            />
          )}

          {currentStep === 4 && (
            <BehaviorStep
              data={formData.behavior}
              onChange={(data) => updateFormData('behavior', data)}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {loading && <LoadingSpinner size="sm" />}
                <span>{loading ? 'Submitting...' : 'Submit Assessment'}</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Step Components
interface StepProps<T> {
  data: T;
  onChange: (data: Partial<T>) => void;
}

function BasicInfoStep({ data, onChange }: StepProps<AssessmentSubmission['basicInfo']>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="w-6 h-6 text-primary-500" />
        <h2 className="text-2xl font-semibold text-text-dark">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-primary-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Field of Study *</label>
          <select
            value={data.field}
            onChange={(e) => onChange({ field: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-primary-500"
            required
          >
            <option value="">Select your field</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Institution *</label>
          <input
            type="text"
            value={data.institution}
            onChange={(e) => onChange({ institution: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-primary-500"
            placeholder="Your university/college"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-primary-500"
            placeholder="Your city"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Year of Study *</label>
          <select
            value={data.year}
            onChange={(e) => onChange({ year: parseInt(e.target.value) })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-primary-500"
            required
          >
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
            <option value={5}>Graduate</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-primary-500"
            placeholder="your.email@example.com"
            required
          />
        </div>
      </div>
    </div>
  );
}

function SelfAssessmentStep({ data, onChange }: StepProps<AssessmentSubmission['selfAssessment']>) {
  const skills = [
    { key: 'programming' as keyof typeof data, label: 'Programming & Technical Skills' },
    { key: 'problemSolving' as keyof typeof data, label: 'Problem Solving' },
    { key: 'communication' as keyof typeof data, label: 'Communication' },
    { key: 'leadership' as keyof typeof data, label: 'Leadership' },
    { key: 'teamwork' as keyof typeof data, label: 'Teamwork' },
    { key: 'creativity' as keyof typeof data, label: 'Creativity' },
    { key: 'adaptability' as keyof typeof data, label: 'Adaptability' },
    { key: 'timeManagement' as keyof typeof data, label: 'Time Management' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Star className="w-6 h-6 text-primary-500" />
        <h2 className="text-2xl font-semibold text-text-dark">Self Assessment</h2>
      </div>
      
      <p className="text-gray-400 mb-8">
        Rate your current skill level from 1 (Beginner) to 10 (Expert) in each area
      </p>

      <div className="space-y-8">
        {skills.map((skill) => (
          <div key={skill.key} className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">{skill.label}</label>
              <span className="text-lg font-semibold text-primary-500">{data[skill.key]}/10</span>
            </div>
            
            <input
              type="range"
              min="1"
              max="10"
              value={data[skill.key]}
              onChange={(e) => onChange({ [skill.key]: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-primary"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectHistoryStep({ data, onChange }: StepProps<AssessmentSubmission['projectHistory']>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Briefcase className="w-6 h-6 text-primary-500" />
        <h2 className="text-2xl font-semibold text-text-dark">Project History</h2>
      </div>
      
      <p className="text-gray-400 mb-8">
        Tell us about your key projects, internships, or relevant experiences
      </p>

      <div className="space-y-4">
        <textarea
          placeholder="Describe your most significant projects, internships, or experiences. Include technologies used, your role, and the impact or outcomes..."
          className="w-full h-48 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-primary-500 resize-none"
          onChange={(e) => onChange({ projectDescription: e.target.value })}
        />
        
        <div className="text-sm text-gray-500">
          <p>• Include academic projects, internships, freelance work, or personal projects</p>
          <p>• Mention technologies, tools, and frameworks you&apos;ve used</p>
          <p>• Describe your specific contributions and achievements</p>
        </div>
      </div>
    </div>
  );
}

function BehaviorStep({ data, onChange }: StepProps<AssessmentSubmission['behavior']>) {
  const workStyles = [
    'Independent worker',
    'Collaborative team player',
    'Leadership-oriented',
    'Detail-focused',
    'Big-picture thinker',
  ];

  const motivationOptions = [
    'Learning new technologies',
    'Solving complex problems',
    'Making an impact',
    'Career advancement',
    'Work-life balance',
    'Financial growth',
    'Recognition and appreciation',
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <GraduationCap className="w-6 h-6 text-primary-500" />
        <h2 className="text-2xl font-semibold text-text-dark">Behavior & Goals</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Work Style Preference</label>
          <div className="space-y-2">
            {workStyles.map((style) => (
              <label key={style} className="flex items-center">
                <input
                  type="radio"
                  name="workStyle"
                  value={style}
                  checked={data.workStyle === style}
                  onChange={(e) => onChange({ workStyle: e.target.value })}
                  className="mr-3 text-primary-500"
                />
                <span className="text-gray-300">{style}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            What motivates you? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {motivationOptions.map((factor) => (
              <label key={factor} className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.motivationFactors.includes(factor)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...data.motivationFactors, factor]
                      : data.motivationFactors.filter(f => f !== factor);
                    onChange({ motivationFactors: updated });
                  }}
                  className="mr-3 text-primary-500"
                />
                <span className="text-gray-300">{factor}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Career Goals</label>
          <textarea
            value={data.careerGoals}
            onChange={(e) => onChange({ careerGoals: e.target.value })}
            placeholder="Describe your short-term and long-term career aspirations..."
            className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-primary-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Biggest Challenges</label>
          <textarea
            value={data.challenges}
            onChange={(e) => onChange({ challenges: e.target.value })}
            placeholder="What are the main challenges or obstacles you face in your career development?"
            className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-text-dark focus:outline-none focus:border-primary-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}