import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PatientList from "@/components/patient-overview/PatientList";
import PatientDetails from "@/components/patient-overview/PatientDetails";
import PatientNotFoundNotice from "@/components/patient-overview/PatientNotFoundNotice";
import FloatingAIAgent from "@/components/referral/FloatingAIAgent";
import { PatientOverviewData } from "@/types";

const PatientOverview = () => {
	const [selectedPatient, setSelectedPatient] = useState<PatientOverviewData | null>(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const [patientNotFound, setPatientNotFound] = useState<string | null>(null);
	const navigate = useNavigate();
	
	const patientIdFromQuery = searchParams.get('patientId');

	const handlePatientSelect = (patientData: PatientOverviewData) => {
		setSelectedPatient(patientData);
		// Clear any patient not found state when a patient is successfully selected
		setPatientNotFound(null);
	};

	const handleClearForm = () => {
		setSelectedPatient(null);
	};

	const handlePatientNotFound = (patientId: string) => {
		setPatientNotFound(patientId);
	};

	const handleDismissNotFound = () => {
		setPatientNotFound(null);
		// Remove the patientId from URL
		const newSearchParams = new URLSearchParams(searchParams);
		newSearchParams.delete('patientId');
		setSearchParams(newSearchParams);
	};

	const handleGoToSnapshot = () => {
		navigate('/patient-snapshot');
	};

	// Clear patient not found state when patient ID changes
	useEffect(() => {
		if (patientIdFromQuery && patientNotFound !== patientIdFromQuery) {
			setPatientNotFound(null);
		}
	}, [patientIdFromQuery, patientNotFound]);

	return (
		<>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Patient Overview</h1>
			</div>
			
			{/* Patient Not Found Notice */}
			{patientNotFound && (
				<div className="mb-6">
					<PatientNotFoundNotice
						patientId={patientNotFound}
						onDismiss={handleDismissNotFound}
						onGoToSnapshot={handleGoToSnapshot}
					/>
				</div>
			)}
			
			<div className="flex flex-col md:flex-row gap-6 w-full items-stretch h-[calc(100vh-200px)]">
				<div className="w-full md:w-[65%] min-w-0 flex">
					<PatientDetails selectedPatient={selectedPatient} />
				</div>
				<aside className="w-full md:w-[35%] min-w-0 flex max-h-full">
					<PatientList
						onPatientSelect={handlePatientSelect}
						onClearForm={handleClearForm}
						initialPatientId={patientIdFromQuery}
						onPatientNotFound={handlePatientNotFound}
					/>
				</aside>
			</div>
			<FloatingAIAgent />
		</>
	);
};

export default PatientOverview;
