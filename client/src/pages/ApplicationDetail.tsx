import { Layout } from "@/components/layout/Sidebar";
import { useApplication } from "@/hooks/use-applications";
import { useRoute } from "wouter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, Clock, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IESTemplate } from "@/components/print/IESTemplate";

export default function ApplicationDetail() {
  const [, params] = useRoute("/application/:id");
  const id = Number(params?.id);
  const { data: app, isLoading } = useApplication(id);

  const handlePrintCAR = () => {
    window.print();
  };

  if (isLoading) return <Layout><div className="p-8 text-center">Loading application...</div></Layout>;
  if (!app) return <Layout><div className="p-8 text-center">Application not found.</div></Layout>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Print Template (Hidden by default, shown during print via CSS in template) */}
        {app.ies && <IESTemplate application={app} />}

        {/* Print Only Header for CAR */}
        <div className="hidden print:hidden mb-8 border-b-2 border-slate-900 pb-4">
          <h1 className="text-2xl font-bold uppercase text-center">Comparative Assessment Result (CAR)</h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm font-bold">Position: <span className="font-normal">{app.position.position}</span></p>
              <p className="text-sm font-bold">School Assigned: <span className="font-normal">{(app.ies as any)?.schoolName || "N/A"}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">Date of Deliberation: <span className="font-normal">{app.car?.dateOfFinalDeliberation ? new Date(app.car.dateOfFinalDeliberation).toLocaleDateString() : "N/A"}</span></p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 print:hidden">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={app.status} className="text-sm px-3 py-1" />
              <span className="text-slate-400 text-sm font-mono">{app.applicantCode}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">{app.position.position}</h1>
            <p className="text-slate-500 text-lg">Application Progress</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {app.ies && (
              <Button onClick={() => window.print()} variant="outline" className="flex-1 sm:flex-none items-center gap-2">
                <Printer className="w-4 h-4" />
                Print IES
              </Button>
            )}
            {app.car && (
              <Button onClick={handlePrintCAR} className="flex-1 sm:flex-none items-center gap-2">
                <Printer className="w-4 h-4" />
                Print CAR
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="print:hidden space-y-8">
            {/* IER Results */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                Step 1: Initial Evaluation (IER)
                {app.ier ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-slate-300" />}
              </h2>
              {app.ier ? (
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader><CardTitle className="text-lg">Evaluation Result</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Eligibility</p>
                      <p className="font-medium">{app.ier.eligibility}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-bold">Result</p>
                      <p className="font-bold capitalize">{app.ier.remarks}</p>
                    </div>
                    {app.ier.feedback && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-400 uppercase font-bold">Feedback</p>
                        <p className="text-slate-600 italic">"{app.ier.feedback}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
                  Evaluation in progress...
                </div>
              )}
            </section>

            {/* IES Results */}
            {app.ier?.remarks === 'qualified' && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  Step 2: Assessment Scoring (IES)
                  {app.ies ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-slate-300" />}
                </h2>
                {app.ies ? (
                  <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between gap-2">
                      <CardTitle className="text-lg">Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                        <ScoreItem label="Education" score={app.ies.education} max={10} />
                        <ScoreItem label="Training" score={app.ies.training} max={10} />
                        <ScoreItem label="Experience" score={app.ies.experience} max={10} />
                        <ScoreItem label="PBET/LET/LPT Rating" score={(app.ies as any).pbetLetLptRating} max={10} />
                        <ScoreItem label="Classroom Observation" score={app.ies.classObs} max={35} />
                        <ScoreItem label="Non-Classroom Observation" score={(app.ies as any).nonClassObs} max={25} />
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-500 uppercase">Total Actual Score</p>
                        <p className="text-3xl font-bold text-primary">{app.ies.actualScore}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
                    Assessment scoring pending...
                  </div>
                )}
              </section>
            )}

            {/* CAR Results */}
            {app.ies && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  Step 3: Final Deliberation (CAR)
                  {app.car ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-slate-300" />}
                </h2>
                {app.car ? (
                  <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      <p className="text-sm font-semibold text-primary">Your application has been finalized.</p>
                    </div>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-400 uppercase font-bold">Final Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={app.status} className="text-sm px-3 py-1" />
                          <span className="text-slate-500 text-sm">| Result: {app.car.remarks || "No remarks"}</span>
                        </div>
                      </div>
                      <DataField label="Background Investigation" value={app.car.backgroundInvestigation} />
                      <DataField label="Proceed to BI" value={app.car.forBi === 'yes' ? "Yes" : "No"} />
                      <DataField label="For Appointment" value={app.car.forAppointment} />
                      <DataField label="Status of Appointment" value={app.car.statusOfAppointment} />
                      <DataField label="Finalized Date" value={app.car.dateOfFinalDeliberation ? new Date(app.car.dateOfFinalDeliberation).toLocaleDateString() : null} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
                    Waiting for final deliberation...
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ScoreItem({ label, score, max }: { label: string, score: any, max: number }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase font-bold mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-900">{score}</span>
        <span className="text-xs text-slate-400">/ {max}</span>
      </div>
    </div>
  );
}

function DataField({ label, value }: { label: string, value: any }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase font-bold">{label}</p>
      <p className="font-medium text-slate-900">{value || "Not specified"}</p>
    </div>
  );
}
