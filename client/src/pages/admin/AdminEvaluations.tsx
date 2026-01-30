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
import { Loader2 } from "lucide-react";

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filteredApps = applications?.filter(
    (app) => !selectedPositionId || app.positionId === Number(selectedPositionId)
  );

  return (
    <div className="p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Evaluation Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Position:</label>
            <Select
              value={selectedPositionId}
              onValueChange={setSelectedPositionId}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a position" />
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

      {!selectedPositionId || selectedPositionId === "all" ? (
        <div className="text-center py-12 bg-muted rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">Please select a position to display applicants.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Applicant List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Personal Info</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Training</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps?.map((app) => (
                  <TableRow key={app.appCodeId}>
                    <TableCell className="font-medium">{app.applicantCode}</TableCell>
                    <TableCell>{app.applicant.name}</TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <p>Age: {app.applicant.age}</p>
                        <p>Sex: {app.applicant.sex}</p>
                        <p>Status: {app.applicant.civilStatus}</p>
                        <p>Religion: {app.applicant.religion}</p>
                        {app.applicant.disability && <p>Disability: {app.applicant.disability}</p>}
                        {app.applicant.ethnicGroup && <p>Ethnic: {app.applicant.ethnicGroup}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{app.applicant.education}</TableCell>
                    <TableCell>{app.applicant.training} hrs</TableCell>
                    <TableCell>{app.applicant.experience} mos</TableCell>
                    <TableCell>{app.applicant.eligibility}</TableCell>
                    <TableCell>
                      {app.status === "qualified" || app.status === "disqualified" ? (
                        <Badge variant={app.status === "qualified" ? "default" : "destructive"}>
                          {app.status.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Pending IER</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredApps?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
  );
}
