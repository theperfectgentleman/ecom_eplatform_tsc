import ReferralForm from "@/components/referral/ReferralForm";
import CaseTable from "@/components/referral/CaseTable";
import FloatingAIAgent from "@/components/referral/FloatingAIAgent";

const Referral = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="flex-1 min-w-0">
          <ReferralForm />
        </div>
        <aside className="w-full md:w-[400px] lg:w-[480px] xl:w-[520px]">
          <CaseTable />
        </aside>
      </div>
      <FloatingAIAgent />
    </>
  );
};

export default Referral;
