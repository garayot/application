import { Layout } from "@/components/layout/Sidebar";
import { usePositions, useCreateApplication, useMajors } from "@/hooks/use-applications";
import { useApplicantProfile } from "@/hooks/use-applicants";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Link } from "wouter";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Apply() {
  const { data: positions, isLoading } = usePositions();
  const { data: majors } = useMajors();
  const { data: profile } = useApplicantProfile();
  const createApplication = useCreateApplication();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedMajor, setSelectedMajor] = useState<string | undefined>();

  if (isLoading) return <Layout><div>Loading positions...</div></Layout>;

  // If no profile, prompt to create one
  if (!profile) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Required</h2>
          <p className="text-slate-600 mb-8">
            You must complete your applicant profile before you can apply for positions.
          </p>
          <Link href="/profile">
            <Button className="bg-primary text-white">Complete Profile</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleApply = (positionId: number, posLevel: string) => {
    if (posLevel === "Junior High School" && !selectedMajor) {
      toast({
        title: "Major Required",
        description: "Please select a major for Junior High School level positions.",
        variant: "destructive"
      });
      return;
    }

    createApplication.mutate({
      appId: profile.appId,
      positionId,
      majorId: selectedMajor ? Number(selectedMajor) : undefined,
    }, {
      onSuccess: () => {
        toast({
          title: "Application Submitted!",
          description: "Your application has been received successfully.",
        });
        setLocation("/my-applications");
      },
      onError: (err) => {
        toast({
          title: "Submission Failed",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Open Positions</h1>
          <p className="text-slate-500 mt-2">Select a position below to start your application.</p>
        </div>

        <div className="grid gap-4">
          {positions?.map((pos) => (
            <div key={pos.positionId} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">{pos.position}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                  {pos.schoolYear && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                      SY {pos.schoolYear}
                    </span>
                  )}
                  {pos.levels && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium capitalize">
                      {pos.levels}
                    </span>
                  )}
                  <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-medium">
                    SG {pos.salaryGrade}
                  </span>
                  <span className="font-semibold text-slate-700">
                    ₱{Number(pos.monthlySalary).toLocaleString()} / month
                  </span>
                </div>

                {pos.levels === "Junior High School" && (
                  <div className="mt-4 max-w-xs">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Select Major</label>
                    <Select onValueChange={setSelectedMajor} value={selectedMajor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a major" />
                      </SelectTrigger>
                      <SelectContent>
                        {majors?.map((major) => (
                          <SelectItem key={major.majorId} value={major.majorId.toString()}>
                            {major.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Button 
                onClick={() => handleApply(pos.positionId, pos.levels || "")}
                disabled={createApplication.isPending}
                className="rounded-xl px-6 h-12"
              >
                {createApplication.isPending ? "Submitting..." : "Apply Now"}
              </Button>
            </div>
          ))}
          {positions?.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              No open positions at the moment.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
