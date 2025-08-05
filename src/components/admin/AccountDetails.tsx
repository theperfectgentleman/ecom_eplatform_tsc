import React from "react";
import { Account } from "@/types";
import { UserPlus, User, KeyRound } from "lucide-react";
import { UserForm } from "./UserForm";
import PasswordResetForm from "./PasswordResetForm";

interface AccountDetailsProps {
  selectedAccount: Account | null;
  activeTab: "create" | "edit" | "password" | null;
  onSuccess: () => void;
  communities: any[];
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ 
  selectedAccount, 
  activeTab,
  onSuccess,
  communities
}) => {
  if (!activeTab) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Account Management</h2>
        <p className="text-sm text-gray-500">
          Select an option from the account list to create, edit, or reset passwords.
        </p>
      </div>
    );
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case "create":
        return "Create New Account";
      case "edit":
        return "Edit Account";
      case "password":
        return "Reset Password";
      default:
        return "Account Management";
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "create":
        return "Enter the details for the new account. A password is required for new accounts.";
      case "edit":
        return "Update the account details. Password changes are handled separately.";
      case "password":
        return "Reset the password for the selected account.";
      default:
        return "";
    }
  };

  const getTabIcon = () => {
    switch (activeTab) {
      case "create":
        return <UserPlus className="h-5 w-5" />;
      case "edit":
        return <User className="h-5 w-5" />;
      case "password":
        return <KeyRound className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border h-full">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          {getTabIcon()}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{getTabTitle()}</h2>
            <p className="text-sm text-gray-600 mt-1">{getTabDescription()}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {(activeTab === "create" || activeTab === "edit") && (
          <UserForm 
            user={activeTab === "edit" ? selectedAccount || undefined : undefined} 
            onSuccess={onSuccess}
            showPasswordFields={activeTab === "create"}
            communities={communities}
          />
        )}
        
        {activeTab === "password" && selectedAccount && (
          <PasswordResetForm 
            account={selectedAccount} 
            onSuccess={onSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AccountDetails;
