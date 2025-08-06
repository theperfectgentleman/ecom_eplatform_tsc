import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast/useToast";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";
import ReactSelect, { SingleValue } from "react-select";
import { Package, User, CheckCircle, AlertCircle } from "lucide-react";

// Type for volunteer select options
interface VolunteerOption {
  value: string;
  label: string;
  volunteer: any;
}

const KitDistributionForm: React.FC<{
  initialData?: any;
  onCancel: () => void;
  onDistributionCreated: () => void;
  isReadOnly: boolean;
  onNewDistribution: () => void;
}> = ({ initialData, onCancel, onDistributionCreated, isReadOnly, onNewDistribution }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { request } = useApi();
  const { filterByAccessLevel } = useAccessLevelFilter();

  const [volunteerOptions, setVolunteerOptions] = useState<VolunteerOption[]>([]);
  const [selectedVolunteerOption, setSelectedVolunteerOption] = useState<VolunteerOption | null>(null);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(false);

  const [formState, setFormState] = useState({
    id: undefined as number | undefined,
    distro_id: "",
    quantity: "",
    vol_user_id: "",
    adm_user_id: user?.account_id?.toString() || "",
    release_date: new Date().toISOString().split('T')[0],
    vol_user_confirm: false,
    adm_user_confirm: true, // Automatically confirmed by issuer
  });

  const isFormDisabled = isReadOnly && !!initialData;

  // Fetch volunteers when component mounts
  useEffect(() => {
    const fetchVolunteers = async () => {
      setIsLoadingVolunteers(true);
      try {
        const volunteers = await request({
          path: "accounts",
          method: "GET",
        });
        
        // Filter for volunteers and community health workers
        const volunteerUsers = volunteers.filter((account: any) => 
          account.user_type === "Volunteer" || account.user_type === "Community Health Worker"
        );
        
        // Apply access level filtering to volunteers
        const filteredVolunteers = filterByAccessLevel(volunteerUsers);
        
        const options: VolunteerOption[] = filteredVolunteers.map((volunteer: any) => ({
          value: volunteer.user_id.toString(),
          label: `${volunteer.firstname} ${volunteer.lastname} (${volunteer.username}) - ${volunteer.user_type}`,
          volunteer: volunteer,
        }));

        setVolunteerOptions(options);
      } catch (error) {
        console.error("Failed to fetch volunteers:", error);
        toast({
          title: "Error",
          description: "Failed to load volunteers. Please try again.",
          variant: "error",
        });
      } finally {
        setIsLoadingVolunteers(false);
      }
    };

    fetchVolunteers();
  }, [request, toast, filterByAccessLevel]);

  // Generate unique distribution ID
  useEffect(() => {
    if (!initialData && !formState.distro_id) {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
      setFormState(prev => ({
        ...prev,
        distro_id: `KIT-${timestamp}-${randomSuffix}`
      }));
    }
  }, [initialData, formState.distro_id]);

  // Populate form with initial data
  useEffect(() => {
    if (initialData) {
      setFormState({
        id: initialData.id,
        distro_id: initialData.distro_id || "",
        quantity: initialData.quantity?.toString() || "",
        vol_user_id: initialData.vol_user_id?.toString() || "",
        adm_user_id: initialData.adm_user_id?.toString() || "",
        release_date: initialData.release_date ? 
          new Date(initialData.release_date).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        vol_user_confirm: initialData.vol_user_confirm || false,
        adm_user_confirm: initialData.adm_user_confirm || false,
      });

      // Set selected volunteer
      if (initialData.vol_user_id) {
        const selectedOption = volunteerOptions.find(
          option => option.value === initialData.vol_user_id.toString()
        );
        setSelectedVolunteerOption(selectedOption || null);
      }
    }
  }, [initialData, volunteerOptions]);

  const handleVolunteerSelect = (option: SingleValue<VolunteerOption>) => {
    if (!option) {
      setSelectedVolunteerOption(null);
      setFormState(prev => ({ ...prev, vol_user_id: "" }));
      return;
    }

    setSelectedVolunteerOption(option);
    setFormState(prev => ({ ...prev, vol_user_id: option.value }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to distribute kits.",
        variant: "error",
      });
      return;
    }

    if (!formState.vol_user_id) {
      toast({
        title: "Validation Error",
        description: "Please select a volunteer to distribute kits to.",
        variant: "error",
      });
      return;
    }

    if (!formState.quantity || parseInt(formState.quantity) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity.",
        variant: "error",
      });
      return;
    }

    const payload = {
      distro_id: formState.distro_id,
      quantity: parseInt(formState.quantity),
      vol_user_id: parseInt(formState.vol_user_id),
      adm_user_id: parseInt(formState.adm_user_id),
      release_date: formState.release_date,
      adm_user_confirm: true, // Always true for issuer
    };

    try {
      if (formState.id) {
        // Update existing distribution
        console.log("Would update distribution with payload:", payload);
        // TODO: Uncomment when API is ready
        // await request({
        //   path: `kit-distro-logs/${formState.id}`,
        //   method: "PUT",
        //   body: payload,
        // });
        toast({
          title: "Success",
          description: "Kit distribution updated successfully. (Mock mode - API not implemented yet)",
          variant: "success",
        });
      } else {
        // Create new distribution
        console.log("Would create distribution with payload:", payload);
        // TODO: Uncomment when API is ready
        // await request({
        //   path: "kit-distro-logs",
        //   method: "POST",
        //   body: payload,
        // });
        toast({
          title: "Success",
          description: "Kit distribution created successfully. (Mock mode - API not implemented yet)",
          variant: "success",
        });
      }
      
      onDistributionCreated();
      onCancel(); // Clear form
    } catch (error: any) {
      console.error("Failed to save distribution:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save kit distribution. Please try again.",
        variant: "error",
      });
    }
  };

  const canDelete = formState.id && !(formState.vol_user_confirm && formState.adm_user_confirm);

  const handleDelete = async () => {
    if (!formState.id) return;
    
    if (formState.vol_user_confirm && formState.adm_user_confirm) {
      toast({
        title: "Cannot Delete",
        description: "This distribution has been confirmed by both parties and cannot be deleted.",
        variant: "error",
      });
      return;
    }

    try {
      console.log("Would delete distribution with ID:", formState.id);
      // TODO: Uncomment when API is ready
      // await request({
      //   path: `kit-distro-logs/${formState.id}`,
      //   method: "DELETE",
      // });
      toast({
        title: "Success",
        description: "Kit distribution deleted successfully. (Mock mode - API not implemented yet)",
        variant: "success",
      });
      onDistributionCreated();
      onCancel();
    } catch (error: any) {
      console.error("Failed to delete distribution:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete kit distribution.",
        variant: "error",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>{formState.id ? "Edit Kit Distribution" : "New Kit Distribution"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Distribution ID and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingInput
              label="Distribution ID"
              value={formState.distro_id}
              onChange={(e) => handleInputChange("distro_id", e.target.value)}
              disabled={isFormDisabled || !!formState.id}
              required
            />
            <FloatingInput
              label="Release Date"
              type="date"
              value={formState.release_date}
              onChange={(e) => handleInputChange("release_date", e.target.value)}
              disabled={isFormDisabled}
              required
            />
          </div>

          {/* Volunteer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Select Volunteer</span>
            </label>
            <ReactSelect
              options={volunteerOptions}
              value={selectedVolunteerOption}
              onChange={handleVolunteerSelect}
              placeholder="Search and select a volunteer..."
              isSearchable
              isLoading={isLoadingVolunteers}
              isDisabled={isFormDisabled}
              className="react-select-container"
              classNamePrefix="react-select"
              noOptionsMessage={() => "No volunteers found"}
            />
          </div>

          {/* Quantity */}
          <FloatingInput
            label="Quantity"
            type="number"
            min="1"
            value={formState.quantity}
            onChange={(e) => handleInputChange("quantity", e.target.value)}
            disabled={isFormDisabled}
            required
          />

          {/* Confirmation Status (Read-only) */}
          {formState.id && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50">
                {formState.adm_user_confirm ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <span className="text-sm">
                  Admin Confirmed: {formState.adm_user_confirm ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50">
                {formState.vol_user_confirm ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <span className="text-sm">
                  Volunteer Confirmed: {formState.vol_user_confirm ? "Yes" : "No"}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onNewDistribution}
              >
                New Distribution
              </Button>
            </div>
            <div className="flex space-x-3">
              {canDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
              {!isFormDisabled && (
                <Button type="submit">
                  {formState.id ? "Update Distribution" : "Create Distribution"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default KitDistributionForm;
