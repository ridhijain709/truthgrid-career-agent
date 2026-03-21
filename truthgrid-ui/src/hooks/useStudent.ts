import { useState, useEffect } from 'react';
import { StudentProfile, TruthID } from '@/types';
import { apiClient } from '@/lib/api';

export function useStudent(studentId?: string) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [truthId, setTruthId] = useState<TruthID | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const loadStudent = async () => {
      setLoading(true);
      setError(null);

      try {
        const [studentData, truthIdData] = await Promise.all([
          apiClient.getStudent(studentId),
          apiClient.getTruthID(studentId),
        ]);

        setStudent(studentData);
        setTruthId(truthIdData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [studentId]);

  return {
    student,
    truthId,
    loading,
    error,
    refetch: () => {
      if (studentId) {
        setStudent(null);
        setTruthId(null);
      }
    },
  };
}

export function useStudents() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError(null);

      try {
        const studentsData = await apiClient.getStudents();
        setStudents(studentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  return {
    students,
    loading,
    error,
    refetch: () => setStudents([]),
  };
}