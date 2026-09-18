 import { useState, useEffect } from 'react';
 import { useParams, Link } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { CourseProgress } from '@/components/CourseProgress';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Progress } from '@/components/ui/progress';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { motion } from 'framer-motion';
 import {
   BookOpen,
   Clock,
   User,
   ArrowLeft,
   ExternalLink,
   Loader2,
   CheckCircle2,
   Star,
   Target,
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { getBestVideoSource } from '@/lib/videoSources';
 
 interface Course {
   id: string;
   name: string;
   description: string;
   domain: string;
   level: 'beginner' | 'intermediate' | 'advanced';
   duration_hours: number;
   skills_covered: string[];
   image_url: string | null;
   instructor: string | null;
   career_relevance: string[] | null;
   institution: string | null;
   source_platform: string | null;
   source_url: string | null;
   external_rating: number | null;
 }
 
 interface Resource {
   id: string;
   title: string;
   type: string;
   url: string | null;
   description: string | null;
   is_free: boolean;
 }
 
 interface Enrollment {
   id: string;
   progress: number;
   enrolled_at: string;
   completed_at: string | null;
 }
 
 const levelStyles = {
   beginner: 'level-beginner',
   intermediate: 'level-intermediate',
   advanced: 'level-advanced',
 };
 
 export default function CourseDetail() {
   const { id } = useParams<{ id: string }>();
   const { user } = useAuth();
   const [course, setCourse] = useState<Course | null>(null);
   const [resources, setResources] = useState<Resource[]>([]);
   const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     if (id) {
       fetchCourseData();
     }
   }, [id, user]);
 
   const fetchCourseData = async () => {
     try {
       const [{ data: courseData }, { data: resourcesData }] = await Promise.all([
         supabase.from('courses').select('*').eq('id', id).single(),
         supabase.from('course_resources').select('*').eq('course_id', id).order('order_index'),
       ]);
 
       if (courseData) {
         setCourse(courseData as Course);
       }
 
       if (resourcesData) {
         setResources(resourcesData as Resource[]);
       }
 
       if (user) {
         const { data: enrollmentData } = await supabase
           .from('enrollments')
           .select('*')
           .eq('user_id', user.id)
           .eq('course_id', id)
           .single();
 
         if (enrollmentData) {
           setEnrollment(enrollmentData as Enrollment);
         }
       }
     } catch (error) {
       console.error('Error fetching course:', error);
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleEnroll = async () => {
     if (!user || !id) return;
 
     try {
       const { data, error } = await supabase
         .from('enrollments')
         .insert({ user_id: user.id, course_id: id })
         .select()
         .single();
 
       if (error) throw error;
 
       setEnrollment(data as Enrollment);
       toast.success('Successfully enrolled!');
     } catch (error) {
       toast.error('Failed to enroll');
     }
   };
 
   const handleProgressUpdate = (newProgress: number) => {
     if (enrollment) {
       setEnrollment({ ...enrollment, progress: newProgress });
     }
   };
 
   if (isLoading) {
     return (
       <DashboardLayout>
         <div className="flex items-center justify-center py-12">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       </DashboardLayout>
     );
   }
 
   if (!course) {
     return (
       <DashboardLayout>
         <div className="text-center py-12">
           <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
           <Button asChild>
             <Link to="/courses">Back to Courses</Link>
           </Button>
         </div>
       </DashboardLayout>
     );
   }

   const videoSource = getBestVideoSource(course);
 
   return (
     <DashboardLayout>
       <div className="space-y-8">
         {/* Back Button */}
         <Button asChild variant="ghost" size="sm">
           <Link to="/courses">
             <ArrowLeft className="h-4 w-4 mr-2" />
             Back to Courses
           </Link>
         </Button>
 
         {/* Course Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="grid lg:grid-cols-3 gap-8"
         >
           {/* Main Info */}
           <div className="lg:col-span-2 space-y-6">
             <div>
               <div className="flex flex-wrap gap-2 mb-4">
                 <Badge variant="secondary">{course.domain}</Badge>
                 <span className={cn('level-badge', levelStyles[course.level])}>
                   {course.level}
                 </span>
               </div>
               <h1 className="text-3xl font-display font-bold mb-4">{course.name}</h1>
               <p className="text-lg text-muted-foreground">{course.description}</p>

               {course.instructor && (
                 <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                   <User className="h-4 w-4" />
                   <span>Instructor: {course.instructor}</span>
                 </div>
               )}
               <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-muted-foreground">
                 {course.institution && (
                   <span>{course.institution}</span>
                 )}
                 {course.source_platform && (
                   <Badge variant="outline">{course.source_platform}</Badge>
                 )}
                 {course.external_rating ? (
                   <span className="flex items-center gap-1">
                     <Star className="h-4 w-4 fill-accent text-accent" />
                     {Number(course.external_rating).toFixed(1)}
                   </span>
                 ) : null}
               </div>
             </div>
 
             {/* Skills Covered */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Target className="h-5 w-5 text-primary" />
                   Skills You'll Learn
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="flex flex-wrap gap-2">
                   {course.skills_covered.map((skill) => (
                     <span key={skill} className="skill-tag">
                       {skill}
                     </span>
                   ))}
                 </div>
               </CardContent>
             </Card>
 
             {/* Course Content (Progress Tracking) */}
             {enrollment && (
               <CourseProgress
                 courseId={course.id}
                 courseName={course.name}
                 onProgressUpdate={handleProgressUpdate}
               />
             )}
           </div>
 
           {/* Sidebar */}
           <div className="space-y-6">
             {/* Enrollment Card */}
             <Card className="shadow-card sticky top-6">
               <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg overflow-hidden">
                 {course.image_url ? (
                   <img
                     src={course.image_url}
                     alt={course.name}
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center">
                     <BookOpen className="h-20 w-20 text-primary/30" />
                   </div>
                 )}
               </div>
 
               <CardContent className="pt-6 space-y-4">
                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                   <div className="flex items-center gap-1">
                     <Clock className="h-4 w-4" />
                     <span>{course.duration_hours} hours</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <BookOpen className="h-4 w-4" />
                     <span>{course.skills_covered.length} skills</span>
                   </div>
                 </div>
 
                 {enrollment ? (
                   <div className="space-y-3">
                     <div className="flex items-center justify-between text-sm">
                       <span>Your Progress</span>
                       <span className="font-medium">{enrollment.progress}%</span>
                     </div>
                     <Progress value={enrollment.progress} className="h-2" />
                     {enrollment.progress === 100 ? (
                       <div className="flex items-center gap-2 text-success">
                         <CheckCircle2 className="h-5 w-5" />
                         <span className="font-medium">Course Completed!</span>
                       </div>
                     ) : (
                       <p className="text-sm text-muted-foreground">
                         Continue where you left off
                       </p>
                     )}
                   </div>
                 ) : (
                   <Button onClick={handleEnroll} className="w-full gradient-primary">
                     Enroll Now
                   </Button>
                 )}

                 <Button asChild variant="secondary" className="w-full">
                   <a href={videoSource.url} target="_blank" rel="noopener noreferrer">
                     <ExternalLink className="h-4 w-4 mr-2" />
                     {videoSource.label}
                   </a>
                 </Button>

                 {course.career_relevance && course.career_relevance.length > 0 && (
                   <div className="pt-4 border-t">
                     <p className="text-sm font-medium mb-2">Career Paths:</p>
                     <div className="flex flex-wrap gap-1">
                       {course.career_relevance.map((career) => (
                         <Badge key={career} variant="outline" className="text-xs">
                           {career}
                         </Badge>
                       ))}
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>
 
             {/* Resources */}
             {resources.length > 0 && (
               <Card className="shadow-card">
                 <CardHeader>
                   <CardTitle className="text-lg">Course Resources</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   {resources.map((resource) => (
                     <a
                       key={resource.id}
                       href={resource.url || '#'}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                     >
                       <ExternalLink className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                       <div className="flex-1 min-w-0">
                         <p className="font-medium text-sm">{resource.title}</p>
                         {resource.description && (
                           <p className="text-xs text-muted-foreground mt-1">
                             {resource.description}
                           </p>
                         )}
                         <div className="flex items-center gap-2 mt-1">
                           <Badge variant="outline" className="text-xs">
                             {resource.type}
                           </Badge>
                           {resource.is_free && (
                             <Badge className="bg-success/10 text-success text-xs">
                               Free
                             </Badge>
                           )}
                         </div>
                       </div>
                     </a>
                   ))}
                 </CardContent>
               </Card>
             )}
           </div>
         </motion.div>
       </div>
     </DashboardLayout>
   );
 }
