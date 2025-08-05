import { useState, useEffect } from "react";
import { Account } from "@/types";
import { useApi } from "@/lib/useApi";
import { useToast } from "@/components/ui/toast/useToast";
import AccountList from "@/components/admin/AccountList";
import AccountDetails from "@/components/admin/AccountDetails";

const Admin = () => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "edit" | "password" | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formKey, setFormKey] = useState(0); // Add this to force remount
  const [communities, setCommunities] = useState<any[]>([]);
  const { request } = useApi();
  const { toast } = useToast();

  // Preload communities data when component mounts
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const data = await request({ path: 'communities' });
        setCommunities(data);
      } catch (error) {
        console.error("Failed to fetch communities:", error);
        // Don't show toast error for this as it's a background fetch
      }
    };
    
    fetchCommunities();
  }, [request]);

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setActiveTab(null); // Reset tab when selecting a different account
  };

  const handleCreateNew = () => {
    setSelectedAccount(null);
    setActiveTab("create");
    setFormKey((prevKey) => prevKey + 1); // Increment key to force remount
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setActiveTab("edit");
    setFormKey((prevKey) => prevKey + 1); // Increment key to force remount
  };

  const handleResetPassword = (account: Account) => {
    setSelectedAccount(account);
    setActiveTab("password");
  };

  const handleDeleteAccount = async (account: Account) => {
    try {
      await request({ path: `accounts/${account.account_id}`, method: 'DELETE' });
      toast({ variant: 'success', title: 'Account deleted successfully' });
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
      // Clear selection if the deleted account was selected
      if (selectedAccount?.account_id === account.account_id) {
        setSelectedAccount(null);
        setActiveTab(null);
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast({ variant: 'error', title: 'Failed to delete account' });
    }
  };

  const handleSuccess = () => {
    setActiveTab(null);
    setSelectedAccount(null);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
    setFormKey((prevKey) => prevKey + 1); // Increment key to force remount
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Administration</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="w-full md:w-[65%] min-w-0">
          <AccountDetails 
            key={formKey} // Add key here to force remount when account is selected
            selectedAccount={selectedAccount} 
            activeTab={activeTab}
            onSuccess={handleSuccess}
            communities={communities}
          />
        </div>
        <aside className="w-full md:w-[35%] min-w-0">
          <AccountList
            onAccountSelect={handleAccountSelect}
            onCreateNew={handleCreateNew}
            onEditAccount={handleEditAccount}
            onResetPassword={handleResetPassword}
            onDeleteAccount={handleDeleteAccount}
            selectedAccountId={selectedAccount?.account_id || null}
            refreshTrigger={refreshTrigger}
          />
        </aside>
      </div>
    </>
  );
};

export default Admin;
