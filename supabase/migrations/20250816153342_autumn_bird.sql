/*
  # Job Portal Database Schema

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, company name)
      - `description` (text, company description)
      - `website` (text, company website)
      - `logo_url` (text, company logo)
      - `location` (text, company location)
      - `size` (text, company size)
      - `created_at` (timestamp)

    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text, job title)
      - `description` (text, job description)
      - `requirements` (text, job requirements)
      - `salary_min` (integer, minimum salary)
      - `salary_max` (integer, maximum salary)
      - `location` (text, job location)
      - `type` (text, job type: full-time, part-time, contract, remote)
      - `experience_level` (text, experience level required)
      - `company_id` (uuid, foreign key to companies)
      - `posted_by` (uuid, foreign key to auth.users)
      - `is_active` (boolean, job status)
      - `created_at` (timestamp)

    - `profiles`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `full_name` (text, user full name)
      - `email` (text, user email)
      - `role` (text, user role: job_seeker, employer)
      - `avatar_url` (text, profile picture)
      - `bio` (text, user bio)
      - `location` (text, user location)
      - `skills` (text array, user skills)
      - `experience` (text, user experience)
      - `resume_url` (text, resume file URL)
      - `company_id` (uuid, foreign key to companies, null for job seekers)
      - `created_at` (timestamp)

    - `applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `applicant_id` (uuid, foreign key to auth.users)
      - `status` (text, application status: pending, reviewed, accepted, rejected)
      - `cover_letter` (text, applicant cover letter)
      - `created_at` (timestamp)

    - `saved_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `job_id` (uuid, foreign key to jobs)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for employers to manage their company jobs
    - Add policies for public job viewing
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  website text DEFAULT '',
  logo_url text DEFAULT '',
  location text DEFAULT '',
  size text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  requirements text DEFAULT '',
  salary_min integer DEFAULT 0,
  salary_max integer DEFAULT 0,
  location text DEFAULT '',
  type text DEFAULT 'full-time',
  experience_level text DEFAULT 'entry',
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  posted_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  email text DEFAULT '',
  role text DEFAULT 'job_seeker',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  location text DEFAULT '',
  skills text[] DEFAULT '{}',
  experience text DEFAULT '',
  resume_url text DEFAULT '',
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  cover_letter text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- Saved jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies are publicly readable"
  ON companies FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Employers can manage their companies"
  ON companies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'employer'
      AND profiles.company_id = companies.id
    )
  );

-- Jobs policies
CREATE POLICY "Jobs are publicly readable"
  ON jobs FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Employers can manage their company jobs"
  ON jobs FOR ALL
  TO authenticated
  USING (posted_by = auth.uid());

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- Applications policies
CREATE POLICY "Users can view applications they're involved in"
  ON applications FOR SELECT
  TO authenticated
  USING (
    applicant_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.posted_by = auth.uid()
    )
  );

CREATE POLICY "Job seekers can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Employers can update application status"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.posted_by = auth.uid()
    )
  );

-- Saved jobs policies
CREATE POLICY "Users can manage their saved jobs"
  ON saved_jobs FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Insert sample data
INSERT INTO companies (name, description, website, location, size) VALUES
  ('TechCorp Innovation', 'Leading technology company specializing in AI and machine learning solutions', 'https://techcorp.com', 'San Francisco, CA', '500-1000'),
  ('StartupXYZ', 'Fast-growing startup revolutionizing e-commerce', 'https://startupxyz.com', 'New York, NY', '50-100'),
  ('Global Solutions Inc', 'Fortune 500 company providing enterprise software solutions', 'https://globalsolutions.com', 'Austin, TX', '1000+'),
  ('Creative Agency Pro', 'Award-winning creative agency specializing in digital marketing', 'https://creativeagency.com', 'Los Angeles, CA', '25-50');

INSERT INTO jobs (title, description, requirements, salary_min, salary_max, location, type, experience_level, company_id, posted_by, is_active) 
SELECT 
  'Senior Software Engineer',
  'Join our engineering team to build scalable web applications using modern technologies. You will work on challenging problems and have the opportunity to mentor junior developers.',
  '• 5+ years of experience with React and Node.js
• Strong understanding of database design
• Experience with cloud platforms (AWS/GCP)
• Excellent problem-solving skills
• Bachelor''s degree in Computer Science or equivalent',
  120000, 160000, 'San Francisco, CA', 'full-time', 'senior', id, 
  (SELECT id FROM auth.users LIMIT 1), true
FROM companies WHERE name = 'TechCorp Innovation';

INSERT INTO jobs (title, description, requirements, salary_min, salary_max, location, type, experience_level, company_id, posted_by, is_active)
SELECT 
  'Product Manager',
  'Lead product strategy and development for our e-commerce platform. Work closely with engineering, design, and marketing teams.',
  '• 3+ years of product management experience
• Strong analytical and communication skills
• Experience with agile methodologies
• Understanding of e-commerce business models
• MBA or equivalent experience preferred',
  90000, 130000, 'New York, NY', 'full-time', 'mid', id,
  (SELECT id FROM auth.users LIMIT 1), true
FROM companies WHERE name = 'StartupXYZ';

INSERT INTO jobs (title, description, requirements, salary_min, salary_max, location, type, experience_level, company_id, posted_by, is_active)
SELECT 
  'Frontend Developer',
  'Create amazing user experiences with modern web technologies. Join a collaborative team building enterprise applications.',
  '• 2+ years of experience with React/Angular/Vue
• Proficiency in HTML, CSS, and JavaScript
• Experience with responsive design
• Knowledge of version control (Git)
• Portfolio of previous work required',
  70000, 95000, 'Austin, TX', 'full-time', 'mid', id,
  (SELECT id FROM auth.users LIMIT 1), true
FROM companies WHERE name = 'Global Solutions Inc';

INSERT INTO jobs (title, description, requirements, salary_min, salary_max, location, type, experience_level, company_id, posted_by, is_active)
SELECT 
  'UI/UX Designer',
  'Design intuitive and beautiful user interfaces for digital marketing campaigns and web applications.',
  '• 2+ years of UI/UX design experience
• Proficiency in Figma, Sketch, or Adobe XD
• Understanding of design systems
• Experience with user research methods
• Portfolio showcasing design process',
  65000, 85000, 'Los Angeles, CA', 'full-time', 'mid', id,
  (SELECT id FROM auth.users LIMIT 1), true
FROM companies WHERE name = 'Creative Agency Pro';