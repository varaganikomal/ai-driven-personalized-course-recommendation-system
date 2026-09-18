 import { Link } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { useAuth } from '@/contexts/AuthContext';
 import { GraduationCap, Target, Map, Sparkles, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
 import { motion } from 'framer-motion';
 
 export default function Index() {
   const { user } = useAuth();
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b">
         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
               <GraduationCap className="h-6 w-6 text-primary-foreground" />
             </div>
             <span className="text-xl font-display font-bold">Course Compass</span>
           </div>
           <div className="flex items-center gap-4">
             {user ? (
               <Button asChild className="gradient-primary">
                 <Link to="/dashboard">Go to Dashboard</Link>
               </Button>
             ) : (
               <>
                 <Button asChild variant="ghost">
                   <Link to="/auth">Sign In</Link>
                 </Button>
                 <Button asChild className="gradient-primary">
                   <Link to="/auth">Get Started</Link>
                 </Button>
               </>
             )}
           </div>
         </div>
       </header>
 
       {/* Hero */}
       <section className="pt-32 pb-20 px-4 relative overflow-hidden">
         <div className="absolute inset-0 gradient-hero opacity-5" />
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
         
         <div className="container mx-auto text-center relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
           >
             <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
               Discover Your Perfect
               <span className="gradient-text block">Learning Path</span>
             </h1>
             <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
               AI-powered course recommendations tailored to your skills, interests, and career goals. 
               Get a personalized roadmap to achieve your dreams.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button asChild size="lg" className="gradient-primary text-lg px-8">
                 <Link to="/auth">
                   Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                 </Link>
               </Button>
               <Button asChild size="lg" variant="outline" className="text-lg px-8">
                 <Link to="/courses">Browse Courses</Link>
               </Button>
             </div>
           </motion.div>
         </div>
       </section>
 
       {/* Features */}
       <section className="py-20 px-4 bg-muted/30">
         <div className="container mx-auto">
           <h2 className="text-3xl font-display font-bold text-center mb-12">
             Why Choose Course Compass?
           </h2>
           <div className="grid md:grid-cols-3 gap-8">
             {[
               { icon: Sparkles, title: 'AI Recommendations', desc: 'Get personalized course suggestions based on your unique profile' },
               { icon: Target, title: 'Skill Gap Analysis', desc: 'Identify missing skills for your dream career' },
               { icon: Map, title: 'Learning Roadmap', desc: 'Follow a structured path from beginner to expert' },
             ].map((feature, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-card p-6 rounded-2xl shadow-card"
               >
                 <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                   <feature.icon className="h-6 w-6 text-primary-foreground" />
                 </div>
                 <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                 <p className="text-muted-foreground">{feature.desc}</p>
               </motion.div>
             ))}
           </div>
         </div>
       </section>
 
       {/* CTA */}
       <section className="py-20 px-4">
         <div className="container mx-auto text-center">
           <div className="gradient-hero rounded-3xl p-12 text-primary-foreground">
             <h2 className="text-3xl font-display font-bold mb-4">Ready to Start Your Journey?</h2>
             <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
               Join thousands of learners who have found their perfect courses with our AI-powered platform.
             </p>
             <Button asChild size="lg" variant="secondary" className="text-lg px-8">
               <Link to="/auth">Get Started Free <ArrowRight className="ml-2" /></Link>
             </Button>
           </div>
         </div>
       </section>
 
       {/* Footer */}
       <footer className="py-8 px-4 border-t">
         <div className="container mx-auto text-center text-muted-foreground">
           <p>© 2024 Course Compass. AI-Powered Learning Platform.</p>
         </div>
       </footer>
     </div>
   );
 }
