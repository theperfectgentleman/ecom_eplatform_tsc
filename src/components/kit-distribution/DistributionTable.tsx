import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, Search, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface KitDistribution {
  id: number;
  distro_id: string;
  quantity: number;
  vol_user_id: number;
  adm_user_id: number;
  release_date: string;
  vol_user_confirm?: boolean; // Optional boolean as per API model
  adm_user_confirm?: boolean; // Optional boolean as per API model
  created_at: string;
  updated_at: string;
  region?: string;
  district?: string;
  subdistrict?: string;
  community_name?: string;
}

interface DistributionTableProps {
  distributions: KitDistribution[];
  isLoading: boolean; 
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEdit: (distribution: KitDistribution) => void;
  onDelete: (distribution: KitDistribution) => void;
  canEditDistribution: (distribution: KitDistribution) => boolean;
  canDeleteDistribution: (distribution: KitDistribution) => boolean;
  user: any;
  refreshList: boolean;
}

const DistributionTable: React.FC<DistributionTableProps> = ({
  distributions,
  isLoading,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  canEditDistribution,
  canDeleteDistribution,
  user,
  refreshList,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    distribution: KitDistribution | null;
  }>({ isOpen: false, distribution: null });

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.ceil(distributions.length / itemsPerPage);
  }, [distributions.length]);

  const paginatedDistributions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return distributions.slice(startIndex, endIndex);
  }, [distributions, currentPage]);

  // Reset to first page when distributions change
  useEffect(() => {
    setCurrentPage(1);
  }, [distributions]);

  // Effect to handle refresh trigger
  useEffect(() => {
    // This effect will run when refreshList changes
    // The parent component handles the actual data fetching
  }, [refreshList]);

  // Handle delete confirmation
  const handleDeleteClick = (distribution: KitDistribution) => {
    setDeleteConfirmation({ isOpen: true, distribution });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation.distribution) {
      onDelete(deleteConfirmation.distribution);
      setDeleteConfirmation({ isOpen: false, distribution: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, distribution: null });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span>Distributions</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by Distribution ID or Quantity..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading kit distributions...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && distributions.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Kit Distributions Found</h3>
            <p className="text-gray-600">
              {searchTerm ? "No distributions match your search criteria." : "Use the form on the left to create your first kit distribution."}
            </p>
          </div>
        )}

        {/* Distribution List */}
        {!isLoading && distributions.length > 0 && (
          <>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {paginatedDistributions.map((distribution) => (
                <div
                  key={distribution.id}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {distribution.distro_id}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {/* Admin Status Icon */}
                          <div className="flex items-center" title={`Admin: ${distribution.adm_user_confirm ? 'Confirmed' : 'Pending'}`}>
                            {distribution.adm_user_confirm ? (
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          {/* Volunteer Status Icon */}
                          <div className="flex items-center" title={`Volunteer: ${distribution.vol_user_confirm ? 'Confirmed' : 'Pending'}`}>
                            {distribution.vol_user_confirm ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-orange-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status badge for created by user only */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {user?.user_id === distribution.adm_user_id && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Created by you
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">Quantity:</span> {distribution.quantity} kits
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(distribution.release_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1 ml-2">
                      {canEditDistribution(distribution) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(distribution);
                          }}
                          className="text-xs px-2 py-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          title={
                            !!distribution.vol_user_confirm // eslint-disable-line no-extra-boolean-cast
                              ? "Cannot edit: Volunteer has confirmed" 
                              : "Cannot edit: Not created by you"
                          }
                          className="text-xs px-2 py-1"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {canDeleteDistribution(distribution) ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(distribution);
                          }}
                          className="text-xs px-2 py-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled
                          title={
                            !!distribution.vol_user_confirm // eslint-disable-line no-extra-boolean-cast
                              ? "Cannot delete: Volunteer has confirmed" 
                              : "Cannot delete: Not created by you"
                          }
                          className="text-xs px-2 py-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages} ({distributions.length} total)
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete kit distribution{" "}
              <span className="font-medium">{deleteConfirmation.distribution?.distro_id}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DistributionTable;
