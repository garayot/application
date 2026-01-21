import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  UserCircle, 
  FileText, 
  Files, 
  LogOut, 
  Building2,
  CheckSquare,
  ClipboardCheck,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { user } = useUser();
  const logout = useLogout();
  const [location] = useLocation();

  if (!user) return null;

  const isAdmin = user.role === "admin";

  const applicantLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/profile", icon: UserCircle, label: "My Profile" },
    { href: "/apply", icon: Files, label: "Apply Now" },
    { href: "/my-applications", icon: FileText, label: "My Applications" },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/applicants", icon: UserCircle, label: "Applicants" },
    { href: "/admin/evaluations", icon: CheckSquare, label: "Evaluations (IER)" },
    { href: "/admin/assessments", icon: ClipboardCheck, label: "Assessments (IES)" },
    { href: "/admin/final", icon: Award, label: "Final (CAR)" },
  ];

  const links = isAdmin ? adminLinks : applicantLinks;

  return (
    <div className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-slate-900">EduHiring</h1>
            <p className="text-xs text-slate-500 font-medium">Division Office</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
              isActive 
                ? "bg-primary/10 text-primary shadow-sm" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}>
              <link.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.username}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 pl-64">
      <Sidebar />
      <main className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
