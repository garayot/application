import { Position, Applicant, ApplicationCode, IER } from "@shared/schema";
import { format } from "date-fns";

type FullApplication = ApplicationCode & {
  applicant: Applicant;
  position: Position;
  ier?: IER;
};

interface IERPrintProps {
  applications: FullApplication[];
  position?: Position;
}

export function IERPrint({ applications, position }: IERPrintProps) {
  // Ensure we have 10 rows as requested
  const displayRows = [...applications];
  while (displayRows.length < 10) {
    displayRows.push({} as any);
  }

  return (
    <div className="print-only font-serif p-8 w-[297mm] mx-auto text-[10pt]" style={{ fontFamily: "'Times New Roman', serif" }}>
      <div className="relative mb-8">
        <div className="absolute top-0 right-0 font-bold">Annex D</div>
        <div className="text-center">
          <h1 className="text-xl font-bold uppercase underline">Initial Evaluation Result (IER)</h1>
        </div>
      </div>

      <div className="mb-4 space-y-1">
        <div><span className="font-bold">Position:</span> <span className="underline px-2">{position?.position || "____________________"}</span></div>
        <div><span className="font-bold">Salary Grade and Monthly Salary:</span> <span className="underline px-2">{position ? `SG ${position.salaryGrade} - ₱${position.monthlySalary}` : "____________________"}</span></div>
      </div>

      <div className="mb-6 space-y-1">
        <h2 className="font-bold underline uppercase">Qualification Standards Section</h2>
        <div><span className="font-bold italic">Education:</span> <span className="underline px-2">{position?.standardEducation ? `${position.standardEducation} units/degree` : "____________________"}</span></div>
        <div><span className="font-bold italic">Training:</span> <span className="underline px-2">{position?.standardTraining ? `${position.standardTraining} hours` : "____________________"}</span></div>
        <div><span className="font-bold italic">Experience:</span> <span className="underline px-2">{position?.standardExperience ? `${position.standardExperience} months` : "____________________"}</span></div>
        <div><span className="font-bold italic">Eligibility:</span> <span className="underline px-2">____________________</span></div>
      </div>

      <table className="w-full border-collapse border border-black text-[9pt]">
        <thead>
          <tr>
            <th rowSpan={2} className="border border-black p-1 text-center w-8">No.</th>
            <th rowSpan={2} className="border border-black p-1 text-center w-24">Application Code</th>
            <th rowSpan={2} className="border border-black p-1 text-center w-32">Names of Applicant</th>
            <th colSpan={8} className="border border-black p-1 text-center">Personal Information</th>
            <th colSpan={2} className="border border-black p-1 text-center">Education</th>
            <th colSpan={2} className="border border-black p-1 text-center">Training</th>
            <th colSpan={2} className="border border-black p-1 text-center">Experience</th>
            <th rowSpan={2} className="border border-black p-1 text-center w-24">Eligibility</th>
            <th rowSpan={2} className="border border-black p-1 text-center w-24">Remarks (Qualified or Disqualified)</th>
          </tr>
          <tr>
            <th className="border border-black p-1 text-center text-[7pt]">Address</th>
            <th className="border border-black p-1 text-center text-[7pt]">Age</th>
            <th className="border border-black p-1 text-center text-[7pt]">Sex</th>
            <th className="border border-black p-1 text-center text-[7pt]">Civil Status</th>
            <th className="border border-black p-1 text-center text-[7pt]">Religion</th>
            <th className="border border-black p-1 text-center text-[7pt]">Disability</th>
            <th className="border border-black p-1 text-center text-[7pt]">Ethnic Group</th>
            <th className="border border-black p-1 text-center text-[7pt]">Email / Contact</th>
            <th className="border border-black p-1 text-center text-[7pt]">Title</th>
            <th className="border border-black p-1 text-center text-[7pt]">Units</th>
            <th className="border border-black p-1 text-center text-[7pt]">Title</th>
            <th className="border border-black p-1 text-center text-[7pt]">Hours</th>
            <th className="border border-black p-1 text-center text-[7pt]">Details</th>
            <th className="border border-black p-1 text-center text-[7pt]">Years</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.slice(0, 10).map((app, index) => (
            <tr key={index} className="h-10">
              <td className="border border-black p-1 text-center">{index + 1}</td>
              <td className="border border-black p-1 text-center font-mono text-[8pt]">{app?.applicantCode || ""}</td>
              <td className="border border-black p-1 text-left">{app?.applicant?.name || ""}</td>
              <td className="border border-black p-1 text-left text-[7pt] truncate max-w-[80px]">{app?.applicant?.address || ""}</td>
              <td className="border border-black p-1 text-center">{app?.applicant?.age || ""}</td>
              <td className="border border-black p-1 text-center">{app?.applicant?.sex || ""}</td>
              <td className="border border-black p-1 text-center">{app?.applicant?.civilStatus || ""}</td>
              <td className="border border-black p-1 text-center">{app?.applicant?.religion || ""}</td>
              <td className="border border-black p-1 text-center">{app?.applicant?.disability || ""}</td>
              <td className="border border-black p-1 text-center">{app?.applicant?.ethnicGroup || ""}</td>
              <td className="border border-black p-1 text-left text-[7pt]">{app?.applicant?.email ? `${app.applicant.email} / ${app.applicant.contact}` : ""}</td>
              <td className="border border-black p-1 text-center">{app?.applicant?.education || ""}</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-center">{app?.applicant?.training ? `${app.applicant.training}h` : ""}</td>
              <td className="border border-black p-1 text-center"></td>
              <td className="border border-black p-1 text-center">{app?.applicant?.experience ? `${Math.floor(Number(app.applicant.experience) / 12)}y` : ""}</td>
              <td className="border border-black p-1 text-center">{app?.applicant?.eligibility || ""}</td>
              <td className="border border-black p-1 text-center font-bold">
                {app?.ier?.remarks?.toUpperCase() || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 flex justify-end">
        <div className="text-center w-64">
          <p className="mb-8">Prepared and certified correct by:</p>
          <div className="border-b border-black mb-1"></div>
          <p className="font-bold">(Name and signature)</p>
          <p>Human Resource Management Officer</p>
          <p className="mt-4 text-left">Date: <span className="underline px-4">{format(new Date(), "MMMM dd, yyyy")}</span></p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 0;
            margin: 0;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}} />
    </div>
  );
}
