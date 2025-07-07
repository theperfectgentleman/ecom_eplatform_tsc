import { useEffect, useState } from "react";
import { Account, AccessLevel } from "@/types";
import { useApi } from "@/lib/useApi";
import { Button, buttonVariants } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast/useToast";
import { normalizeAccounts } from "@/lib/normalizeAccount";
import { Badge } from "@/components/ui/badge";
import { accessLevelColors, userTypeColors } from "@/lib/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Pencil, Trash2 } from "lucide-react";
import PasswordResetModal from "@/components/profile/PasswordResetModal";

const Admin = () => {
  const [data, setData] = useState<Account[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);
  const [accountToDelete, setAccountToDelete] = useState<Account | undefined>(undefined);
  const [filterText, setFilterText] = useState("");
  const { toast } = useToast();
  const { request } = useApi();

  const fetchAccounts = async () => {
    try {
      const response = await request<Account[]>({ path: "accounts" });
      setData(normalizeAccounts(response));
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast({ variant: 'error', title: 'Failed to fetch accounts' });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredData = data.filter(
    (account) =>
      account.firstname.toLowerCase().includes(filterText.toLowerCase()) ||
      account.lastname.toLowerCase().includes(filterText.toLowerCase()) ||
      account.email.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsFormDialogOpen(true);
  };

  const handleDelete = (account: Account) => {
    setAccountToDelete(account);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = (account: Account) => {
    setSelectedAccount(account);
    setIsResetPasswordOpen(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await request({ path: `accounts/${accountToDelete.account_id}`, method: 'DELETE' });
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

  const userTypeTemplate = (props: Account) => {
    return (
      <Badge variant="outline">
        {props.user_type.toUpperCase()}
      </Badge>
    );
  };

  const accessLevelTemplate = (props: Account) => {
    const accessLevelLabel = AccessLevel[props.access_level] || String(props.access_level);
    return (
      <Badge variant="outline">
        {accessLevelLabel.toUpperCase()}
      </Badge>
    );
  };

  const actionTemplate = (props: Account) => {
    return (
      <div className="flex gap-2 justify-center">
        <Button variant="outline" size="sm" onClick={() => handleEdit(props)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleResetPassword(props)}>
            <KeyRound className="h-4 w-4 mr-2" />
            Reset Password
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleDelete(props)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Account Management</CardTitle>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Filter by name or email..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="max-w-sm"
                        />
                        <Button onClick={handleCreate}>Create Account</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>First Name</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Access Level</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((account) => (
                                    <TableRow key={account.account_id}>
                                        <TableCell>{account.firstname}</TableCell>
                                        <TableCell>{account.lastname}</TableCell>
                                        <TableCell>{account.email}</TableCell>
                                        <TableCell>{userTypeTemplate(account)}</TableCell>
                                        <TableCell>{accessLevelTemplate(account)}</TableCell>
                                        <TableCell>{actionTemplate(account)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>{selectedAccount ? "Edit Account" : "Create Account"}</DialogTitle>
            <DialogDescription>
              {selectedAccount ? 'Update the details of the existing account.' : 'Enter the details for the new account.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm user={selectedAccount} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>

      <PasswordResetModal 
        isOpen={isResetPasswordOpen} 
        onOpenChange={setIsResetPasswordOpen} 
        account={selectedAccount} 
      />

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
    </div>
  );
};

export default Admin;
