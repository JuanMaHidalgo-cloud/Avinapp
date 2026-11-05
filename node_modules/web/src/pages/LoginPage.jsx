import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Role-based routing if already logged in
  if (isAuthenticated && currentUser) {
    if (currentUser.role === 'super_admin') return <Navigate to="/superadmin" replace />;
    if (currentUser.role === 'broker_admin') return <Navigate to="/broker-dashboard" replace />;
    return <Navigate to="/policies" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authData = await login(formData.email, formData.password);
      toast.success('Inicio de sesión exitoso');

      // Strict role-based redirect
      if (authData.record.role === 'super_admin') {
        navigate('/superadmin', { replace: true });
      } else if (authData.record.role === 'broker_admin') {
        navigate('/broker-dashboard', { replace: true });
      } else {
        navigate('/policies', { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Credenciales inválidas. Inténtalo de nuevo.');
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

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - avinapp</title>
        <meta name="description" content="Inicia sesión en tu cuenta de avinapp" />
      </Helmet>

      <div className="flex-1 flex items-center justify-center bg-muted/30 px-4 py-12 min-h-screen">
        <Card className="w-full max-w-md shadow-xl border-border/50 rounded-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-primary font-extrabold text-2xl">A</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Bienvenido a avinapp</CardTitle>
            <CardDescription className="text-base">
              Ingresa tus credenciales para acceder a tu panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu.correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="text-foreground h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="text-foreground h-11 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium mt-2"
                disabled={loading}
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>

              <div className="mt-8 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  ¿Es tu primera vez aquí?{' '}
                  <Link to="/activate-account" className="text-primary hover:underline font-medium transition-colors">
                    Activar Cuenta
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;