import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/useApi";
import { Contact } from "@/types";
import ContactForm from "@/components/address/ContactForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Edit, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.string().optional(),
  email1: z.string().email({ message: "Invalid email address." }).optional(),
  mobile1: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
});

const AddressBook = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");
  const { request } = useApi();

  const fetchContacts = async () => {
    try {
      const data = await request({ path: "contacts", method: "GET" });
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleFormSubmit = async (data: { name: string; position?: string; email1?: string; mobile1?: string; region?: string; district?: string }) => {
    try {
      const mappedData = {
        name: data.name,
        position: data.position,
        email1: data.email1,
        mobile1: data.mobile1,
        region: data.region,
        district: data.district,
      };
      
      if (selectedContact) {
        await request({
          path: `contacts/${selectedContact.contactid}`,
          method: "PUT",
          body: mappedData,
        });
      } else {
        await request({ path: "contacts", method: "POST", body: mappedData });
      }
      fetchContacts();
      setIsDialogOpen(false);
      setSelectedContact(undefined);
    } catch (error) {
      console.error("Failed to submit contact", error);
    }
  };

  const openDialog = (contact?: Contact) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    try {
      await request({ path: `contacts/${contactId}`, method: "DELETE" });
      fetchContacts();
    } catch (error) {
      console.error("Failed to delete contact", error);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    Object.values(contact).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Address Book</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => openDialog()}>Create Contact</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Position</TableHead>
                <TableHead className="hidden lg:table-cell">Region</TableHead>
                <TableHead className="hidden lg:table-cell">District</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <TableRow key={contact.contactid}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {contact.position}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {contact.region}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {contact.district}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {contact.email1}
                    </TableCell>
                    <TableCell>{contact.mobile1}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(contact)}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(String(contact.contactid))}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {selectedContact ? "Edit Contact" : "Create Contact"}
              </DialogTitle>
            </DialogHeader>
            <ContactForm
              onSubmit={handleFormSubmit}
              contact={selectedContact}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AddressBook;
