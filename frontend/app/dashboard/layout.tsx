"use client";
import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Layout,
  LayoutDashboard,
  Users,
  ChevronLeft,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Mail,
  Shield,
  MoreHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type SidebarLink = {
  label: string;
  href: string;
  roles?: string[];
  icon: ReactNode;
  description?: string;
  badge?: string;
};

const DASHBOARD_LINKS: SidebarLink[] = [
  {
    label: "Overview",
    href: "/dashboard",
    roles: ["admin", "staff"],
    icon: <LayoutDashboard className="w-4 h-4" />,
    description: "Dashboard overview and key metrics",
  },
  {
    label: "Visitors",
    href: "/dashboard/visitors",
    roles: ["admin", "staff"],
    icon: <Users className="w-4 h-4" />,
    description: "Manage and track visitors",
  },
];

const sidebarVariants = {
  expanded: { width: 240 },
  collapsed: { width: 64 },
};

interface NavLinkProps {
  link: SidebarLink;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavLink = ({ link, isActive, isCollapsed }: NavLinkProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={link.href}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "relative flex items-center px-2 h-10 rounded-md",
          "group cursor-pointer select-none",
          isActive
            ? "bg-blue-50/80 text-blue-700"
            : "text-gray-600 hover:bg-gray-100/80",
          "transition-colors duration-150"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 w-0.5 h-4 bg-blue-600 rounded-full my-auto inset-y-0"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}

        <div
          className={cn(
            "flex items-center justify-center",
            isActive
              ? "text-blue-600"
              : "text-gray-500 group-hover:text-gray-700",
            "transition-colors duration-150",
            isCollapsed ? "mx-auto" : "mr-2 ml-1"
          )}
        >
          {link.icon}
        </div>

        {!isCollapsed && (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-xs font-medium truncate",
                  isActive ? "text-blue-700" : "text-gray-700"
                )}
              >
                {link.label}
              </span>
            </div>

            {link.badge && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                {link.badge}
              </span>
            )}
          </div>
        )}

        {isCollapsed && isHovered && (
          <div
            className="
            absolute left-full ml-2 px-2 py-1
            bg-gray-900 text-white text-xs rounded
            whitespace-nowrap z-50
          "
          >
            {link.label}
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, isStaff, logout } = useAuth();
  const pathname = usePathname();
  const [allowedLinks, setAllowedLinks] = useState<SidebarLink[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const admin = isAdmin();
      const staff = isStaff();
      setAllowedLinks(
        DASHBOARD_LINKS.filter(
          (link) => (admin || staff) && link.roles?.includes(user.role)
        )
      );
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="/fixed static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center px-3 border-b border-gray-200">
          <div className="flex items-center w-full justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <Layout className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-sm">Dashboard</span>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 ml-1"
            >
              <motion.div
                animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {/* Main Navigation */}
          <div>
            <nav className="px-3 space-y-0.5">
              {allowedLinks.map((link) => (
                <NavLink
                  key={link.href}
                  link={link}
                  isActive={pathname === link.href}
                  isCollapsed={isSidebarCollapsed}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 /p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  "flex items-center cursor-pointer /p-2 p-4 /rounded-md hover:bg-gray-100",
                  "transition-colors duration-150",
                  isSidebarCollapsed ? "justify-center" : "space-x-2"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                )}
                {!isSidebarCollapsed && (
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                <User className="w-4 h-4 mr-2" />
                <span className="text-xs">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                <span className="text-xs">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-xs">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center flex-1">
            <h1 className="px-3 py-1 rounded-xl text-sm bg-slate-100 text-slate-500">
              Visitor Management System
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {[
              { icon: Bell, label: "Notifications" },
              { icon: HelpCircle, label: "Help" },
              { icon: Settings, label: "Settings" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-150"
              >
                <Icon className="w-4 h-4 text-gray-600" />
              </button>
            ))}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Profile Information
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-6 py-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: User, label: "Full Name", value: user?.name },
                { icon: Mail, label: "Email", value: user?.email },
                { icon: Shield, label: "Role", value: user?.role },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="text-sm capitalize">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
