import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Shield, FileText, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const HomePage = () => {
  const features = [
    {
      icon: Shield,
      title: 'Seguridad Garantizada',
      description: 'Tus datos y pólizas están protegidos con los más altos estándares de seguridad.'
    },
    {
      icon: FileText,
      title: 'Gestión Simplificada',
      description: 'Accede a todos tus documentos y realiza solicitudes de reembolso en un solo lugar.'
    },
    {
      icon: Clock,
      title: 'Respuestas Rápidas',
      description: 'Procesamiento ágil de tus solicitudes con notificaciones en tiempo real.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>avinapp - Gestión Inteligente de Seguros</title>
        <meta name="description" content="Plataforma integral para la gestión de pólizas y reembolsos." />
      </Helmet>

      <div className="flex flex-col flex-1 min-h-screen">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-20 lg:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight" style={{letterSpacing: '-0.02em'}}>
                    Gestión Inteligente de Seguros
                  </h1>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-prose">
                    avinapp centraliza todas tus pólizas, simplifica los reembolsos y te mantiene conectado con tu corredor de seguros en todo momento.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/login">
                      <Button size="lg" className="gap-2">
                        Iniciar Sesión
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/activate-account">
                      <Button size="lg" variant="outline">
                        Activar Cuenta
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1581815940149-7178af8f6731"
                    alt="Professional insurance consultation with documents and laptop"
                    className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Todo lo que necesitas
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Herramientas diseñadas para facilitar tu experiencia con los seguros.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="border-none shadow-lg">
                      <CardHeader>
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-primary text-primary-foreground border-none shadow-xl">
                <CardContent className="p-12 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    ¿Listo para empezar?
                  </h2>
                  <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                    Accede a tu panel de control y descubre una nueva forma de gestionar tus seguros.
                  </p>
                  <Link to="/login">
                    <Button size="lg" variant="secondary" className="gap-2">
                      Acceder a mi cuenta
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;