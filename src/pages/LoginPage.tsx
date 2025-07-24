import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/lib/useApi';
import { useToast } from '@/components/ui/toast/useToast';
import { AccessLevel, UserType, Account } from '@/types';
import { shouldRedirectToGuide } from '@/lib/permissions';
import logo from '@/img/logo.png';
import docNurse from '@/img/doc_nurse.png';
import docPat from '@/img/doc_pat.png';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// ...existing code...

const formSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const images = [docNurse, docPat];

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { request } = useApi();
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [systemStatus, setSystemStatus] = useState<"checking" | "live" | "down">("checking");

  // Check system status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await request<{ status: string }>({
          path: "status",
          method: "GET",
        });
        if (response && response.status === "live system") {
          setSystemStatus("live");
        } else {
          setSystemStatus("down");
        }
      } catch (error) {
        console.error("System status check failed:", error);
        setSystemStatus("down");
      }
    };

    checkStatus();
  }, [request]);

  // Redirect to appropriate page if already logged in
  useEffect(() => {
    console.log('LoginPage useEffect - Current user:', user);
    
    if (user) {
      console.log('User is logged in, navigating to appropriate page');
      
      // Redirect unknown types or volunteers to guide, others to dashboard
      if (shouldRedirectToGuide(user.user_type)) {
        console.log('User should go to guide, redirecting to guide');
        navigate('/guide', { replace: true });
      } else {
        console.log('Regular user, navigating to dashboard');
        navigate('/dashboard', { replace: true });
      }
    } else {
      console.log('User is not logged in yet');
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Form values:', values);

    const payload = {
      identifier: values.username,
      password: values.password,
    };

    console.log('Login payload:', payload);

    try {
      const response = await request({
        path: 'accounts/login',
        method: 'POST',
        body: payload,
      });
      
      console.log('Full API response:', response);
      
      // Handle different response structures
      let userData: Account;
      let tokenData: string;
      
      if (response.token && response.user) {
        // Structure: { token, user }
        userData = response.user;
        tokenData = response.token;
      } else if (response.data && response.data.token) {
        // Structure: { data: { token, user } }
        userData = response.data.user;
        tokenData = response.data.token;
      } else if (response.account) {
        // Structure: { account, token }
        userData = response.account;
        tokenData = response.token;
      } else {
        // Fallback: assume the response itself is the user
        userData = response;
        tokenData = localStorage.getItem('token') || 'temp-token';
      }
      
      console.log('Extracted user and token:', { userData, tokenData });
      
      if (userData) {
        login(userData, tokenData);
        console.log('Login function called with user data');
        toast({ variant: 'success', title: 'Login successful!' });
      } else {
        throw new Error('Could not extract user data from response');
      }
    } catch (error: any) {
      console.error('Login failed:', error);

      // Log the full error response if available
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      toast({
        variant: 'error',
        title: 'Login Failed',
        description: error.response?.data?.message || error.message || 'Invalid credentials or server error',
      });
    }
  };

  const handleBypassLogin = () => {
    const mockUser: Account = {
      account_id: 'bypass-account-id',
      username: 'devuser',
      firstname: 'Dev',
      lastname: 'User',
      email: 'devuser@example.com',
      phone: '000-000-0000',
      user_type: UserType.ADMIN,
      access_level: AccessLevel.NATIONAL,
      region: 'bypass-region',
      district: 'bypass-district',
    };

    const mockToken = 'mock-bypass-token';

    console.log('Bypass login with mock user');
    login(mockUser, mockToken);
    toast({ variant: 'success', title: 'Bypass Login Successful!', description: 'Logged in as a mock user.' });
    // Let the useEffect handle navigation instead of doing it here
  };

  const StatusIndicator = () => {
    const statusInfo = {
      checking: {
        icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
        text: "Checking system status...",
        color: "text-gray-500",
      },
      live: {
        icon: <CheckCircle className="mr-2 h-4 w-4" />,
        text: "System is live",
        color: "text-green-500",
      },
      down: {
        icon: <XCircle className="mr-2 h-4 w-4" />,
        text: "System is currently down",
        color: "text-red-500",
      },
    };

    const currentStatus = statusInfo[systemStatus];

    return (
      <div className={`flex items-center text-sm ${currentStatus.color}`}>
        {currentStatus.icon}
        <span>{currentStatus.text}</span>
      </div>
    );
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="relative hidden bg-muted lg:block">
        {images.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-10 left-10 text-white z-10">
          <div className="flex items-center mb-4">
            <img src={logo} alt="Encompass Logo" className="h-12 mr-4" />
            <h1 className="text-5xl font-bold tracking-tighter">Encompass</h1>
          </div>
          <p className="text-xl mt-2 max-w-lg">
            Connecting Healthcare in Rural Communities. Secure, reliable, and always available.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your username below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="your.username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                  {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
                {(() => {
                  // Show bypass button only if URL contains #bypass#bypass
                  if (window.location.hash.includes('#bypass#bypass')) {
                    return (
                      <Button type="button" variant="outline" onClick={handleBypassLogin} className="w-full">
                        Bypass Login (Dev)
                      </Button>
                    );
                  }
                  return null;
                })()}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <StatusIndicator />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
