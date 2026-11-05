import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Briefcase, Shield, BarChart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const isBrokerAdmin = currentUser?.role === 'broker_admin';
  const isClient = currentUser?.role === 'client';
  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Strict role-based routing map (excluding Perfil and SuperAdmin which are pinned to the bottom)
  const navItems = [
    {
      label: 'Mis Pólizas',
      href: '/policies',
      icon: Shield,
      show: isClient
    },
    {
      label: 'Panel del Corredor',
      href: '/broker-dashboard',
      icon: Briefcase,
      show: isBrokerAdmin
    },
    {
      label: 'Reembolsos',
      href: '/reimbursements',
      icon: FileText,
      show: isClient || isBrokerAdmin
    },
    {
      label: 'Analítica',
      href: '/analytics',
      icon: BarChart,
      show: isBrokerAdmin
    },
    {
      label: 'Configuración',
      href: '/admin',
      icon: Settings,
      show: isBrokerAdmin
    }
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r bg-muted/30 min-h-[calc(100vh-4rem)]">
      <nav className="flex-1 p-4 flex flex-col gap-2">
        <div className="space-y-2 flex-1">
          {navItems.map((item) => {
            if (!item.show) return null;
            
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-2 mt-auto pt-4 border-t border-border/50">
          {isSuperAdmin && (
            <button
              onClick={() => navigate('/superadmin')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2",
                location.pathname === '/superadmin'
                  ? "bg-primary text-primary-foreground shadow-md border-primary" 
                  : "border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/30"
              )}
            >
              <Shield className="h-5 w-5" />
              Panel Super Admin
            </button>
          )}
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              location.pathname === '/profile'
                ? "bg-primary text-primary-foreground shadow-md" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <User className="h-5 w-5" />
            Perfil
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;