import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, User, Menu, LogOut, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { navConfig, NavItem } from '@/config/nav';
import { useLoading } from '@/contexts/LoadingContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FilterIndicator } from '@/components/FilterIndicator';
import LoadingSpinner from '../ui/LoadingSpinner';
import logo from '@/img/logo.png'; // Import the logo
import PasswordResetModal from '../profile/PasswordResetModal';
import packageJson from '../../../package.json';

interface SidebarLinkProps {
  item: NavItem;
  onNavigate: (href: string) => void;
  currentPath: string;
  canAccess: (href: string) => boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ item, onNavigate, currentPath, canAccess }) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const accessibleSubItems = hasSubItems ? (item.subItems || []).filter(subItem => canAccess(subItem.href)) : [];
  const isActive = item.href ? currentPath === item.href : accessibleSubItems.some(subItem => currentPath === subItem.href);
  
  // Auto-expand if user is on any sub-page
  const shouldBeExpanded = hasSubItems && accessibleSubItems.some(subItem => currentPath === subItem.href);
  const [isExpanded, setIsExpanded] = useState(shouldBeExpanded);

  // Update expansion state when current path changes
  useEffect(() => {
    if (shouldBeExpanded && !isExpanded) {
      setIsExpanded(true);
    }
  }, [shouldBeExpanded, isExpanded]);

  // If main item has no href but has sub-items, it's a collapsible parent
  const handleClick = () => {
    if (item.href) {
      onNavigate(item.href);
    } else if (hasSubItems) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`flex items-center justify-between w-full rounded-md px-4 py-2 text-left transition-colors duration-200 ${
          isActive 
            ? 'bg-blue-100 text-blue-700' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center space-x-3">
          <item.icon className="h-5 w-5" />
          <span className="text-base font-medium">{item.title}</span>
        </div>
        {hasSubItems && (
          isExpanded ? 
            <ChevronDown className="h-4 w-4" /> : 
            <ChevronRight className="h-4 w-4" />
        )}
      </button>
      
      {hasSubItems && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {accessibleSubItems.map((subItem) => (
            <button
              key={subItem.href}
              onClick={() => onNavigate(subItem.href)}
              className={`flex items-center space-x-3 rounded-md px-4 py-2 text-sm w-full text-left transition-colors duration-200 ${
                currentPath === subItem.href
                  ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {subItem.icon && <subItem.icon className="h-4 w-4" />}
              <span className="font-medium">{subItem.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { canAccessPage } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
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
      {navConfig
        .filter((item) => {
          // If item has href, check access to it
          if (item.href) {
            return canAccessPage(item.href);
          }
          // If item has no href but has sub-items, check if any sub-item is accessible
          return item.subItems?.some(subItem => canAccessPage(subItem.href)) || false;
        })
        .map((item) => (
          <SidebarLink
            key={item.href || item.title}
            item={item}
            onNavigate={handleNavigation}
            currentPath={location.pathname}
            canAccess={canAccessPage}
          />
        ))}
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow bg-white overflow-y-auto border-r border-gray-200">
            <div className="flex-grow flex flex-col pt-5">
                <div className="flex items-center flex-shrink-0 px-4 mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Encompas</h1>
                </div>
              {sidebarLinks}
            </div>
            <div className="flex-shrink-0 p-6 border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <img src={logo} alt="Encompass Logo" className="h-14 w-auto" />
                <p className="text-xs text-gray-400 pb-1">v{packageJson.version}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Content */}
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center flex-shrink-0 px-4 h-16 border-b">
                <h1 className="text-2xl font-bold text-gray-800">Encompas</h1>
            </div>
            <div className="flex-grow flex flex-col mt-5">
              {sidebarLinks}
            </div>
            <div className="flex-shrink-0 p-6 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                    <img src={logo} alt="Encompass Logo" className="h-14 w-auto" />
                    <p className="text-xs text-gray-400 pb-1">v{packageJson.version}</p>
                </div>
            </div>
          </div>
        </SheetContent>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Access Level Filter Indicator */}
          <FilterIndicator />
          
          {/* Top Navigation */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  {/* Mobile menu button */}
                  <div className="md:hidden mr-2">
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                  </div>
                </div>


                {/* Right-aligned items */}
                <div className="flex items-center space-x-4 ml-auto">
                  {isLoading && <LoadingSpinner />}
                  <Button variant="ghost" size="icon">
                    <Bell className="h-6 w-6" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          {/* If you have a user image URL property, replace 'profileImageUrl' with the correct property name */}
                          <AvatarImage src={undefined} />
                          <AvatarFallback>{getInitials(user?.firstname, user?.lastname)}</AvatarFallback>
                        </Avatar>
                        <div className="hidden md:flex flex-col items-start">
                          <span className="text-sm font-medium">{`${user?.firstname} ${user?.lastname}`}</span>
                          <span className="text-xs text-gray-500">{user?.user_type}</span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <p className="font-bold">{`${user?.firstname} ${user?.lastname}`}</p>
                        <p className="text-xs text-gray-500 font-normal">{user?.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsPasswordModalOpen(true)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      {canAccessPage('/feedback') && (
                        <DropdownMenuItem onClick={() => navigate('/feedback')}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>Feedback</span>
                        </DropdownMenuItem>
                      )}
                      {canAccessPage('/guide') && (
                        <DropdownMenuItem onClick={() => navigate('/guide')}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>Guide</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="w-full">
              {isLoading ? <LoadingSpinner /> : children || <Outlet />}
            </div>
          </main>
        </div>
      </Sheet>
      <PasswordResetModal isOpen={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} />
    </div>
  );
};

export default MainLayout;
