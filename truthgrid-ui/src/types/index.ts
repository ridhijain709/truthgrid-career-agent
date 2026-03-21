export interface StudentProfile {
  id: string;
  name: string;
  field: string;
  institution: string;
  city: string;
  year: number;
  email: string;
  phone: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillScore {
  priorityAbility: number;
  technicalSkills: number;
  executionSpeed: number;
  learnability: number;
  softSkills: number;
}

export interface TruthID {
  id: string;
  studentId: string;
  score: number;
  skillBreakdown: SkillScore;
  lgs: number; // Learning Growth Score
  trend: 'up' | 'down' | 'stable';
  signalStatus: SignalStatus;
  insights: string;
  strengths: string[];
  developmentAreas: string[];
  generatedAt: Date;
}

export interface SignalStatus {
  status: 'HEALTHY' | 'WATCH' | 'COLLAPSE' | 'RECOVERY';
  color: string;
  description: string;
}

export interface JobInsights {
  suggestedRoles: string[];
  marketTrends: string[];
  skillGaps: string[];
  careerPath: string[];
}

export interface WeeklyReport {
  id: string;
  week: string;
  classAverage: number;
  topPerformers: StudentProfile[];
  studentsAtRisk: StudentProfile[];
  trends: {
    improving: number;
    declining: number;
    stable: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AssessmentSubmission {
  basicInfo: {
    name: string;
    field: string;
    institution: string;
    city: string;
    year: number;
    email: string;
    phone: string;
  };
  selfAssessment: {
    programming: number;
    problemSolving: number;
    communication: number;
    leadership: number;
    teamwork: number;
    creativity: number;
    adaptability: number;
    timeManagement: number;
  };
  projectHistory: {
    projectDescription?: string;
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
      role: string;
      duration: string;
      impact: string;
    }>;
  };
  behavior: {
    workStyle: string;
    motivationFactors: string[];
    careerGoals: string;
    challenges: string;
  };
}

export interface AdminStats {
  totalStudents: number;
  averageScore: number;
  studentsAtRisk: number;
  healthyStudents: number;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  fieldBreakdown: {
    field: string;
    count: number;
    avgScore: number;
  }[];
}

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface Theme {
  isDark: boolean;
  toggle: () => void;
}

export interface AppContextType {
  theme: Theme;
  selectedStudent: StudentProfile | null;
  setSelectedStudent: (student: StudentProfile | null) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
}