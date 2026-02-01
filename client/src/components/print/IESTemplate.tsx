import { cn } from "@/lib/utils";

interface IESTemplateProps {
  application: any;
}

export function IESTemplate({ application: app }: IESTemplateProps) {
  const ies = app.ies;
  if (!ies) return null;

  return (
    <div className="hidden print:block font-serif text-slate-900 p-8 max-w-[8.5in] mx-auto bg-white min-h-[11in]">
      <style>{`
        @media print {
          @page { size: portrait; margin: 0.5in; }
          body { -webkit-print-color-adjust: exact; }
          .print-table th { background-color: #f1f5f9 !important; }
        }
      `}</style>
      
      <div className="text-right text-[10px] font-bold italic mb-4">Annex G-1</div>
      
      <h1 className="text-center font-bold text-xl mb-8 uppercase underline tracking-wider">
        Individual Evaluation Sheet (IES)
      </h1>

      <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-8 text-sm">
        <div className="flex gap-2">
          <span className="whitespace-nowrap">Name of Applicant:</span>
          <span className="border-b border-slate-900 flex-1 font-bold">{app.applicant.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="whitespace-nowrap">Application code:</span>
          <span className="border-b border-slate-900 flex-1 font-mono font-bold">{app.applicantCode}</span>
        </div>
        <div className="flex gap-2">
          <span className="whitespace-nowrap">Position Applied For:</span>
          <span className="border-b border-slate-900 flex-1">{app.position.position}</span>
        </div>
        <div className="flex gap-2"></div>
        <div className="flex gap-2">
          <span className="whitespace-nowrap">Schools Division Office:</span>
          <span className="border-b border-slate-900 flex-1">{ies.schoolName || "Bislig City Division Office"}</span>
        </div>
        <div className="flex gap-2"></div>
        <div className="flex gap-2">
          <span className="whitespace-nowrap">Contact Number:</span>
          <span className="border-b border-slate-900 flex-1">{app.applicant.contact}</span>
        </div>
        <div className="flex gap-2"></div>
        <div className="flex gap-2">
          <span className="whitespace-nowrap">Job Group/SG-Level:</span>
          <span className="border-b border-slate-900 flex-1">SG-{app.position.salaryGrade}</span>
        </div>
        <div className="flex gap-2"></div>
      </div>

      <table className="w-full border-collapse border-[1.5px] border-slate-900 text-[11px] mb-8 print-table">
        <thead>
          <tr className="bg-slate-100">
            <th rowSpan={2} className="border border-slate-900 p-3 text-center w-[25%] uppercase font-bold">Criteria</th>
            <th rowSpan={2} className="border border-slate-900 p-3 text-center w-[12%] uppercase font-bold">Weight Allocation</th>
            <th colSpan={3} className="border border-slate-900 p-2 text-center uppercase font-bold">Applicant's Actual Qualifications</th>
          </tr>
          <tr className="bg-slate-100">
            <th className="border border-slate-900 p-2 text-center w-[25%] font-bold">Details of Applicant's Qualifications</th>
            <th className="border border-slate-900 p-2 text-center w-[20%] font-bold">Computation</th>
            <th className="border border-slate-900 p-2 text-center w-[18%] font-bold uppercase">Actual Score</th>
          </tr>
        </thead>
        <tbody>
          <CriteriaRow 
            label="Education" 
            weight={10} 
            details={app.applicant.education} 
            computation={`${app.ier?.applicantEducation || 0} Level(s)`} 
            score={ies.education} 
          />
          <CriteriaRow 
            label="Training" 
            weight={10} 
            details={`${app.applicant.training || 0} Hours`} 
            computation={`${app.ier?.applicantTraining || 0} Level(s)`} 
            score={ies.training} 
          />
          <CriteriaRow 
            label="Experience" 
            weight={10} 
            details={`${app.applicant.experience || 0} Year(s)`} 
            computation={`${app.ier?.applicantExperience || 0} Level(s)`} 
            score={ies.experience} 
          />
          <CriteriaRow 
            label="PBET/LET/LEPT Rating" 
            weight={10} 
            details="Professional Rating" 
            computation="Standard Rating" 
            score={ies.pbetLetLptRating} 
          />
          <CriteriaRow 
            label={<span>PPST Classroom Observable Indicators<br/><span className="text-[9px] font-normal">(Demonstration Teaching using COT-RSP)</span></span>} 
            weight={35} 
            details="Observation Result" 
            computation="COT Tool" 
            score={ies.classObs} 
          />
          <CriteriaRow 
            label={<span>PPST Non-Classroom Observable Indicators<br/><span className="text-[9px] font-normal">(Teacher Reflection)</span></span>} 
            weight={25} 
            details="Reflection Notes" 
            computation="Evaluation Tool" 
            score={ies.nonClassObs} 
          />
          <tr className="font-bold text-white bg-slate-700">
            <td className="border border-slate-900 p-2 text-center uppercase">Total</td>
            <td className="border border-slate-900 p-2 text-center">100</td>
            <td colSpan={2} className="border border-slate-900"></td>
            <td className="border border-slate-900 p-2 text-center text-black bg-white font-black text-sm">{ies.actualScore}</td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-6 text-[11px] leading-relaxed">
        <p>
          I hereby attest to the conduct of the application and assessment process in accordance with the applicable guidelines; and acknowledge, upon discussion with the Human Resource Merit Promotion and Selection Board (HRMPSB), the results of the comparative assessment and the points given to me based on my qualifications and submitted documentary requirements for the <span className="font-bold">[{app.position.position}]</span> under <span className="font-bold">[{ies.schoolName || "insert office where vacancy exists"}]</span>.
        </p>
        <p>
          Furthermore, I hereby affix my signature in this Form to attest to the objective and judicious conduct of the HRMPSB evaluation through Open Ranking System.
        </p>
      </div>

      <div className="mt-16 flex flex-col items-end">
        <div className="w-[250px] border-t border-slate-900 pt-1 text-center font-bold">
          Name and Signature of Applicant
        </div>
        <div className="w-[250px] pt-1 text-center italic text-slate-500">
          Date: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="mt-12 space-y-8">
        <div className="text-sm">Attested:</div>
        <div className="w-[250px] border-t border-slate-900 pt-1 text-center font-bold">
          HRMPSB Chair
        </div>
      </div>
    </div>
  );
}

function CriteriaRow({ label, weight, details, computation, score }: any) {
  return (
    <tr>
      <td className="border border-slate-900 p-3 font-medium">{label}</td>
      <td className="border border-slate-900 p-3 text-center">{weight}</td>
      <td className="border border-slate-900 p-2 text-center">{details}</td>
      <td className="border border-slate-900 p-2 text-center">{computation}</td>
      <td className="border border-slate-900 p-2 text-center font-bold">{score}</td>
    </tr>
  );
}
