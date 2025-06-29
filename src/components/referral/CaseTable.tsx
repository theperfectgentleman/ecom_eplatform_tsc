import React, { useState, useEffect, useRef } from "react";
import { Circle, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/api";

const PRIORITY_COLORS: Record<string, string> = {
	closed: "#808080", // Medium Grey
	routine: "#F0E68C", // Traditional Khaki
	urgent: "#FF7F50", // Coral Orange
	critical: "#FF0000", // Pure Red
};

const PRIORITY_LABELS: Record<string, string> = {
	closed: "Closed",
	routine: "Routine",
	urgent: "Urgent",
	critical: "Critical",
};

const getPriority = (status: string | undefined) => {
	if (!status) return "routine";
	const s = status.toLowerCase();
	if (["closed"].includes(s)) return "closed";
	if (["urgent"].includes(s)) return "urgent";
	if (["critical"].includes(s)) return "critical";
	return "routine";
};

const statusIcon = (status: string) => {
	const priority = getPriority(status);
	return (
		<Tooltip content={PRIORITY_LABELS[priority] || "Routine"}>
			<Circle
				className=""
				size={20}
				style={{ color: PRIORITY_COLORS[priority] || PRIORITY_COLORS.routine }}
				aria-label={PRIORITY_LABELS[priority] || "Routine"}
				fill={PRIORITY_COLORS[priority] || PRIORITY_COLORS.routine}
			/>
		</Tooltip>
	);
};

function formatDate(dateStr: string) {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = (now.getTime() - date.getTime()) / 1000;
	if (diff < 60 * 60) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 60 * 60 * 24) return `${Math.floor(diff / 3600)}h ago`;
	if (diff < 60 * 60 * 24 * 7) return `${Math.floor(diff / 86400)}d ago`;
	return date.toLocaleDateString();
}

const CaseTable: React.FC<{
	onCaseSelect?: (caseData: any) => void;
	onClearForm?: () => void;
}> = ({ onCaseSelect, onClearForm }) => {
	const [search, setSearch] = useState("");
	const [cases, setCases] = useState<any[]>([]);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [deleteCode, setDeleteCode] = useState("");
	const [deleteChallenge, setDeleteChallenge] = useState("");
	const [deleteError, setDeleteError] = useState("");
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		apiRequest({ path: "api/case-files" }).then(setCases);
	}, []);

	const filtered = cases.filter(
		(c) =>
			(c.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
			(c.case_file_id?.toLowerCase() || "").includes(search.toLowerCase()) ||
			(c.region?.toLowerCase() || "").includes(search.toLowerCase())
	);

	const handleCaseClick = (c: any) => {
		if (onClearForm) onClearForm();
		if (onCaseSelect) onCaseSelect(c);
	};

	const handleDelete = async (id: string) => {
		setDeleteError("");
		if (deleteCode !== deleteChallenge) {
			setDeleteError("Incorrect code. Please type the code exactly as shown.");
			return;
		}
		try {
			await apiRequest({ path: `api/case-files/${id}`, method: "DELETE" });
			setCases((prev) => prev.filter((c) => c.case_file_id !== id));
			setDeleteId(null);
			setDeleteCode("");
			setDeleteChallenge("");
		} catch (e: any) {
			setDeleteError(e.message || "Delete failed");
		}
	};

	const openDeleteDialog = (id: string) => {
		// Generate a random 6-digit code
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		setDeleteId(id);
		setDeleteChallenge(code);
		setDeleteCode("");
		setDeleteError("");
	};

	const handleDeleteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Only allow typing, not pasting
		if (
			e.nativeEvent instanceof InputEvent &&
			e.nativeEvent.inputType === "insertFromPaste"
		) {
			e.preventDefault();
			return;
		}
		setDeleteCode(e.target.value);
	};

	return (
		<div
			className="bg-white rounded-lg shadow p-4 h-full flex flex-col overflow-hidden scrollbar-hide"
			style={{ minHeight: 600, maxHeight: 900, height: "100%" }}
		>
			<h2 className="text-lg font-semibold mb-2">Recent & Emergency Cases</h2>
			<div className="flex gap-2 mb-3">
				<input
					className="border rounded px-2 py-1 w-full"
					placeholder="Search by patient, case ID, or region..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<button className="bg-blue-600 text-white rounded px-3 py-1 font-semibold">
					Search
				</button>
			</div>
			<div
				ref={listRef}
				className="space-y-4 flex-1 overflow-y-scroll pr-1 scrollbar-hide"
				style={{ maxHeight: "100%", scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				{filtered.length === 0 && (
					<div className="text-gray-400 text-center">No cases found.</div>
				)}
				{filtered.map((c) => (
					<div
						key={c.case_file_id || c.id}
						className="relative flex flex-col bg-gray-50 rounded-lg shadow-sm p-4 cursor-pointer hover:bg-blue-50 transition min-h-[110px]"
						onClick={() => handleCaseClick(c)}
					>
						{/* Status icon top right */}
						<div className="absolute top-3 right-3">
							{statusIcon(c.priority_level || c.status || "routine")}
						</div>
						{/* Delete button bottom right */}
						<button
							className="absolute bottom-3 right-3 text-gray-500 hover:text-gray-800"
							style={{ color: "#444" }}
							onClick={(e) => {
								e.stopPropagation();
								openDeleteDialog(c.case_file_id || c.id);
							}}
							title="Delete case"
						>
							<Trash2 size={18} />
						</button>
						<span className="font-bold text-gray-900 truncate max-w-[70%]">
							{c.name || c.patient}
						</span>
						<div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-gray-600">
							<span>
								<span className="font-medium">Case ID:</span> {c.case_file_id || c.id}
							</span>
							<span>
								<span className="font-medium">Region:</span> {c.region}
							</span>
							<span>
								<span className="font-medium">District:</span> {c.district}
							</span>
							<span>
								<span className="font-medium">Date:</span> {formatDate(c.created_at || c.date)}
							</span>
						</div>
					</div>
				))}
			</div>
			{/* Delete confirmation dialog */}
			{deleteId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
					<div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
						<button
							className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
							onClick={() => setDeleteId(null)}
							aria-label="Close"
						>
							×
						</button>
						<div className="mb-2 font-semibold text-lg text-red-600">
							Confirm Delete
						</div>
						<div className="mb-2 text-sm">
							Type the code below to confirm deletion.{" "}
							<b>Copy and paste is disabled.</b>
						</div>
						<div className="mb-2 text-center font-mono text-xl tracking-widest bg-gray-100 rounded p-2 select-none">
							{deleteChallenge}
						</div>
						<input
							className="border rounded px-2 py-1 w-full mb-2"
							placeholder="Type the code above"
							value={deleteCode}
							onChange={handleDeleteInput}
							autoFocus
						/>
						{deleteError && (
							<div className="text-red-500 text-xs mb-2">{deleteError}</div>
						)}
						<button
							className="bg-red-600 text-white rounded px-4 py-2 font-semibold w-full mt-2"
							onClick={() => handleDelete(deleteId)}
						>
							Delete Case
						</button>
					</div>
				</div>
			)}
			<style>{`
        .scrollbar-hide::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
        .scrollbar-hide { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
		</div>
	);
};

export default CaseTable;
