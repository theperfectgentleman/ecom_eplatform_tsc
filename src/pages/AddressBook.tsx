import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/useApi";
import { Contact } from "@/types";
import ContactForm from "@/components/address/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Trash2 } from "lucide-react";
import { useState as useReactState } from "react";
import { useToast } from "@/components/ui/toast/useToast";

const AddressBook = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);
  const [formEditable, setFormEditable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { request } = useApi();
  const { toast } = useToast();

  const fetchContacts = async () => {
    try {
      const data = await request({ path: "contacts", method: "GET" });
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts. Please try again.",
        variant: "error",
      });
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleFormSubmit = async (data: any) => {
    try {
      // Data is already properly mapped from ContactForm
      if (selectedContact) {
        // For updates, use the existing contact ID and update timestamp
        const updateData = {
          ...data,
          ContactID: selectedContact.ContactID,
          UpdatedAt: new Date().toISOString(),
        };
        await request({
          path: `contacts/${selectedContact.ContactID}`,
          method: "PUT",
          body: updateData,
        });
        toast({
          title: "Success",
          description: "Contact updated successfully.",
          variant: "success",
        });
      } else {
        // For new contacts, use the mapped data as-is
        await request({ path: "contacts", method: "POST", body: data });
        toast({
          title: "Success",
          description: "Contact created successfully.",
          variant: "success",
        });
      }
      fetchContacts();
      setIsDialogOpen(false);
      setSelectedContact(undefined);
      setFormEditable(false);
    } catch (error) {
      console.error("Failed to submit contact", error);
      toast({
        title: "Error",
        description: selectedContact ? "Failed to update contact. Please try again." : "Failed to create contact. Please try again.",
        variant: "error",
      });
    }
  };

  const openDialog = (contact?: Contact) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
    setFormEditable(true);
  };

  // When a contact is selected from the list, show in form as read-only
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
    setFormEditable(false);
  };

  // Close dialog and reset form
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedContact(undefined);
    setFormEditable(false);
  };


  // Confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useReactState<{ id: string; name: string } | null>(null);

  const handleDelete = async (contactId: string) => {
    setDeleteConfirm(null);
    try {
      await request({ path: `contacts/${contactId}`, method: "DELETE" });
      fetchContacts();
      toast({
        title: "Success",
        description: "Contact deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to delete contact", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "error",
      });
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    Object.values(contact).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Contact Form or Empty State */}
      <div className="w-1/2 p-6 bg-white border-r overflow-y-auto scrollbar-hide">
        {(isDialogOpen || selectedContact) ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">{selectedContact ? (formEditable ? "Edit Contact" : "Contact Details") : "Create Contact"}</h2>
            <ContactForm
              onSubmit={handleFormSubmit}
              contact={selectedContact}
              onCancel={closeDialog}
              readOnly={!formEditable}
            />
            {/* Removed Edit button from form - editing is only triggered from the list */}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <CardTitle className="text-2xl mb-2">No Contact Selected</CardTitle>
              <p className="text-gray-500 mb-4">Select a contact to view or create a new one</p>
              <Button onClick={() => openDialog()}>
                <Edit className="mr-2 h-4 w-4" />
                New Contact
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Right Panel - Contacts List */}
      <div className="w-1/2 p-6 overflow-y-auto scrollbar-hide">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Edit className="mr-2 h-5 w-5" />
                Address Book ({filteredContacts.length})
              </CardTitle>
              <Button onClick={() => openDialog()} size="sm">
                <Edit className="mr-2 h-4 w-4" />
                New
              </Button>
            </div>
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-4"
            />
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No contacts found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.ContactID}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-base mb-1">{contact.Name}</div>
                          <div className="text-sm text-gray-700 mb-1">{contact.Mobile1}{contact.Mobile2 ? `, ${contact.Mobile2}` : ''}</div>
                          <div className="text-xs text-gray-500 mb-1">
                            {contact.Region ? `Region: ${contact.Region}` : ''}
                            {contact.Region && contact.District ? ' | ' : ''}
                            {contact.District ? `District: ${contact.District}` : ''}
                          </div>
                          {contact.Position && (
                            <div className="text-xs text-gray-400 mb-1">{contact.Position}</div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation();
                              openDialog(contact);
                            }}
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            setDeleteConfirm({ id: String(contact.ContactID), name: contact.Name || 'Unknown Contact' });
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Delete Contact</h3>
            <p className="mb-4">Are you sure you want to delete <span className="font-bold">{deleteConfirm.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteConfirm.id)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddressBook;
