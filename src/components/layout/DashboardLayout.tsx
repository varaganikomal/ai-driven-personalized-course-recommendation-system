 import { ReactNode, useState } from 'react';
 import { Link, useLocation, useNavigate } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { cn } from '@/lib/utils';
 import {
   GraduationCap,
   LayoutDashboard,
   BookOpen,
   Target,
   Map,
   User,
   LogOut,
   Menu,
   X,
   Settings,
   Users,
   BarChart3,
 } from 'lucide-react';
 
 interface DashboardLayoutProps {
   children: ReactNode;
 }
 
 const studentNavItems = [
   { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
   { href: '/courses', label: 'Browse Courses', icon: BookOpen },
   { href: '/recommendations', label: 'Recommendations', icon: Target },
   { href: '/roadmap', label: 'Learning Roadmap', icon: Map },
   { href: '/profile', label: 'My Profile', icon: User },
 ];
 
 const adminNavItems = [
   { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
   { href: '/admin/courses', label: 'Manage Courses', icon: BookOpen },
   { href: '/admin/users', label: 'Users', icon: Users },
   { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
 ];
 
 export function DashboardLayout({ children }: DashboardLayoutProps) {
   const { profile, role, signOut } = useAuth();
   const location = useLocation();
   const navigate = useNavigate();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
   const navItems = role === 'admin' ? adminNavItems : studentNavItems;
 
   const handleSignOut = async () => {
     await signOut();
     navigate('/');
   };
 
   const getInitials = (name: string) => {
     return name
       .split(' ')
       .map((n) => n[0])
       .join('')
       .toUpperCase()
       .slice(0, 2);
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Desktop Sidebar */}
       <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
         <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4">
           <Link to="/" className="flex h-16 shrink-0 items-center gap-2">
             <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
               <GraduationCap className="h-6 w-6 text-primary-foreground" />
             </div>
             <span className="text-lg font-display font-bold text-sidebar-foreground">
               Course Compass
             </span>
           </Link>
 
           <nav className="flex flex-1 flex-col">
             <ul className="flex flex-1 flex-col gap-y-1">
               {navItems.map((item) => {
                 const Icon = item.icon;
                 const isActive = location.pathname === item.href;
 
                 return (
                   <li key={item.href}>
                     <Link
                       to={item.href}
                       className={cn(
                         'group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                         isActive
                           ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                           : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                       )}
                     >
                       <Icon className="h-5 w-5 shrink-0" />
                       {item.label}
                     </Link>
                   </li>
                 );
               })}
             </ul>
           </nav>
         </div>
       </aside>
 
       {/* Mobile Header */}
       <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-card/80 backdrop-blur-lg px-4 py-4 shadow-sm lg:hidden border-b">
         <button
           type="button"
           className="-m-2.5 p-2.5 text-foreground lg:hidden"
           onClick={() => setMobileMenuOpen(true)}
         >
           <Menu className="h-6 w-6" />
         </button>
 
         <div className="flex-1 flex justify-center">
           <Link to="/" className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
               <GraduationCap className="h-5 w-5 text-primary-foreground" />
             </div>
             <span className="font-display font-bold">Course Compass</span>
           </Link>
         </div>
 
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="icon" className="rounded-full">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={profile?.avatar_url || ''} />
                 <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                   {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                 </AvatarFallback>
               </Avatar>
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end" className="w-48">
             <DropdownMenuLabel>{profile?.full_name}</DropdownMenuLabel>
             <DropdownMenuSeparator />
             <DropdownMenuItem onClick={handleSignOut}>
               <LogOut className="mr-2 h-4 w-4" />
               Sign Out
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       </div>
 
       {/* Mobile Menu Overlay */}
       {mobileMenuOpen && (
         <div className="fixed inset-0 z-50 lg:hidden">
           <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
           <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-sidebar p-6">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                   <GraduationCap className="h-6 w-6 text-primary-foreground" />
                 </div>
                 <span className="text-lg font-display font-bold text-sidebar-foreground">
                   Course Compass
                 </span>
               </div>
               <button onClick={() => setMobileMenuOpen(false)}>
                 <X className="h-6 w-6 text-sidebar-foreground" />
               </button>
             </div>
 
             <nav className="flex flex-col gap-1">
               {navItems.map((item) => {
                 const Icon = item.icon;
                 const isActive = location.pathname === item.href;
 
                 return (
                   <Link
                     key={item.href}
                     to={item.href}
                     onClick={() => setMobileMenuOpen(false)}
                     className={cn(
                       'flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                       isActive
                         ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                         : 'text-sidebar-foreground hover:bg-sidebar-accent'
                     )}
                   >
                     <Icon className="h-5 w-5" />
                     {item.label}
                   </Link>
                 );
               })}
             </nav>
           </div>
         </div>
       )}
 
       {/* Desktop Header */}
       <div className="hidden lg:fixed lg:top-0 lg:left-64 lg:right-0 lg:z-40 lg:flex lg:h-16 lg:items-center lg:gap-x-4 lg:border-b lg:bg-card/80 lg:backdrop-blur-lg lg:px-8">
         <div className="flex flex-1 justify-end gap-x-4">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="flex items-center gap-2 rounded-full px-3">
                 <Avatar className="h-8 w-8">
                   <AvatarImage src={profile?.avatar_url || ''} />
                   <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                     {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                   </AvatarFallback>
                 </Avatar>
                 <span className="text-sm font-medium">{profile?.full_name}</span>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-56">
               <DropdownMenuLabel>
                 <div className="flex flex-col">
                   <span>{profile?.full_name}</span>
                   <span className="text-xs text-muted-foreground font-normal">{profile?.email}</span>
                 </div>
               </DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem asChild>
                 <Link to="/profile">
                   <Settings className="mr-2 h-4 w-4" />
                   Settings
                 </Link>
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={handleSignOut}>
                 <LogOut className="mr-2 h-4 w-4" />
                 Sign Out
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       </div>
 
       {/* Main Content */}
       <main className="lg:pl-64 lg:pt-16">
         <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
       </main>
     </div>
   );
 }