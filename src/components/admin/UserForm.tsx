"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Account } from "@/types"
import { AccessLevel, UserType } from "@/types"
import { apiRequest } from "@/lib/api"
import { useToast } from "../ui/toast/useToast"

const baseSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
  firstname: z.string().min(2, "First name must be at least 2 characters."),
  lastname: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  user_type: z.nativeEnum(UserType),
  access_level: z.nativeEnum(AccessLevel),
  district: z.string().optional(),
  region: z.string().optional(),
  subdistrict: z.string().optional(),
  community_name: z.string().optional(),
});

const createUserSchema = baseSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const updateUserSchema = baseSchema;

const formSchema = baseSchema.extend({
    password: z.string().min(8, "Password must be at least 8 characters.").optional(),
    confirmPassword: z.string().optional(),
});

interface UserFormProps {
  user?: Account;
  onSuccess: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<string[]>([]);
  const [communityOptions, setCommunityOptions] = useState<string[]>([]);
  const isInitialMount = useRef(true);

  const schema = user ? updateUserSchema : createUserSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(schema),
    defaultValues: user ? {
      ...user,
      district: user.district || "",
      region: user.region || "",
      subdistrict: user.subdistrict || "",
      community_name: user.community_name || "",
    } : {
      username: "",
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      user_type: UserType.VOLUNTEER,
      access_level: AccessLevel.COMMUNITY,
      district: "",
      region: "",
      subdistrict: "",
      community_name: "",
    },
  });

  const { watch, setValue, getValues } = form;

  // Fetch communities on mount
  useEffect(() => {
    apiRequest({ path: 'api/communities' })
      .then((data) => {
        setCommunities(data);
        const regions = Array.from(
          new Set(data.map((c: any) => String(c.region)).filter(Boolean))
        ) as string[];
        setRegionOptions(["None", ...regions]);

        // Pre-populate dropdowns in edit mode
        if (user) {
            const { region, district, subdistrict } = user;
            if (region) {
                const districts = Array.from(new Set(data.filter((c:any) => c.region === region).map((c:any) => c.district).filter(Boolean))) as string[];
                setDistrictOptions(["None", ...districts]);
            }
            if (district) {
                const subdistricts = Array.from(new Set(data.filter((c:any) => c.region === region && c.district === district).map((c:any) => c.subdistrict).filter(Boolean))) as string[];
                setSubdistrictOptions(["None", ...subdistricts]);
            }
            if (subdistrict) {
                const comms = Array.from(new Set(data.filter((c:any) => c.region === region && c.district === district && c.subdistrict === subdistrict).map((c:any) => c.community_name).filter(Boolean))) as string[];
                setCommunityOptions(["None", ...comms]);
            }
        }
      })
      .catch(() => {
        toast({ title: 'Failed to load communities', variant: 'error' });
      });
  }, [toast, user]);

  const watchedRegion = watch('region');
  const watchedDistrict = watch('district');
  const watchedSubdistrict = watch('subdistrict');

  // Handle region change
  useEffect(() => {
    if (isInitialMount.current) return;
    setValue('district', '');
    setValue('subdistrict', '');
    setValue('community_name', '');
    
    const districts = Array.from(new Set(communities.filter(c => c.region === watchedRegion).map(c => c.district).filter(Boolean))) as string[];
    setDistrictOptions(["None", ...districts]);
    setSubdistrictOptions([]);
    setCommunityOptions([]);

  }, [watchedRegion, communities, setValue]);

  // Handle district change
  useEffect(() => {
    if (isInitialMount.current) return;
    setValue('subdistrict', '');
    setValue('community_name', '');

    const subdistricts = Array.from(new Set(communities.filter(c => c.region === getValues('region') && c.district === watchedDistrict).map(c => c.subdistrict).filter(Boolean))) as string[];
    setSubdistrictOptions(["None", ...subdistricts]);
    setCommunityOptions([]);
  }, [watchedDistrict, communities, setValue, getValues]);

  // Handle subdistrict change
  useEffect(() => {
    if (isInitialMount.current) return;
    setValue('community_name', '');

    const comms = Array.from(new Set(communities.filter(c => c.region === getValues('region') && c.district === getValues('district') && c.subdistrict === watchedSubdistrict).map(c => c.community_name).filter(Boolean))) as string[];
    setCommunityOptions(["None", ...comms]);
  }, [watchedSubdistrict, communities, setValue, getValues]);

  useEffect(() => {
      if(communities.length > 0){
          const timer = setTimeout(() => {
            isInitialMount.current = false;
          }, 500); // A small delay to allow initial values to settle
          return () => clearTimeout(timer);
      }
  }, [communities]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with values:", values);
    try {
      if (user && !user.account_id) {
        console.error('Update attempted with missing account_id:', user);
        toast({
          title: 'Error: Missing account_id',
          description: 'Cannot update account because account_id is missing.',
          variant: 'error',
        });
        return;
      }
      const apiPath = user ? `api/accounts/${user.account_id}` : 'api/accounts';
      const apiMethod = user ? 'PUT' : 'POST';

      await apiRequest({
        method: apiMethod,
        path: apiPath,
        body: {
          ...values,
          // Remove confirmPassword from payload
          confirmPassword: undefined,
        },
      });

      toast({
        title: user ? "User updated" : "User created",
        description: `User ${values.firstname} ${values.lastname} has been successfully ${user ? 'updated' : 'created'}.`,
        variant: "success",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "An error occurred.",
        description: error.message || "Something went wrong.",
        variant: "error",
      });
    }
  }

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
                <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="lastname"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                    <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="user_type"
            render={({ field }) => (
                <FormItem>
                <FormLabel>User Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {Object.values(UserType).map((role) => (
                        <SelectItem key={role} value={role}>
                        {role.toUpperCase()}
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
            name="access_level"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Access Level</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an access level" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {Object.keys(AccessLevel).filter(k => !isNaN(Number(k))).map((level) => (
                        <SelectItem key={level} value={level}>
                        {AccessLevel[Number(level)]}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        {!user && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type={showPassword ? "text" : "password"} placeholder="********" {...field} />
                  </FormControl>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="********" {...field} />
                  </FormControl>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
            </>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                    <Input placeholder="Username" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Region</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {regionOptions.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
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
                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedRegion}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a district" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {districtOptions.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="subdistrict"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Subdistrict</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrict}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a subdistrict" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {subdistrictOptions.map((subdistrict) => (
                        <SelectItem key={subdistrict} value={subdistrict}>{subdistrict}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="community_name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Community</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!watchedSubdistrict}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a community" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {communityOptions.map((community) => (
                        <SelectItem key={community} value={community}>{community}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Create User')}
        </Button>
      </form>
    </Form>
  )
}
