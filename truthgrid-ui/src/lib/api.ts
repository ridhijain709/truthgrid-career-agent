import { StudentProfile, TruthID, AssessmentSubmission, ChatMessage } from '@/types';
import { MOCK_STUDENTS, MOCK_TRUTHID_SCORES, MOCK_CHAT_MESSAGES } from './mock-data';

class APIClient {
  private baseURL: string;
  private mockMode: boolean;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.mockMode = process.env.NODE_ENV === 'development' || !process.env.GEMINI_API_KEY;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (this.mockMode) {
      return this.handleMockRequest<T>(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async handleMockRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (endpoint === '/students') {
      return MOCK_STUDENTS as T;
    }

    if (endpoint.match(/^\/students\/\w+$/)) {
      const studentId = endpoint.split('/')[2];
      const student = MOCK_STUDENTS.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');
      return student as T;
    }

    if (endpoint.match(/^\/students\/\w+\/truthid$/)) {
      const studentId = endpoint.split('/')[2];
      const truthId = MOCK_TRUTHID_SCORES.find(t => t.studentId === studentId);
      if (!truthId) throw new Error('TruthID not found');
      return truthId as T;
    }

    if (endpoint === '/chat/messages') {
      return MOCK_CHAT_MESSAGES as T;
    }

    if (endpoint === '/chat/send' && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const responses = [
        "That's a great question! Based on your profile, I'd recommend focusing on...",
        "I can help you with that. Here are some specific steps you can take...",
        "Let me analyze your current skills and provide targeted advice...",
        "Excellent progress! To continue improving, consider these approaches...",
        "I understand your concern. Here's how we can address this challenge...",
      ];
      
      const mockResponse: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)] + " " + 
                "Focus on practical projects, join study groups, and practice regularly. Would you like more specific resources?",
        timestamp: new Date(),
      };
      
      return mockResponse as T;
    }

    if (endpoint === '/assessments' && options?.method === 'POST') {
      // Mock assessment submission
      const submissionId = Date.now().toString();
      return { id: submissionId, status: 'submitted' } as T;
    }

    throw new Error(`Mock endpoint not implemented: ${endpoint}`);
  }

  async getStudents(): Promise<StudentProfile[]> {
    return this.request<StudentProfile[]>('/students');
  }

  async getStudent(id: string): Promise<StudentProfile> {
    return this.request<StudentProfile>(`/students/${id}`);
  }

  async getTruthID(studentId: string): Promise<TruthID> {
    return this.request<TruthID>(`/students/${studentId}/truthid`);
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>('/chat/messages');
  }

  async sendChatMessage(message: string): Promise<ChatMessage> {
    return this.request<ChatMessage>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message, timestamp: new Date() }),
    });
  }

  async submitAssessment(assessment: AssessmentSubmission): Promise<{ id: string; status: string }> {
    return this.request('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessment),
    });
  }

  async generateTruthID(studentId: string): Promise<TruthID> {
    if (this.mockMode) {
      // Return existing mock TruthID or create new one
      const existingTruthId = MOCK_TRUTHID_SCORES.find(t => t.studentId === studentId);
      if (existingTruthId) return existingTruthId;
      
      throw new Error('TruthID not found for student');
    }

    return this.request<TruthID>('/generate-truthid', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  }

  async getAnalytics(): Promise<any> {
    // Mock analytics data
    return this.request('/analytics');
  }
}

export const apiClient = new APIClient();
export default apiClient;