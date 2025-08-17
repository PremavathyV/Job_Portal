import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Bookmark, Send, Users, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Job, Application } from '../lib/supabase';
import JobCard from '../components/Jobs/JobCard';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    savedJobs: 0,
    applications: 0,
    postedJobs: 0,
  });

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'job_seeker') {
        fetchSavedJobs();
        fetchApplications();
      } else {
        fetchPostedJobs();
      }
    }
  }, [user, profile]);

  const fetchSavedJobs = async () => {
    if (!user) return;

    // Skip if using placeholder credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
    if (supabaseUrl.includes('placeholder')) {
      setSavedJobs([]);
      setStats(prev => ({ ...prev, savedJobs: 0 }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          *,
          job:jobs(
            *,
            company:companies(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const jobs = data?.map(item => item.job).filter(Boolean) || [];
      setSavedJobs(jobs);
      setStats(prev => ({ ...prev, savedJobs: jobs.length }));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;

    // Skip if using placeholder credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
    if (supabaseUrl.includes('placeholder')) {
      setApplications([]);
      setStats(prev => ({ ...prev, applications: 0 }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(
            *,
            company:companies(*)
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
      setStats(prev => ({ ...prev, applications: data?.length || 0 }));
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchPostedJobs = async () => {
    if (!user) return;

    // Skip if using placeholder credentials
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
    if (supabaseUrl.includes('placeholder')) {
      setPostedJobs([]);
      setStats(prev => ({ ...prev, postedJobs: 0 }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('posted_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPostedJobs(data || []);
      setStats(prev => ({ ...prev, postedJobs: data?.length || 0 }));
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile.full_name || 'User'}!
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            {profile.role === 'job_seeker' 
              ? 'Track your job search progress and discover new opportunities'
              : 'Manage your job postings and find the perfect candidates'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {profile.role === 'job_seeker' ? (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Bookmark className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.savedJobs}</h3>
                    <p className="text-gray-600">Saved Jobs</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <Send className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.applications}</h3>
                    <p className="text-gray-600">Applications</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 rounded-full p-3">
                    <Briefcase className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {applications.filter(app => app.status === 'reviewed').length}
                    </h3>
                    <p className="text-gray-600">Under Review</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.postedJobs}</h3>
                    <p className="text-gray-600">Posted Jobs</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {applications.reduce((acc, app) => acc + (app.job?.posted_by === user?.id ? 1 : 0), 0)}
                    </h3>
                    <p className="text-gray-600">Total Applications</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Link
                  to="/post-job"
                  className="flex items-center space-x-4 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <div className="bg-blue-100 rounded-full p-3">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Post New Job</h3>
                    <p className="text-sm">Find your next hire</p>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Content based on role */}
        {profile.role === 'job_seeker' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Saved Jobs */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Saved Jobs</h2>
                <Link to="/jobs" className="text-blue-600 hover:text-blue-700 font-medium">
                  Browse More
                </Link>
              </div>
              <div className="space-y-4">
                {savedJobs.slice(0, 3).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => window.location.href = `/jobs/${job.id}`}
                  />
                ))}
                {savedJobs.length === 0 && (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No saved jobs yet</p>
                    <Link
                      to="/jobs"
                      className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                    >
                      Start browsing jobs
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applications */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Applications</h2>
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div
                    key={application.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {application.job?.title}
                        </h3>
                        <p className="text-gray-600">
                          {application.job?.company?.name}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Applied {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <Send className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No applications yet</p>
                    <Link
                      to="/jobs"
                      className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                    >
                      Apply to jobs
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Job Postings</h2>
              <Link
                to="/post-job"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Post New Job
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => window.location.href = `/jobs/${job.id}`}
                />
              ))}
            </div>
            {postedJobs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">You haven't posted any jobs yet</p>
                <Link
                  to="/post-job"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Post Your First Job
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}