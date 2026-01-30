import { Position, Applicant, ApplicationCode, IER } from "@shared/schema";

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
  // Group applications into pages of 10
  const pages: FullApplication[][] = [];
  const limit = 10;
  
  if (applications.length === 0) {
    pages.push([]);
  } else {
    for (let i = 0; i < applications.length; i += limit) {
      pages.push(applications.slice(i, i + limit));
    }
  }

  return (
    <div className="print-only">
      {pages.map((pageApps, pageIndex) => (
        <div 
          key={pageIndex} 
          className="font-serif p-4 w-[297mm] mx-auto text-[8pt] page-break-after-always last:page-break-after-auto" 
          style={{ 
            fontFamily: "'Times New Roman', serif", 
            color: "black",
            minHeight: "210mm",
            position: "relative"
          }}
        >
          <div className="relative mb-6">
            <div className="absolute top-0 right-0 font-italic text-[10pt]" style={{ fontStyle: 'italic' }}>Annex D</div>
            <div className="text-center">
              <h1 className="text-[12pt] font-bold uppercase">INITIAL EVALUATION RESULT (IER)</h1>
            </div>
          </div>

          <div className="mb-4 text-[10pt]">
            <div className="flex items-center">
              <span className="w-48">Position:</span>
              <span className="border-b border-black flex-1 min-h-[1.2em]">{position?.position || ""}</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="w-48">Salary Grade and Monthly Salary:</span>
              <span className="border-b border-black flex-1 min-h-[1.2em]">
                {position ? `SG ${position.salaryGrade} - ₱${position.monthlySalary}` : ""}
              </span>
            </div>
            <div className="mt-1">Qualification Standards:</div>
            <div className="ml-8 space-y-1 mt-1">
              <div className="flex items-center">
                <span className="w-40">Education</span>
                <span className="border-b border-black flex-1 min-h-[1.2em]">{position?.standardEducation ? `${position.standardEducation} units/degree` : ""}</span>
              </div>
              <div className="flex items-center">
                <span className="w-40">Training</span>
                <span className="border-b border-black flex-1 min-h-[1.2em]">{position?.standardTraining ? `${position.standardTraining} hours` : ""}</span>
              </div>
              <div className="flex items-center">
                <span className="w-40">Experience</span>
                <span className="border-b border-black flex-1 min-h-[1.2em]">{position?.standardExperience ? `${position.standardExperience} months` : ""}</span>
              </div>
              <div className="flex items-center">
                <span className="w-40">Eligibility</span>
                <span className="border-b border-black flex-1 min-h-[1.2em]"></span>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse border border-black table-fixed">
            <thead>
              <tr className="bg-white">
                <th rowSpan={2} className="border border-black p-1 text-center w-[3%] text-[7pt]">No.</th>
                <th rowSpan={2} className="border border-black p-1 text-center w-[8%] text-[7pt]">Application Code</th>
                <th rowSpan={2} className="border border-black p-1 text-center w-[11%] text-[7pt]">Names of Applicant</th>
                <th colSpan={8} className="border border-black p-1 text-center text-[7pt]">Personal Information</th>
                <th rowSpan={2} className="border border-black p-1 text-center w-[7%] text-[7pt]">Education</th>
                <th colSpan={2} className="border border-black p-1 text-center text-[7pt]">Training</th>
                <th colSpan={2} className="border border-black p-1 text-center text-[7pt]">Experience</th>
                <th rowSpan={2} className="border border-black p-1 text-center w-[7%] text-[7pt]">Eligibility</th>
                <th rowSpan={2} className="border border-black p-1 text-center w-[8%] text-[7pt]">Remarks (Qualified or Disqualified)</th>
              </tr>
              <tr className="bg-white">
                <th className="border border-black p-0.5 text-center text-[6pt] w-[8%]">Address</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[3%]">Age</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[3%]">Sex</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[6%]">Civil Status</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[6%]">Religion</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[6%]">Disability</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[6%]">Ethnic Group</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[10%]">Email Address / Contact No.</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[6%]">Title</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[3%]">Hours</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[6%]">Details</th>
                <th className="border border-black p-0.5 text-center text-[6pt] w-[3%]">Years</th>
              </tr>
            </thead>
            <tbody>
              {pageApps.map((app, index) => (
                <tr key={index} className="h-10">
                  <td className="border border-black p-1 text-center text-[7pt]">{pageIndex * limit + index + 1}</td>
                  <td className="border border-black p-1 text-center text-[7pt] font-mono">{app?.applicantCode || ""}</td>
                  <td className="border border-black p-1 text-left text-[7pt] uppercase">{app?.applicant?.name || ""}</td>
                  <td className="border border-black p-1 text-left text-[6pt] break-words">{app?.applicant?.address || ""}</td>
                  <td className="border border-black p-1 text-center text-[7pt]">{app?.applicant?.age || ""}</td>
                  <td className="border border-black p-1 text-center text-[7pt]">{app?.applicant?.sex || ""}</td>
                  <td className="border border-black p-1 text-center text-[7pt]">{app?.applicant?.civilStatus || ""}</td>
                  <td className="border border-black p-1 text-center text-[7pt]">{app?.applicant?.religion || ""}</td>
                  <td className="border border-black p-1 text-center text-[7pt]">{app?.applicant?.disability || ""}</td>
                  <td className="border border-black p-1 text-center text-[7pt]">{app?.applicant?.ethnicGroup || ""}</td>
                  <td className="border border-black p-1 text-left text-[6pt] break-words">
                    {app?.applicant?.email ? `${app.applicant.email} / ${app.applicant.contact}` : ""}
                  </td>
                  <td className="border border-black p-1 text-center text-[7pt]">{app?.applicant?.education || ""}</td>
                  <td className="border border-black p-1 text-center text-[7pt]"></td>
                  <td className="border border-black p-1 text-center text-[7pt]">
                    {app?.applicant?.training ? `${app.applicant.training}` : ""}
                  </td>
                  <td className="border border-black p-1 text-center text-[7pt]"></td>
                  <td className="border border-black p-1 text-center text-[7pt]">
                    {app?.applicant?.experience ? `${(Number(app.applicant.experience) / 12).toFixed(1)}` : ""}
                  </td>
                  <td className="border border-black p-1 text-center text-[7pt]">{app?.applicant?.eligibility || ""}</td>
                  <td className="border border-black p-1 text-center text-[7pt] font-bold uppercase">
                    {app?.ier?.remarks || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 flex flex-col items-end text-[10pt]">
            <div className="text-left w-80">
              <p>Prepared and certified correct by:</p>
              <div className="mt-12 border-b border-black w-full text-center font-bold italic underline">
                (Name and signature)
              </div>
              <div className="text-center">
                <p>Human Resource Management Officer</p>
                <p className="flex items-center justify-center mt-1">
                  Date: <span className="border-b border-black flex-1 ml-2 min-h-[1.2em]"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          .print-only { display: none; }
        }
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
            display: block !important;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          .page-break-after-always {
            page-break-after: always;
          }
          table { border: 1px solid black !important; }
          th, td { border: 1px solid black !important; }
        }
      `}} />
    </div>
  );
}
