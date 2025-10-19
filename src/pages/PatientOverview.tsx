import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PatientList from "@/components/patient-overview/PatientList";
import PatientDetails from "@/components/patient-overview/PatientDetails";
import PatientNotFoundNotice from "@/components/patient-overview/PatientNotFoundNotice";
import FloatingAIAgent from "@/components/referral/FloatingAIAgent";
import { PatientOverviewData } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Info } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const PATIENT_LIMIT_OPTIONS = [
	{ value: '500', label: '500 patients' },
	{ value: '1000', label: '1,000 patients' },
	{ value: '2000', label: '2,000 patients' },
	{ value: '3000', label: '3,000 patients' },
	{ value: '5000', label: '5,000 patients' },
	{ value: '10000', label: 'All patients (up to 10K)' },
];

const PatientOverview = () => {
	const [selectedPatient, setSelectedPatient] = useState<PatientOverviewData | null>(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const [patientNotFound, setPatientNotFound] = useState<string | null>(null);
	const [patientLimit, setPatientLimit] = useState<string>(PATIENT_LIMIT_OPTIONS[3].value); // Default to 3000
	const navigate = useNavigate();
	const { user } = useAuth();
	
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
				
				{/* Patient Limit Selector */}
				<Select value={patientLimit} onValueChange={setPatientLimit}>
					<SelectTrigger className="w-[220px]">
						<SelectValue placeholder="Select data scope" />
					</SelectTrigger>
					<SelectContent>
						{PATIENT_LIMIT_OPTIONS.map(option => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Access Level Notice */}
			{user && user.access_level !== 4 && (
				<div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-start gap-3">
						<Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
						<div className="flex-1">
							<h3 className="text-sm font-semibold text-blue-900 mb-1">
								Showing patients within your access level
							</h3>
							<p className="text-sm text-blue-700">
								{user.access_level === 3 && `You have access to patients in: ${user.region} Region`}
								{user.access_level === 2 && `You have access to patients in: ${user.district} District`}
								{user.access_level === 1 && `You have access to patients in: ${user.subdistrict} Subdistrict`}
								{user.access_level === 0 && `You have access to patients in: ${user.community_name} Community`}
							</p>
							<p className="text-xs text-blue-600 mt-1">
								<strong>Note:</strong> The Dashboard shows system-wide totals. The patient count here will be lower as it only includes patients you can manage.
							</p>
						</div>
					</div>
				</div>
			)}
			
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
						limit={Number(patientLimit)}
					/>
				</aside>
			</div>
			<FloatingAIAgent />
		</>
	);
};

export default PatientOverview;
