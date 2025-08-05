import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/useApi";
import { useToast } from "@/components/ui/toast/useToast";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";
import { Account, AccessLevel } from "@/types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, User, Edit, RotateCcw, UserPlus, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
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
import { normalizeAccounts } from "@/lib/normalizeAccount";

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

interface AccountListProps {
  onAccountSelect: (account: Account) => void;
  onCreateNew: () => void;
  onEditAccount: (account: Account) => void;
  onResetPassword: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
  selectedAccountId: string | null;
  refreshTrigger?: number;
}

const AccountList: React.FC<AccountListProps> = ({
  onAccountSelect,
  onCreateNew,
  onEditAccount,
  onResetPassword,
  onDeleteAccount,
  selectedAccountId,
  refreshTrigger = 0,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { request } = useApi();
  const { toast } = useToast();
  const { filterByAccessLevel } = useAccessLevelFilter();

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await request<Account[]>({ path: "accounts" });
      const normalizedAccounts = normalizeAccounts(response);
      // Apply access level filtering
      const filteredAccounts = filterByAccessLevel(normalizedAccounts);
      setAccounts(filteredAccounts);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast({ variant: 'error', title: 'Failed to fetch accounts' });
    } finally {
      setIsLoading(false);
    }
  }, [request, filterByAccessLevel, toast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts, refreshTrigger]);

  const filteredAccounts = accounts.filter(
    (account) =>
      account.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAccountClick = (account: Account) => {
    onAccountSelect(account);
  };

  const handleEditClick = (e: React.MouseEvent, account: Account) => {
    e.stopPropagation();
    onEditAccount(account);
  };

  const handleResetPasswordClick = (e: React.MouseEvent, account: Account) => {
    e.stopPropagation();
    onResetPassword(account);
  };

  const handleDeleteClick = (e: React.MouseEvent, account: Account) => {
    e.stopPropagation();
    setDeleteAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteAccount) {
      onDeleteAccount(deleteAccount);
      setIsDeleteDialogOpen(false);
      setDeleteAccount(null);
    }
  };

  const getUserTypeLabel = (userType: string) => {
    return userType.toUpperCase();
  };

  const getAccessLevelLabel = (accessLevel: number) => {
    return AccessLevel[accessLevel] || String(accessLevel);
  };

  return (
    <>
      <style>{listStyles}</style>
      <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Account Management</h2>
            <Button
              onClick={onCreateNew}
              size="sm"
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading accounts...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchTerm ? "No accounts found matching your search." : "No accounts available."}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredAccounts.map((account) => (
                <div
                  key={account.account_id}
                  onClick={() => handleAccountClick(account)}
                  className={`p-4 rounded-lg border mb-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedAccountId === account.account_id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {account.firstname} {account.lastname}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        @{account.username}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getUserTypeLabel(account.user_type)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getAccessLevelLabel(account.access_level)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                      <button
                        onClick={(e) => handleEditClick(e, account)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Account"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleResetPasswordClick(e, account)}
                        className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        title="Reset Password"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, account)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for{" "}
              <strong>{deleteAccount?.firstname} {deleteAccount?.lastname}</strong>.
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
    </>
  );
};

export default AccountList;
