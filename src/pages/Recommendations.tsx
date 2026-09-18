 import { useState, useEffect } from 'react';
 import { useAuth } from '@/contexts/AuthContext';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { CourseCard } from '@/components/CourseCard';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Loader2, Target, BookOpen, Eye } from 'lucide-react';
 import { Link } from 'react-router-dom';
 
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
  institution?: string | null;
  source_platform?: string | null;
  source_url?: string | null;
  external_rating?: number | null;
}
 
 interface Recommendation {
   course: Course;
   score: number;
   explanation: string;
  whyEnroll?: string;
  importance?: string;
  usefulness?: string;
 }
 
 export default function Recommendations() {
   const { user, profile } = useAuth();
   const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
   const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetailedExplanations, setShowDetailedExplanations] = useState(true);
 
   useEffect(() => {
     if (user) {
       fetchData();
     }
   }, [user]);
 
   const fetchData = async () => {
     await Promise.all([fetchRecommendations(), fetchEnrollments()]);
     setIsLoading(false);
   };
 
   const fetchRecommendations = async () => {
     try {
       const { data, error } = await supabase.functions.invoke('get-recommendations', {
         body: { limit: 12 }
       });
 
       if (error) throw error;
       if (data?.recommendations) {
         setRecommendations(data.recommendations);
       }
     } catch (error) {
       console.error('Error fetching recommendations:', error);
       toast.error('Failed to load recommendations');
     }
   };
 
   const fetchEnrollments = async () => {
     const { data } = await supabase
       .from('enrollments')
       .select('course_id')
       .eq('user_id', user!.id);
 
     if (data) {
       setEnrolledCourseIds(data.map(e => e.course_id));
     }
   };
 
   const handleRefresh = async () => {
     setIsRefreshing(true);
     await fetchRecommendations();
     setIsRefreshing(false);
     toast.success('Recommendations refreshed!');
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
 
       // Track recommendation interaction
       await supabase.from('recommendations').update({ was_enrolled: true })
         .eq('user_id', user!.id)
         .eq('course_id', courseId);
     } catch (error) {
       toast.error('Failed to enroll');
     }
   };
 
   const profileComplete = profile?.skills?.length && profile?.interests?.length;
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col md:flex-row md:items-center justify-between gap-4"
         >
           <div>
             <h1 className="text-2xl font-display font-bold mb-2 flex items-center gap-2">
               <Sparkles className="h-6 w-6 text-primary" />
               AI-Powered Recommendations
             </h1>
             <p className="text-muted-foreground">
               Personalized course suggestions based on your profile and learning goals
             </p>
           </div>
 
           <Button
             onClick={handleRefresh}
             disabled={isRefreshing}
             variant="outline"
           >
             <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
         </motion.div>
 
          {/* Explanation Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
          >
            <Eye className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <Label htmlFor="detailed-mode" className="font-medium">Detailed AI Explanations</Label>
              <p className="text-sm text-muted-foreground">
                Show why you should enroll, importance, and how each course helps your career
              </p>
            </div>
            <Switch
              id="detailed-mode"
              checked={showDetailedExplanations}
              onCheckedChange={setShowDetailedExplanations}
            />
          </motion.div>

         {/* Profile Completeness Check */}
         {!profileComplete && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
           >
             <Card className="border-primary/30 bg-primary/5">
               <CardContent className="flex items-center gap-4 py-6">
                 <div className="p-3 rounded-full bg-primary/10">
                   <Target className="h-6 w-6 text-primary" />
                 </div>
                 <div className="flex-1">
                   <h3 className="font-semibold">Complete Your Profile</h3>
                   <p className="text-sm text-muted-foreground">
                     Add your skills and interests to get better personalized recommendations
                   </p>
                 </div>
                 <Button asChild className="gradient-primary">
                   <Link to="/profile">Complete Profile</Link>
                 </Button>
               </CardContent>
             </Card>
           </motion.div>
         )}
 
         {/* Recommendations Grid */}
         {isLoading ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
         ) : recommendations.length > 0 ? (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
           >
             {recommendations.map((rec, index) => (
               <motion.div
                 key={rec.course.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.05 * index }}
               >
                 <CourseCard
                   {...rec.course}
                   matchScore={rec.score}
                   matchReason={rec.explanation}
                    whyEnroll={rec.whyEnroll}
                    importance={rec.importance}
                    usefulness={rec.usefulness}
                   onEnroll={() => handleEnroll(rec.course.id)}
                   isEnrolled={enrolledCourseIds.includes(rec.course.id)}
                    showDetailedReason={showDetailedExplanations}
                 />
               </motion.div>
             ))}
           </motion.div>
         ) : (
           <Card className="p-8 text-center">
             <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
             <p className="text-muted-foreground mb-4">
               Complete your profile with skills and interests to get personalized recommendations
             </p>
             <Button asChild className="gradient-primary">
               <Link to="/profile">Complete Profile</Link>
             </Button>
           </Card>
         )}
       </div>
     </DashboardLayout>
   );
 }