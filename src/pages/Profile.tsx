import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, GraduationCap, Target, Briefcase, Plus, X, Loader2, Save, Clock, BookOpen, Globe } from 'lucide-react';

interface CareerRole {
  id: string;
  name: string;
  description: string;
}

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [careerRoles, setCareerRoles] = useState<CareerRole[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    education: '',
    skills: [] as string[],
    interests: [] as string[],
    skill_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    career_goals: '',
    target_career_role: '',
    learning_style: 'visual',
    daily_study_hours: 2,
    experience_years: 0,
    preferred_language: 'English',
    target_timeline: '6 months',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        education: profile.education || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        skill_level: profile.skill_level || 'beginner',
        career_goals: profile.career_goals || '',
        target_career_role: profile.target_career_role || '',
        learning_style: (profile as any).learning_style || 'visual',
        daily_study_hours: (profile as any).daily_study_hours || 2,
        experience_years: (profile as any).experience_years || 0,
        preferred_language: (profile as any).preferred_language || 'English',
        target_timeline: (profile as any).target_timeline || '6 months',
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchCareerRoles();
  }, []);

  const fetchCareerRoles = async () => {
    const { data } = await supabase.from('career_roles').select('id, name, description');
    if (data) setCareerRoles(data);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          education: formData.education,
          skills: formData.skills,
          interests: formData.interests,
          skill_level: formData.skill_level,
          career_goals: formData.career_goals,
          target_career_role: formData.target_career_role || null,
          learning_style: formData.learning_style,
          daily_study_hours: formData.daily_study_hours,
          experience_years: formData.experience_years,
          preferred_language: formData.preferred_language,
          target_timeline: formData.target_timeline,
        } as any)
        .eq('user_id', user!.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const sectionDelay = (i: number) => ({ delay: 0.1 * i });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Complete your profile to get personalized course recommendations
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sectionDelay(1)}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile?.email || ''} disabled className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Education & Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sectionDelay(2)}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Education & Skills
                </CardTitle>
                <CardDescription>Tell us about your educational background and current skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Textarea id="education" value={formData.education} onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))} placeholder="e.g., B.Tech in Computer Science" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input id="experience_years" type="number" min={0} max={50} value={formData.experience_years} onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skill_level">Current Skill Level</Label>
                  <Select value={formData.skill_level} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setFormData(prev => ({ ...prev, skill_level: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select your skill level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Your Skills</Label>
                  <div className="flex gap-2">
                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g., Python, Machine Learning" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} />
                    <Button type="button" onClick={handleAddSkill} size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="pl-3">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2 hover:text-destructive"><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Learning Preferences */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sectionDelay(3)}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>Help us tailor your learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="learning_style">Learning Style</Label>
                    <Select value={formData.learning_style} onValueChange={(value) => setFormData(prev => ({ ...prev, learning_style: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual (Videos, Diagrams)</SelectItem>
                        <SelectItem value="reading">Reading (Articles, Docs)</SelectItem>
                        <SelectItem value="hands-on">Hands-on (Projects, Labs)</SelectItem>
                        <SelectItem value="mixed">Mixed (All formats)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daily_study_hours">Daily Study Hours</Label>
                    <Select value={String(formData.daily_study_hours)} onValueChange={(value) => setFormData(prev => ({ ...prev, daily_study_hours: parseInt(value) }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="6">6+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_language">Preferred Language</Label>
                    <Select value={formData.preferred_language} onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_language: value }))}>
                      <SelectTrigger>
                        <Globe className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_timeline">Target Completion Timeline</Label>
                    <Select value={formData.target_timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, target_timeline: value }))}>
                      <SelectTrigger>
                        <Clock className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 month">1 month</SelectItem>
                        <SelectItem value="3 months">3 months</SelectItem>
                        <SelectItem value="6 months">6 months</SelectItem>
                        <SelectItem value="1 year">1 year</SelectItem>
                        <SelectItem value="2 years">2+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interests */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sectionDelay(4)}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Interests
                </CardTitle>
                <CardDescription>What topics are you interested in learning?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="e.g., Data Science, Web Development" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())} />
                  <Button type="button" onClick={handleAddInterest} size="icon"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="pl-3 border-primary/30">
                      {interest}
                      <button type="button" onClick={() => handleRemoveInterest(interest)} className="ml-2 hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Career Goals */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sectionDelay(5)}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Career Goals
                </CardTitle>
                <CardDescription>Select a target career role to get a personalized learning roadmap</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target_career_role">Target Career Role</Label>
                  <Select value={formData.target_career_role} onValueChange={(value) => setFormData(prev => ({ ...prev, target_career_role: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select your target career" /></SelectTrigger>
                    <SelectContent>
                      {careerRoles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="career_goals">Career Goals Description</Label>
                  <Textarea id="career_goals" value={formData.career_goals} onChange={(e) => setFormData(prev => ({ ...prev, career_goals: e.target.value }))} placeholder="Describe your career aspirations..." rows={3} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={sectionDelay(6)} className="flex justify-end">
            <Button type="submit" className="gradient-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </motion.div>
        </form>
      </div>
    </DashboardLayout>
  );
}
