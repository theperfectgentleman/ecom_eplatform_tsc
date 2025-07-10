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
import { Contact } from "@/types";
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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.string().nullable().optional(),
  email1: z.string().email({ message: "Invalid email address." }).optional(),
  mobile1: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
});

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void> | void;
  onCancel: () => void;
}

const ContactForm = ({ contact, onSubmit, onCancel }: ContactFormProps) => {
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
  const [communities, setCommunities] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: contact
      ? {
          ...contact,
          region: contact.region || "",
          district: contact.district || "",
          position: contact.position || null,
        }
      : {
          name: "",
          position: null,
          email1: "",
          mobile1: "",
          region: "",
          district: "",
        },
  });

  const watchedRegion = form.watch("region");

  useEffect(() => {
    request({ path: "communities" }).then((data) => {
      setCommunities(data);
      const regions = [
        ...new Set(data.map((c: any) => c.region)),
      ].sort() as string[];
      setRegionOptions(regions);
    });
  }, [request]);

  useEffect(() => {
    if (watchedRegion) {
      const districts = [
        ...new Set(
          communities
            .filter((c: any) => c.region === watchedRegion)
            .map((c: any) => c.district)
        ),
      ].sort() as string[];
      setDistrictOptions(districts);
    } else {
      setDistrictOptions([]);
    }
    form.setValue("district", "");
  }, [watchedRegion, communities, form]);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
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
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Autocomplete
                      options={roleOptions}
                      value={field.value || null}
                      onChange={(event, newValue) => {
                        field.onChange(newValue);
                      }}
                      onBlur={field.onBlur}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Select a role" 
                          variant="outlined" 
                          size="small"
                          error={!!form.formState.errors.position}
                          helperText={form.formState.errors.position?.message}
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option === value}
                      getOptionLabel={(option) => option || ""}
                      fullWidth
                      disableClearable={false}
                      clearOnBlur={false}
                      selectOnFocus
                      handleHomeEndKeys
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
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
                    <Input placeholder="+1234567890" {...field} />
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
                      defaultValue={field.value}
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
                      disabled={!watchedRegion}
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
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
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
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;