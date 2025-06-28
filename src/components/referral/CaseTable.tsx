import React from "react";

// Placeholder for the case search/history table
const CaseTable: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Recent & Emergency Cases</h2>
      {/* Table or list of cases, search/filter UI will go here */}
      <div className="text-gray-500 mb-2">[Case table UI coming soon]</div>
      <div className="flex gap-2 mb-3">
        <input className="border rounded px-2 py-1 w-full" placeholder="Search by patient, case ID, or region..." />
        <button className="bg-blue-600 text-white rounded px-3 py-1 font-semibold">Search</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Case ID</th>
              <th className="p-2 border">Patient</th>
              <th className="p-2 border">Region</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Example rows, replace with dynamic data */}
            <tr>
              <td className="p-2 border">CF123456</td>
              <td className="p-2 border">Jane Doe</td>
              <td className="p-2 border">Upper West</td>
              <td className="p-2 border">2025-06-28</td>
              <td className="p-2 border text-green-600 font-semibold">Open</td>
            </tr>
            <tr>
              <td className="p-2 border">CF123457</td>
              <td className="p-2 border">John Smith</td>
              <td className="p-2 border">Ashanti</td>
              <td className="p-2 border">2025-06-27</td>
              <td className="p-2 border text-gray-500">Closed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaseTable;
