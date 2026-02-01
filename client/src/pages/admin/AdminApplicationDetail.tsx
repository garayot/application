import { Layout } from "@/components/layout/Sidebar";
import {
  useApplication,
  useCreateIER,
  useCreateIES,
  useCreateCAR,
  useSchools,
} from "@/hooks/use-applications";
import { useRoute } from "wouter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText, User, Printer } from "lucide-react";
import { IESTemplate } from "@/components/print/IESTemplate";

// Schemas matching server expectations
const ierFormSchema = z.object({
  eligibility: z.string().min(1, "Required"),
  remarks: z.enum(["qualified", "disqualified"]),
  feedback: z.string().optional(),
  positionId: z.number(),
  applicantEducation: z.coerce.number().min(0).max(31),
  applicantTraining: z.coerce.number().min(0).max(31),
  applicantExperience: z.coerce.number().min(0).max(31),
});

const iesFormSchema = z.object({
  schoolId: z.number(),
  pbetLetLptRating: z.coerce.number().min(0).max(10),
  classObs: z.coerce.number().min(0).max(35),
  nonClassObs: z.coerce.number().min(0).max(25),
});

const carFormSchema = z.object({
  remarks: z.string().optional(),
  backgroundInvestigation: z.string().optional(),
  forAppointment: z.string().optional(),
  statusOfAppointment: z.string().optional(),
  forBi: z.enum(["yes", "no"]),
  finalizedBy: z.number().optional(),
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

  if (isLoading || !app)
    return (
      <Layout>
        <div>Loading application...</div>
      </Layout>
    );

  // === Applicant Info Section ===
  const ApplicantInfo = () => (
    <Card className="mb-8 border-slate-200 shadow-sm print:hidden">
      <CardHeader className="bg-slate-50/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Applicant Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
              <p className="text-slate-900 font-medium">{app.applicant.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
              <p className="text-slate-900 font-medium">{app.applicant.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Number</p>
              <p className="text-slate-900 font-medium">{app.applicant.contact}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</p>
              <p className="text-slate-900 font-medium">{app.applicant.address}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</p>
                <p className="text-slate-900 font-medium">{app.applicant.age}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sex</p>
                <p className="text-slate-900 font-medium capitalize">{app.applicant.sex}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Civil Status</p>
                <p className="text-slate-900 font-medium capitalize">{app.applicant.civilStatus}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Religion</p>
                <p className="text-slate-900 font-medium">{app.applicant.religion}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Education</p>
              <p className="text-slate-900 font-medium">{app.applicant.education}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligibility</p>
              <p className="text-slate-900 font-medium">{app.applicant.eligibility}</p>
            </div>
          </div>

          <div className="space-y-4 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <p className="text-sm font-bold text-primary flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              Application Documents
            </p>
            {app.applicant.pdsUrl ? (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-white" asChild>
                <a href={app.applicant.pdsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Personal Data Sheet (PDS)
                </a>
              </Button>
            ) : <p className="text-xs text-slate-500 italic">No PDS uploaded</p>}

            {app.applicant.letterUrl ? (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-white" asChild>
                <a href={app.applicant.letterUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Intent Letter
                </a>
              </Button>
            ) : <p className="text-xs text-slate-500 italic">No Intent Letter uploaded</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
      },
    });

    const standardEducation = app.position.standardEducation || 0;
    const standardTraining = app.position.standardTraining || 0;
    const standardExperience = app.position.standardExperience || 0;
    const applicantEducation = form.watch("applicantEducation");
    const incEdu = (applicantEducation || 0) - standardEducation;

    const onSubmit = (data: any) => {
      createIER.mutate({ id, data }, {
        onSuccess: () => toast({ title: "Evaluation Submitted" }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      });
    };

    if (app.ier) return <CompletedSection title="Initial Evaluation Result (IER)" data={app.ier} />;

    return (
      <Card className="print:hidden">
        <CardHeader><CardTitle>Initial Evaluation (IER)</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="eligibility" render={({ field }) => (
                  <FormItem><FormLabel>Eligibility Confirmed</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="remarks" render={({ field }) => (
                  <FormItem><FormLabel>Manual Override Result</FormLabel><FormControl>
                    <select {...field} className="w-full h-10 border rounded-md px-3 bg-transparent">
                      <option value="qualified">Qualified</option>
                      <option value="disqualified">Disqualified</option>
                    </select>
                  </FormControl></FormItem>
                )} />
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase text-slate-500">Qualification Standards & Applicant Levels</h3>
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border">
                  {['Education', 'Training', 'Experience'].map((item, idx) => {
                    const std = idx === 0 ? standardEducation : idx === 1 ? standardTraining : standardExperience;
                    const fieldName = idx === 0 ? "applicantEducation" : idx === 1 ? "applicantTraining" : "applicantExperience";
                    const appVal = form.watch(fieldName as any) || 0;
                    const inc = appVal - std;
                    return (
                      <div key={item} className={idx > 0 ? "border-l pl-4 space-y-4" : "space-y-4"}>
                        <p className="font-bold text-xs text-center">{item}</p>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Standard</p>
                          <p className="text-sm font-bold">{std}</p>
                        </div>
                        <FormField control={form.control} name={fieldName as any} render={({ field }) => (
                          <FormItem><FormLabel className="text-xs">Applicant (1-31)</FormLabel><FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl></FormItem>
                        )} />
                        <div className={`p-2 rounded text-center text-sm font-bold ${inc < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          Inc: {inc}
                          {inc < 0 && <p className="text-[10px] mt-1">BELOW STANDARD</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <FormField control={form.control} name="feedback" render={({ field }) => (
                <FormItem><FormLabel>Feedback (Optional)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <Button type="submit" disabled={createIER.isPending} className="w-full">
                {incEdu < 0 ? "Submit Disqualification" : "Submit Evaluation"}
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
        pbetLetLptRating: 0,
        classObs: 0,
        nonClassObs: 0,
      },
    });

    const onSubmit = (data: any) => {
      createIES.mutate({ id: app.ier!.ierId, data: { ...data, schoolId: Number(data.schoolId) } }, {
        onSuccess: () => toast({ title: "Assessment Submitted" }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      });
    };

    if (!app.ier || app.ier.remarks === "disqualified") return null;
    if (app.ies) return <CompletedSection title="Initial Evaluation Sheet (IES)" data={app.ies} />;

    return (
      <Card className="mt-8 border-yellow-200 bg-yellow-50/50 print:hidden">
        <CardHeader><CardTitle>Assessment Scoring (IES)</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="schoolId" render={({ field }) => (
                <FormItem><FormLabel>Assigned School</FormLabel><FormControl>
                  <select {...field} onChange={e => field.onChange(Number(e.target.value))} className="w-full h-10 border rounded-md px-3 bg-white">
                    {schools?.map(s => <option key={s.schoolId} value={s.schoolId}>{s.name}</option>)}
                  </select>
                </FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Education', 'Training', 'Experience'].map(item => (
                  <div key={item} className="space-y-2">
                    <FormLabel>{item} (Auto)</FormLabel>
                    <div className="h-10 px-3 py-2 rounded-md border bg-slate-100 text-slate-500 flex items-center text-xs">Auto-calculated</div>
                  </div>
                ))}
                <FormField control={form.control} name="pbetLetLptRating" render={({ field }) => (
                  <FormItem><FormLabel>PBET/LET/LPT Rating (Max 10)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="classObs" render={({ field }) => (
                  <FormItem><FormLabel>Classroom Obs (Max 35)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="nonClassObs" render={({ field }) => (
                  <FormItem><FormLabel>Non-Classroom Obs (Max 25)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
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
      },
    });

    const onSubmit = (data: any) => {
      createCAR.mutate({ id: app.ies!.iesId, data }, {
        onSuccess: () => toast({ title: "Finalized Application" }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      });
    };

    if (!app.ies) return null;
    if (app.car) return <CompletedSection title="Comparative Assessment Result (CAR)" data={app.car} />;

    return (
      <Card className="mt-8 border-purple-200 bg-purple-50/50 print:hidden">
        <CardHeader><CardTitle>Final Deliberation (CAR)</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="remarks" render={({ field }) => (
                <FormItem><FormLabel>Final Remarks</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="backgroundInvestigation" render={({ field }) => (
                  <FormItem><FormLabel>BI Result</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="forBi" render={({ field }) => (
                  <FormItem><FormLabel>Proceed to BI?</FormLabel><FormControl>
                    <select {...field} className="w-full h-10 border rounded-md px-3 bg-white">
                      <option value="yes">Yes</option><option value="no">No</option>
                    </select>
                  </FormControl></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="forAppointment" render={({ field }) => (
                  <FormItem><FormLabel>For Appointment</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="statusOfAppointment" render={({ field }) => (
                  <FormItem><FormLabel>Status of Appointment</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
              <Button type="submit" disabled={createCAR.isPending}>Finalize Assessment</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  };

  const CompletedSection = ({ title, data }: { title: string; data: any }) => (
    <Card className="mt-8 border-green-200 bg-green-50/50 print:hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <span className="text-xs font-bold text-green-600 uppercase bg-white px-2 py-1 rounded-full border border-green-200">Completed</span>
      </CardHeader>
      <CardContent>
        <pre className="text-[10px] text-slate-500 overflow-auto max-h-32 p-2 bg-white rounded border">{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-20">
        {app.ies && <IESTemplate application={app} />}
        
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 print:hidden">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={app.status} className="text-sm px-3 py-1" />
              <span className="text-slate-400 text-sm font-mono">{app.applicantCode}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">{app.applicant.name}</h1>
            <p className="text-slate-500">{app.position.position}</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {app.ies && (
              <Button onClick={() => window.print()} variant="outline" className="flex-1 sm:flex-none items-center gap-2">
                <Printer className="w-4 h-4" /> Print IES
              </Button>
            )}
          </div>
        </div>

        <ApplicantInfo />
        <IERSection />
        <IESSection />
        <CARSection />
      </div>
    </Layout>
  );
}
