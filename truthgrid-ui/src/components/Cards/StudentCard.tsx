'use client';

import Link from 'next/link';
import { StudentProfile, TruthID } from '@/types';
import SignalBadge from '@/components/UI/SignalBadge';
import { formatScore, getScoreColor } from '@/lib/calculations';
import { GraduationCap, MapPin } from 'lucide-react';

interface StudentCardProps {
  student: StudentProfile;
  truthId?: TruthID;
  showDetails?: boolean;
}

export default function StudentCard({ student, truthId, showDetails = false }: StudentCardProps) {
  return (
    <Link href={`/student/${student.id}`}>
      <div className="bg-card-dark rounded-lg p-6 card-shadow hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
              <span className="text-primary-500 font-semibold text-lg">
                {student.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-dark group-hover:text-primary-500 transition-colors">
                {student.name}
              </h3>
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <GraduationCap className="w-4 h-4 mr-1" />
                {student.field}
              </div>
            </div>
          </div>

          {truthId && (
            <div className="text-right">
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: getScoreColor(truthId.score) }}
              >
                {formatScore(truthId.score)}
              </div>
              <div className="text-xs text-gray-400">TruthID Score</div>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <MapPin className="w-4 h-4 mr-1" />
              {student.institution}, {student.city}
            </div>
            <div className="text-sm text-gray-400">
              Year {student.year} • {student.email}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {truthId && (
            <SignalBadge signal={truthId.signalStatus} size="sm" />
          )}
          
          <div className="flex items-center text-sm text-gray-400">
            <span>Updated {student.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>

        {truthId && showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-300 line-clamp-2">
              {truthId.insights}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}