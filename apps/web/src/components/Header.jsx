import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTheme } from '@/contexts/DynamicThemeProvider.jsx';
import LanguageSwitcher from '@/components/LanguageSwitcher.jsx';
import NotificationCenter from '@/components/NotificationCenter.jsx';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Header = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { brokerConfig } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isAdmin = isAuthenticated && (currentUser?.role === 'broker_admin' || currentUser?.role === 'super_admin');
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/';
    if (currentUser?.role === 'broker_admin') return '/broker-dashboard';
    if (currentUser?.role === 'super_admin') return '/superadmin';
    return '/policies';
  };

  const LogoContent = () => (
    <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogout}>
      {brokerConfig?.logo_url ? (
        <img
          src={brokerConfig.logo_url}
          alt="Brand Logo"
          className="h-10 w-auto max-w-[140px] object-contain"
        />
      ) : (
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <span className="text-primary-foreground font-bold text-lg">
            A
          </span>
        </div>
      )}
      {!brokerConfig?.logo_url && (
        <span className="font-semibold text-lg hidden sm:block">
          avinapp
        </span>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {isAdmin ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div><LogoContent /></div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Deseas cerrar sesión?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Estás a punto de salir del Panel de Administración.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Aceptar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Link to={getDefaultRoute()}>
              <LogoContent />
            </Link>
          )}

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 pl-2">
                      <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="hidden lg:inline font-medium">{currentUser?.full_name || currentUser?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>

                    {isSuperAdmin && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/superadmin" className="flex items-center w-full text-primary">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Panel Super Admin
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm">Iniciar Sesión</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;