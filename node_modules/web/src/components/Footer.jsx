import React from 'react';
import { useTheme } from '@/contexts/DynamicThemeProvider.jsx';

const Footer = () => {
  const { brokerConfig } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {brokerConfig?.broker_name || 'avinapp'}. Todos los derechos reservados.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {brokerConfig?.company_email && (
              <a 
                href={`mailto:${brokerConfig.company_email}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {brokerConfig.company_email}
              </a>
            )}
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacidad
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;