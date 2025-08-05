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
import { useApi } from "@/lib/useApi"
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
  showPasswordFields?: boolean;
  communities?: any[];
}

export function UserForm({ user, onSuccess, showPasswordFields = false, communities: propCommunities = [] }: UserFormProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [communities, setCommunities] = useState<any[]>(propCommunities);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<string[]>([]);
  const [communityOptions, setCommunityOptions] = useState<string[]>([]);
  const isInitialMount = useRef(true);
  const { request } = useApi();

  const schema = showPasswordFields ? createUserSchema : updateUserSchema;

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

  const watchedRegion = form.watch("region");
  const watchedDistrict = form.watch("district");
  const watchedSubdistrict = form.watch("subdistrict");

  // Reset isInitialMount when user prop changes
  useEffect(() => {
    isInitialMount.current = true;
  }, [user]);

  // Update communities when propCommunities changes and set region options
  useEffect(() => {
    if (propCommunities.length > 0) {
      setCommunities(propCommunities);
      const regions = [...new Set(propCommunities.map((c: any) => c.region))].sort() as string[];
      setRegionOptions(regions);
    }
  }, [propCommunities]);

  // Fetch communities on mount only if not provided via props
  useEffect(() => {
    if (propCommunities.length === 0) {
      request({ path: 'communities' })
        .then(data => {
          setCommunities(data);
          const regions = [...new Set(data.map((c: any) => c.region))].sort() as string[];
          setRegionOptions(regions);
        });
    }
  }, [request, propCommunities.length]);

  // Handle region change
  useEffect(() => {
    if (isInitialMount.current && user && communities.length > 0) {
      // If in edit mode, pre-fill the form with user data
      const userRegion = user.region || '';
      const userDistrict = user.district || '';
      const userSubdistrict = user.subdistrict || '';
      const userCommunity = user.community_name || '';

      if (userRegion) {
        const districts = [...new Set(communities.filter((c: any) => c.region === userRegion).map((c: any) => c.district))].sort() as string[];
        setDistrictOptions(districts);
      }
      if (userDistrict) {
        const subdistricts = [...new Set(communities.filter((c: any) => c.district === userDistrict).map((c: any) => c.subdistrict))].sort() as string[];
        setSubdistrictOptions(subdistricts);
      }
      if (userSubdistrict) {
        const comms = [...new Set(communities.filter((c: any) => c.subdistrict === userSubdistrict).map((c: any) => c.community_name))].sort() as string[];
        setCommunityOptions(comms);
      }

      form.reset({
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone || '',
        user_type: user.user_type,
        access_level: user.access_level,
        region: userRegion,
        district: userDistrict,
        subdistrict: userSubdistrict,
        community_name: userCommunity,
      });

      // Set isInitialMount to false after a small delay to allow cascading options to be set
      setTimeout(() => {
        isInitialMount.current = false;
      }, 50);
      return; // Prevent resetting fields on initial load for existing user
    }

    if (isInitialMount.current) return;

    form.setValue("district", "");
    form.setValue("subdistrict", "");
    form.setValue("community_name", "");

    if (watchedRegion) {
      const districts = [...new Set(communities.filter((c: any) => c.region === watchedRegion).map((c: any) => c.district))].sort() as string[];
      setDistrictOptions(districts);
    } else {
      setDistrictOptions([]);
    }
  }, [watchedRegion, communities, form, user, isInitialMount]);

  // Handle district change
  useEffect(() => {
    // For initial population during edit mode, we need to set options without clearing values
    if (isInitialMount.current && user) {
      if (watchedDistrict && communities.length > 0) {
        const subdistricts = [...new Set(communities.filter((c: any) => c.district === watchedDistrict).map((c: any) => c.subdistrict))].sort() as string[];
        setSubdistrictOptions(subdistricts);
      }
      return;
    }

    if (isInitialMount.current) return;

    form.setValue("subdistrict", "");
    form.setValue("community_name", "");

    if (watchedDistrict) {
      const subdistricts = [...new Set(communities.filter((c: any) => c.district === watchedDistrict).map((c: any) => c.subdistrict))].sort() as string[];
      setSubdistrictOptions(subdistricts);
    } else {
      setSubdistrictOptions([]);
    }
  }, [watchedDistrict, communities, form, user, isInitialMount]);

  // Handle subdistrict change
  useEffect(() => {
    // For initial population during edit mode, we need to set options without clearing values
    if (isInitialMount.current && user) {
      if (watchedSubdistrict && communities.length > 0) {
        const comms = [...new Set(communities.filter((c: any) => c.subdistrict === watchedSubdistrict).map((c: any) => c.community_name))].sort() as string[];
        setCommunityOptions(comms);
      }
      return;
    }

    if (isInitialMount.current) return;

    form.setValue("community_name", "");

    if (watchedSubdistrict) {
      const comms = [...new Set(communities.filter((c: any) => c.subdistrict === watchedSubdistrict).map((c: any) => c.community_name))].sort() as string[];
      setCommunityOptions(comms);
    } else {
      setCommunityOptions([]);
    }
  }, [watchedSubdistrict, communities, form, user, isInitialMount]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = { ...values };
      // Remove confirmPassword from payload as it's not needed by the API
      delete payload.confirmPassword;

      // If password is empty, remove it from the payload for updates
      if (!payload.password) {
        delete payload.password;
      }

      await request({
        path: user ? `accounts/${user.account_id}` : 'accounts',
        method: user ? 'PUT' : 'POST',
        body: payload,
      });

      toast({ variant: 'success', title: user ? 'Account updated successfully' : 'Account created successfully' });
      onSuccess();
    } catch (error: any) {
      console.error("Failed to submit form:", error);
      toast({ variant: 'error', title: 'Operation Failed', description: error.message || 'An unknown error occurred.' });
    }
  }

  const onInvalid = (errors: any) => {
    console.error("Form validation errors:", errors);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <div className="space-y-4">
            <h3 className="text-lg font-medium">User Information</h3>
            <hr />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions & Role</h3>
            <hr />
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
        </div>

        {showPasswordFields && (
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Password</h3>
                <hr />
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
            </div>
        )}

        <div className="space-y-4">
            <h3 className="text-lg font-medium">Geographic Assignment</h3>
            <hr />
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
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Create User')}
        </Button>
      </form>
    </Form>
  )
}
