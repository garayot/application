import { Layout } from "@/components/layout/Sidebar";
import { usePositions } from "@/hooks/use-applications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPositionSchema } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminHiring() {
  const { data: positions, isLoading } = usePositions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(insertPositionSchema),
    defaultValues: {
      position: "",
      salaryGrade: 0,
      monthlySalary: "0",
      standardEducation: 0,
      standardTraining: 0,
      standardExperience: 0,
      schoolYear: "",
      levels: "",
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/positions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      form.reset();
      toast({ title: "Position posted successfully" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PATCH", `/api/positions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      setEditingId(null);
      form.reset();
      toast({ title: "Position updated successfully" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/positions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      toast({ title: "Position deleted" });
    }
  });

  const onSubmit = (data: any) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (pos: any) => {
    setEditingId(pos.positionId);
    form.reset({
      position: pos.position,
      salaryGrade: pos.salaryGrade,
      monthlySalary: pos.monthlySalary,
      standardEducation: pos.standardEducation,
      standardTraining: pos.standardTraining,
      standardExperience: pos.standardExperience,
      schoolYear: pos.schoolYear || "",
      levels: pos.levels || "",
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-display font-bold">Hiring Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Hiring Post" : "Post New Hiring"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="position" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="salaryGrade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Grade</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="monthlySalary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="standardEducation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Standard (1-31)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="standardTraining" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Standard (1-31)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="standardExperience" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Standard (1-31)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="schoolYear" render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Year (e.g. 2026-2027)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="levels" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          <option value="">Select Level</option>
                          <option value="kinder">Kinder</option>
                          <option value="elementary">Elementary</option>
                          <option value="Junior High School">Junior High School</option>
                          <option value="Senior High School">Senior High School</option>
                          <option value="IP Education">IP Education</option>
                          <option value="Special education">Special education</option>
                          <option value="NTP/Not Applicable">NTP/Not Applicable</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex items-center gap-2">
                    {editingId ? "Update Post" : <><Plus className="w-4 h-4" /> Post Hiring</>}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset(); }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Hiring Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>SY</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>SG</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Standards (E/T/X)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions?.map((pos: any) => (
                  <TableRow key={pos.positionId}>
                    <TableCell className="font-medium">{pos.position}</TableCell>
                    <TableCell>{pos.schoolYear}</TableCell>
                    <TableCell className="capitalize">{pos.levels}</TableCell>
                    <TableCell>{pos.salaryGrade}</TableCell>
                    <TableCell>{pos.monthlySalary}</TableCell>
                    <TableCell>{pos.standardEducation}/{pos.standardTraining}/{pos.standardExperience}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(pos)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deleteMutation.mutate(pos.positionId)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
