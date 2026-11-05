import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, ShieldAlert, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || '',
    phone: currentUser?.phone || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(currentUser.id, {
        full_name: formData.full_name,
        phone: formData.phone
      });
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Perfil - avinapp</title>
      </Helmet>

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-muted/10">
            <div className="max-w-4xl mx-auto">
              
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/broker-dashboard')} 
                  className="mb-6 shadow-sm font-medium"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Regresar al Panel
                </Button>
                
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground mt-1">
                  Gestiona tu información personal y configuración de cuenta.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="shadow-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Actualiza tus datos de contacto.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nombre Completo</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          type="text"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="text-foreground bg-background"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={currentUser?.email}
                          disabled
                          className="bg-muted text-muted-foreground opacity-70"
                        />
                        <p className="text-xs text-muted-foreground">
                          El correo electrónico no puede ser modificado.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="text-foreground bg-background"
                        />
                      </div>

                      <Button type="submit" className="w-full mt-2" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="shadow-sm border-border/50">
                    <CardHeader>
                      <CardTitle>Detalles de la Cuenta</CardTitle>
                      <CardDescription>
                        Información sobre tu rol y estado.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rol</span>
                        <Badge variant={currentUser?.role === 'broker_admin' || currentUser?.role === 'super_admin' ? 'default' : 'secondary'}>
                          {currentUser?.role}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ID de Broker</span>
                        <span className="text-sm font-medium font-mono bg-muted px-2 py-1 rounded">{currentUser?.broker_id}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Estado</span>
                        <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20">Activa</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-border/50">
                    <CardHeader>
                      <CardTitle>Acciones</CardTitle>
                      <CardDescription>
                        Opciones adicionales de tu cuenta.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentUser?.role === 'super_admin' && (
                        <Button 
                          variant="secondary" 
                          className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                          asChild
                        >
                          <Link to="/superadmin">
                            <ShieldAlert className="h-4 w-4" />
                            Panel Super Admin
                          </Link>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;