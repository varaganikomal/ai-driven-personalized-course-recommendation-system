 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { AuthProvider } from "@/contexts/AuthContext";
 import { ProtectedRoute } from "@/components/ProtectedRoute";
 import Index from "./pages/Index";
 import Auth from "./pages/Auth";
 import Dashboard from "./pages/Dashboard";
 import Profile from "./pages/Profile";
 import Courses from "./pages/Courses";
 import Recommendations from "./pages/Recommendations";
 import Roadmap from "./pages/Roadmap";
 import AdminDashboard from "./pages/admin/AdminDashboard";
 import ManageCourses from "./pages/admin/ManageCourses";
import CourseDetail from "./pages/CourseDetail";
 import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <QueryClientProvider client={queryClient}>
     <TooltipProvider>
       <Toaster />
       <Sonner />
       <BrowserRouter>
         <AuthProvider>
           <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/auth" element={<Auth />} />
             <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
             <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
             <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
              <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
             <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
             <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
             <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
             <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><ManageCourses /></ProtectedRoute>} />
             <Route path="*" element={<NotFound />} />
           </Routes>
         </AuthProvider>
       </BrowserRouter>
     </TooltipProvider>
   </QueryClientProvider>
 );
 
 export default App;
