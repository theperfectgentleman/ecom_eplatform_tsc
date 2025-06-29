import { useEffect, useState } from "react";
import { Account } from "@/types";
import { useApi } from "@/lib/useApi";
import { getColumns } from "@/components/admin/columns";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserForm } from "@/components/admin/UserForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/toast/useToast";
import { buttonVariants } from "@/components/ui/button";
import { normalizeAccounts } from "@/lib/normalizeAccount";

const Admin = () => {
  const [data, setData] = useState<Account[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
  const [accountToDelete, setAccountToDelete] = useState<Account | undefined>(undefined);
  const { toast } = useToast();
  const { request } = useApi();

  const fetchAccounts = async () => {
    try {
      const response = await request<Account[]>({ path: "api/accounts" });
      setData(normalizeAccounts(response));
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast({ variant: 'error', title: 'Failed to fetch accounts' });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsFormDialogOpen(true);
  };

  const handleDelete = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await request({ path: `api/accounts/${accountToDelete.account_id}`, method: 'DELETE' });
      toast({ variant: 'success', title: 'Account deleted successfully' });
      fetchAccounts(); // Refetch accounts after deletion
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast({ variant: 'error', title: 'Failed to delete account' });
    } finally {
      setIsDeleteDialogOpen(false);
      setAccountToDelete(undefined);
    }
  };

  const handleCreate = () => {
    setSelectedAccount(undefined);
    setIsFormDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsFormDialogOpen(false);
    fetchAccounts(); // Refetch accounts after create/edit
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Account Management</h1>
        <Button onClick={handleCreate}>Create Account</Button>
      </div>
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedAccount ? "Edit Account" : "Create Account"}</DialogTitle>
            <DialogDescription>
              {selectedAccount ? 'Update the details of the existing account.' : 'Enter the details for the new account.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm user={selectedAccount} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for {accountToDelete?.firstname} {accountToDelete?.lastname}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable columns={getColumns({ onEdit: handleEdit, onDelete: handleDelete })} data={data} />
    </div>
  );
};

export default Admin;
