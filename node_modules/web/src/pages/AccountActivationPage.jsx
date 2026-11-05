import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AccountActivationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [aseguradoData, setAseguradoData] = useState(null);
  
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const res = await pb.collection('asegurados').getList(1, 1, {
        filter: `email="${email}"`,
        $autoCancel: false
      });

      if (res.items.length > 0) {
        setAseguradoData(res.items[0]);
        setStep(2);
      } else {
        toast.error('Este correo no está asociado a ninguna póliza activa. Por favor, contacta a tu corredor de seguros.');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      toast.error('Error al verificar el correo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if (passwordData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // Check if user already exists in users collection
      let userExists = false;
      try {
        const existingUser = await pb.collection('users').getFirstListItem(`email="${email}"`, { $autoCancel: false });
        if (existingUser) userExists = true;
      } catch (e) {
        // User not found, proceed to create
      }

      if (userExists) {
        toast.error('Esta cuenta ya ha sido activada. Por favor, inicia sesión.');
        navigate('/login');
        return;
      }

      await pb.collection('users').create({
        email: email,
        password: passwordData.password,
        passwordConfirm: passwordData.confirmPassword,
        role: 'client',
        broker_id: aseguradoData.broker_id,
        full_name: aseguradoData.nombre_completo,
        verified: true
      }, { $autoCancel: false });

      toast.success('Cuenta activada exitosamente. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error) {
      console.error('Activation failed:', error);
      toast.error('Error al activar la cuenta. Es posible que ya esté registrada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Activar Cuenta - avinapp</title>
        <meta name="description" content="Activa tu cuenta de avinapp" />
      </Helmet>

      <div className="flex-1 flex items-center justify-center bg-muted/30 px-4 py-12 min-h-screen">
        <Card className="w-full max-w-md shadow-lg border-border/50">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-xl">B</span>
            </div>
            <CardTitle className="text-2xl font-bold">Activar Cuenta</CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Ingresa tu correo electrónico para verificar tu póliza.' 
                : `Hola ${aseguradoData?.nombre_completo}, crea tu contraseña.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu.correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-foreground"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verificando...' : 'Verificar Correo'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                    required
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                    className="text-foreground"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Activando...' : 'Activar Cuenta'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AccountActivationPage;