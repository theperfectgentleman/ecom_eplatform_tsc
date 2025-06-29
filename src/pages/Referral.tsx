import React, { useState } from "react";
import ReferralForm from "@/components/referral/ReferralForm";
import CaseTable from "@/components/referral/CaseTable";
import FloatingAIAgent from "@/components/referral/FloatingAIAgent";

const Referral = () => {
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [formKey, setFormKey] = useState(0);

  const handleCaseSelect = (caseData: any) => {
    setSelectedCase(caseData);
    setFormKey((k) => k + 1); // force re-mount to clear form state
  };

  const handleClearForm = () => {
    setSelectedCase(null);
    setFormKey((k) => k + 1);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 w-full h-[calc(100vh-60px)] overflow-hidden">
        <div className="flex-1 min-w-0">
          <ReferralForm key={formKey} initialData={selectedCase} onClear={handleClearForm} onCaseCreated={() => {}} />
        </div>
        <aside className="w-full md:w-[400px] lg:w-[480px] xl:w-[520px] h-full overflow-hidden">
          <CaseTable onCaseSelect={handleCaseSelect} onClearForm={handleClearForm} />
        </aside>
      </div>
      <FloatingAIAgent />
    </>
  );
};

export default Referral;
