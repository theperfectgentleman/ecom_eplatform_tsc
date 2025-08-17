import React, { useState, useEffect } from "react";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast/useToast";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";
import KitDistributionForm from "@/components/kit-distribution/KitDistributionForm";
import DistributionTable from "@/components/kit-distribution/DistributionTable";

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
  // Add filterable data properties
  region?: string;
  district?: string;
  subdistrict?: string;
  community_name?: string;
}

const KitDistributionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { request } = useApi();
  const { filterByAccessLevel } = useAccessLevelFilter();

  const [distributions, setDistributions] = useState<KitDistribution[]>([]);
  const [filteredDistributions, setFilteredDistributions] = useState<KitDistribution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<KitDistribution | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [refreshList, setRefreshList] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // Fetch kit distributions
  const fetchDistributions = async () => {
    setIsLoading(true);
    try {
      const response = await request<KitDistribution[]>({
        path: "kit-distro-logs",
        method: "GET",
      });

      // Apply access level filtering
      const filtered = filterByAccessLevel(response);
      
      // Temporarily use unfiltered data for debugging
      const dataToUse = filtered?.length > 0 ? filtered : response;
      setDistributions(dataToUse);
      setFilteredDistributions(dataToUse);
    } catch (error) {
      console.error("Failed to fetch kit distributions:", error);
      toast({
        title: "Error",
        description: "Failed to load kit distributions. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDistributions(distributions);
    } else {
      const filtered = distributions.filter((dist) =>
        dist.distro_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dist.quantity.toString().includes(searchTerm)
      );
      setFilteredDistributions(filtered);
    }
  }, [searchTerm, distributions]);

  const handleNewDistribution = () => {
    setSelectedDistribution(null);
    setIsReadOnly(false);
    setFormKey((prevKey) => prevKey + 1);
  };

  const handleClearForm = () => {
    setSelectedDistribution(null);
    setIsReadOnly(true);
    setFormKey((prevKey) => prevKey + 1);
  };

  const handleDistributionCreated = () => {
    setRefreshList((prev) => !prev);
    fetchDistributions();
  };

  // Check if distribution can be edited
  const canEditDistribution = (distribution: KitDistribution): boolean => {
    // Cannot edit if volunteer has confirmed
    if (!!distribution.vol_user_confirm) { // eslint-disable-line no-extra-boolean-cast
      return false;
    }
    
    // Cannot edit if not entered by current user
    if (user?.user_id !== distribution.adm_user_id) {
      return false;
    }
    
    return true;
  };

  // Check if distribution can be deleted
  const canDeleteDistribution = (distribution: KitDistribution): boolean => {
    // Cannot delete if volunteer has confirmed
    if (!!distribution.vol_user_confirm) { // eslint-disable-line no-extra-boolean-cast
      return false;
    }
    
    // Cannot delete if not entered by current user
    if (user?.user_id !== distribution.adm_user_id) {
      return false;
    }
    
    return true;
  };

  const handleEdit = (distribution: KitDistribution) => {
    if (!canEditDistribution(distribution)) {
      toast({
        title: "Cannot Edit",
        description: "This distribution cannot be edited because it has been confirmed by the volunteer or was not created by you.",
        variant: "error",
      });
      return;
    }
    
    setSelectedDistribution(distribution);
    setIsReadOnly(false);
    setFormKey((prevKey) => prevKey + 1);
  };

  const handleDelete = async (distribution: KitDistribution) => {
    if (!canDeleteDistribution(distribution)) {
      toast({
        title: "Cannot Delete",
        description: "This distribution cannot be deleted because it has been confirmed by the volunteer or was not created by you.",
        variant: "error",
      });
      return;
    }

    try {
      await request({
        path: `kit-distro-logs/${distribution.id}`,
        method: "DELETE",
      });
      toast({
        title: "Success",
        description: "Kit distribution deleted successfully.",
        variant: "success",
      });
      fetchDistributions();
    } catch (error: any) {
      console.error("Failed to delete distribution:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete kit distribution.",
        variant: "error",
      });
    }
  };

  const handleFormCancel = () => {
    handleClearForm();
  };

  const handleFormSuccess = () => {
    handleDistributionCreated();
    handleClearForm();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kit Management</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="w-full md:w-[65%] min-w-0">
          <KitDistributionForm
            key={formKey}
            initialData={selectedDistribution}
            onCancel={handleFormCancel}
            onDistributionCreated={handleFormSuccess}
            onNewDistribution={handleNewDistribution}
            isReadOnly={isReadOnly}
          />
        </div>
        <aside className="w-full md:w-[35%] min-w-0">
          <DistributionTable
            distributions={filteredDistributions}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEditDistribution={canEditDistribution}
            canDeleteDistribution={canDeleteDistribution}
            user={user}
            refreshList={refreshList}
          />
        </aside>
      </div>
    </>
  );
};

export default KitDistributionPage;
