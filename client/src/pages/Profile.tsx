import { Layout } from "@/components/layout/Sidebar";
import { useApplicantProfile, useUpdateApplicantProfile } from "@/hooks/use-applicants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicantSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { FileUp, Save } from "lucide-react";

export default function Profile() {
  const { data: profile, isLoading } = useApplicantProfile();
  const updateProfile = useUpdateApplicantProfile();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertApplicantSchema),
    defaultValues: {
      name: "", address: "", age: 18, sex: "", civilStatus: "",
      religion: "", disability: "", ethnicGroup: "", email: "",
      contact: "", education: "", training: 0, experience: 0,
      eligibility: "", pdsUrl: "", letterUrl: ""
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  const onSubmit = (data: any) => {
    // For numeric fields coming from text inputs
    const formattedData = {
      ...data,
      age: Number(data.age),
      training: Number(data.training),
      experience: Number(data.experience)
    };

    updateProfile.mutate(formattedData, {
      onSuccess: () => {
        toast({ title: "Profile Saved", description: "Your information has been updated." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900">Applicant Profile</h1>
          <p className="text-slate-500 mt-2">Manage your personal information and documents.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Personal Information */}
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="contact" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="age" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="sex" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sex</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                              <option value="">Select</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="civilStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Civil Status</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="disability" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disability</FormLabel>
                        <FormControl><Input {...field} placeholder="None or specify" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="ethnicGroup" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ethnic Group</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Tagalog" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="religion" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Religion</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                {/* Professional Info */}
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Qualifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="education" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Highest Educational Attainment</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Bachelor in Secondary Education" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="eligibility" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Eligibility</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. LET Passer" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="experience" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience (Months)</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="training" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Hours</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                {/* Documents (Mock) */}
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="pdsUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Data Sheet (PDS)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl><Input {...field} placeholder="File URL..." /></FormControl>
                          <Button type="button" variant="outline" size="icon"><FileUp className="w-4 h-4" /></Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="letterUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intent Letter</FormLabel>
                        <div className="flex gap-2">
                          <FormControl><Input {...field} placeholder="File URL..." /></FormControl>
                          <Button type="button" variant="outline" size="icon"><FileUp className="w-4 h-4" /></Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updateProfile.isPending} className="px-8 rounded-xl h-12 text-base font-semibold">
                    <Save className="w-4 h-4 mr-2" />
                    {updateProfile.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
