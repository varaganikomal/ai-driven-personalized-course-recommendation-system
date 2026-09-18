import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CourseCard } from '@/components/CourseCard';
import { SkillGapChart } from '@/components/SkillGapChart';
import { ProgressPieChart, CourseProgressBarChart } from '@/components/ProgressChart';
import { DomainDistributionChart } from '@/components/DomainDistributionChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  BookOpen, Target, TrendingUp, Award, ArrowRight, Sparkles, Map, Loader2, CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Course {
  id: string;
  name: string;
  description: string;
  domain: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  skills_covered: string[];
  image_url?: string | null;
  instructor?: string | null;
}

interface Recommendation {
  course: Course;
  score: number;
  explanation: string;
  whyEnroll?: string;
  importance?: string;
  usefulness?: string;
}

interface Enrollment {
  id: string;
  progress: number;
  course: Course;
  enrolled_at: string;
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [skillGaps, setSkillGaps] = useState<string[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [{ data: enrollmentData }, recResult] = await Promise.all([
        supabase
          .from('enrollments')
          .select('id, progress, enrolled_at, course:courses(*)')
          .eq('user_id', user!.id)
          .order('enrolled_at', { ascending: false })
          .limit(10),
        supabase.functions.invoke('get-recommendations', { body: { limit: 3 } }),
      ]);

      if (enrollmentData) setEnrollments(enrollmentData as unknown as Enrollment[]);
      if (recResult.data?.recommendations) setRecommendations(recResult.data.recommendations);

      if (profile?.target_career_role) {
        const { data: careerData } = await supabase
          .from('career_roles')
          .select('required_skills')
          .eq('name', profile.target_career_role)
          .single();

        if (careerData?.required_skills) {
          const reqSkills = (careerData.required_skills as any[]).map(s =>
            typeof s === 'string' ? s : (s as any).skill || ''
          ).filter(Boolean);
          setRequiredSkills(reqSkills);
          const userSkills = (profile.skills || []).map(s => s.toLowerCase());
          setSkillGaps(reqSkills.filter(skill => !userSkills.includes(skill.toLowerCase())));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const { error } = await supabase.from('enrollments').insert({ user_id: user!.id, course_id: courseId });
      if (error) throw error;
      toast.success('Successfully enrolled in course!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to enroll in course');
    }
  };

  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const averageProgress = enrollments.length > 0
    ? enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl gradient-hero p-6 md:p-8 text-primary-foreground">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-foreground/80 max-w-xl">Continue your learning journey. You're making great progress!</p>
            {profile?.target_career_role && (
              <div className="mt-4 inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-4 py-2">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Goal: {profile.target_career_role}</span>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: BookOpen, label: 'Enrolled Courses', value: enrollments.length, color: 'primary' },
            { icon: Award, label: 'Completed', value: completedCourses, color: 'success' },
            { icon: TrendingUp, label: 'Avg Progress', value: `${Math.round(averageProgress)}%`, color: 'accent' },
            { icon: Target, label: 'Skills', value: (profile?.skills || []).length, color: 'info' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}/10`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        {enrollments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="grid gap-6 md:grid-cols-2">
              <ProgressPieChart enrollments={enrollments} />
              <CourseProgressBarChart enrollments={enrollments} />
            </div>
          </motion.div>
        )}

        {/* Skill Gap Chart */}
        {requiredSkills.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <SkillGapChart
              acquiredSkills={profile?.skills || []}
              requiredSkills={requiredSkills}
              title={`Skill Gap for ${profile?.target_career_role}`}
            />
          </motion.div>
        )}

        {/* Domain Distribution */}
        {enrollments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <DomainDistributionChart enrollments={enrollments} />
          </motion.div>
        )}

        {/* Skill Gap Alert */}
        {skillGaps.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="border-warning/30 bg-warning/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Map className="h-5 w-5 text-warning" />
                  Skills to Develop for {profile?.target_career_role}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skillGaps.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full text-sm bg-warning/10 text-warning border border-warning/20">{skill}</span>
                  ))}
                </div>
                <Button asChild variant="link" className="mt-2 p-0 text-warning">
                  <Link to="/roadmap">View Learning Roadmap <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Current Enrollments */}
        {enrollments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Continue Learning
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/courses">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrollments.slice(0, 5).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                        {enrollment.progress === 100 ? <CheckCircle2 className="h-8 w-8 text-success" /> : <BookOpen className="h-8 w-8 text-primary/60" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{enrollment.course.name}</h4>
                        <p className="text-sm text-muted-foreground">{enrollment.course.domain}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Progress value={enrollment.progress} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{enrollment.progress}%</span>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/courses/${enrollment.course.id}`}>
                          {enrollment.progress === 100 ? 'Review' : 'Continue'}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-display font-semibold">Recommended for You</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/recommendations">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec) => (
                <CourseCard
                  key={rec.course.id}
                  {...rec.course}
                  matchScore={rec.score}
                  matchReason={rec.explanation}
                  whyEnroll={rec.whyEnroll}
                  importance={rec.importance}
                  usefulness={rec.usefulness}
                  onEnroll={() => handleEnroll(rec.course.id)}
                  isEnrolled={enrollments.some(e => e.course.id === rec.course.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Complete your profile to get personalized recommendations!</p>
              <Button asChild className="mt-4 gradient-primary">
                <Link to="/profile">Complete Profile</Link>
              </Button>
            </Card>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
