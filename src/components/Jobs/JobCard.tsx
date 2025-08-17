import React from 'react';
import { MapPin, Clock, DollarSign, Building2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Job } from '../../lib/supabase';

interface JobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
  onClick?: () => void;
}

export default function JobCard({ job, onSave, isSaved, onClick }: JobCardProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const formatJobType = (type?: string) => {
    if (!type) return '';
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getExperienceLevel = (level?: string) => {
    const levels: Record<string, string> = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'lead': 'Lead/Principal'
    };
    return levels[level || ''] || 'Not specified';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          {job.company?.logo_url ? (
            <img 
              src={job.company.logo_url} 
              alt={`${job.company.name} logo`}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium">{job.company?.name}</p>
          </div>
        </div>
        
        {onSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(job.id);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-blue-600" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{job.location || 'Remote'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{formatJobType(job.type)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <DollarSign className="h-4 w-4" />
          <span>{formatSalary(job.salary_min, job.salary_max)}</span>
        </div>
        <div className="text-sm text-gray-600">
          {getExperienceLevel(job.experience_level)}
        </div>
      </div>

      {job.description && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>
      )}

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Posted {new Date(job.created_at).toLocaleDateString()}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick(e);
          }}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors px-3 py-1 rounded-lg hover:bg-blue-50"
        >
          View Details
        </button>
      </div>
    </div>
  );
}