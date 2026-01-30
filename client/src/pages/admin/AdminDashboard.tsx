import { Layout } from "@/components/layout/Sidebar";
import { useAllApplications } from "@/hooks/use-applications";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";
import { Users, FileCheck, ClipboardList, TrendingUp } from "lucide-react";
import { useUser } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const { user } = useUser();
  const { data: applications, isLoading } = useAllApplications();

  if (isLoading || !user)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );

  const stats = [
    {
      label: "Total Applicants",
      value: applications?.length || 0,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Pending Review",
      value: applications?.filter((a) => a.status === "submitted").length || 0,
      icon: FileCheck,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Qualified",
      value: applications?.filter((a) => a.status === "qualified").length || 0,
      icon: ClipboardList,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Finalized",
      value: applications?.filter((a) => a.status === "finalized").length || 0,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Admin Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Manage applications and assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">
                {stat.value}
              </h3>
            </div>
          ))}
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
                {applications?.map((app) => (
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
