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
import packageJson from '../../package.json';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LOGIN_LOCKOUT_SESSION_KEY = 'tsc_login_lockout';
const MAX_FAILED_ATTEMPTS = 4;
const LOGIN_LOCKOUT_MS = 10 * 60 * 1000;

interface LoginLockoutState {
  failedAttempts: number;
  lockedUntil: number | null;
}

interface TwoFactorAnnouncement {
  show: boolean;
  activationDate: string;
  title: string;
  description: string;
}

interface PendingAnnouncementState {
  userData: Account;
  tokenData: string;
  announcement: TwoFactorAnnouncement;
}

interface PendingTwoFactorState {
  preAuthToken: string;
  phoneHint: string;
  expiresInMinutes: number;
}

const getDefaultLockoutState = (): LoginLockoutState => ({
  failedAttempts: 0,
  lockedUntil: null,
});

const readLockoutState = (): LoginLockoutState => {
  try {
    const rawValue = sessionStorage.getItem(LOGIN_LOCKOUT_SESSION_KEY);
    if (!rawValue) {
      return getDefaultLockoutState();
    }

    const parsedValue = JSON.parse(rawValue) as Partial<LoginLockoutState>;
    const failedAttempts = typeof parsedValue.failedAttempts === 'number' ? parsedValue.failedAttempts : 0;
    const lockedUntil = typeof parsedValue.lockedUntil === 'number' ? parsedValue.lockedUntil : null;

    if (lockedUntil && lockedUntil <= Date.now()) {
      sessionStorage.removeItem(LOGIN_LOCKOUT_SESSION_KEY);
      return getDefaultLockoutState();
    }

    return { failedAttempts, lockedUntil };
  } catch {
    sessionStorage.removeItem(LOGIN_LOCKOUT_SESSION_KEY);
    return getDefaultLockoutState();
  }
};

const writeLockoutState = (state: LoginLockoutState) => {
  sessionStorage.setItem(LOGIN_LOCKOUT_SESSION_KEY, JSON.stringify(state));
};

const clearLockoutState = () => {
  sessionStorage.removeItem(LOGIN_LOCKOUT_SESSION_KEY);
};

