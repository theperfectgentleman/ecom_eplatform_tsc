import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "@/lib/useApi";
import { useToast } from "@/components/ui/toast/useToast";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";
import { Case } from "@/types";
import { Input } from "../ui/input";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";

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

const getStatusInfo = (status: string | undefined) => {
	switch (status?.toLowerCase()) {
		case "critical":
			return { color: "bg-red-200 text-red-800" }; // Washed-out red
		case "urgent":
			return { color: "bg-orange-200 text-orange-800" }; // Washed-out orange
		case "routine":
			return { color: "bg-purple-200 text-purple-800" }; // Washed-out purple
		case "closed":
			return { color: "bg-gray-200 text-gray-800" }; // Washed-out grey
		default:
			return { color: "bg-gray-200 text-gray-800" };
	}
};

interface CaseTableProps {
	onCaseSelect: (caseData: Case, readOnly: boolean) => void;
	onClearForm: () => void;
	refreshList: boolean;
}

const CaseTable: React.FC<CaseTableProps> = ({
	onCaseSelect,
	onClearForm,
	refreshList,
}) => {
	const [cases, setCases] = useState<Case[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
	const { request } = useApi();
	const { toast } = useToast();
	const { filterByAccessLevel } = useAccessLevelFilter();

	const fetchCases = useCallback(async () => {
		try {
			const data = await request<Case[]>({ path: "case-files" });
			const sortedData = data.sort(
				(a, b) =>
					new Date(b.date_created).getTime() -
					new Date(a.date_created).getTime()
			);
			// Apply access level filtering
			const filteredData = filterByAccessLevel(sortedData);
			setCases(filteredData);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch cases.",
				variant: "error",
			});
		}
	}, [request, toast, filterByAccessLevel]);

	useEffect(() => {
		fetchCases();
	}, [fetchCases, refreshList]); // Refreshes when `refreshList` prop changes

	const handleDelete = async (caseId: string) => {
		try {
			await request({ path: `case-files/${caseId}`, method: "DELETE" });
			toast({
				title: "Success",
				description: "Case deleted successfully.",
				variant: "success",
			});
			fetchCases(); // Refresh the list
			onClearForm(); // Clear the form if the deleted case was selected
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete case.",
				variant: "error",
			});
		}
	};

	const confirmDelete = () => {
		if (caseToDelete) {
			handleDelete(caseToDelete.case_file_id);
			setCaseToDelete(null);
		}
	};

	const filteredCases = useMemo(
		() =>
			cases.filter(
				(c) =>
					c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					String(c.case_file_id).toLowerCase().includes(searchTerm.toLowerCase())
			),
		[cases, searchTerm]
	);

	return (
		<div className="bg-white p-4 rounded-lg shadow flex flex-col h-full">
			<style>{listStyles}</style>
			<h3 className="text-lg font-semibold mb-4">
				Recent & Emergency Cases 
				<span className="ml-2 text-sm font-normal text-gray-500">({filteredCases.length})</span>
			</h3>
			<Input
				placeholder="Search by patient, case ID, or region..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="mb-4"
			/>
			<div className="flex-grow overflow-y-auto custom-scrollbar">
				{filteredCases.map((caseItem) => {
					const statusInfo = getStatusInfo(caseItem.priority_level);
					const patientInitial = caseItem.name?.charAt(0).toUpperCase() || "?";
					const caseDate = new Date(caseItem.date_created).toLocaleDateString(
						"en-US",
						{
							year: "numeric",
							month: "short",
							day: "numeric",
						}
					);

					return (
						<div
							key={caseItem.case_file_id}
							className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
							onClick={() => onCaseSelect(caseItem, true)}
						>
							<div className="flex items-center gap-4 flex-grow min-w-0">
								<div
									className={`flex-shrink-0 h-10 w-10 rounded-full ${statusInfo.color} flex items-center justify-center font-bold text-sm`}
								>
									{patientInitial}
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-gray-800 truncate">
										{caseItem.name}
									</p>
									<p className="text-sm text-gray-500 truncate">
										{caseDate}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 ml-4">
								<button
									onClick={(e) => {
										e.stopPropagation();
										onCaseSelect(caseItem, false);
									}}
									className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-blue-600 transition-colors duration-150"
									title="Edit Case"
								>
									<Edit size={16} />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										setCaseToDelete(caseItem);
									}}
									className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600 transition-colors duration-150"
									title="Delete Case"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					);
				})}
			</div>
			<AlertDialog
				open={!!caseToDelete}
				onOpenChange={(isOpen) => !isOpen && setCaseToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the case
							for {caseToDelete?.name}.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default CaseTable;
