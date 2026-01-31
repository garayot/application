import { Layout } from "@/components/layout/Sidebar";
import { useUser } from "@/hooks/use-auth";
import { useMyApplications } from "@/hooks/use-applications";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";
import { FileText, Plus, Bell, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();
  const { data: applications, isLoading } = useMyApplications();

  if (!user) return null;

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user.username}. Track your applications here.</p>
          </div>
          <Link href="/apply" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all">
            <Plus className="w-5 h-5" />
            New Application
          </Link>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Applications</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{applications?.length || 0}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-sm font-medium">In Progress</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              {applications?.filter(a => a.status === 'submitted' || a.status === 'under_assessment').length || 0}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Notifications</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">0</h3>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900">Recent Applications</h3>
            <Link href="/my-applications" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading applications...</div>
          ) : !applications || applications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-900 font-medium">No applications yet</p>
              <p className="text-slate-500 text-sm mt-1 mb-4">Start your journey by applying for a position.</p>
              <Link href="/apply" className="inline-flex items-center text-primary font-medium hover:underline">
                Browse positions
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app.appCodeId} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                      {app.position.position.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{app.position.position}</h4>
                      <p className="text-sm text-slate-500">Code: {app.applicantCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Status</p>
                      <StatusBadge status={app.status} />
                    </div>
                    <Link href={`/application/${app.appCodeId}`} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors" data-testid={`link-view-app-${app.appCodeId}`}>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

import { ArrowRight } from "lucide-react";
