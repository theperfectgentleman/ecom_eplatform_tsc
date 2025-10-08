import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Contact, Account } from "@/types";
import { useState, useEffect } from "react";
import { useApi } from "@/lib/useApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Tooltip } from "@/components/ui/tooltip";
import { User, Phone } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.string().min(2, { message: "Role is required." }),
  mobile1: z.string().min(5, { message: "Mobile is required." }),
  email1: z.string().email({ message: "Invalid email address." }).or(z.literal("")).optional(),
  email2: z.string().optional(),
  region: z.string().min(2, { message: "Region is required." }),
  district: z.string().min(2, { message: "District is required." }),
  description: z.string().optional(), // always present, default ""
  // Hide community from UI, but keep in schema for payload
  community: z.string().optional(),
  mobile2: z.string().optional(),
});

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel: () => void;
  readOnly?: boolean;
  currentUser?: Account | null;
  creatorInfo?: Account | null; // Add creator information
}

const ContactForm = ({ contact, onSubmit, onCancel, readOnly = false, currentUser, creatorInfo }: ContactFormProps) => {
  // Debug logging
  console.log('ContactForm props:', { contact, readOnly, currentUser, creatorInfo });
  // Role options, sorted alphabetically
  const roleOptions = [
    "Community Health Nurse",
    "Consultant / Specialist",
    "Dietitian / Nutritionist",
    "Disease Control Officer",
    "General Nurse / Staff Nurse",
    "General Practitioner / Medical Officer",
    "General Surgeon",
    "Health Aide / Orderly",
    "Health Information / Records Officer",
    "House Officer / Intern",
    "Laboratory Scientist / Technologist",
    "Laboratory Technician",
    "Mental Health Nurse",
    "Midwife / Nurse-Midwife",
    "Nurse Anaesthetist",
    "Obstetrician & Gynaecologist (OB/GYN)",
    "Paediatric Nurse",
    "Paediatrician",
    "Pharmacist",
    "Pharmacy Technician",
    "Physician Assistant (Medical)",
    "Physiotherapist",
    "Radiographer / X-ray Technician",
    "Theatre Nurse",
  ].sort((a, b) => a.localeCompare(b));
  
  const { request } = useApi();
  // Store full community objects for region/district mapping
  const [communityObjects, setCommunityObjects] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: contact
      ? {
          ...contact,
          region: contact.region || "",
          district: contact.district || "",
          position: contact.position || "",
          community: "",
          description: contact.description || "",
        }
      : {
          name: "",
          position: "",
          email1: "",
          mobile1: "",
          region: "",
          district: "",
          community: "",
          description: "",
        },
  });

  // Add this effect to update form values when contact changes
  useEffect(() => {
    if (contact) {
      console.log('Loading contact into form:', contact);
      form.reset({
        name: contact.name || contact.Name || "",
        position: contact.position || contact.Position || "",
        email1: contact.email1 || contact.Email1 || "",
        email2: contact.email2 || contact.Email2 || "",
        mobile1: contact.mobile1 || contact.Mobile1 || "",
        mobile2: contact.mobile2 || contact.Mobile2 || "",
        region: contact.region || contact.Region || "",
        district: contact.district || contact.District || "",
        community: "",
        description: contact.description || contact.Description || "",
      });
    } else {
      console.log('Resetting form for new contact');
      form.reset({
        name: "",
        position: "",
        email1: "",
        email2: "",
        mobile1: "",
        mobile2: "",
        region: "",
        district: "",
        community: "",
        description: "",
      });
    }
  }, [contact, form]);

  const watchedRegion = form.watch("region");
  const watchedDistrict = form.watch("district");

  useEffect(() => {
    request({ path: "communities" }).then((data: any[]) => {
      setCommunityObjects(data);
      // Region dropdown: unique, sorted
      const regions = [
        ...new Set(data.map((c: any) => c.region).filter(Boolean)),
      ].sort() as string[];
      setRegionOptions(regions);
      
      // If we have a contact with region/district, populate districts immediately
      const contactRegion = contact?.region || contact?.Region;
      const contactDistrict = contact?.district || contact?.District;
      
      if (contactRegion) {
        console.log('Loading districts for contact region:', contactRegion);
        const districts = [
          ...new Set(
            data
              .filter((c: any) => c.region === contactRegion)
              .map((c: any) => c.district)
              .filter(Boolean)
          ),
        ].sort() as string[];
        setDistrictOptions(districts);
        
        // Verify the contact's district is in the list
        if (contactDistrict && districts.includes(contactDistrict)) {
          console.log('Contact district found in list:', contactDistrict);
        } else if (contactDistrict) {
          console.warn('Contact district not found in region districts:', contactDistrict, 'Available:', districts);
        }
      }
    });
    // request is stable from useApi, but add for exhaustive-deps
  }, [request, contact]);

  useEffect(() => {
    if (watchedRegion && communityObjects.length > 0) {
      console.log('Region changed to:', watchedRegion);
      // Find districts for selected region from communityObjects
      const districts = [
        ...new Set(
          communityObjects
            .filter((c: any) => c.region === watchedRegion)
            .map((c: any) => c.district)
            .filter(Boolean)
        ),
      ].sort() as string[];
      setDistrictOptions(districts);
      console.log('Available districts for region:', districts);
      
      const currentDistrict = form.getValues("district");
      const contactDistrict = contact?.district || contact?.District;
      
      // If we're loading an existing contact and the district is valid for the region, keep it
      if (contact && contactDistrict && districts.includes(contactDistrict)) {
        console.log('Keeping existing contact district:', contactDistrict);
        if (currentDistrict !== contactDistrict) {
          form.setValue("district", contactDistrict);
        }
      } 
      // If user changed region (watchedRegion differs from contact's region), reset district
      else if (contact && watchedRegion !== (contact.region || contact.Region)) {
        console.log('Region changed from original, resetting district');
        form.setValue("district", "");
      }
      // If no contact (new form) and no valid district, reset
      else if (!contact || !districts.includes(currentDistrict)) {
        console.log('Resetting district field for new contact or invalid district');
        form.setValue("district", "");
      }
    } else if (!watchedRegion) {
      setDistrictOptions([]);
      // Only reset district if it's not from an existing contact being loaded
      if (!contact) {
        form.setValue("district", "");
      }
    }
  }, [watchedRegion, communityObjects, form, contact]);

  // Effect for community/subdistrict options based on selected district
  useEffect(() => {
    if (watchedDistrict && communityObjects.length > 0) {
      console.log('District changed to:', watchedDistrict);
      // Find communities for selected district
      const communities = [
        ...new Set(
          communityObjects
            .filter((c: any) => c.district === watchedDistrict)
            .map((c: any) => c.community)
            .filter(Boolean)
        ),
      ].sort() as string[];
      console.log('Available communities for district:', communities);
      
      const currentCommunity = form.getValues("community");
      const contactCommunity = (contact as any)?.community || (contact as any)?.Community;
      
      // If we're loading an existing contact and the community is valid for the district, keep it
      if (contact && contactCommunity && communities.includes(contactCommunity)) {
        console.log('Keeping existing contact community:', contactCommunity);
        if (currentCommunity !== contactCommunity) {
          form.setValue("community", contactCommunity);
        }
      } 
      // If user changed district (watchedDistrict differs from contact's district), reset community
      else if (contact && watchedDistrict !== (contact.district || (contact as any).District)) {
        console.log('District changed from original, resetting community');
        form.setValue("community", "");
      }
      // If no contact (new form) and no valid community, reset
      else if (!contact || !currentCommunity || !communities.includes(currentCommunity)) {
        console.log('Resetting community field for new contact or invalid community');
        form.setValue("community", "");
      }
    } else if (!watchedDistrict) {
      // Only reset community if it's not from an existing contact being loaded
      if (!contact) {
        form.setValue("community", "");
      }
    }
  }, [watchedDistrict, communityObjects, form, contact]);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    // Map frontend form data to backend expected format
    const now = new Date().toISOString();
    const mappedData = {
      ContactID: Math.floor(10000000 + Math.random() * 90000000), // Random 8-digit number
      Name: values.name || "",
      Position: values.position || "",
      Description: values.description || "",
      Region: values.region || "",
      District: values.district || "",
      Email1: values.email1 || "",
      Email2: values.email2 || "",
      Mobile1: values.mobile1 || "",
      Mobile2: values.mobile2 || "",
      CreatedAt: now,
      UpdatedAt: now,
    };
    
    onSubmit(mappedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => {
                // Debug: log value and options
                console.log('Role Autocomplete value:', field.value, typeof field.value);
                console.log('Role Autocomplete options:', roleOptions);
                return (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Autocomplete
                        options={roleOptions}
                        value={typeof field.value === 'string' ? field.value : null}
                        onChange={readOnly ? undefined : ((_, newValue) => {
                          console.log('Autocomplete onChange newValue:', newValue, typeof newValue);
                          field.onChange(typeof newValue === 'string' ? newValue : null);
                        })}
                        renderInput={(params) => (
                          <TextField {...params} label="Select a role" variant="outlined" size="small" disabled={readOnly} />
                        )}
                        fullWidth
                        disablePortal
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="email1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="font-semibold text-lg border-b pb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={readOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regionOptions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={readOnly || (!watchedRegion && !contact)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districtOptions.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Info and optional fields */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Info</FormLabel>
                <FormControl>
                  <Input placeholder="Additional info or notes" {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Email</FormLabel>
                <FormControl>
                  <Input placeholder="Alternate email" {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Mobile</FormLabel>
                <FormControl>
                  <Input placeholder="Alternate mobile" {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between items-center gap-2 pt-4 border-t">
          {/* User info labels - username visible, user_id hidden when editing */}
          {!readOnly && currentUser && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">
                Created by: {currentUser.username}
              </span>
              <span className="text-xs text-gray-400 hidden">
                User ID: {currentUser.user_id}
              </span>
            </div>
          )}
          
          {/* When viewing existing contact, show the contact's user info */}
          {readOnly && contact && (contact.username || contact.user_id) && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Created by:</span>
                {contact.username && (
                  <Tooltip 
                    content={
                      <div className="text-center">
                        <div className="font-semibold">{contact.username}</div>
                        <div className="text-xs opacity-80">Contact Creator</div>
                        {creatorInfo?.phone && (
                          <div className="text-xs opacity-80 mt-1 flex items-center gap-1 justify-center">
                            <Phone className="h-3 w-3" />
                            {creatorInfo.phone}
                          </div>
                        )}
                        {creatorInfo?.email && (
                          <div className="text-xs opacity-80 mt-1">
                            {creatorInfo.email}
                          </div>
                        )}
                        {(creatorInfo?.firstname || creatorInfo?.lastname) && (
                          <div className="text-xs opacity-80 mt-1">
                            {creatorInfo.firstname} {creatorInfo.lastname}
                          </div>
                        )}
                        {contact.CreatedAt || contact.createdat ? (
                          <div className="text-xs opacity-60 mt-1">
                            Created: {new Date(contact.CreatedAt || contact.createdat || '').toLocaleDateString()}
                          </div>
                        ) : null}
                      </div>
                    }
                  >
                    <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-1 cursor-help">
                      <User className="h-3 w-3" />
                      {contact.username}
                    </span>
                  </Tooltip>
                )}
                {contact.CreatedAt || contact.createdat ? (
                  <span className="text-xs text-gray-400">
                    on {new Date(contact.CreatedAt || contact.createdat || '').toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              Cancel
            </Button>
            {!readOnly && (
              <Button type="submit" className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-save"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Submit
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;