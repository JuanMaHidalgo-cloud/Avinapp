import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 flex flex-col items-center justify-center text-center bg-card rounded-xl border border-destructive/20 shadow-sm my-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ha ocurrido un error inesperado</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {this.props.fallbackMessage || 'El módulo no pudo cargarse correctamente. Si el problema persiste, contacte a soporte.'}
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Intentar de nuevo
            </Button>
            {this.props.onGoBack && (
              <Button onClick={this.props.onGoBack} className="gap-2">
                Volver atrás
              </Button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;