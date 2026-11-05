import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, DollarSign, ShieldCheck, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AnalyticsPage = ({ hideLayout = false }) => {
  const { currentUser } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async () => {
    if (!currentUser?.broker_id) return;
    
    setLoading(true);
    setError(null);
    try {
      // CRITICAL: Use broker_id, NEVER user_id for polizas collection
      const records = await pb.collection('polizas').getFullList({
        filter: `broker_id="${currentUser.broker_id}"`,
        sort: '+created',
        $autoCancel: false
      });
      setPolicies(records);
    } catch (err) {
      console.error('Failed to fetch policies for analytics:', err);
      setError('No se pudieron cargar los datos analíticos. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [currentUser?.broker_id]);

  const metrics = useMemo(() => {
    if (!policies.length) return { total: 0, active: 0, pending: 0, expired: 0, totalPremium: 0 };
    
    const active = policies.filter(p => p.estado === 'Activa');
    const expired = policies.filter(p => p.estado === 'Vencida' || p.estado === 'Cancelada');
    
    return {
      total: policies.length,
      active: active.length,
      expired: expired.length,
      totalPremium: policies.reduce((sum, p) => sum + (p.monto_prima || 0), 0)
    };
  }, [policies]);

  const statusData = useMemo(() => {
    const counts = policies.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});
    
    return [
      { name: 'Activa', value: counts['Activa'] || 0, color: '#10b981' },
      { name: 'Vencida', value: counts['Vencida'] || 0, color: '#f59e0b' },
      { name: 'Cancelada', value: counts['Cancelada'] || 0, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }, [policies]);

  const productData = useMemo(() => {
    const counts = policies.reduce((acc, p) => {
      const type = p.tipo_poliza || 'Otro';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).sort((a, b) => b.value - a.value);
  }, [policies]);

  const trendData = useMemo(() => {
    const monthlyData = policies.reduce((acc, p) => {
      if (!p.created) return acc;
      try {
        const monthYear = format(parseISO(p.created), 'MMM yyyy', { locale: es });
        if (!acc[monthYear]) acc[monthYear] = 0;
        acc[monthYear] += (p.monto_prima || 0);
      } catch (e) {
        // Ignore invalid dates
      }
      return acc;
    }, {});

    return Object.keys(monthlyData).map(key => ({
      month: key,
      Primas: monthlyData[key]
    }));
  }, [policies]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-12 flex flex-col items-center justify-center text-center bg-card rounded-xl border border-destructive/20 shadow-sm">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error de Carga</h3>
          <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
          <Button onClick={fetchAnalyticsData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Reintentar
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {!hideLayout && (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analítica de Cartera</h1>
            <p className="text-muted-foreground mt-1">Visión general del rendimiento y estado de pólizas</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Pólizas Totales</p>
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Pólizas Activas</p>
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Primas Totales</p>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">${metrics.totalPremium.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">Rendimiento (Est.)</p>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">+12.5%</div>
              <p className="text-xs text-muted-foreground mt-1">Frente al mes anterior</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Tendencia de Primas</CardTitle>
              <CardDescription>Crecimiento de primas acumuladas a lo largo del tiempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `$${value}`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Primas']}
                      />
                      <Line type="monotone" dataKey="Primas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">No hay suficientes datos para mostrar tendencias</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>Proporción de pólizas activas vs vencidas/canceladas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">No hay datos de estado disponibles</div>
                )}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {statusData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-muted-foreground">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle>Productos Destacados</CardTitle>
              <CardDescription>Pólizas agrupadas por tipo de seguro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {productData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} width={100} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f3f4f6' }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">No hay datos de productos disponibles</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (hideLayout) {
    return <div className="py-2">{renderContent()}</div>;
  }

  return (
    <>
      <Helmet>
        <title>Analítica - avinapp</title>
      </Helmet>

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 p-6 lg:p-8 bg-muted/10 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AnalyticsPage;