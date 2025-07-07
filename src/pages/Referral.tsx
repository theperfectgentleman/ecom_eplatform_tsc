import React, { useState } from "react";
import ReferralForm from "@/components/referral/ReferralForm";
import CaseTable from "@/components/referral/CaseTable";
import FloatingAIAgent from "@/components/referral/FloatingAIAgent";

const Referral = () => {
	const [selectedCase, setSelectedCase] = useState<any | null>(null);
	const [refreshList, setRefreshList] = useState(false);
	const [isReadOnly, setIsReadOnly] = useState(true);
	const [formKey, setFormKey] = useState(0); // Add this to force remount

	const handleCaseSelect = (caseData: any, readOnly: boolean) => {
		setSelectedCase(caseData);
		setIsReadOnly(readOnly);
		setFormKey((prevKey) => prevKey + 1); // Increment key to force remount
	};

	const handleClearForm = () => {
		setSelectedCase(null);
		setIsReadOnly(true); // Reset to read-only when clearing
		setFormKey((prevKey) => prevKey + 1); // Increment key to force remount
	};

	const handleNewCase = () => {
		setSelectedCase(null);
		setIsReadOnly(false); // Not read-only for new case creation
		setFormKey((prevKey) => prevKey + 1); // Increment key to force remount
	};

	const handleCaseCreated = () => {
		setRefreshList((prev) => !prev); // Toggle to trigger list refresh
	};

	return (
		<>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Patient Referrals</h1>
			</div>
			<div className="flex flex-col md:flex-row gap-6 w-full">
				<div className="w-full md:w-[65%] min-w-0">
					<ReferralForm
						key={formKey} // Add key here to force remount when case is selected
						initialData={selectedCase}
						onCancel={handleClearForm}
						onCaseCreated={handleCaseCreated}
						isReadOnly={isReadOnly}
						onNewCase={handleNewCase}
					/>
				</div>
				<aside className="w-full md:w-[35%] min-w-0">
					<CaseTable
						onCaseSelect={handleCaseSelect}
						onClearForm={handleClearForm}
						refreshList={refreshList}
					/>
				</aside>
			</div>
			<FloatingAIAgent />
		</>
	);
};

export default Referral;
