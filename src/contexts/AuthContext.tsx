 import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
 import { User, Session } from '@supabase/supabase-js';
 import { supabase } from '@/integrations/supabase/client';
 
 type UserRole = 'admin' | 'student';
 
 interface Profile {
   id: string;
   user_id: string;
   full_name: string;
   email: string;
   education: string | null;
   skills: string[];
   interests: string[];
   skill_level: 'beginner' | 'intermediate' | 'advanced';
   career_goals: string | null;
   target_career_role: string | null;
   avatar_url: string | null;
 }
 
 interface AuthContextType {
   user: User | null;
   session: Session | null;
   profile: Profile | null;
   role: UserRole | null;
   isLoading: boolean;
   signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
   signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
   signOut: () => Promise<void>;
   refreshProfile: () => Promise<void>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [session, setSession] = useState<Session | null>(null);
   const [profile, setProfile] = useState<Profile | null>(null);
   const [role, setRole] = useState<UserRole | null>(null);
   const [isLoading, setIsLoading] = useState(true);
 
   const fetchProfile = async (userId: string) => {
     const { data: profileData } = await supabase
       .from('profiles')
       .select('*')
       .eq('user_id', userId)
       .single();
 
     if (profileData) {
       setProfile(profileData as Profile);
     }
 
     const { data: roleData } = await supabase
       .from('user_roles')
       .select('role')
       .eq('user_id', userId)
       .single();
 
     if (roleData) {
       setRole(roleData.role as UserRole);
     }
   };
 
   const refreshProfile = async () => {
     if (user) {
       await fetchProfile(user.id);
     }
   };
 
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         setSession(session);
         setUser(session?.user ?? null);
 
         if (session?.user) {
           setTimeout(() => {
             fetchProfile(session.user.id);
           }, 0);
         } else {
           setProfile(null);
           setRole(null);
         }
 
         if (event === 'SIGNED_OUT') {
           setProfile(null);
           setRole(null);
         }
       }
     );
 
     supabase.auth.getSession().then(({ data: { session } }) => {
       setSession(session);
       setUser(session?.user ?? null);
       if (session?.user) {
         fetchProfile(session.user.id).finally(() => setIsLoading(false));
       } else {
         setIsLoading(false);
       }
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const signUp = async (email: string, password: string, fullName: string) => {
     const redirectUrl = `${window.location.origin}/`;
     
     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         emailRedirectTo: redirectUrl,
         data: {
           full_name: fullName,
         },
       },
     });
 
     return { error: error as Error | null };
   };
 
   const signIn = async (email: string, password: string) => {
     const { error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });
 
     return { error: error as Error | null };
   };
 
   const signOut = async () => {
     await supabase.auth.signOut();
   };
 
   return (
     <AuthContext.Provider
       value={{
         user,
         session,
         profile,
         role,
         isLoading,
         signUp,
         signIn,
         signOut,
         refreshProfile,
       }}
     >
       {children}
     </AuthContext.Provider>
   );
 }
 
 export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
 }