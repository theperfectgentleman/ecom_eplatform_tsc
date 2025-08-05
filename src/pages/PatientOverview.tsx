import { useState } from "react";
import PatientList from "@/components/patient-overview/PatientList";
import PatientDetails from "@/components/patient-overview/PatientDetails";
import FloatingAIAgent from "@/components/referral/FloatingAIAgent";
import { PatientOverviewData } from "@/types";

const PatientOverview = () => {
	const [selectedPatient, setSelectedPatient] = useState<PatientOverviewData | null>(null);

	const handlePatientSelect = (patientData: PatientOverviewData) => {
		setSelectedPatient(patientData);
	};

	const handleClearForm = () => {
		setSelectedPatient(null);
	};

	return (
		<>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Patient Overview</h1>
			</div>
			<div className="flex flex-col md:flex-row gap-6 w-full">
				<div className="w-full md:w-[65%] min-w-0">
					<PatientDetails selectedPatient={selectedPatient} />
				</div>
				<aside className="w-full md:w-[35%] min-w-0">
					<PatientList
						onPatientSelect={handlePatientSelect}
						onClearForm={handleClearForm}
					/>
				</aside>
			</div>
			<FloatingAIAgent />
		</>
	);
};

export default PatientOverview;
