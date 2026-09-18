 import { useState, useEffect } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Badge } from '@/components/ui/badge';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from '@/components/ui/dialog';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { motion } from 'framer-motion';
 import { Plus, Pencil, Trash2, BookOpen, Loader2, X } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface Course {
   id: string;
   name: string;
   description: string;
   domain: string;
   level: 'beginner' | 'intermediate' | 'advanced';
   duration_hours: number;
   skills_covered: string[];
   career_relevance: string[];
   instructor: string | null;
   institution: string | null;
   source_platform: string | null;
   source_url: string | null;
   external_rating: number | null;
   is_active: boolean;
 }
 
 type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
 
 const initialFormData: {
   name: string;
   description: string;
   domain: string;
   level: CourseLevel;
   duration_hours: number;
   skills_covered: string[];
   career_relevance: string[];
   instructor: string;
   institution: string;
   source_platform: string;
   source_url: string;
   external_rating: number;
 } = {
   name: '',
   description: '',
   domain: '',
   level: 'beginner',
   duration_hours: 10,
   skills_covered: [],
   career_relevance: [],
   instructor: '',
   institution: '',
   source_platform: '',
   source_url: '',
   external_rating: 0,
 };
 
 export default function ManageCourses() {
   const [courses, setCourses] = useState<Course[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [formData, setFormData] = useState(initialFormData);
   const [newSkill, setNewSkill] = useState('');
   const [newCareer, setNewCareer] = useState('');
 
   useEffect(() => {
     fetchCourses();
   }, []);
 
   const fetchCourses = async () => {
     const { data, error } = await supabase
       .from('courses')
       .select('*')
       .order('created_at', { ascending: false });
 
     if (error) {
       toast.error('Failed to load courses');
     } else {
       setCourses(data as Course[]);
     }
     setIsLoading(false);
   };
 
   const handleAddSkill = () => {
     if (newSkill.trim() && !formData.skills_covered.includes(newSkill.trim())) {
       setFormData(prev => ({
         ...prev,
         skills_covered: [...prev.skills_covered, newSkill.trim()],
       }));
       setNewSkill('');
     }
   };
 
   const handleRemoveSkill = (skill: string) => {
     setFormData(prev => ({
       ...prev,
       skills_covered: prev.skills_covered.filter(s => s !== skill),
     }));
   };
 
   const handleAddCareer = () => {
     if (newCareer.trim() && !formData.career_relevance.includes(newCareer.trim())) {
       setFormData(prev => ({
         ...prev,
         career_relevance: [...prev.career_relevance, newCareer.trim()],
       }));
       setNewCareer('');
     }
   };
 
   const handleRemoveCareer = (career: string) => {
     setFormData(prev => ({
       ...prev,
       career_relevance: prev.career_relevance.filter(c => c !== career),
     }));
   };
 
   const handleEdit = (course: Course) => {
     setEditingId(course.id);
     setFormData({
       name: course.name,
       description: course.description,
       domain: course.domain,
       level: course.level,
       duration_hours: course.duration_hours,
       skills_covered: course.skills_covered,
       career_relevance: course.career_relevance || [],
       instructor: course.instructor || '',
       institution: course.institution || '',
       source_platform: course.source_platform || '',
       source_url: course.source_url || '',
       external_rating: Number(course.external_rating || 0),
     });
     setIsDialogOpen(true);
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSaving(true);
 
     try {
       if (editingId) {
         const { error } = await supabase
           .from('courses')
           .update({
             ...formData,
             instructor: formData.instructor || null,
             institution: formData.institution || null,
             source_platform: formData.source_platform || null,
             source_url: formData.source_url || null,
           })
           .eq('id', editingId);
 
         if (error) throw error;
         toast.success('Course updated successfully!');
       } else {
        const { error } = await supabase.from('courses').insert({
          ...formData,
          instructor: formData.instructor || null,
          institution: formData.institution || null,
          source_platform: formData.source_platform || null,
          source_url: formData.source_url || null,
        });
 
         if (error) throw error;
         toast.success('Course created successfully!');
       }
 
       setIsDialogOpen(false);
       setEditingId(null);
       setFormData(initialFormData);
       fetchCourses();
     } catch (error) {
       console.error('Error saving course:', error);
       toast.error('Failed to save course');
     } finally {
       setIsSaving(false);
     }
   };
 
   const handleDelete = async (id: string) => {
     if (!confirm('Are you sure you want to delete this course?')) return;
 
     try {
       const { error } = await supabase.from('courses').delete().eq('id', id);
       if (error) throw error;
       toast.success('Course deleted');
       fetchCourses();
     } catch (error) {
       toast.error('Failed to delete course');
     }
   };
 
   const handleToggleActive = async (id: string, isActive: boolean) => {
     try {
       const { error } = await supabase
         .from('courses')
         .update({ is_active: !isActive })
         .eq('id', id);
 
       if (error) throw error;
       toast.success(isActive ? 'Course deactivated' : 'Course activated');
       fetchCourses();
     } catch (error) {
       toast.error('Failed to update course status');
     }
   };
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center justify-between"
         >
           <div>
             <h1 className="text-2xl font-display font-bold mb-2">Manage Courses</h1>
             <p className="text-muted-foreground">
               Add, edit, and manage courses in the platform
             </p>
           </div>
 
           <Dialog open={isDialogOpen} onOpenChange={(open) => {
             setIsDialogOpen(open);
             if (!open) {
               setEditingId(null);
               setFormData(initialFormData);
             }
           }}>
             <DialogTrigger asChild>
               <Button className="gradient-primary">
                 <Plus className="h-4 w-4 mr-2" />
                 Add Course
               </Button>
             </DialogTrigger>
             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                 <DialogTitle>
                   {editingId ? 'Edit Course' : 'Add New Course'}
                 </DialogTitle>
               </DialogHeader>
 
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                     <Label htmlFor="name">Course Name</Label>
                     <Input
                       id="name"
                       value={formData.name}
                       onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                       required
                     />
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="domain">Domain</Label>
                     <Input
                       id="domain"
                       value={formData.domain}
                       onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                       placeholder="e.g., Data Science, Web Development"
                       required
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="description">Description</Label>
                   <Textarea
                     id="description"
                     value={formData.description}
                     onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                     rows={3}
                     required
                   />
                 </div>
 
                 <div className="grid gap-4 md:grid-cols-3">
                   <div className="space-y-2">
                     <Label htmlFor="level">Level</Label>
                   <Select
                       value={formData.level}
                       onValueChange={(value) =>
                         setFormData(prev => ({ ...prev, level: value as CourseLevel }))
                       }
                     >
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="beginner">Beginner</SelectItem>
                         <SelectItem value="intermediate">Intermediate</SelectItem>
                         <SelectItem value="advanced">Advanced</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="duration">Duration (hours)</Label>
                     <Input
                       id="duration"
                       type="number"
                       min="1"
                       value={formData.duration_hours}
                       onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) }))}
                       required
                     />
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="instructor">Instructor</Label>
                     <Input
                       id="instructor"
                       value={formData.instructor}
                       onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                     />
                   </div>
                 </div>

                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                     <Label htmlFor="institution">Institution</Label>
                     <Input
                       id="institution"
                       value={formData.institution}
                       onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                       placeholder="e.g., Coursera, Stanford, YouTube"
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="source_platform">Video Platform</Label>
                     <Input
                       id="source_platform"
                       value={formData.source_platform}
                       onChange={(e) => setFormData(prev => ({ ...prev, source_platform: e.target.value }))}
                       placeholder="e.g., YouTube, Coursera, Udemy"
                     />
                   </div>
                 </div>

                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                     <Label htmlFor="source_url">Video Source URL</Label>
                     <Input
                       id="source_url"
                       value={formData.source_url}
                       onChange={(e) => setFormData(prev => ({ ...prev, source_url: e.target.value }))}
                       placeholder="https://..."
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="external_rating">Course Rating</Label>
                     <Input
                       id="external_rating"
                       type="number"
                       min="0"
                       max="5"
                       step="0.1"
                       value={formData.external_rating}
                       onChange={(e) => setFormData(prev => ({ ...prev, external_rating: Number(e.target.value) }))}
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <Label>Skills Covered</Label>
                   <div className="flex gap-2">
                     <Input
                       value={newSkill}
                       onChange={(e) => setNewSkill(e.target.value)}
                       placeholder="Add a skill..."
                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                     />
                     <Button type="button" onClick={handleAddSkill} size="icon">
                       <Plus className="h-4 w-4" />
                     </Button>
                   </div>
                   <div className="flex flex-wrap gap-2 mt-2">
                     {formData.skills_covered.map((skill) => (
                       <Badge key={skill} variant="secondary" className="pl-3">
                         {skill}
                         <button
                           type="button"
                           onClick={() => handleRemoveSkill(skill)}
                           className="ml-2 hover:text-destructive"
                         >
                           <X className="h-3 w-3" />
                         </button>
                       </Badge>
                     ))}
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <Label>Career Relevance</Label>
                   <div className="flex gap-2">
                     <Input
                       value={newCareer}
                       onChange={(e) => setNewCareer(e.target.value)}
                       placeholder="Add a career role..."
                       onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCareer())}
                     />
                     <Button type="button" onClick={handleAddCareer} size="icon">
                       <Plus className="h-4 w-4" />
                     </Button>
                   </div>
                   <div className="flex flex-wrap gap-2 mt-2">
                     {formData.career_relevance.map((career) => (
                       <Badge key={career} variant="outline" className="pl-3">
                         {career}
                         <button
                           type="button"
                           onClick={() => handleRemoveCareer(career)}
                           className="ml-2 hover:text-destructive"
                         >
                           <X className="h-3 w-3" />
                         </button>
                       </Badge>
                     ))}
                   </div>
                 </div>
 
                 <div className="flex justify-end gap-3 pt-4">
                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                     Cancel
                   </Button>
                   <Button type="submit" className="gradient-primary" disabled={isSaving}>
                     {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                     {editingId ? 'Update Course' : 'Create Course'}
                   </Button>
                 </div>
               </form>
             </DialogContent>
           </Dialog>
         </motion.div>
 
         {/* Courses Table */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
         >
           <Card className="shadow-card">
             <CardContent className="p-0">
               {isLoading ? (
                 <div className="flex items-center justify-center py-12">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
               ) : (
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Course</TableHead>
                       <TableHead>Domain</TableHead>
                       <TableHead>Level</TableHead>
                       <TableHead>Duration</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {courses.map((course) => (
                       <TableRow key={course.id}>
                         <TableCell>
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                               <BookOpen className="h-5 w-5 text-primary" />
                             </div>
                             <div>
                               <p className="font-medium">{course.name}</p>
                               <p className="text-sm text-muted-foreground line-clamp-1">
                                 {course.description}
                               </p>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>{course.domain}</TableCell>
                         <TableCell>
                           <Badge className={cn('level-badge', `level-${course.level}`)}>
                             {course.level}
                           </Badge>
                         </TableCell>
                         <TableCell>{course.duration_hours}h</TableCell>
                         <TableCell>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleToggleActive(course.id, course.is_active)}
                             className={cn(
                               course.is_active
                                 ? 'text-success hover:text-success'
                                 : 'text-muted-foreground'
                             )}
                           >
                             {course.is_active ? 'Active' : 'Inactive'}
                           </Button>
                         </TableCell>
                         <TableCell className="text-right">
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleEdit(course)}
                           >
                             <Pencil className="h-4 w-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleDelete(course.id)}
                             className="text-destructive hover:text-destructive"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               )}
             </CardContent>
           </Card>
         </motion.div>
       </div>
     </DashboardLayout>
   );
 }
