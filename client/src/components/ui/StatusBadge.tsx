import { cn } from "@/lib/utils";

type Status = "submitted" | "qualified" | "disqualified" | "under_assessment" | "finalized";

const styles = {
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  qualified: "bg-green-100 text-green-700 border-green-200",
  disqualified: "bg-red-100 text-red-700 border-red-200",
  under_assessment: "bg-yellow-100 text-yellow-700 border-yellow-200",
  finalized: "bg-purple-100 text-purple-700 border-purple-200",
};

const labels = {
  submitted: "Submitted",
  qualified: "Qualified",
  disqualified: "Disqualified",
  under_assessment: "Under Assessment",
  finalized: "Finalized",
};

export function StatusBadge({ status, className }: { status: string, className?: string }) {
  const normalizedStatus = status.toLowerCase() as Status;
  const style = styles[normalizedStatus] || "bg-slate-100 text-slate-700 border-slate-200";
  const label = labels[normalizedStatus] || status;

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      style,
      className
    )}>
      {label}
    </span>
  );
}
