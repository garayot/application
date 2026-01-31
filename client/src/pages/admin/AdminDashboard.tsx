import { Layout } from "@/components/layout/Sidebar";
import { useAllApplications } from "@/hooks/use-applications";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";
import { Search } from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const { user } = useUser();
  const { data: applications, isLoading } = useAllApplications();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading || !user)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );

  const filteredApplications = applications?.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.applicantCode?.toLowerCase().includes(searchLower) ||
      app.applicant.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">
              Admin Overview
            </h1>
            <p className="text-slate-500 mt-1">
              Manage applications and assessments.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-applicants"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-900">
              Recent Applications
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Applicant Code</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications?.map((app) => (
                  <tr key={app.appCodeId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {app.applicantCode}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {app.applicant.name}
                    </td>
                    <td className="px-6 py-4">{app.position.position}</td>
                    <td className="px-6 py-4">{app.position.levels}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(app.createdAt!).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/application/${app.appCodeId}`}
                        className="text-primary font-medium hover:underline"
                        data-testid={`link-view-application-${app.appCodeId}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
