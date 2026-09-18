 import { useState } from 'react';
 import { useNavigate, useLocation } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { toast } from 'sonner';
 import { GraduationCap, Loader2, Mail, Lock, User } from 'lucide-react';
 import { z } from 'zod';
 
 const emailSchema = z.string().email('Please enter a valid email address');
 const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
 const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100);
 
 export default function Auth() {
   const [isLoading, setIsLoading] = useState(false);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [fullName, setFullName] = useState('');
   const { signIn, signUp, user } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
 
   const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
 
   if (user) {
     navigate(from, { replace: true });
     return null;
   }
 
   const handleSignIn = async (e: React.FormEvent) => {
     e.preventDefault();
     
     try {
       emailSchema.parse(email);
       passwordSchema.parse(password);
     } catch (err) {
       if (err instanceof z.ZodError) {
         toast.error(err.errors[0].message);
         return;
       }
     }
 
     setIsLoading(true);
     const { error } = await signIn(email, password);
     setIsLoading(false);
 
     if (error) {
       if (error.message.includes('Invalid login credentials')) {
         toast.error('Invalid email or password. Please try again.');
       } else {
         toast.error(error.message);
       }
     } else {
       toast.success('Welcome back!');
       navigate(from, { replace: true });
     }
   };
 
   const handleSignUp = async (e: React.FormEvent) => {
     e.preventDefault();
 
     try {
       nameSchema.parse(fullName);
       emailSchema.parse(email);
       passwordSchema.parse(password);
     } catch (err) {
       if (err instanceof z.ZodError) {
         toast.error(err.errors[0].message);
         return;
       }
     }
 
     setIsLoading(true);
     const { error } = await signUp(email, password, fullName);
     setIsLoading(false);
 
     if (error) {
       if (error.message.includes('already registered')) {
         toast.error('This email is already registered. Please sign in instead.');
       } else {
         toast.error(error.message);
       }
     } else {
       toast.success('Account created! Please check your email to verify your account.');
     }
   };
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
       </div>
 
       <Card className="w-full max-w-md shadow-card animate-scale-in relative z-10">
         <CardHeader className="text-center pb-2">
           <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
             <GraduationCap className="h-8 w-8 text-primary-foreground" />
           </div>
           <CardTitle className="text-2xl font-display">Course Compass</CardTitle>
           <CardDescription>
             AI-powered personalized course recommendations
           </CardDescription>
         </CardHeader>
 
         <CardContent>
           <Tabs defaultValue="signin" className="w-full">
             <TabsList className="grid w-full grid-cols-2 mb-6">
               <TabsTrigger value="signin">Sign In</TabsTrigger>
               <TabsTrigger value="signup">Sign Up</TabsTrigger>
             </TabsList>
 
             <TabsContent value="signin">
               <form onSubmit={handleSignIn} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="signin-email">Email</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="signin-email"
                       type="email"
                       placeholder="you@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="pl-10"
                       required
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="signin-password">Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="signin-password"
                       type="password"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="pl-10"
                       required
                     />
                   </div>
                 </div>
 
                 <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                   {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                   Sign In
                 </Button>
               </form>
             </TabsContent>
 
             <TabsContent value="signup">
               <form onSubmit={handleSignUp} className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="signup-name">Full Name</Label>
                   <div className="relative">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="signup-name"
                       type="text"
                       placeholder="John Doe"
                       value={fullName}
                       onChange={(e) => setFullName(e.target.value)}
                       className="pl-10"
                       required
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="signup-email">Email</Label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="signup-email"
                       type="email"
                       placeholder="you@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="pl-10"
                       required
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <Label htmlFor="signup-password">Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                       id="signup-password"
                       type="password"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="pl-10"
                       required
                     />
                   </div>
                 </div>
 
                 <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                   {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                   Create Account
                 </Button>
               </form>
             </TabsContent>
           </Tabs>
         </CardContent>
       </Card>
     </div>
   );
 }