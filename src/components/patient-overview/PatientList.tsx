import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "@/lib/useApi";
import { useToast } from "@/components/ui/toast/useToast";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";
import { PatientOverviewData } from "@/types";
import { Input } from "../ui/input";
import { Search, User } from "lucide-react";

// Custom CSS to hide the scrollbar
const listStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .custom-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

interface PatientListProps {
	onPatientSelect: (patientData: PatientOverviewData) => void;
	onClearForm: () => void;
}

const PatientList: React.FC<PatientListProps> = ({
	onPatientSelect,
	onClearForm,
}) => {
	const [patients, setPatients] = useState<PatientOverviewData[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	
	const { request } = useApi();
	const { toast } = useToast();
	const { filterByAccessLevel } = useAccessLevelFilter();

	const calculateAge = (yearOfBirth: number): number => {
		const currentYear = new Date().getFullYear();
		return currentYear - yearOfBirth;
	};

	// Helper function to format full name
	const formatFullName = (patient: PatientOverviewData): string => {
		const surname = patient.name || '';
		const otherNames = patient.othernames || '';
		
		if (surname && otherNames) {
			return `${otherNames} ${surname}`;
		}
		if (surname) {
			return surname;
		}
		if (otherNames) {
			return otherNames;
		}
		return 'No name';
	};

	const fetchPatients = useCallback(async () => {
		setIsLoading(true);
		try {
			// Add cache busting parameter to ensure fresh data
			const timestamp = new Date().getTime();
			const response = await request<PatientOverviewData[]>({
				method: "GET",
				path: `patients?_t=${timestamp}`,
			});

			if (response && Array.isArray(response)) {
				// Calculate age for each patient
				const patientsWithAge = response.map(patient => ({
					...patient,
					age: patient.year_of_birth ? calculateAge(patient.year_of_birth) : undefined
				}));

				const filteredPatients = filterByAccessLevel(patientsWithAge);
				setPatients(filteredPatients);
			} else {
				setPatients([]);
			}
		} catch (error) {
			console.error("Error fetching patients:", error);
			toast({
				title: "Error",
				description: "Failed to fetch patients. Please try again.",
				variant: "error",
			});
			setPatients([]);
		} finally {
			setIsLoading(false);
		}
	}, [request, filterByAccessLevel, toast]);

	const fetchPatientWithUserDetails = useCallback(async (patientId: string) => {
		try {
			// Fetch patient details with assigned user information
			const patientResponse = await request<PatientOverviewData>({
				method: "GET",
				path: `patients/${patientId}`,
			});

			if (patientResponse) {
				// If patient has assigned_user_id, fetch user details
				if (patientResponse.assigned_user_id) {
					try {
						const userResponse = await request<any>({
							method: "GET",
							path: `accounts/${patientResponse.assigned_user_id}`,
						});
						
						if (userResponse) {
							patientResponse.assigned_user = {
								id: userResponse.user_id,
								firstname: userResponse.firstname,
								lastname: userResponse.lastname,
								username: userResponse.username,
								user_type: userResponse.user_type
							};
						}
					} catch (userError) {
						console.warn("Could not fetch user details:", userError);
					}
				}

				// Calculate age
				if (patientResponse.year_of_birth) {
					patientResponse.age = calculateAge(patientResponse.year_of_birth);
				}

				onPatientSelect(patientResponse);
			}
		} catch (error) {
			console.error("Error fetching patient details:", error);
			toast({
				title: "Error",
				description: "Failed to fetch patient details. Please try again.",
				variant: "error",
			});
		}
	}, [request, onPatientSelect, toast, calculateAge]);

	useEffect(() => {
		fetchPatients();
	}, [fetchPatients]);

	const filteredPatients = useMemo(() => {
		if (!searchTerm.trim()) return patients;

		const searchLower = searchTerm.toLowerCase();
		return patients.filter((patient) => {
			const searchFields = [
				patient.name?.toLowerCase(),
				patient.othernames?.toLowerCase(),
				formatFullName(patient).toLowerCase(),
				patient.patient_code?.toLowerCase(),
				patient.contact_number?.toLowerCase(),
				patient.national_id?.toLowerCase(),
			];

			return searchFields.some(field => field?.includes(searchLower));
		});
	}, [patients, searchTerm]);

	const handlePatientClick = useCallback((patient: PatientOverviewData) => {
		setSelectedPatientId(patient.patient_id);
		fetchPatientWithUserDetails(patient.patient_id);
	}, [fetchPatientWithUserDetails]);

	const handleClear = useCallback(() => {
		setSelectedPatientId(null);
		onClearForm();
	}, [onClearForm]);

	return (
		<>
			<style>{listStyles}</style>
			<div className="bg-white rounded-lg shadow-sm border w-full flex flex-col min-h-full">
				<div className="p-4 border-b border-gray-200 flex-shrink-0">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold text-gray-900">
							Patients ({filteredPatients.length})
						</h2>
						{selectedPatientId && (
							<button
								onClick={handleClear}
								className="text-sm text-blue-600 hover:text-blue-800 font-medium"
							>
								Clear Selection
							</button>
						)}
					</div>

					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							type="text"
							placeholder="Search by name, code, phone, or national ID..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<div className="custom-scrollbar flex-1 overflow-y-auto min-h-0">
					{isLoading ? (
						<div className="p-8 text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
							<p className="text-sm text-gray-500 mt-2">Loading patients...</p>
						</div>
					) : filteredPatients.length === 0 ? (
						<div className="p-8 text-center text-gray-500">
							<User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
							<p className="text-sm">
								{searchTerm ? "No patients found matching your search." : "No patients available."}
							</p>
						</div>
					) : (
						<div className="divide-y divide-gray-100">
							{filteredPatients.map((patient) => (
								<div
									key={patient.patient_id}
									onClick={() => handlePatientClick(patient)}
									className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
										selectedPatientId === patient.patient_id
											? "bg-blue-50 border-l-4 border-blue-500"
											: ""
									}`}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1 min-w-0">
											<h3 className="text-sm font-medium text-gray-900 truncate">
												{formatFullName(patient)}
											</h3>
											<div className="mt-1 space-y-1">
												{patient.age && (
													<p className="text-xs text-gray-600">
														Age: {patient.age} years
													</p>
												)}
												{patient.contact_number && (
													<p className="text-xs text-gray-600">
														Phone: {patient.contact_number}
													</p>
												)}
												{patient.patient_code && (
													<p className="text-xs text-gray-500">
														Code: {patient.patient_code}
													</p>
												)}
											</div>
										</div>
										<div className="ml-2 flex-shrink-0">
											<div className="flex items-center space-x-1">
												{patient.gender && (
													<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
														{patient.gender}
													</span>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default PatientList;
