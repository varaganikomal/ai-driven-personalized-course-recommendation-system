 import { useState, useEffect } from 'react';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Badge } from '@/components/ui/badge';
 import { toast } from 'sonner';
 import { motion, AnimatePresence } from 'framer-motion';
 import {
   BookOpen,
   Clock,
   CheckCircle2,
   Circle,
   ExternalLink,
   ChevronDown,
   ChevronUp,
   Play,
   Award,
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
 
 interface Lesson {
   id: string;
   title: string;
   description: string | null;
   order_index: number;
   duration_minutes: number;
   resources: { title: string; url: string; type: string }[];
 }
 
 interface LessonProgress {
   lesson_id: string;
   completed: boolean;
   completed_at: string | null;
 }
 
 interface CourseProgressProps {
   courseId: string;
   courseName: string;
   onProgressUpdate?: (progress: number) => void;
 }
 
 export function CourseProgress({ courseId, courseName, onProgressUpdate }: CourseProgressProps) {
   const { user } = useAuth();
   const [lessons, setLessons] = useState<Lesson[]>([]);
   const [progress, setProgress] = useState<Record<string, boolean>>({});
   const [isLoading, setIsLoading] = useState(true);
   const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
 
   useEffect(() => {
     if (user && courseId) {
       fetchLessonsAndProgress();
     }
   }, [user, courseId]);
 
   const fetchLessonsAndProgress = async () => {
     try {
       const [{ data: lessonsData }, { data: progressData }] = await Promise.all([
         supabase
           .from('lessons')
           .select('*')
           .eq('course_id', courseId)
           .order('order_index'),
         supabase
           .from('lesson_progress')
           .select('*')
           .eq('user_id', user!.id)
           .eq('course_id', courseId),
       ]);
 
       if (lessonsData) {
         setLessons(lessonsData.map(l => ({
           ...l,
           resources: Array.isArray(l.resources) ? l.resources as { title: string; url: string; type: string }[] : []
         })));
       }
 
       if (progressData) {
         const progressMap: Record<string, boolean> = {};
         progressData.forEach((p: LessonProgress) => {
           progressMap[p.lesson_id] = p.completed;
         });
         setProgress(progressMap);
       }
     } catch (error) {
       console.error('Error fetching lessons:', error);
     } finally {
       setIsLoading(false);
     }
   };
 
   const toggleLessonComplete = async (lessonId: string) => {
     const newCompleted = !progress[lessonId];
     
     try {
       const { error } = await supabase
         .from('lesson_progress')
         .upsert({
           user_id: user!.id,
           lesson_id: lessonId,
           course_id: courseId,
           completed: newCompleted,
           completed_at: newCompleted ? new Date().toISOString() : null,
         }, {
           onConflict: 'user_id,lesson_id'
         });
 
       if (error) throw error;
 
       setProgress(prev => ({ ...prev, [lessonId]: newCompleted }));
 
       // Calculate and update overall progress
       const newProgress = { ...progress, [lessonId]: newCompleted };
       const completedCount = Object.values(newProgress).filter(Boolean).length;
       const overallProgress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
 
       // Update enrollment progress
       await supabase
         .from('enrollments')
         .update({ 
           progress: overallProgress,
           completed_at: overallProgress === 100 ? new Date().toISOString() : null
         })
         .eq('user_id', user!.id)
         .eq('course_id', courseId);
 
       if (newCompleted) {
         toast.success('Lesson completed! 🎉');
       }
 
       onProgressUpdate?.(overallProgress);
     } catch (error) {
       toast.error('Failed to update progress');
     }
   };
 
   const toggleExpanded = (lessonId: string) => {
     setExpandedLessons(prev => {
       const newSet = new Set(prev);
       if (newSet.has(lessonId)) {
         newSet.delete(lessonId);
       } else {
         newSet.add(lessonId);
       }
       return newSet;
     });
   };
 
   const completedCount = Object.values(progress).filter(Boolean).length;
   const overallProgress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
   const totalDuration = lessons.reduce((acc, l) => acc + l.duration_minutes, 0);
 
   if (isLoading) {
     return (
       <Card>
         <CardContent className="py-8 text-center text-muted-foreground">
           Loading lessons...
         </CardContent>
       </Card>
     );
   }
 
   if (lessons.length === 0) {
     return (
       <Card>
         <CardContent className="py-8 text-center text-muted-foreground">
           <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
           <p>No lessons available for this course yet.</p>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card className="shadow-card">
       <CardHeader>
         <CardTitle className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <BookOpen className="h-5 w-5 text-primary" />
             Course Content
           </div>
           <Badge variant={overallProgress === 100 ? 'default' : 'secondary'} className={cn(
             overallProgress === 100 && 'bg-success'
           )}>
             {completedCount}/{lessons.length} lessons
           </Badge>
         </CardTitle>
         
         <div className="space-y-2 mt-4">
           <div className="flex justify-between text-sm">
             <span className="text-muted-foreground">Overall Progress</span>
             <span className="font-medium">{overallProgress}%</span>
           </div>
           <Progress value={overallProgress} className="h-2" />
           <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <span className="flex items-center gap-1">
               <Clock className="h-4 w-4" />
               {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total
             </span>
             {overallProgress === 100 && (
               <span className="flex items-center gap-1 text-success">
                 <Award className="h-4 w-4" />
                 Completed!
               </span>
             )}
           </div>
         </div>
       </CardHeader>
 
       <CardContent className="space-y-2">
         <AnimatePresence>
           {lessons.map((lesson, index) => {
             const isCompleted = progress[lesson.id];
             const isExpanded = expandedLessons.has(lesson.id);
 
             return (
               <motion.div
                 key={lesson.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.05 }}
               >
                 <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(lesson.id)}>
                   <div className={cn(
                     'rounded-lg border transition-all',
                     isCompleted ? 'bg-success/5 border-success/30' : 'bg-muted/30 hover:bg-muted/50'
                   )}>
                     <div className="flex items-center gap-3 p-4">
                       <div 
                         className="cursor-pointer"
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleLessonComplete(lesson.id);
                         }}
                       >
                         {isCompleted ? (
                           <CheckCircle2 className="h-6 w-6 text-success" />
                         ) : (
                           <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                         )}
                       </div>
 
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2">
                           <span className={cn(
                             'text-xs font-medium px-2 py-0.5 rounded-full',
                             isCompleted ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                           )}>
                             {index + 1}
                           </span>
                           <h4 className={cn(
                             'font-medium truncate',
                             isCompleted && 'text-muted-foreground line-through'
                           )}>
                             {lesson.title}
                           </h4>
                         </div>
                         <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                           <span className="flex items-center gap-1">
                             <Clock className="h-3 w-3" />
                             {lesson.duration_minutes}m
                           </span>
                           {lesson.resources.length > 0 && (
                             <span>{lesson.resources.length} resources</span>
                           )}
                         </div>
                       </div>
 
                       <CollapsibleTrigger asChild>
                         <Button variant="ghost" size="icon" className="shrink-0">
                           {isExpanded ? (
                             <ChevronUp className="h-4 w-4" />
                           ) : (
                             <ChevronDown className="h-4 w-4" />
                           )}
                         </Button>
                       </CollapsibleTrigger>
                     </div>
 
                     <CollapsibleContent>
                       <div className="px-4 pb-4 pt-2 border-t border-border/50">
                         {lesson.description && (
                           <p className="text-sm text-muted-foreground mb-4">
                             {lesson.description}
                           </p>
                         )}
 
                         {lesson.resources.length > 0 && (
                           <div className="space-y-2">
                             <h5 className="text-sm font-medium">Resources:</h5>
                             <div className="grid gap-2">
                               {lesson.resources.map((resource, idx) => (
                                 <a
                                   key={idx}
                                   href={resource.url}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-sm transition-colors"
                                 >
                                   <ExternalLink className="h-4 w-4 text-primary" />
                                   <span className="flex-1">{resource.title}</span>
                                   <Badge variant="outline" className="text-xs">
                                     {resource.type}
                                   </Badge>
                                 </a>
                               ))}
                             </div>
                           </div>
                         )}
 
                         <div className="flex gap-2 mt-4">
                           <Button
                             size="sm"
                             onClick={() => toggleLessonComplete(lesson.id)}
                             className={cn(
                               isCompleted ? 'bg-muted text-muted-foreground hover:bg-muted/80' : 'gradient-primary'
                             )}
                           >
                             {isCompleted ? (
                               <>Mark Incomplete</>
                             ) : (
                               <>
                                 <CheckCircle2 className="h-4 w-4 mr-1" />
                                 Mark Complete
                               </>
                             )}
                           </Button>
                         </div>
                       </div>
                     </CollapsibleContent>
                   </div>
                 </Collapsible>
               </motion.div>
             );
           })}
         </AnimatePresence>
       </CardContent>
     </Card>
   );
 }