const formatRemainingLockout = (remainingMs: number) => {
  const totalSeconds = Math.max(Math.ceil(remainingMs / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
};

const isCredentialFailure = (error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  return /invalid username\/email\/phone or password/i.test(message);
};

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
  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const [loginLockout, setLoginLockout] = useState<LoginLockoutState>(getDefaultLockoutState());
  const [lockoutNow, setLockoutNow] = useState(() => Date.now());
  const [pendingAnnouncement, setPendingAnnouncement] = useState<PendingAnnouncementState | null>(null);
  const [pendingTwoFactor, setPendingTwoFactor] = useState<PendingTwoFactorState | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] = useState(false);

  // Check system status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Use the public health endpoint that doesn't require authentication
        const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.encompas.org/api').replace(/\/$/, '');
        
        const response = await fetch(`${apiBaseUrl}/health`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        if (response.ok) {
          const healthData = await response.json();
          console.log("API health check - Status:", response.status, "Data:", healthData);
          setSystemStatus("live");
          // Store API version if available
          if (healthData.version) {
            setApiVersion(healthData.version);
          }
        } else {
          console.warn("API health check returned non-OK status:", response.status);
          setSystemStatus("down");
        }
        
      } catch (error) {
        console.error("API health check failed:", error);
        setSystemStatus("down");
      }
    };

    checkStatus();
  }, []);

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
    setLoginLockout(readLockoutState());
  }, []);

  useEffect(() => {
    if (!loginLockout.lockedUntil || loginLockout.lockedUntil <= Date.now()) {
      return;
    }

    const interval = window.setInterval(() => {
      const now = Date.now();
      setLockoutNow(now);

      if (loginLockout.lockedUntil && loginLockout.lockedUntil <= now) {
        clearLockoutState();
        setLoginLockout(getDefaultLockoutState());
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [loginLockout.lockedUntil]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  // Check for logout reasons and show appropriate messages
  useEffect(() => {
    const logoutReason = sessionStorage.getItem('logout_reason');
    const logoutMessage = sessionStorage.getItem('logout_message');
    
    if (logoutReason) {
      // Clear the stored reason
      sessionStorage.removeItem('logout_reason');
      sessionStorage.removeItem('logout_message');
      
      const messages = {
        expired: 'Your session has expired. Please log in again to continue.',
        unauthorized: 'Your access has been revoked. Please log in again.',
        manual: 'You have been logged out successfully.'
      };
      
      toast({
        variant: logoutReason === 'expired' ? 'warning' : 'info',
        title: logoutReason === 'expired' ? 'Session Expired' : 'Logged Out',
        description: logoutMessage || messages[logoutReason as keyof typeof messages] || messages.manual,
      });
    }
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', password: '' },
  });

  const completeLogin = (userData: Account, tokenData: string) => {
    clearLockoutState();
    setLoginLockout(getDefaultLockoutState());
    login(userData, tokenData);
    toast({ variant: 'success', title: 'Login successful!' });
  };

  const acknowledgeAnnouncement = () => {
    if (!pendingAnnouncement) {
      return;
    }

    const { userData, tokenData } = pendingAnnouncement;
    setPendingAnnouncement(null);
    completeLogin(userData, tokenData);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const currentLockout = readLockoutState();
    if (currentLockout.lockedUntil && currentLockout.lockedUntil > Date.now()) {
      const remaining = currentLockout.lockedUntil - Date.now();
      setLoginLockout(currentLockout);
      toast({
        variant: 'warning',
        title: 'Too many login attempts',
        description: `Please wait ${formatRemainingLockout(remaining)} before trying again.`,
      });
      return;
    }

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
        isPublic: true,
        headers: {
          'x-encompas-client': 'tsc-web',
        },
        suppressToast: { error: true },
      });

      if (response.requiresTwoFactor && response.preAuthToken) {
        setPendingTwoFactor({
          preAuthToken: response.preAuthToken,
          phoneHint: response.phoneHint || '',
          expiresInMinutes: response.expiresInMinutes || 5,
        });
        setTwoFactorCode('');
        toast({
          variant: 'info',
          title: 'Verification code sent',
          description: `Enter the code sent to ${response.phoneHint || 'your registered phone number'}.`,
        });
        return;
      }
      
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
        if (response.twoFactorAnnouncement?.show && (userData.user_type === UserType.ADMIN || userData.user_type === UserType.SUPER)) {
          setPendingAnnouncement({
            userData,
            tokenData,
            announcement: response.twoFactorAnnouncement,
          });
          return;
        }

        console.log('Login function called with user data');
        completeLogin(userData, tokenData);
      } else {
        throw new Error('Could not extract user data from response');
      }
    } catch (error: any) {
      console.error('Login failed:', error);

      if (isCredentialFailure(error)) {
        const currentState = readLockoutState();
        const nextFailedAttempts = currentState.failedAttempts + 1;
        const nextState: LoginLockoutState = {
          failedAttempts: nextFailedAttempts,
          lockedUntil: nextFailedAttempts >= MAX_FAILED_ATTEMPTS ? Date.now() + LOGIN_LOCKOUT_MS : null,
        };

        writeLockoutState(nextState);
        setLoginLockout(nextState);

        if (nextState.lockedUntil) {
          toast({
            variant: 'warning',
            title: 'Login temporarily locked',
            description: 'Too many failed login attempts. Please wait 10 minutes before trying again.',
          });
          return;
        }

        const attemptsRemaining = Math.max(MAX_FAILED_ATTEMPTS - nextFailedAttempts, 0);
        toast({
          variant: 'error',
          title: 'Login Failed',
          description: `Invalid credentials. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before a 10-minute lockout.`,
        });
        return;
      }

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

  const handleTwoFactorVerification = async () => {
    if (!pendingTwoFactor || !twoFactorCode.trim()) {
      toast({
        variant: 'warning',
        title: 'Verification code required',
        description: 'Enter the code sent to your phone to continue.',
      });
      return;
    }

    setIsVerifyingTwoFactor(true);

    try {
      const response = await request({
        path: 'accounts/2fa/verify',
        method: 'POST',
        body: {
          preAuthToken: pendingTwoFactor.preAuthToken,
          code: twoFactorCode.trim(),
        },
        isPublic: true,
        headers: {
          'x-encompas-client': 'tsc-web',
        },
        suppressToast: { error: true },
      });

      const userData: Account = response.account;
      const tokenData: string = response.token;

      if (!userData || !tokenData) {
        throw new Error('Unable to complete verification');
      }

      setPendingTwoFactor(null);
      setTwoFactorCode('');
      completeLogin(userData, tokenData);
    } catch (error: any) {
      toast({
        variant: 'error',
        title: 'Verification failed',
        description: error.message || 'Unable to verify the code.',
      });
    } finally {
      setIsVerifyingTwoFactor(false);
    }
  };

  const isLoginLocked = Boolean(loginLockout.lockedUntil && loginLockout.lockedUntil > lockoutNow);
  const lockoutRemainingMs = isLoginLocked && loginLockout.lockedUntil
    ? loginLockout.lockedUntil - lockoutNow
    : 0;
  const attemptsRemaining = Math.max(MAX_FAILED_ATTEMPTS - loginLockout.failedAttempts, 0);

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
        text: "Checking API connectivity...",
        color: "text-gray-500",
      },
      live: {
        icon: <CheckCircle className="mr-2 h-4 w-4" />,
        text: apiVersion ? `API server is reachable (v${apiVersion})` : "API server is reachable",
        color: "text-green-500",
      },
      down: {
        icon: <XCircle className="mr-2 h-4 w-4" />,
        text: "Cannot reach API server",
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
            <img src={logo} alt="Encompas Logo" className="h-12 mr-4" />
            <h1 className="text-5xl font-bold tracking-tighter">Encompas-UHAS</h1>
          </div>
          <p className="text-xl mt-2 max-w-lg">
            Connecting Healthcare in Rural Communities. Secure, reliable, and always available.
          </p>
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/30">
            <p className="text-lg font-bold text-yellow-300">Version {packageJson.version}</p>
            <p className="text-sm opacity-90">Release Build</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{pendingTwoFactor ? 'Two-Factor Verification' : 'Login'}</CardTitle>
            <CardDescription>
              {pendingTwoFactor
                ? `Enter the verification code sent to ${pendingTwoFactor.phoneHint || 'your registered phone number'}`
                : 'Enter your username below to login to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTwoFactor ? (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FormLabel htmlFor="two-factor-code">Verification Code</FormLabel>
                  <Input
                    id="two-factor-code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={twoFactorCode}
                    onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleTwoFactorVerification();
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    The code expires in about {pendingTwoFactor.expiresInMinutes} minute{pendingTwoFactor.expiresInMinutes === 1 ? '' : 's'}.
                  </p>
                </div>
                <Button type="button" className="w-full" onClick={handleTwoFactorVerification} disabled={isVerifyingTwoFactor}>
                  {isVerifyingTwoFactor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isVerifyingTwoFactor ? 'Verifying...' : 'Verify and Continue'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPendingTwoFactor(null);
                    setTwoFactorCode('');
                  }}
                  disabled={isVerifyingTwoFactor}
                >
                  Back to Login
                </Button>
              </div>
            ) : (
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
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isLoginLocked}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    {form.formState.isSubmitting ? 'Logging in...' : isLoginLocked ? 'Login Locked' : 'Login'}
                  </Button>
                  {isLoginLocked ? (
                    <p className="text-sm text-amber-700">
                      Too many failed login attempts in this browser session. Try again in {formatRemainingLockout(lockoutRemainingMs)}.
                    </p>
                  ) : loginLockout.failedAttempts > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining before a 10-minute browser-session lockout.
                    </p>
                  ) : null}
                  {(() => {
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
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <StatusIndicator />
          </CardFooter>
        </Card>
        <AlertDialog open={Boolean(pendingAnnouncement)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{pendingAnnouncement?.announcement.title || 'Two-factor authentication update'}</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingAnnouncement?.announcement.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={acknowledgeAnnouncement}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default LoginPage;
