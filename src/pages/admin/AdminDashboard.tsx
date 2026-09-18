 import { useState, useEffect } from 'react';
 import { Link } from 'react-router-dom';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { supabase } from '@/integrations/supabase/client';
 import { motion } from 'framer-motion';
 import {
   BookOpen,
   Users,
   TrendingUp,
   Star,
   ArrowRight,
   BarChart3,
 } from 'lucide-react';
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
 
 interface Stats {
   totalCourses: number;
   totalStudents: number;
   totalEnrollments: number;
   avgRating: number;
 }
 
 const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
 
 export default function AdminDashboard() {
   const [stats, setStats] = useState<Stats>({
     totalCourses: 0,
     totalStudents: 0,
     totalEnrollments: 0,
     avgRating: 0,
   });
   const [domainData, setDomainData] = useState<{ name: string; count: number }[]>([]);
   const [levelData, setLevelData] = useState<{ name: string; value: number }[]>([]);
 
   useEffect(() => {
     fetchStats();
   }, []);
 
   const fetchStats = async () => {
     // Fetch courses count
     const { count: coursesCount } = await supabase
       .from('courses')
       .select('*', { count: 'exact', head: true });
 
     // Fetch students count
     const { count: studentsCount } = await supabase
       .from('profiles')
       .select('*', { count: 'exact', head: true });
 
     // Fetch enrollments count
     const { count: enrollmentsCount } = await supabase
       .from('enrollments')
       .select('*', { count: 'exact', head: true });
 
     // Fetch average rating
     const { data: ratings } = await supabase
       .from('course_feedback')
       .select('rating');
 
     const avgRating = ratings && ratings.length > 0
       ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
       : 0;
 
     setStats({
       totalCourses: coursesCount || 0,
       totalStudents: studentsCount || 0,
       totalEnrollments: enrollmentsCount || 0,
       avgRating,
     });
 
     // Fetch domain distribution
     const { data: courses } = await supabase.from('courses').select('domain, level');
 
     if (courses) {
       // Domain distribution
       const domainCounts: Record<string, number> = {};
       courses.forEach(c => {
         domainCounts[c.domain] = (domainCounts[c.domain] || 0) + 1;
       });
       setDomainData(Object.entries(domainCounts).map(([name, count]) => ({ name, count })));
 
       // Level distribution
       const levelCounts: Record<string, number> = {};
       courses.forEach(c => {
         levelCounts[c.level] = (levelCounts[c.level] || 0) + 1;
       });
       setLevelData(Object.entries(levelCounts).map(([name, value]) => ({ name, value })));
     }
   };
 
   return (
     <DashboardLayout>
       <div className="space-y-8">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
         >
           <h1 className="text-2xl font-display font-bold mb-2">Admin Dashboard</h1>
           <p className="text-muted-foreground">
             Overview of your course recommendation platform
           </p>
         </motion.div>
 
         {/* Stats Grid */}
         <div className="grid gap-4 md:grid-cols-4">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
           >
             <Card className="shadow-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-4">
                   <div className="p-3 rounded-xl bg-primary/10">
                     <BookOpen className="h-6 w-6 text-primary" />
                   </div>
                   <div>
                     <p className="text-2xl font-bold">{stats.totalCourses}</p>
                     <p className="text-sm text-muted-foreground">Total Courses</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
 
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.15 }}
           >
             <Card className="shadow-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-4">
                   <div className="p-3 rounded-xl bg-info/10">
                     <Users className="h-6 w-6 text-info" />
                   </div>
                   <div>
                     <p className="text-2xl font-bold">{stats.totalStudents}</p>
                     <p className="text-sm text-muted-foreground">Students</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
 
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <Card className="shadow-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-4">
                   <div className="p-3 rounded-xl bg-success/10">
                     <TrendingUp className="h-6 w-6 text-success" />
                   </div>
                   <div>
                     <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                     <p className="text-sm text-muted-foreground">Enrollments</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
 
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.25 }}
           >
             <Card className="shadow-card">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-4">
                   <div className="p-3 rounded-xl bg-accent/10">
                     <Star className="h-6 w-6 text-accent" />
                   </div>
                   <div>
                     <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                     <p className="text-sm text-muted-foreground">Avg Rating</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
         </div>
 
         {/* Charts */}
         <div className="grid gap-6 md:grid-cols-2">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
           >
             <Card className="shadow-card">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <BarChart3 className="h-5 w-5 text-primary" />
                   Courses by Domain
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={domainData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                     <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                     <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                     <Tooltip
                       contentStyle={{
                         backgroundColor: 'hsl(var(--card))',
                         border: '1px solid hsl(var(--border))',
                         borderRadius: '8px',
                       }}
                     />
                     <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </CardContent>
             </Card>
           </motion.div>
 
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.35 }}
           >
             <Card className="shadow-card">
               <CardHeader>
                 <CardTitle>Courses by Level</CardTitle>
               </CardHeader>
               <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                   <PieChart>
                     <Pie
                       data={levelData}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                       outerRadius={100}
                       fill="#8884d8"
                       dataKey="value"
                     >
                       {levelData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip
                       contentStyle={{
                         backgroundColor: 'hsl(var(--card))',
                         border: '1px solid hsl(var(--border))',
                         borderRadius: '8px',
                       }}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </CardContent>
             </Card>
           </motion.div>
         </div>
 
         {/* Quick Actions */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
         >
           <Card className="shadow-card">
             <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
             </CardHeader>
             <CardContent className="flex flex-wrap gap-4">
               <Button asChild className="gradient-primary">
                 <Link to="/admin/courses">
                   Manage Courses <ArrowRight className="h-4 w-4 ml-2" />
                 </Link>
               </Button>
               <Button asChild variant="outline">
                 <Link to="/admin/users">
                   View Users <ArrowRight className="h-4 w-4 ml-2" />
                 </Link>
               </Button>
             </CardContent>
           </Card>
         </motion.div>
       </div>
     </DashboardLayout>
   );
 }