import { Layout } from "@/components/layout/Sidebar";
import { useApplication, useCreateIER, useCreateIES, useCreateCAR, useSchools } from "@/hooks/use-applications";
import { useRoute } from "wouter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Schemas matching server expectations
const ierFormSchema = z.object({
  eligibility: z.string().min(1, "Required"),
  remarks: z.enum(["qualified", "disqualified"]),
  feedback: z.string().optional(),
  positionId: z.number(),
  // Qualification Levels (1-31)
  applicantEducation: z.coerce.number().min(0).max(31),
  applicantTraining: z.coerce.number().min(0).max(31),
  applicantExperience: z.coerce.number().min(0).max(31),
});

const iesFormSchema = z.object({
  schoolId: z.number(),
  education: z.coerce.number().min(0).max(10),
  training: z.coerce.number().min(0).max(10),
  experience: z.coerce.number().min(0).max(10),
  performance: z.coerce.number().min(0).max(30),
  classObs: z.coerce.number().min(0).max(25),
  portfolioBei: z.coerce.number().min(0).max(15),
});

const carFormSchema = z.object({
  remarks: z.string().optional(),
  backgroundInvestigation: z.string().optional(),
  forAppointment: z.string().optional(),
  statusOfAppointment: z.string().optional(),
  forBi: z.enum(["yes", "no"]),
  finalizedBy: z.number().optional()
});

