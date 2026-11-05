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
import { Shield, FileText, Calendar, DollarSign, Activity, Building2, AlertCircle, Car } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CustomerPoliciesPage = () => {
  const { currentUser } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPolicies = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);

        const result = await pb.collection('polizas').getList(1, 50, {
          $autoCancel: false,
          filter: `numero_identificacion = "${currentUser?.numero_identificacion}"`
        });

        if (!isMounted) return;
        setPolicies(result.items || []);

      } catch (err) {
        console.error("Real connection error:", err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPolicies();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const getStatusBadge = (status) => {
    if (!status) return null;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'activa') {
      return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-none font-medium px-3 py-1">Activa</Badge>;
    }
    if (lowerStatus === 'vencida') {
      return <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-none font-medium px-3 py-1">Vencida</Badge>;
    }
    if (lowerStatus === 'cancelada') {
      return <Badge variant="destructive" className="font-medium px-3 py-1 border-none">Cancelada</Badge>;
    }
    return <Badge variant="secondary" className="px-3 py-1">{status}</Badge>;
  };

  const getStatusBorderColor = (status) => {
    if (!status) return 'border-border/50';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'activa') return 'border-l-emerald-500';
    if (lowerStatus === 'vencida') return 'border-l-amber-500';
    if (lowerStatus === 'cancelada') return 'border-l-destructive';
    return 'border-l-border/50';
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

          <main className="flex-1 p-6 lg:p-10 bg-muted/10 w-full overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground text-balance">
                    Mis Pólizas
                  </h1>
                  <p className="text-muted-foreground mt-2 text-balance max-w-2xl">
                    Consulta y administra el estado de todos tus seguros activos e históricos en un solo lugar.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Activity className="h-5 w-5 animate-pulse" />
                    <span className="font-medium">Cargando tus pólizas...</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="border border-border/50 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start mb-4">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                          <Skeleton className="h-7 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                          </div>
                          <Skeleton className="h-12 w-full rounded-xl" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <Card className="border-destructive/20 bg-destructive/5 shadow-sm rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Error de Conexión</h3>
                    <p className="text-destructive max-w-md text-balance font-medium">
                      {error}
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="mt-6 border-destructive/20 text-destructive hover:bg-destructive/10">
                      Intentar nuevamente
                    </Button>
                  </CardContent>
                </Card>
              ) : policies.length === 0 ? (
                <Card className="border-dashed bg-card/50 border-2 rounded-2xl shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                      <Shield className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-foreground tracking-tight">No tienes pólizas registradas</h3>
                    <p className="text-muted-foreground max-w-md text-balance text-lg">
                      Actualmente no encontramos pólizas asociadas a tu nombre en la base de datos real.
                    </p>
                    <Button variant="outline" onClick={() => window.location.reload()} className="mt-8">
                      Refrescar Búsqueda
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {policies.map((policy) => {
                    const statusBorderClass = getStatusBorderColor(policy.status);
                    const hasCoverageDetails = policy.coverage_type && policy.coverage_type.trim().length > 0;
                    const isAuto = policy.tipo_poliza?.toLowerCase().includes('auto');

                    // Combinar marca y modelo si es auto
                    const vehicleInfo = [policy.marca_vehiculo, policy.modelo_vehiculo].filter(Boolean).join(' ');

                    return (
                      <Card
                        key={policy.id}
                        className={`border-t border-r border-b border-l-4 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full bg-card ${statusBorderClass}`}
                      >
                        <CardHeader className="bg-muted/10 pb-5">
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant="outline" className="bg-background text-muted-foreground font-medium flex items-center gap-1.5 px-3 py-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {policy.nombre_aseguradora || 'Aseguradora'}
                            </Badge>
                            {getStatusBadge(policy.status)}
                          </div>
                          <CardTitle className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                            {isAuto ? <Car className="h-5 w-5 text-primary" /> : <Activity className="h-5 w-5 text-primary" />}
                            Seguro {policy.tipo_poliza || 'General'}
                          </CardTitle>
                          <p className="text-sm font-mono text-muted-foreground mt-1">
                            Nº: {policy.numero_poliza || 'Sin número'}
                          </p>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-6 flex-1">
                          <div className="grid grid-cols-2 gap-3">
                            {/* Caja de Prima */}
                            <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1 font-medium tracking-wide uppercase">
                                <DollarSign className="h-3 w-3 text-primary/70 shrink-0" /> Prima
                              </p>
                              <p className="font-semibold text-sm text-foreground tabular-nums">
                                {policy.monto_prima?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                              </p>
                            </div>

                            {/* Caja de Vencimiento */}
                            <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1 font-medium tracking-wide uppercase">
                                <Calendar className="h-3 w-3 text-primary/70 shrink-0" /> Vencimiento
                              </p>
                              <p className="font-semibold text-sm text-foreground mt-0.5">
                                {policy.fecha_vencimiento ? format(parseISO(policy.fecha_vencimiento), 'dd/MM/yyyy') : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Sección Dinámica: Vehículo (Marca y Modelo) o Beneficiarios */}
                          <div className="pt-2 border-t border-border/50 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Cobertura:</span>
                              <span className="font-medium tabular-nums">{policy.monto_cobertura?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground block">
                                {isAuto ? 'Vehículo (Marca y Modelo):' : 'Beneficiarios:'}
                              </span>
                              <p className="font-medium mt-0.5 text-foreground">
                                {isAuto ? (vehicleInfo || 'No especificado') : (policy.beneficiarios_cobertura || 'Ninguno')}
                              </p>
                            </div>
                          </div>

                          {hasCoverageDetails && (
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <Shield className="h-4 w-4 text-primary" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Cobertura</p>
                                  <p className="text-sm font-semibold text-foreground truncate">{policy.coverage_type}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-0 mt-auto border-t border-border/50 p-4 bg-muted/5">
                          <Button variant="ghost" className="w-full justify-center text-primary hover:text-primary hover:bg-primary/10 font-medium transition-colors">
                            <FileText className="h-4 w-4 mr-2" /> Detalles de Cobertura
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

export default CustomerPoliciesPage;