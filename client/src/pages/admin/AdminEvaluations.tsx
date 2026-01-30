import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Position, ApplicationCode, Applicant, IER } from "@shared/schema";
import { Loader2, Search, Printer } from "lucide-react";
import { Layout } from "@/components/layout/Sidebar";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { IERPrint } from "@/components/IERPrint";

type FullApplication = ApplicationCode & {
  applicant: Applicant;
  position: Position;
  ier?: IER;
};

export default function AdminEvaluations() {
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");

  const { data: positions, isLoading: loadingPositions } = useQuery<Position[]>({
    queryKey: ["/api/positions"],
  });

  const { data: applications, isLoading: loadingApps } = useQuery<FullApplication[]>({
    queryKey: ["/api/applications"],
  });

  if (loadingPositions || loadingApps) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const selectedPosition = positions?.find(p => p.positionId === Number(selectedPositionId));

  const filteredApps = applications?.filter(
    (app) => !selectedPositionId || selectedPositionId === "all" || app.positionId === Number(selectedPositionId)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Evaluations (IER)</h1>
            <p className="text-slate-500 mt-1">Review and filter initial evaluation results for applicants.</p>
          </div>
          {selectedPositionId && selectedPositionId !== "all" && (
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print IER
            </Button>
          )}
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Evaluation Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Filter by Position:</label>
              <Select
                value={selectedPositionId}
                onValueChange={setSelectedPositionId}
              >
                <SelectTrigger className="w-[300px] bg-white border-slate-200">
                  <SelectValue placeholder="Select a position to view applicants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions?.map((pos) => (
                    <SelectItem key={pos.positionId} value={pos.positionId.toString()}>
                      {pos.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Hidden Print Content */}
        {selectedPositionId && selectedPositionId !== "all" && (
          <div className="hidden">
            <IERPrint 
              applications={filteredApps || []} 
              position={selectedPosition} 
            />
          </div>
        )}

        {!selectedPositionId || selectedPositionId === "all" ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-slate-500 font-medium">Please select a specific position to display the applicant evaluation list.</p>
          </div>
        ) : (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-900">App Code</TableHead>
                    <TableHead className="font-semibold text-slate-900">Applicant Name</TableHead>
                    <TableHead className="font-semibold text-slate-900">Personal Information</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-center">Education</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-center">Training</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-center">Experience</TableHead>
                    <TableHead className="font-semibold text-slate-900">Eligibility</TableHead>
                    <TableHead className="font-semibold text-slate-900 text-right">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps?.map((app) => (
                    <TableRow key={app.appCodeId} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-sm text-primary font-bold">{app.applicantCode}</TableCell>
                      <TableCell className="font-medium text-slate-900">{app.applicant.name}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1 text-slate-600">
                          <div className="flex gap-2">
                            <span className="font-medium">Age:</span> {app.applicant.age}
                            <span className="text-slate-300">|</span>
                            <span className="font-medium">Sex:</span> {app.applicant.sex}
                          </div>
                          <div className="flex gap-2">
                            <span className="font-medium">Status:</span> {app.applicant.civilStatus}
                            <span className="text-slate-300">|</span>
                            <span className="font-medium">Religion:</span> {app.applicant.religion}
                          </div>
                          {(app.applicant.disability || app.applicant.ethnicGroup) && (
                            <div className="flex gap-2 pt-0.5">
                              {app.applicant.disability && <span><span className="font-medium">Disability:</span> {app.applicant.disability}</span>}
                              {app.applicant.ethnicGroup && <span><span className="font-medium">Ethnicity:</span> {app.applicant.ethnicGroup}</span>}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{app.applicant.education}</TableCell>
                      <TableCell className="text-center font-medium">{app.applicant.training}h</TableCell>
                      <TableCell className="text-center font-medium">{app.applicant.experience}m</TableCell>
                      <TableCell className="text-slate-700">{app.applicant.eligibility}</TableCell>
                      <TableCell className="text-right">
                        {app.ier?.remarks ? (
                          <Badge 
                            variant={app.ier.remarks === "qualified" ? "default" : "destructive"}
                            className={app.ier.remarks === "qualified" ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : ""}
                          >
                            {app.ier.remarks.toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-xs italic bg-slate-100 px-2 py-1 rounded">Pending IER</span>
                        )}
                      </TableCell>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/application/${app.appCodeId}`}
                          className="text-primary font-medium hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </TableRow>
                  ))}
                  {filteredApps?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-20 text-slate-400 font-medium">
                        No applications found for this position.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
