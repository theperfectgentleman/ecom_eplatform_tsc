import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, User, Menu, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { navConfig } from '@/config/nav';
import { useLoading } from '@/contexts/LoadingContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface SidebarLinkProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon: Icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-3 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 w-full text-left"
  >
    <Icon className="h-5 w-5" />
    <span className="text-base font-medium">{text}</span>
  </button>
);

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isLoading } = useLoading();

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const getInitials = (firstname?: string, lastname?: string) => {
    if (!firstname || !lastname) return '';
    return `${firstname[0]}${lastname[0]}`.toUpperCase();
  };

  const sidebarLinks = (
    <nav className="flex-1 px-2 pb-4 space-y-1">
      {navConfig.map((item) => (
        <SidebarLink
          key={item.href}
          icon={item.icon}
          text={item.title}
          onClick={() => handleNavigation(item.href)}
        />
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-semibold text-gray-900">Encompas E-Platform</h1>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              {sidebarLinks}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Content */}
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center flex-shrink-0 px-4 h-16 border-b">
              <h1 className="text-xl font-semibold text-gray-900">Encompas E-Platform</h1>
            </div>
            <div className="flex-grow flex flex-col mt-5">
              {sidebarLinks}
            </div>
          </div>
        </SheetContent>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Navigation */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Mobile menu button */}
                <div className="md:hidden">
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                </div>

                {/* Search bar could go here */}
                <div className="flex-1 max-w-2xl mx-auto md:ml-8">
                  {/* Placeholder for search */}
                </div>

                {/* Right side navigation */}
                <div className="flex items-center space-x-4">
                  {isLoading && <LoadingSpinner />}
                  <Button variant="ghost" size="icon">
                    <Bell className="h-6 w-6" />
                  </Button>

                  {/* User menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={`${user?.firstname} ${user?.lastname}`} />
                          <AvatarFallback>
                            {user ? getInitials(user.firstname, user.lastname) : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user ? `${user.firstname} ${user.lastname}` : 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleNavigation('settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden bg-gray-100">
            {children}
          </main>
        </div>
      </Sheet>
    </div>
  );
};

export default MainLayout;
