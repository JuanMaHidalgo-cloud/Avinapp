import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Shield, FileText, Calendar, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { isValidPolicyId } from '@/lib/policyValidation.js';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMyPolicies = async () => {
      if (!currentUser?.id) return;
      
      try {
        setLoading(true);
        // Note: For clients, they might be identified by an ID or email depending on the schema structure.
        // Assuming we rely on listRules for the collection access if direct filter causes issues.
        const result = await pb.collection('polizas').getList(1, 50, {
          $autoCancel: false
        });
        
        if (!isMounted) return;

        // Filter out invalid IDs or poorly formed records
        const validPolicies = result.items.filter(policy => policy && isValidPolicyId(policy.id));
        setPolicies(validPolicies);
        
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching policies from polizas collection:', err);
        if (err.status !== 404) {
          toast.error('No se pudieron cargar sus pólizas. Intente más tarde.');
        }
        setPolicies([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMyPolicies();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const getStatusBadge = (status) => {
    if (!status) return null;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'activa' || lowerStatus === 'active') {
      return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20">Activa</Badge>;
    }
    if (lowerStatus === 'vencida' || lowerStatus === 'expired') {
      return <Badge variant="destructive">Vencida</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>Mis Pólizas - avinapp</title>
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 p-6 lg:p-8 bg-muted/10 w-full overflow-y-auto">
            <div className="max-w-[1400px] mx-auto space-y-8">
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">Mis Pólizas</h1>
                <p className="text-muted-foreground mt-1 text-balance">
                  Revisa el estado, coberturas y pagos de tus pólizas vigentes.
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="border border-border/50 shadow-sm rounded-2xl bg-card">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : policies.length === 0 ? (
                <Card className="border-dashed bg-card/50 border-2 rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <Shield className="h-16 w-16 text-muted-foreground/30 mb-6" />
                    <h3 className="text-xl font-semibold mb-2">No tienes pólizas activas</h3>
                    <p className="text-muted-foreground max-w-md text-balance">
                      Actualmente no encontramos pólizas registradas a tu nombre. Contacta a tu corredor de seguros si crees que esto es un error.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {policies.map((policy) => {
                    if (!policy?.id) return null;
                    const annualPremium = policy.monto_prima || 0;
                    const monthlyPayment = (annualPremium / 12).toFixed(2);
                    
                    return (
                      <Card key={policy.id} className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full bg-card">
                        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-background">
                              {policy.nombre_aseguradora || 'Aseguradora'}
                            </Badge>
                            {getStatusBadge(policy.estado)}
                          </div>
                          <CardTitle className="text-xl flex items-center gap-2 font-semibold">
                            <Activity className="h-5 w-5 text-primary" />
                            Seguro de {policy.tipo_poliza || 'Vida'}
                          </CardTitle>
                          <p className="text-sm font-mono text-muted-foreground">
                            POL: {policy.numero_poliza || 'N/A'}
                          </p>
                        </CardHeader>
                        
                        <CardContent className="space-y-5 pt-6 flex-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/50 p-3 rounded-xl">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1 font-medium tracking-wide uppercase">
                                <DollarSign className="h-3 w-3" /> Prima Anual
                              </p>
                              <p className="font-semibold text-lg text-foreground">${annualPremium.toLocaleString()}</p>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-xl">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1 font-medium tracking-wide uppercase">
                                <DollarSign className="h-3 w-3" /> Pago Mensual
                              </p>
                              <p className="font-semibold text-lg text-foreground">${monthlyPayment}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs font-medium">Vencimiento</p>
                              <p className="font-medium text-foreground">
                                {policy.fecha_vencimiento ? format(parseISO(policy.fecha_vencimiento), 'dd MMM yyyy') : 'No definido'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="pt-0 mt-auto border-t border-border/50 p-4">
                          <Button variant="ghost" className="w-full justify-center text-primary hover:text-primary hover:bg-primary/5 font-medium transition-colors">
                            <FileText className="h-4 w-4 mr-2" /> Ver Detalles Completos
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default DashboardPage;