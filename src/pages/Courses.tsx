 import { useState, useEffect } from 'react';
 import { useAuth } from '@/contexts/AuthContext';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { CourseCard } from '@/components/CourseCard';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { motion } from 'framer-motion';
 import { Search, Filter, Loader2 } from 'lucide-react';
 
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
 
 export default function Courses() {
   const { user } = useAuth();
   const [courses, setCourses] = useState<Course[]>([]);
   const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [levelFilter, setLevelFilter] = useState<string>('all');
   const [domainFilter, setDomainFilter] = useState<string>('all');
   const [domains, setDomains] = useState<string[]>([]);
 
   useEffect(() => {
     fetchCourses();
     if (user) {
       fetchEnrollments();
     }
   }, [user]);
 
   const fetchCourses = async () => {
     const { data, error } = await supabase
       .from('courses')
       .select('*')
       .eq('is_active', true)
       .order('created_at', { ascending: false });
 
     if (error) {
       toast.error('Failed to load courses');
     } else {
       setCourses(data as Course[]);
       const uniqueDomains = [...new Set(data.map(c => c.domain))];
       setDomains(uniqueDomains);
     }
     setIsLoading(false);
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
 
   const filteredCourses = courses.filter(course => {
     const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
       course.skills_covered.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
 
     const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
     const matchesDomain = domainFilter === 'all' || course.domain === domainFilter;
 
     return matchesSearch && matchesLevel && matchesDomain;
   });
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
         >
           <h1 className="text-2xl font-display font-bold mb-2">Browse Courses</h1>
           <p className="text-muted-foreground">
             Explore our catalog of courses to advance your skills
           </p>
         </motion.div>
 
         {/* Filters */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="flex flex-col md:flex-row gap-4"
         >
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search courses by name, description, or skills..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10"
             />
           </div>
 
           <div className="flex gap-3">
             <Select value={levelFilter} onValueChange={setLevelFilter}>
               <SelectTrigger className="w-[140px]">
                 <Filter className="h-4 w-4 mr-2" />
                 <SelectValue placeholder="Level" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Levels</SelectItem>
                 <SelectItem value="beginner">Beginner</SelectItem>
                 <SelectItem value="intermediate">Intermediate</SelectItem>
                 <SelectItem value="advanced">Advanced</SelectItem>
               </SelectContent>
             </Select>
 
             <Select value={domainFilter} onValueChange={setDomainFilter}>
               <SelectTrigger className="w-[160px]">
                 <SelectValue placeholder="Domain" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Domains</SelectItem>
                 {domains.map(domain => (
                   <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
         </motion.div>
 
         {/* Course Grid */}
         {isLoading ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
         ) : filteredCourses.length > 0 ? (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
           >
             {filteredCourses.map((course, index) => (
               <motion.div
                 key={course.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 * (index % 6) }}
               >
                 <CourseCard
                   {...course}
                   onEnroll={() => handleEnroll(course.id)}
                   isEnrolled={enrolledCourseIds.includes(course.id)}
                 />
               </motion.div>
             ))}
           </motion.div>
         ) : (
           <div className="text-center py-12">
             <p className="text-muted-foreground">No courses found matching your criteria</p>
             <Button
               variant="ghost"
               className="mt-4"
               onClick={() => {
                 setSearchQuery('');
                 setLevelFilter('all');
                 setDomainFilter('all');
               }}
             >
               Clear Filters
             </Button>
           </div>
         )}
       </div>
     </DashboardLayout>
   );
 }