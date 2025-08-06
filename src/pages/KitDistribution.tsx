import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast/useToast";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";
import KitDistributionForm from "@/components/kit-distribution/KitDistributionForm";
import { Package, Plus, Search, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";

interface KitDistribution {
  id: number;
  distro_id: string;
  quantity: number;
  vol_user_id: number;
  adm_user_id: number;
  release_date: string;
  vol_user_confirm: boolean;
  adm_user_confirm: boolean;
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
  const [showForm, setShowForm] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<KitDistribution | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Fetch kit distributions
  const fetchDistributions = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await request<KitDistribution[]>({
      //   path: "kit-distro-logs",
      //   method: "GET",
      // });

      // Mock data for now
      const mockDistributions: KitDistribution[] = [
        {
          id: 1,
          distro_id: "KIT-1722890123-ABC1",
          quantity: 50,
          vol_user_id: 123,
          adm_user_id: 456,
          release_date: "2024-08-01",
          vol_user_confirm: false,
          adm_user_confirm: true,
          created_at: "2024-08-01T10:00:00Z",
          updated_at: "2024-08-01T10:00:00Z",
          region: "Greater Accra",
          district: "Accra Metropolitan",
          subdistrict: "Osu Klottey",
          community_name: "Osu"
        },
        {
          id: 2,
          distro_id: "KIT-1722890456-DEF2",
          quantity: 25,
          vol_user_id: 789,
          adm_user_id: 456,
          release_date: "2024-08-02",
          vol_user_confirm: true,
          adm_user_confirm: true,
          created_at: "2024-08-02T14:30:00Z",
          updated_at: "2024-08-02T14:30:00Z",
          region: "Northern Region",
          district: "Tamale Metropolitan",
          subdistrict: "Tamale Central",
          community_name: "Tamale Township"
        }
      ];

      // Apply access level filtering to mock data
      const filtered = filterByAccessLevel(mockDistributions);
      setDistributions(filtered);
      setFilteredDistributions(filtered);

      console.log("Using mock data for kit distributions - API endpoint not available yet");
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
  }, []);

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
    setShowForm(true);
  };

  const handleEdit = (distribution: KitDistribution) => {
    setSelectedDistribution(distribution);
    setIsReadOnly(false);
    setShowForm(true);
  };

  const handleView = (distribution: KitDistribution) => {
    setSelectedDistribution(distribution);
    setIsReadOnly(true);
    setShowForm(true);
  };

  const handleDelete = async (distribution: KitDistribution) => {
    if (distribution.vol_user_confirm && distribution.adm_user_confirm) {
      toast({
        title: "Cannot Delete",
        description: "This distribution has been confirmed by both parties and cannot be deleted.",
        variant: "error",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this kit distribution?")) {
      return;
    }

    try {
      console.log("Would delete distribution:", distribution);
      // TODO: Uncomment when API is ready
      // await request({
      //   path: `kit-distro-logs/${distribution.id}`,
      //   method: "DELETE",
      // });
      toast({
        title: "Success",
        description: "Kit distribution deleted successfully. (Mock mode - API not implemented yet)",
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
    setShowForm(false);
    setSelectedDistribution(null);
    setIsReadOnly(false);
  };

  const handleFormSuccess = () => {
    fetchDistributions();
    setShowForm(false);
    setSelectedDistribution(null);
    setIsReadOnly(false);
  };

  const getStatusIcon = (volConfirm: boolean, admConfirm: boolean) => {
    if (volConfirm && admConfirm) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <AlertCircle className="h-5 w-5 text-orange-600" />;
  };

  const getStatusText = (volConfirm: boolean, admConfirm: boolean) => {
    if (volConfirm && admConfirm) return "Fully Confirmed";
    if (admConfirm && !volConfirm) return "Admin Confirmed";
    if (volConfirm && !admConfirm) return "Volunteer Confirmed";
    return "Pending Confirmation";
  };

  if (showForm) {
    return (
      <div className="container mx-auto p-6">
        <KitDistributionForm
          initialData={selectedDistribution}
          onCancel={handleFormCancel}
          onDistributionCreated={handleFormSuccess}
          isReadOnly={isReadOnly}
          onNewDistribution={handleNewDistribution}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <span>Kit Distribution Management</span>
            </CardTitle>
            <Button onClick={handleNewDistribution} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Distribution</span>
            </Button>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
          {!isLoading && filteredDistributions.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Kit Distributions Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No distributions match your search criteria." : "Get started by creating your first kit distribution."}
              </p>
              <Button onClick={handleNewDistribution}>
                <Plus className="h-4 w-4 mr-2" />
                New Distribution
              </Button>
            </div>
          )}

          {/* Distribution List */}
          {!isLoading && filteredDistributions.length > 0 && (
            <div className="space-y-4">
              {filteredDistributions.map((distribution) => (
                <div
                  key={distribution.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {distribution.distro_id}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(distribution.vol_user_confirm, distribution.adm_user_confirm)}
                          <span className="text-sm text-gray-600">
                            {getStatusText(distribution.vol_user_confirm, distribution.adm_user_confirm)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Quantity:</span> {distribution.quantity} kits
                        </div>
                        <div>
                          <span className="font-medium">Release Date:</span>{" "}
                          {new Date(distribution.release_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {new Date(distribution.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(distribution)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(distribution)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!(distribution.vol_user_confirm && distribution.adm_user_confirm) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(distribution)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KitDistributionPage;