export default function AdminApplicationDetail() {
  const [, params] = useRoute("/admin/application/:id");
  const id = Number(params?.id);
  const { data: app, isLoading } = useApplication(id);
  const { data: schools } = useSchools();
  const createIER = useCreateIER();
  const createIES = useCreateIES();
  const createCAR = useCreateCAR();
  const { toast } = useToast();

  if (isLoading || !app) return <Layout><div>Loading application...</div></Layout>;

  // === IER FORM (Step 1) ===
  const IERSection = () => {
    const form = useForm({
      resolver: zodResolver(ierFormSchema),
      defaultValues: {
        eligibility: app.applicant.eligibility || "Eligible",
        remarks: "qualified" as const,
        feedback: "",
        positionId: app.positionId,
        applicantEducation: 0,
        applicantTraining: 0,
        applicantExperience: 0,
      }
    });

    const standardEducation = app.position.standardEducation || 0;
    const standardTraining = app.position.standardTraining || 0;
    const standardExperience = app.position.standardExperience || 0;
    const applicantEducation = form.watch("applicantEducation");
    const applicantTraining = form.watch("applicantTraining");
    const applicantExperience = form.watch("applicantExperience");

    const incEdu = applicantEducation - standardEducation;
    const incTra = applicantTraining - standardTraining;
    const incExp = applicantExperience - standardExperience;

    const onSubmit = (data: any) => {
      createIER.mutate({ id, data }, {
        onSuccess: () => toast({ title: "Evaluation Submitted" }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    };

    if (app.ier) return <CompletedSection title="Initial Evaluation Result (IER)" data={app.ier} />;

    return (
      <Card>
        <CardHeader><CardTitle>Initial Evaluation (IER)</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="eligibility" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligibility Confirmed</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="remarks" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manual Override Result</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full h-10 border rounded-md px-3 bg-transparent">
                        <option value="qualified">Qualified</option>
                        <option value="disqualified">Disqualified</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase text-slate-500">Qualification Standards & Applicant Levels</h3>
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border">
                  <div className="space-y-4">
                    <p className="font-bold text-xs text-center">Education</p>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Standard</p>
                      <p className="text-sm font-bold">{standardEducation}</p>
                    </div>
                    <FormField control={form.control} name="applicantEducation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Applicant (1-31)</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )} />
                    <div className={`p-2 rounded text-center text-sm font-bold ${incEdu < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      Inc: {incEdu}
                      {incEdu < 0 && <p className="text-[10px] mt-1">BELOW STANDARD</p>}
                    </div>
                  </div>

                  <div className="space-y-4 border-l pl-4">
                    <p className="font-bold text-xs text-center">Training</p>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Standard</p>
                      <p className="text-sm font-bold">{standardTraining}</p>
                    </div>
                    <FormField control={form.control} name="applicantTraining" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Applicant (1-31)</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )} />
                    <div className={`p-2 rounded text-center text-sm font-bold ${incTra < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      Inc: {incTra}
                      {incTra < 0 && <p className="text-[10px] mt-1">BELOW STANDARD</p>}
                    </div>
                  </div>

                  <div className="space-y-4 border-l pl-4">
                    <p className="font-bold text-xs text-center">Experience</p>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Standard</p>
                      <p className="text-sm font-bold">{standardExperience}</p>
                    </div>
                    <FormField control={form.control} name="applicantExperience" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Applicant (1-31)</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      </FormItem>
                    )} />
                    <div className={`p-2 rounded text-center text-sm font-bold ${incExp < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      Inc: {incExp}
                      {incExp < 0 && <p className="text-[10px] mt-1">BELOW STANDARD</p>}
                    </div>
                  </div>
                </div>
              </div>

              <FormField control={form.control} name="feedback" render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback (Optional)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
              <Button type="submit" disabled={createIER.isPending} className="w-full">
                {incEdu < 0 ? 'Submit Disqualification' : 'Submit Evaluation'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  };

  // === IES FORM (Step 2) ===
  const IESSection = () => {
    const form = useForm({
      resolver: zodResolver(iesFormSchema),
      defaultValues: {
        schoolId: schools?.[0]?.schoolId || 0,
        education: 0,
        training: 0,
        experience: 0,
        performance: 0,
        classObs: 0,
        portfolioBei: 0
      }
    });

    const onSubmit = (data: any) => {
      // Manual coercion just in case
      const payload = {
        ...data,
        schoolId: Number(data.schoolId),
        education: Number(data.education),
        training: Number(data.training),
        experience: Number(data.experience),
        performance: Number(data.performance),
        classObs: Number(data.classObs),
        portfolioBei: Number(data.portfolioBei),
      };

      createIES.mutate({ id: app.ier!.ierId, data: payload }, {
        onSuccess: () => toast({ title: "Assessment Submitted" }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    };

    if (!app.ier || app.ier.remarks === 'disqualified') return null;
    if (app.ies) return <CompletedSection title="Initial Evaluation Sheet (IES)" data={app.ies} />;

    return (
      <Card className="mt-8 border-yellow-200 bg-yellow-50/50">
        <CardHeader><CardTitle>Assessment Scoring (IES)</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField control={form.control} name="schoolId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned School</FormLabel>
                    <FormControl>
                      <select {...field} onChange={e => field.onChange(Number(e.target.value))} className="w-full h-10 border rounded-md px-3 bg-white">
                        {schools?.map(s => <option key={s.schoolId} value={s.schoolId}>{s.name}</option>)}
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="education" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education (Max 10)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="training" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training (Max 10)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="experience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience (Max 10)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="performance" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Performance (Max 30)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="classObs" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classroom Obs (Max 25)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="portfolioBei" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio & BEI (Max 15)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <Button type="submit" disabled={createIES.isPending}>Calculate & Submit Score</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  };

  // === CAR FORM (Step 3) ===
  const CARSection = () => {
    const form = useForm({
      resolver: zodResolver(carFormSchema),
      defaultValues: {
        remarks: "Highly Recommended",
        backgroundInvestigation: "",
        forAppointment: "",
        statusOfAppointment: "",
        forBi: "yes" as const,
      }
    });

    const onSubmit = (data: any) => {
      // Ensure forBi is explicitly passed
      const payload = {
        ...data,
        forBi: data.forBi || "yes"
      };
      createCAR.mutate({ id: app.ies!.iesId, data: payload }, {
        onSuccess: () => toast({ title: "Finalized Application" }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    };

    if (!app.ies) return null;
    if (app.car) return <CompletedSection title="Comparative Assessment Result (CAR)" data={app.car} />;

    return (
      <Card className="mt-8 border-purple-200 bg-purple-50/50">
        <CardHeader><CardTitle>Final Deliberation (CAR)</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="p-4 bg-white rounded-lg border mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Applicant Code</p>
                    <p className="text-sm font-mono">{app.applicantCode}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Applicant Name</p>
                    <p className="text-sm font-bold">{app.applicant.name}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                   <div>Edu: {app.ies?.education}</div>
                   <div>Tra: {app.ies?.training}</div>
                   <div>Exp: {app.ies?.experience}</div>
                   <div>Perf: {app.ies?.performance}</div>
                   <div>Obs: {app.ies?.classObs}</div>
                   <div>Bei: {app.ies?.portfolioBei}</div>
                </div>
                <Separator className="my-2" />
                <p className="text-sm font-bold text-slate-500 uppercase">Total IES Score</p>
                <p className="text-3xl font-bold text-slate-900">{app.ies?.actualScore}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="forBi" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proceed to Background Investigation?</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full h-10 border rounded-md px-3 bg-white">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="remarks" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="backgroundInvestigation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Investigation</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="forAppointment" render={({ field }) => (
                  <FormItem>
                    <FormLabel>For Appointment</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="statusOfAppointment" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status of Appointment</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <Button type="submit" disabled={createCAR.isPending}>Finalize Application</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={app.status} className="text-sm px-3 py-1" />
              <span className="text-slate-400 text-sm font-mono">{app.applicantCode}</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">{app.applicant.name}</h1>
            <p className="text-slate-500 text-lg">{app.position.position}</p>
          </div>
          <div className="text-right text-sm text-slate-500 flex flex-col items-end gap-2">
            <p>Applied on {new Date(app.createdAt!).toLocaleDateString()}</p>
            {app.car && (
              <Button size="sm" variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print CAR
              </Button>
            )}
          </div>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
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

        {/* Print Only Table */}
        <div className="hidden print:block mb-8">
          <table className="w-full border-collapse border border-slate-900 text-[10px]">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-900 p-1 text-left">Code</th>
                <th className="border border-slate-900 p-1 text-left">Name</th>
                <th className="border border-slate-900 p-1 text-center">Edu</th>
                <th className="border border-slate-900 p-1 text-center">Tra</th>
                <th className="border border-slate-900 p-1 text-center">Exp</th>
                <th className="border border-slate-900 p-1 text-center">Perf</th>
                <th className="border border-slate-900 p-1 text-center">Obs</th>
                <th className="border border-slate-900 p-1 text-center">Bei</th>
                <th className="border border-slate-900 p-1 text-center">Total</th>
                <th className="border border-slate-900 p-1 text-left">Remarks</th>
                <th className="border border-slate-900 p-1 text-left">BI</th>
                <th className="border border-slate-900 p-1 text-left">Appt</th>
                <th className="border border-slate-900 p-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-900 p-1 font-mono">{app.applicantCode}</td>
                <td className="border border-slate-900 p-1 font-bold">{app.applicant.name}</td>
                <td className="border border-slate-900 p-1 text-center">{app.ies?.education}</td>
                <td className="border border-slate-900 p-1 text-center">{app.ies?.training}</td>
                <td className="border border-slate-900 p-1 text-center">{app.ies?.experience}</td>
                <td className="border border-slate-900 p-1 text-center">{app.ies?.performance}</td>
                <td className="border border-slate-900 p-1 text-center">{app.ies?.classObs}</td>
                <td className="border border-slate-900 p-1 text-center">{app.ies?.portfolioBei}</td>
                <td className="border border-slate-900 p-1 text-center font-bold">{app.ies?.actualScore}</td>
                <td className="border border-slate-900 p-1">{app.car?.remarks || "N/A"}</td>
                <td className="border border-slate-900 p-1 capitalize">{app.car?.forBi}</td>
                <td className="border border-slate-900 p-1">{app.car?.forAppointment || "N/A"}</td>
                <td className="border border-slate-900 p-1">{app.car?.statusOfAppointment || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Evaluation Flow */}
        <div className="space-y-8 print:hidden">
          <IERSection />
          <IESSection />
          <CARSection />
        </div>
      </div>
    </Layout>
  );
}

// Helper to show completed sections nicely
function CompletedSection({ title, data }: { title: string, data: any }) {
  return (
    <Card className="bg-slate-50 border-slate-200 opacity-80 hover:opacity-100 transition-opacity">
      <CardHeader><CardTitle className="flex justify-between items-center text-slate-600">
        {title}
        <CheckCircle2 className="text-green-500 w-6 h-6" />
      </CardTitle></CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        {Object.entries(data).map(([key, value]) => {
          if (key.includes('Id') || key === 'createdAt') return null;
          return (
            <div key={key}>
              <span className="font-bold text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(value)}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

import { CheckCircle2, Printer } from "lucide-react";

