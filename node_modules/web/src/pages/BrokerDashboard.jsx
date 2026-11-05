import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTheme } from '@/contexts/DynamicThemeProvider.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import LoadModule from './broker-dashboard/LoadModule.jsx';
import OperationsModule from './broker-dashboard/OperationsModule.jsx';
import ReportsModule from './broker-dashboard/ReportsModule.jsx';
import DashboardCustomization from './broker-dashboard/DashboardCustomization.jsx';
import ScheduledReports from './broker-dashboard/ScheduledReports.jsx';
import PoliciesModule from './broker-dashboard/PoliciesModule.jsx';
import AnalyticsPage from './AnalyticsPage.jsx';

const BrokerDashboard = () => {
  const { currentUser } = useAuth();
  const { brokerConfig } = useTheme();
  
  const [preferences, setPreferences] = useState({ visible_widgets: [] });

  useEffect(() => {
    let isMounted = true;
    
    if (currentUser?.id) {
      pb.collection('dashboard_preferences').getList(1, 1, {
        filter: `user_id="${currentUser.id}"`,
        $autoCancel: false
      }).then(res => {
        if (isMounted && res.items.length > 0) {
          setPreferences(res.items[0]);
        }
      }).catch(err => {
        if (isMounted) console.error('Failed to load dashboard preferences', err);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  return (
    <>
      <Helmet>
        <title>Panel del Corredor - {brokerConfig?.broker_name || 'avinapp'}</title>
        <meta name="description" content="Gestión integral de pólizas y operaciones" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/10 w-full overflow-y-auto overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto space-y-6">
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">
                  Panel del Corredor
                </h1>
                <p className="text-muted-foreground mt-1 text-balance">
                  Gestión integral de pólizas y operaciones
                </p>
              </div>

              <ErrorBoundary fallbackMessage="Hubo un error crítico cargando el panel principal. Por favor, refresque la página.">
                <Tabs defaultValue="policies" className="w-full space-y-6">
                  <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="inline-flex min-w-max h-auto bg-card border border-border/50 p-1 rounded-xl items-center justify-start shadow-sm">
                      <TabsTrigger value="policies" className="rounded-lg px-4 py-2 font-medium">Directorio de Pólizas</TabsTrigger>
                      <TabsTrigger value="analytics" className="rounded-lg px-4 py-2 font-medium">Analítica</TabsTrigger>
                      <TabsTrigger value="load" className="rounded-lg px-4 py-2 font-medium">Carga de Datos</TabsTrigger>
                      <TabsTrigger value="operations" className="rounded-lg px-4 py-2 font-medium">Operaciones</TabsTrigger>
                      <TabsTrigger value="reports" className="rounded-lg px-4 py-2 font-medium">Reportes</TabsTrigger>
                      <TabsTrigger value="scheduled" className="rounded-lg px-4 py-2 font-medium">Reportes Programados</TabsTrigger>
                      <TabsTrigger value="customization" className="rounded-lg px-4 py-2 font-medium">Personalización</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="policies" className="focus-visible:outline-none m-0">
                    <ErrorBoundary fallbackMessage="Ocurrió un error cargando el directorio de pólizas.">
                      <PoliciesModule />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="analytics" className="focus-visible:outline-none m-0">
                    <ErrorBoundary fallbackMessage="Error al cargar el módulo de analítica.">
                      <AnalyticsPage hideLayout={true} />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="load" className="focus-visible:outline-none m-0">
                    <ErrorBoundary fallbackMessage="Error al cargar el módulo de carga de datos.">
                      <LoadModule />
                    </ErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="operations" className="focus-visible:outline-none m-0">
                    <ErrorBoundary fallbackMessage="Error al cargar el módulo de operaciones.">
                      <OperationsModule />
                    </ErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="reports" className="focus-visible:outline-none m-0">
                    <ErrorBoundary fallbackMessage="Error al cargar el módulo de reportes.">
                      <ReportsModule visibleWidgets={preferences.visible_widgets} />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="scheduled" className="focus-visible:outline-none m-0">
                    <ErrorBoundary fallbackMessage="Error al cargar el módulo de reportes programados.">
                      <ScheduledReports />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="customization" className="focus-visible:outline-none m-0">
                    <ErrorBoundary fallbackMessage="Error al cargar las opciones de personalización.">
                      <DashboardCustomization />
                    </ErrorBoundary>
                  </TabsContent>
                </Tabs>
              </ErrorBoundary>

            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BrokerDashboard;