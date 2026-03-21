import { StudentProfile, TruthID, WeeklyReport, AdminStats, ChatMessage } from '@/types';
import { SIGNAL_STATUS } from './constants';

export const MOCK_STUDENTS: StudentProfile[] = [
  {
    id: '1',
    name: 'Ridhi Jain',
    field: 'Marketing',
    institution: 'Delhi University',
    city: 'New Delhi',
    year: 3,
    email: 'ridhi.jain@example.com',
    phone: '+91 98765 43210',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: '2',
    name: 'Arjun Sharma',
    field: 'Computer Science',
    institution: 'IIT Bombay',
    city: 'Mumbai',
    year: 4,
    email: 'arjun.sharma@example.com',
    phone: '+91 98765 43211',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-12'),
  },
  {
    id: '3',
    name: 'Priya Mehta',
    field: 'Business Administration',
    institution: 'XLRI Jamshedpur',
    city: 'Jamshedpur',
    year: 2,
    email: 'priya.mehta@example.com',
    phone: '+91 98765 43212',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-08'),
  },
];

export const MOCK_TRUTHID_SCORES: TruthID[] = [
  {
    id: 'tid1',
    studentId: '1',
    score: 7040,
    skillBreakdown: {
      priorityAbility: 75,
      technicalSkills: 68,
      executionSpeed: 72,
      learnability: 80,
      softSkills: 85,
    },
    lgs: 76,
    trend: 'up',
    signalStatus: SIGNAL_STATUS.HEALTHY,
    insights: 'Ridhi shows exceptional soft skills and strong learnability. Her marketing acumen combined with communication skills makes her well-suited for brand management roles. Focus on technical digital marketing tools to enhance career prospects.',
    strengths: ['Communication', 'Leadership', 'Creative Problem Solving', 'Team Management'],
    developmentAreas: ['Technical Skills', 'Data Analysis', 'Digital Marketing Tools'],
    generatedAt: new Date('2024-03-10'),
  },
  {
    id: 'tid2',
    studentId: '2',
    score: 8250,
    skillBreakdown: {
      priorityAbility: 88,
      technicalSkills: 92,
      executionSpeed: 85,
      learnability: 78,
      softSkills: 72,
    },
    lgs: 83,
    trend: 'up',
    signalStatus: SIGNAL_STATUS.HEALTHY,
    insights: 'Arjun demonstrates outstanding technical capabilities with strong execution skills. His programming expertise and problem-solving abilities position him well for senior software roles. Consider developing leadership and communication skills for management track.',
    strengths: ['Programming', 'System Design', 'Problem Solving', 'Technical Innovation'],
    developmentAreas: ['Public Speaking', 'Team Leadership', 'Business Acumen'],
    generatedAt: new Date('2024-03-12'),
  },
  {
    id: 'tid3',
    studentId: '3',
    score: 4820,
    skillBreakdown: {
      priorityAbility: 55,
      technicalSkills: 45,
      executionSpeed: 48,
      learnability: 62,
      softSkills: 58,
    },
    lgs: 54,
    trend: 'down',
    signalStatus: SIGNAL_STATUS.WATCH,
    insights: 'Priya shows good potential in learnability but needs significant improvement in execution and technical skills. Her business foundation is solid, but practical application requires development. Recommend focused skill-building programs and mentorship.',
    strengths: ['Strategic Thinking', 'Academic Knowledge', 'Adaptability'],
    developmentAreas: ['Project Execution', 'Technical Proficiency', 'Time Management', 'Practical Application'],
    generatedAt: new Date('2024-03-08'),
  },
];

export const MOCK_WEEKLY_REPORT: WeeklyReport = {
  id: 'wr1',
  week: 'March 4-10, 2024',
  classAverage: 6703,
  topPerformers: [MOCK_STUDENTS[1], MOCK_STUDENTS[0]],
  studentsAtRisk: [MOCK_STUDENTS[2]],
  trends: {
    improving: 2,
    declining: 1,
    stable: 0,
  },
};

export const MOCK_ADMIN_STATS: AdminStats = {
  totalStudents: 3,
  averageScore: 6703,
  studentsAtRisk: 1,
  healthyStudents: 2,
  scoreDistribution: [
    { range: '8000-10000', count: 1 },
    { range: '6000-7999', count: 1 },
    { range: '4000-5999', count: 1 },
    { range: '0-3999', count: 0 },
  ],
  fieldBreakdown: [
    { field: 'Computer Science', count: 1, avgScore: 8250 },
    { field: 'Marketing', count: 1, avgScore: 7040 },
    { field: 'Business Administration', count: 1, avgScore: 4820 },
  ],
};

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg1',
    role: 'system',
    content: 'Welcome to TruthGrid AI Tutor! I\'m here to help you improve your skills and career prospects. How can I assist you today?',
    timestamp: new Date('2024-03-12T10:00:00'),
  },
  {
    id: 'msg2',
    role: 'user',
    content: 'I want to improve my technical skills. What should I focus on?',
    timestamp: new Date('2024-03-12T10:01:00'),
  },
  {
    id: 'msg3',
    role: 'assistant',
    content: 'Based on your profile, I recommend focusing on: 1) Programming fundamentals (Python/JavaScript), 2) Data analysis tools (Excel, SQL basics), 3) Digital marketing platforms (Google Analytics, social media tools). Start with 30 minutes daily practice. Would you like specific learning resources?',
    timestamp: new Date('2024-03-12T10:01:30'),
  },
];

export const MOCK_TREND_DATA = [
  { date: '2024-01-01', score: 6500, lgs: 65 },
  { date: '2024-01-15', score: 6750, lgs: 67 },
  { date: '2024-02-01', score: 7000, lgs: 70 },
  { date: '2024-02-15', score: 7200, lgs: 72 },
  { date: '2024-03-01', score: 7400, lgs: 74 },
  { date: '2024-03-15', score: 7040, lgs: 76 },
];