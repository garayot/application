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
import { Position, ApplicationCode, Applicant, IER, IES } from "@shared/schema";
import { Loader2, Search, Printer, Calculator, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Layout } from "@/components/layout/Sidebar";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type FullApplication = ApplicationCode & {
  applicant: Applicant;
  position: Position;
  ier?: IER;
  ies?: IES;
};

type SortOrder = "asc" | "desc" | null;

export default function AdminAssessments() {
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

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

  // Filter for applicants who have already calculated and submitted (IES exists)
  let filteredApps = applications?.filter(
    (app) => 
      app.ies && 
      (!selectedPositionId || selectedPositionId === "" || selectedPositionId === "all" || app.positionId === Number(selectedPositionId))
  ) || [];

  // Apply sorting
  if (sortOrder) {
    filteredApps = [...filteredApps].sort((a, b) => {
      const scoreA = Number(a.ies?.actualScore || 0);
      const scoreB = Number(b.ies?.actualScore || 0);
      return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
    });
  }

  const toggleSort = () => {
    setSortOrder((current) => {
      if (current === null) return "desc";
      if (current === "desc") return "asc";
      return null;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getSortIcon = () => {
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 ml-1" />;
    if (sortOrder === "desc") return <ArrowDown className="w-4 h-4 ml-1" />;
    return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Assessments (IES)</h1>
            <p className="text-slate-500 mt-1">Review finalized evaluation scores for qualified applicants.</p>
          </div>
          {selectedPositionId && selectedPositionId !== "all" && filteredApps && filteredApps.length > 0 && (
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print IES Summary
            </Button>
          )}
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Assessment Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Filter by Position:</label>
              <Select
                value={selectedPositionId}
                onValueChange={setSelectedPositionId}
              >
                <SelectTrigger className="w-[300px] bg-white border-slate-200">
                  <SelectValue placeholder="Select a position to view scores" />
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

        {(!selectedPositionId || selectedPositionId === "all") && (!filteredApps || filteredApps.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Calculator className="w-6 h-6" />
            </div>
            <p className="text-slate-500 font-medium">
              {filteredApps && filteredApps.length === 0 
                ? "No applicants have finalized assessments (IES) yet."
                : "Please select a specific position to display the finalized assessment scores."}
            </p>
          </div>
        ) : (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-900">App Code</TableHead>
                      <TableHead className="font-semibold text-slate-900">Applicant Name</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-center">Education</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-center">Training</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-center">Experience</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-center">LET/LPT</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-center">Class Obs</TableHead>
                      <TableHead className="font-semibold text-slate-900 text-center">Non-Class</TableHead>
                      <TableHead 
                        className="font-semibold text-slate-900 text-center cursor-pointer hover:bg-slate-100/50 transition-colors"
                        onClick={toggleSort}
                      >
                        <div className="flex items-center justify-center">
                          Total Score
                          {getSortIcon()}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-900 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps?.map((app) => (
                      <TableRow key={app.appCodeId} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-sm text-primary font-bold">{app.applicantCode}</TableCell>
                        <TableCell className="font-medium text-slate-900">{app.applicant.name}</TableCell>
                        <TableCell className="text-center font-medium">{app.ies?.education}</TableCell>
                        <TableCell className="text-center font-medium">{app.ies?.training}</TableCell>
                        <TableCell className="text-center font-medium">{app.ies?.experience}</TableCell>
                        <TableCell className="text-center font-medium">{app.ies?.pbetLetLptRating}</TableCell>
                        <TableCell className="text-center font-medium">{app.ies?.classObs}</TableCell>
                        <TableCell className="text-center font-medium">{app.ies?.nonClassObs}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            {app.ies?.actualScore}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/application/${app.appCodeId}`}>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">
                              Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredApps?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-20 text-slate-400 font-medium">
                          No finalized assessments found for this position.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
