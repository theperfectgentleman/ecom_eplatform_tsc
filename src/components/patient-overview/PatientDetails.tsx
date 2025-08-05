import React, { useState, useEffect, useRef } from "react";
import { PatientOverviewData, AntenatalRegistration, AntenatalVisit } from "@/types";
import { useApi } from "@/lib/useApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerList } from "@/components/ui/shimmer";
import { Calendar, User, Phone, MapPin, Heart, Baby, Stethoscope, Clock } from "lucide-react";

interface PatientDetailsProps {
	selectedPatient: PatientOverviewData | null;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ selectedPatient }) => {
	const [antenatalRegistrations, setAntenatalRegistrations] = useState<AntenatalRegistration[]>([]);
	const [antenatalVisits, setAntenatalVisits] = useState<AntenatalVisit[]>([]);
	const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
	const [isLoadingVisits, setIsLoadingVisits] = useState(false);
	const [activeTab, setActiveTab] = useState("bio");
	const [showShimmer, setShowShimmer] = useState(false);

	const { optionalRequest } = useApi();
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		// Clear previous timeout and abort controller
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Reset tab to bio when new patient is selected
		setActiveTab("bio");

		if (selectedPatient?.patient_id) {
			// Clear previous data and show shimmer for antenatal sections
			setAntenatalRegistrations([]);
			setAntenatalVisits([]);
			setShowShimmer(true);

			// Set 2-second delay before calling antenatal APIs
			timeoutRef.current = setTimeout(() => {
				fetchAntenatalData(selectedPatient.patient_id);
			}, 2000);
		} else {
			setAntenatalRegistrations([]);
			setAntenatalVisits([]);
			setShowShimmer(false);
		}

		// Cleanup function
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [selectedPatient]);

	const fetchAntenatalData = async (patientId: number) => {
		// Create new abort controller for this request
		abortControllerRef.current = new AbortController();

		// Fetch antenatal registrations
		setIsLoadingRegistrations(true);
		try {
			const registrations = await optionalRequest<AntenatalRegistration[]>({
				method: "GET",
				path: `antenatal-registrations/patient/${patientId}`,
			});
			if (!abortControllerRef.current.signal.aborted) {
				setAntenatalRegistrations(registrations || []);
			}
		} catch (error: any) {
			if (!abortControllerRef.current.signal.aborted) {
				// Silently handle "no data found" cases
				setAntenatalRegistrations([]);
			}
		} finally {
			if (!abortControllerRef.current.signal.aborted) {
				setIsLoadingRegistrations(false);
			}
		}

		// Fetch antenatal visits
		setIsLoadingVisits(true);
		try {
			const visits = await optionalRequest<AntenatalVisit[]>({
				method: "GET",
				path: `antenatal-visits/patient/${patientId}`,
			});
			if (!abortControllerRef.current.signal.aborted) {
				setAntenatalVisits(visits || []);
			}
		} catch (error: any) {
			if (!abortControllerRef.current.signal.aborted) {
				// Silently handle "no data found" cases
				setAntenatalVisits([]);
			}
		} finally {
			if (!abortControllerRef.current.signal.aborted) {
				setIsLoadingVisits(false);
				setShowShimmer(false);
			}
		}
	};

	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString();
	};

	if (!selectedPatient) {
		return (
			<div className="bg-white rounded-lg shadow-sm border p-8 text-center">
				<User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
				<h2 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h2>
				<p className="text-sm text-gray-500">
					Select a patient from the list to view their details.
				</p>
			</div>
		);
	}

	const renderPatientBio = () => (
		<div className="p-6 space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center space-x-2">
							<User className="h-5 w-5" />
							<span>Personal Information</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<label className="text-sm font-medium text-gray-700">Full Name</label>
							<p className="text-sm text-gray-900">{selectedPatient.name}</p>
						</div>
						{selectedPatient.othernames && (
							<div>
								<label className="text-sm font-medium text-gray-700">Other Names</label>
								<p className="text-sm text-gray-900">{selectedPatient.othernames}</p>
							</div>
						)}
						<div>
							<label className="text-sm font-medium text-gray-700">Age</label>
							<p className="text-sm text-gray-900">{selectedPatient.age || 'N/A'} years</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-700">Gender</label>
							<p className="text-sm text-gray-900">{selectedPatient.gender}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-700">Date of Birth</label>
							<p className="text-sm text-gray-900">{formatDate(selectedPatient.dob)}</p>
						</div>
						{selectedPatient.national_id && (
							<div>
								<label className="text-sm font-medium text-gray-700">National ID</label>
								<p className="text-sm text-gray-900">{selectedPatient.national_id}</p>
							</div>
						)}
						{selectedPatient.patient_code && (
							<div>
								<label className="text-sm font-medium text-gray-700">Patient Code</label>
								<p className="text-sm text-gray-900">{selectedPatient.patient_code}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center space-x-2">
							<Phone className="h-5 w-5" />
							<span>Contact Information</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<label className="text-sm font-medium text-gray-700">Primary Phone</label>
							<p className="text-sm text-gray-900">{selectedPatient.contact_number || 'N/A'}</p>
						</div>
						{selectedPatient.alternative_number && (
							<div>
								<label className="text-sm font-medium text-gray-700">Alternative Phone</label>
								<p className="text-sm text-gray-900">{selectedPatient.alternative_number}</p>
							</div>
						)}
						{selectedPatient.address && (
							<div>
								<label className="text-sm font-medium text-gray-700">Address</label>
								<p className="text-sm text-gray-900">{selectedPatient.address}</p>
							</div>
						)}
						{selectedPatient.next_kin && (
							<div>
								<label className="text-sm font-medium text-gray-700">Next of Kin</label>
								<p className="text-sm text-gray-900">{selectedPatient.next_kin}</p>
							</div>
						)}
						{selectedPatient.next_kin_contact && (
							<div>
								<label className="text-sm font-medium text-gray-700">Next of Kin Contact</label>
								<p className="text-sm text-gray-900">{selectedPatient.next_kin_contact}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center space-x-2">
							<MapPin className="h-5 w-5" />
							<span>Location Information</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<label className="text-sm font-medium text-gray-700">Region</label>
							<p className="text-sm text-gray-900">{selectedPatient.region || 'N/A'}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-700">District</label>
							<p className="text-sm text-gray-900">{selectedPatient.district || 'N/A'}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-700">Sub-district</label>
							<p className="text-sm text-gray-900">{selectedPatient.sub_district || 'N/A'}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-700">Community</label>
							<p className="text-sm text-gray-900">{selectedPatient.community || 'N/A'}</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center space-x-2">
							<Heart className="h-5 w-5" />
							<span>Medical Information</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<label className="text-sm font-medium text-gray-700">Blood Group</label>
							<p className="text-sm text-gray-900">{selectedPatient.blood_group || 'N/A'}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-700">Insurance Status</label>
							<p className="text-sm text-gray-900">{selectedPatient.insurance_status || 'N/A'}</p>
						</div>
						{selectedPatient.insurance_no && (
							<div>
								<label className="text-sm font-medium text-gray-700">Insurance Number</label>
								<p className="text-sm text-gray-900">{selectedPatient.insurance_no}</p>
							</div>
						)}
						<div>
							<label className="text-sm font-medium text-gray-700">Registration Date</label>
							<p className="text-sm text-gray-900">{formatDate(selectedPatient.registration_date)}</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);

	const renderAntenatalRegistrations = () => (
		<div className="p-6">
			{showShimmer || isLoadingRegistrations ? (
				<ShimmerList />
			) : antenatalRegistrations.length === 0 ? (
				<div className="text-center py-8">
					<Baby className="h-12 w-12 mx-auto mb-2 text-gray-300" />
					<p className="text-sm text-gray-500">No antenatal registrations found</p>
				</div>
			) : (
				<div className="space-y-4">
					{antenatalRegistrations.map((registration) => (
						<Card key={registration.antenatal_registration_id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">
										Registration #{registration.registration_number}
									</CardTitle>
									<Badge variant={registration.antenatal_status === 'active' ? 'default' : 'secondary'}>
										{registration.antenatal_status || 'Unknown'}
									</Badge>
								</div>
								<CardDescription>
									Registered on {formatDate(registration.registration_date)}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="text-sm font-medium text-gray-700">Gestation Weeks</label>
										<p className="text-sm text-gray-900">{registration.gestation_weeks || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Expected Delivery</label>
										<p className="text-sm text-gray-900">{formatDate(registration.estimated_delivery_date)}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Parity</label>
										<p className="text-sm text-gray-900">{registration.parity || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Blood Group</label>
										<p className="text-sm text-gray-900">{registration.blood_group_abo || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Rhesus Status</label>
										<p className="text-sm text-gray-900">{registration.rhesus_status || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Hemoglobin</label>
										<p className="text-sm text-gray-900">{registration.hemoglobin_at_registration || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">HIV Status</label>
										<p className="text-sm text-gray-900">{registration.hiv_status_at_registration || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">TB Screening</label>
										<p className="text-sm text-gray-900">{registration.screened_for_tb ? 'Yes' : 'No'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">ITN Given</label>
										<p className="text-sm text-gray-900">{registration.itn_given ? 'Yes' : 'No'}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);

	const renderAntenatalVisits = () => (
		<div className="p-6">
			{showShimmer || isLoadingVisits ? (
				<ShimmerList />
			) : antenatalVisits.length === 0 ? (
				<div className="text-center py-8">
					<Stethoscope className="h-12 w-12 mx-auto mb-2 text-gray-300" />
					<p className="text-sm text-gray-500">No antenatal visits found</p>
				</div>
			) : (
				<div className="space-y-4">
					{antenatalVisits
						.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
						.map((visit) => (
						<Card key={visit.id}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg flex items-center space-x-2">
										<Calendar className="h-5 w-5" />
										<span>Visit - {formatDate(visit.visit_date)}</span>
									</CardTitle>
									{visit.next_visit_date && (
										<Badge variant="outline" className="flex items-center space-x-1">
											<Clock className="h-3 w-3" />
											<span>Next: {formatDate(visit.next_visit_date)}</span>
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="text-sm font-medium text-gray-700">Gestation Weeks</label>
										<p className="text-sm text-gray-900">{visit.gestation_weeks || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Weight (kg)</label>
										<p className="text-sm text-gray-900">{visit.weight_kg || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Blood Pressure</label>
										<p className="text-sm text-gray-900">{visit.blood_pressure || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Fetal Heart Rate</label>
										<p className="text-sm text-gray-900">{visit.fetal_heart_rate || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Fundal Height</label>
										<p className="text-sm text-gray-900">{visit.fundal_height || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Fetal Heart Inspection</label>
										<p className="text-sm text-gray-900">{visit.fetal_heart_inspection || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Urine Protein</label>
										<p className="text-sm text-gray-900">{visit.urine_p || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Urine Sugar</label>
										<p className="text-sm text-gray-900">{visit.urine_s || 'N/A'}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Iron/Folic Acid</label>
										<p className="text-sm text-gray-900">{visit.folic_acid_iron || 'N/A'}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);

	return (
		<div className="bg-white rounded-lg shadow-sm border">
			{/* Header with assigned user info */}
			{selectedPatient.assigned_user && (
				<div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
					<div className="flex items-center space-x-2">
						<User className="h-4 w-4 text-blue-600" />
						<span className="text-sm font-medium text-blue-900">
							Registered by: {selectedPatient.assigned_user.firstname} {selectedPatient.assigned_user.lastname}
						</span>
						<Badge variant="secondary" className="text-xs">
							{selectedPatient.assigned_user.user_type}
						</Badge>
					</div>
				</div>
			)}

			{/* Tab Navigation */}
			<div className="border-b border-gray-200">
				<nav className="flex space-x-8 px-6">
					<button
						onClick={() => setActiveTab("bio")}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === "bio"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}
					>
						<div className="flex items-center space-x-2">
							<User className="h-4 w-4" />
							<span>Patient Bio</span>
						</div>
					</button>
					<button
						onClick={() => setActiveTab("registration")}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === "registration"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}
					>
						<div className="flex items-center space-x-2">
							<Baby className="h-4 w-4" />
							<span>Antenatal Registration</span>
						</div>
					</button>
					<button
						onClick={() => setActiveTab("visits")}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === "visits"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}
					>
						<div className="flex items-center space-x-2">
							<Stethoscope className="h-4 w-4" />
							<span>Antenatal Visits</span>
						</div>
					</button>
				</nav>
			</div>

			{/* Tab Content */}
			{activeTab === "bio" && renderPatientBio()}
			{activeTab === "registration" && renderAntenatalRegistrations()}
			{activeTab === "visits" && renderAntenatalVisits()}
		</div>
	);
};

export default PatientDetails;
