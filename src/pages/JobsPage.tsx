import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Job } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import JobSearch, { SearchFilters } from '../components/Jobs/JobSearch';
import JobCard from '../components/Jobs/JobCard';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchJobs = async (filters?: SearchFilters) => {
    try {
      setSearchLoading(!!filters);
      
      // Skip if using placeholder credentials
      if (supabase.supabaseUrl?.includes('placeholder')) {
        setJobs([]);
        return;
      }
      
      let query = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('is_active', true);

      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }
      
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters?.jobType) {
        query = query.eq('type', filters.jobType);
      }
      
      if (filters?.experienceLevel) {
        query = query.eq('experience_level', filters.experienceLevel);
      }
      
      if (filters?.salaryMin) {
        query = query.gte('salary_min', parseInt(filters.salaryMin));
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if (!user) return;

    // Skip if using placeholder credentials
    if (supabase.supabaseUrl?.includes('placeholder')) {
      setSavedJobs(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setSavedJobs(new Set(data?.map(item => item.job_id) || []));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
        
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await supabase
          .from('saved_jobs')
          .insert({ user_id: user.id, job_id: jobId });
        
        setSavedJobs(prev => new Set([...prev, jobId]));
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Next Job</h1>
          <p className="text-xl text-gray-600">Discover opportunities that match your skills and career goals</p>
        </div>

        <div className="mb-8">
          <JobSearch onSearch={fetchJobs} loading={searchLoading} />
        </div>

        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSave={handleSaveJob}
              isSaved={savedJobs.has(job.id)}
              onClick={() => navigate(`/jobs/${job.id}`)}
            />
          ))}
        </div>

        {jobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or browse all available jobs</p>
          </div>
        )}
      </div>
    </div>
  );
}