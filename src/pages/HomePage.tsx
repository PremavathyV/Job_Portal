import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Users, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase, Job } from '../lib/supabase';
import JobCard from '../components/Jobs/JobCard';

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0
  });

  useEffect(() => {
    fetchFeaturedJobs();
    fetchStats();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      // Skip if using placeholder credentials
      if (supabaseUrl.includes('placeholder')) {
        setFeaturedJobs([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedJobs(data || []);
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Skip if using placeholder credentials
      if (supabaseUrl.includes('placeholder')) {
        setStats({ totalJobs: 0, totalCompanies: 0, totalApplications: 0 });
        return;
      }
      
      const [jobsResult, companiesResult, applicationsResult] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalJobs: jobsResult.count || 0,
        totalCompanies: companiesResult.count || 0,
        totalApplications: applicationsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Dream Job
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with top companies and discover opportunities that match your skills and ambitions
            </p>
            
            {/* Quick search */}
            <div className="max-w-2xl mx-auto mb-8">
              <Link to="/jobs">
                <div className="bg-white rounded-lg p-2 flex items-center space-x-4 hover:shadow-lg transition-shadow">
                  <Search className="h-5 w-5 text-gray-400 ml-2" />
                  <input
                    type="text"
                    placeholder="Search for jobs, companies, or locations..."
                    className="flex-1 py-2 px-2 text-gray-900 placeholder-gray-500 border-none focus:outline-none"
                    readOnly
                  />
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Search Jobs
                  </button>
                </div>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/jobs"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <Briefcase className="h-5 w-5" />
                <span>Browse Jobs</span>
              </Link>
              <Link
                to="/signup"
                className="border border-blue-300 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Users className="h-5 w-5" />
                <span>Join Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Briefcase className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalJobs.toLocaleString()}</h3>
              <p className="text-gray-600">Active Jobs</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalCompanies.toLocaleString()}</h3>
              <p className="text-gray-600">Companies</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalApplications.toLocaleString()}</h3>
              <p className="text-gray-600">Applications Sent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Jobs</h2>
            <p className="text-xl text-gray-600">Discover the latest job opportunities from top companies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => window.location.href = `/jobs/${job.id}`}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/jobs"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <span>View All Jobs</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have found their dream jobs through our platform
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup?role=job_seeker"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Find Your Next Job
            </Link>
            <Link
              to="/signup?role=employer"
              className="border border-indigo-300 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Hire Top Talent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}