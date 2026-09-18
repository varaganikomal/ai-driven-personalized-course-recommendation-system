 import { useState, useEffect } from 'react';
 import { useAuth } from '@/contexts/AuthContext';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Progress } from '@/components/ui/progress';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { motion } from 'framer-motion';
 import {
   Map,
   Target,
   CheckCircle2,
   Circle,
   ChevronRight,
   BookOpen,
   Loader2,
   ArrowRight,
   Sparkles,
  ExternalLink,
  Clock,
  GraduationCap,
 } from 'lucide-react';
 import { Link } from 'react-router-dom';
 import { cn } from '@/lib/utils';
 
 interface SkillRequirement {
   skill: string;
   level: 'beginner' | 'intermediate' | 'advanced';
   priority: number;
 }
 
 interface CareerRole {
   id: string;
   name: string;
   description: string;
   required_skills: SkillRequirement[];
   skill_progression: {
     beginner: string[];
     intermediate: string[];
     advanced: string[];
   };
 }
 
 interface RoadmapCourse {
   id: string;
   name: string;
   level: 'beginner' | 'intermediate' | 'advanced';
   skills_covered: string[];
   domain: string;
   duration_hours: number;
 }
 
interface CourseResource {
  id: string;
  course_id: string;
  title: string;
  type: string;
  url: string | null;
  description: string | null;
  is_free: boolean;
}

 interface RoadmapStage {
   level: 'beginner' | 'intermediate' | 'advanced';
   label: string;
   skills: string[];
   courses: RoadmapCourse[];
  resources: CourseResource[];
   completed: boolean;
 }
 
 export default function Roadmap() {
   const { user, profile } = useAuth();
   const [careerRole, setCareerRole] = useState<CareerRole | null>(null);
   const [roadmap, setRoadmap] = useState<RoadmapStage[]>([]);
   const [skillGaps, setSkillGaps] = useState<string[]>([]);
   const [acquiredSkills, setAcquiredSkills] = useState<string[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
 
   useEffect(() => {
     if (user && profile?.target_career_role) {
       fetchRoadmapData();
     } else {
       setIsLoading(false);
     }
   }, [user, profile]);
 
   const fetchRoadmapData = async () => {
     try {
       // Fetch career role details
       const { data: roleData } = await supabase
         .from('career_roles')
         .select('*')
         .eq('name', profile!.target_career_role!)
         .single();
 
       if (roleData) {
        // Handle required_skills which could be an array of strings or objects
        const requiredSkillsRaw = roleData.required_skills;
        let requiredSkills: string[] = [];
        if (Array.isArray(requiredSkillsRaw)) {
          requiredSkills = requiredSkillsRaw.map(s => {
            if (typeof s === 'string') return s.toLowerCase();
            if (typeof s === 'object' && s && 'skill' in s) return (s.skill as string).toLowerCase();
            return '';
          }).filter(Boolean);
        }
         const userSkills = (profile!.skills || []).map(s => s.toLowerCase());
         const gaps = requiredSkills.filter(skill => !userSkills.includes(skill));
         const acquired = requiredSkills.filter(skill => userSkills.includes(skill));
 
         setSkillGaps(gaps);
         setAcquiredSkills(acquired);
 
         const progressionRaw = roleData.skill_progression as unknown as Record<string, string[]> | null;
         const progression = {
           beginner: progressionRaw?.beginner || [],
           intermediate: progressionRaw?.intermediate || [],
           advanced: progressionRaw?.advanced || [],
         };
 
        // Fetch courses and resources
        const [{ data: coursesData }, { data: resourcesData }] = await Promise.all([
          supabase
           .from('courses')
           .select('*')
            .eq('is_active', true),
          supabase
            .from('course_resources')
            .select('*')
            .order('order_index'),
        ]);
 
         // Fetch enrollments
         const { data: enrollments } = await supabase
           .from('enrollments')
           .select('course_id, progress')
           .eq('user_id', user!.id);
 
         const enrolledIds = enrollments?.map(e => e.course_id) || [];
         setEnrolledCourseIds(enrolledIds);
 
        // Group resources by course
        const resourcesByCourse: Record<string, CourseResource[]> = {};
        (resourcesData || []).forEach((r: CourseResource) => {
          if (!resourcesByCourse[r.course_id]) {
            resourcesByCourse[r.course_id] = [];
          }
          resourcesByCourse[r.course_id].push(r);
        });

        // Get resources for level
        const getResourcesForLevel = (level: string): CourseResource[] => {
          const levelCourses = (coursesData || []).filter(c => c.level === level);
          const resources: CourseResource[] = [];
          levelCourses.forEach(c => {
            if (resourcesByCourse[c.id]) {
              resources.push(...resourcesByCourse[c.id].slice(0, 2));
            }
          });
          return resources.slice(0, 4);
        };

         // Filter courses relevant to the target career role
         const targetRole = profile!.target_career_role!.toLowerCase();
         const getRelevantCourses = (level: string) => {
           const relevant = (coursesData || []).filter(c =>
             c.level === level && (
               (c.career_relevance || []).some((r: string) => r.toLowerCase().includes(targetRole)) ||
               c.skills_covered.some((s: string) => requiredSkills.includes(s.toLowerCase()))
             )
           );
           // Fallback to level-based if no career-specific match
           if (relevant.length === 0) {
             return (coursesData || []).filter(c => c.level === level).slice(0, 4);
           }
           return relevant.slice(0, 6);
         };

         // Get resources for role-specific courses
         const getResourcesForLevelAndRole = (level: string): CourseResource[] => {
           const levelCourses = getRelevantCourses(level);
           const resources: CourseResource[] = [];
           levelCourses.forEach(c => {
             if (resourcesByCourse[c.id]) {
               resources.push(...resourcesByCourse[c.id]);
             }
           });
           return resources.slice(0, 6);
         };

          const stages: RoadmapStage[] = [
            {
              level: 'beginner',
              label: 'Foundation',
              skills: progression.beginner || [],
              courses: getRelevantCourses('beginner') as RoadmapCourse[],
              resources: getResourcesForLevelAndRole('beginner'),
              completed: progression.beginner?.every(s => acquired.includes(s.toLowerCase())) || false,
            },
            {
              level: 'intermediate',
              label: 'Specialization',
              skills: progression.intermediate || [],
              courses: getRelevantCourses('intermediate') as RoadmapCourse[],
              resources: getResourcesForLevelAndRole('intermediate'),
              completed: progression.intermediate?.every(s => acquired.includes(s.toLowerCase())) || false,
            },
            {
              level: 'advanced',
              label: 'Mastery',
              skills: progression.advanced || [],
              courses: getRelevantCourses('advanced') as RoadmapCourse[],
              resources: getResourcesForLevelAndRole('advanced'),
              completed: progression.advanced?.every(s => acquired.includes(s.toLowerCase())) || false,
            },
          ];
 
         setRoadmap(stages);
       }
     } catch (error) {
       console.error('Error fetching roadmap:', error);
       toast.error('Failed to load roadmap');
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleEnroll = async (courseId: string) => {
     try {
       const { error } = await supabase.from('enrollments').insert({
         user_id: user!.id,
         course_id: courseId,
       });
 
       if (error) throw error;
       toast.success('Successfully enrolled!');
       setEnrolledCourseIds(prev => [...prev, courseId]);
     } catch (error) {
       toast.error('Failed to enroll');
     }
   };
 
   const overallProgress = acquiredSkills.length / (acquiredSkills.length + skillGaps.length) * 100 || 0;
 
   if (isLoading) {
     return (
       <DashboardLayout>
         <div className="flex items-center justify-center py-12">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       </DashboardLayout>
     );
   }
 
   if (!profile?.target_career_role) {
     return (
       <DashboardLayout>
         <div className="max-w-2xl mx-auto text-center py-12">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
           >
             <Map className="h-16 w-16 text-primary/50 mx-auto mb-6" />
             <h1 className="text-2xl font-display font-bold mb-4">
               Set Your Career Goal
             </h1>
             <p className="text-muted-foreground mb-8">
               Select a target career role in your profile to generate a personalized learning roadmap
             </p>
             <Button asChild className="gradient-primary">
               <Link to="/profile">Go to Profile</Link>
             </Button>
           </motion.div>
         </div>
       </DashboardLayout>
     );
   }
 
   return (
     <DashboardLayout>
       <div className="space-y-8">
         {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
         >
           <h1 className="text-2xl font-display font-bold mb-2 flex items-center gap-2">
             <Map className="h-6 w-6 text-primary" />
             Learning Roadmap
           </h1>
           <p className="text-muted-foreground">
             Your personalized path to becoming a {profile.target_career_role}
           </p>
         </motion.div>
 
         {/* Progress Overview */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
         >
           <Card className="shadow-card overflow-hidden">
             <div className="gradient-hero p-6 text-primary-foreground">
               <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 rounded-xl bg-primary-foreground/20">
                   <Target className="h-8 w-8" />
                 </div>
                 <div>
                   <h2 className="text-xl font-display font-bold">{profile.target_career_role}</h2>
                   <p className="text-primary-foreground/80">Target Career Role</p>
                 </div>
               </div>
 
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span>Overall Progress</span>
                   <span>{Math.round(overallProgress)}% Complete</span>
                 </div>
                 <Progress value={overallProgress} className="h-3 bg-primary-foreground/20" />
               </div>
             </div>
 
             <CardContent className="pt-6">
               <div className="grid md:grid-cols-2 gap-6">
                 <div>
                   <h3 className="font-semibold mb-3 flex items-center gap-2">
                     <CheckCircle2 className="h-5 w-5 text-success" />
                     Skills You Have ({acquiredSkills.length})
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {acquiredSkills.map(skill => (
                       <Badge key={skill} className="bg-success/10 text-success border-success/30">
                         {skill}
                       </Badge>
                     ))}
                     {acquiredSkills.length === 0 && (
                       <p className="text-sm text-muted-foreground">No matching skills yet</p>
                     )}
                   </div>
                 </div>
 
                 <div>
                   <h3 className="font-semibold mb-3 flex items-center gap-2">
                     <Circle className="h-5 w-5 text-warning" />
                     Skills to Develop ({skillGaps.length})
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {skillGaps.slice(0, 10).map(skill => (
                       <Badge key={skill} variant="outline" className="border-warning/30 text-warning">
                         {skill}
                       </Badge>
                     ))}
                     {skillGaps.length > 10 && (
                       <Badge variant="secondary">+{skillGaps.length - 10} more</Badge>
                     )}
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
         </motion.div>
 
         {/* Roadmap Stages */}
         <div className="space-y-6">
           {roadmap.map((stage, index) => (
             <motion.div
               key={stage.level}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 + index * 0.1 }}
             >
               <Card className={cn(
                 'shadow-card transition-all',
                 stage.completed && 'border-success/30 bg-success/5'
               )}>
                 <CardHeader>
                   <div className="flex items-center gap-4">
                     <div className={cn(
                       'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                       stage.completed
                         ? 'bg-success text-success-foreground'
                         : stage.level === 'beginner'
                           ? 'bg-green-100 text-green-700'
                           : stage.level === 'intermediate'
                             ? 'bg-amber-100 text-amber-700'
                             : 'bg-red-100 text-red-700'
                     )}>
                       {stage.completed ? <CheckCircle2 className="h-6 w-6" /> : index + 1}
                     </div>
                     <div>
                       <CardTitle className="flex items-center gap-2">
                         {stage.label}
                         <Badge className={cn(
                           'level-badge',
                           `level-${stage.level}`
                         )}>
                           {stage.level}
                         </Badge>
                       </CardTitle>
                       <p className="text-sm text-muted-foreground mt-1">
                         {stage.skills.length} skills to master
                       </p>
                     </div>
                   </div>
                 </CardHeader>
 
                 <CardContent className="space-y-6">
                   {/* Skills in this stage */}
                   <div>
                     <h4 className="text-sm font-medium mb-2">Skills in this stage:</h4>
                     <div className="flex flex-wrap gap-2">
                       {stage.skills.map(skill => {
                         const hasSkill = acquiredSkills.includes(skill.toLowerCase());
                         return (
                           <Badge
                             key={skill}
                             variant={hasSkill ? 'default' : 'outline'}
                             className={cn(
                               hasSkill && 'bg-success text-success-foreground'
                             )}
                           >
                             {hasSkill && <CheckCircle2 className="h-3 w-3 mr-1" />}
                             {skill}
                           </Badge>
                         );
                       })}
                     </div>
                   </div>
 
                   {/* Recommended Courses */}
                   {stage.courses.length > 0 && (
                     <div>
                       <h4 className="text-sm font-medium mb-3">Recommended Courses:</h4>
                       <div className="grid gap-3">
                         {stage.courses.map(course => (
                           <div
                             key={course.id}
                             className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                           >
                             <div className="flex items-center gap-3">
                               <BookOpen className="h-5 w-5 text-primary" />
                               <div>
                                 <p className="font-medium">{course.name}</p>
                                 <p className="text-sm text-muted-foreground">
                                   {course.domain} • {course.duration_hours}h
                                 </p>
                               </div>
                             </div>
                             <Button
                               size="sm"
                               onClick={() => handleEnroll(course.id)}
                               disabled={enrolledCourseIds.includes(course.id)}
                               className={enrolledCourseIds.includes(course.id) ? 'bg-success' : ''}
                             >
                               {enrolledCourseIds.includes(course.id) ? 'Enrolled' : 'Enroll'}
                               <ArrowRight className="h-4 w-4 ml-1" />
                             </Button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
 
                   {stage.courses.length === 0 && !stage.completed && (
                     <div className="text-center py-4">
                       <p className="text-sm text-muted-foreground">
                         No specific courses found for this stage yet
                       </p>
                       <Button asChild variant="ghost" size="sm" className="mt-2">
                         <Link to="/courses">
                           Browse All Courses <ChevronRight className="h-4 w-4 ml-1" />
                         </Link>
                       </Button>
                     </div>
                   )}

                  {/* Resources for this stage */}
                  {stage.resources.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-accent" />
                        Learning Resources:
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {stage.resources.map(resource => (
                          <a
                            key={resource.id}
                            href={resource.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border"
                          >
                            <ExternalLink className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{resource.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                                {resource.is_free && (
                                  <Badge variant="secondary" className="text-xs">Free</Badge>
                                )}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                 </CardContent>
               </Card>
 
               {/* Connector Arrow */}
               {index < roadmap.length - 1 && (
                 <div className="flex justify-center py-2">
                   <ChevronRight className="h-8 w-8 text-muted-foreground/30 rotate-90" />
                 </div>
               )}
             </motion.div>
           ))}
         </div>
 
         {/* AI Enhancement Suggestion */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
         >
           <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
             <CardContent className="flex items-center gap-4 py-6">
               <div className="p-3 rounded-full gradient-primary">
                 <Sparkles className="h-6 w-6 text-primary-foreground" />
               </div>
               <div className="flex-1">
                 <h3 className="font-semibold">Get Personalized Recommendations</h3>
                 <p className="text-sm text-muted-foreground">
                   Our AI analyzes your profile to suggest the best courses for your goals
                 </p>
               </div>
               <Button asChild className="gradient-primary">
                 <Link to="/recommendations">View Recommendations</Link>
               </Button>
             </CardContent>
           </Card>
         </motion.div>
       </div>
     </DashboardLayout>
   );
 }