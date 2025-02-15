import { motion } from "motion/react";
import { useAuthStore } from "@/lib/store/auth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Layout, Menu, Users, FileText, LogOut, UserPlus } from "lucide-react";

export function Navbar() {
  const { user, clearAuth } = useAuthStore();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4"
    >
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Layout className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-bold">VMS</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user?.name} ({user?.role})
          </span>
          <button onClick={() => clearAuth()} className="p-2 hover:bg-gray-100 rounded-full">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuthStore();

  const navItems = [
    ...(isAdmin()
      ? [
          { href: "/dashboard/visitors", icon: Users, label: "Visitors" },
          { href: "/dashboard/logs", icon: FileText, label: "Activity Logs" },
        ]
      : [{ href: "/dashboard/register", icon: UserPlus, label: "Register Visitor" }]),
  ];

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r"
    >
      <div className="p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  ${isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}
                `}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className="pt-16 pl-64">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8">
          {children}
        </motion.div>
      </main>
    </div>
  );
}
