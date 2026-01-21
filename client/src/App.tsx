import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useUser } from "@/hooks/use-auth";

// Pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Apply from "@/pages/Apply";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminApplicationDetail from "@/pages/admin/AdminApplicationDetail";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    setLocation("/");
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    setLocation("/dashboard");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Applicant Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/apply">
        <ProtectedRoute component={Apply} />
      </Route>
      <Route path="/my-applications">
        <ProtectedRoute component={Dashboard} /> {/* Reusing Dashboard for now */}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} adminOnly />
      </Route>
      <Route path="/admin/application/:id">
        <ProtectedRoute component={AdminApplicationDetail} adminOnly />
      </Route>
      
      {/* Aliases for admin sidebar */}
      <Route path="/admin/applicants">
        <ProtectedRoute component={AdminDashboard} adminOnly />
      </Route>
      <Route path="/admin/evaluations">
        <ProtectedRoute component={AdminDashboard} adminOnly />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
