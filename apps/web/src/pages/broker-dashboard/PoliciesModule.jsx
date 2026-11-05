import React, { useState } from 'react';
import PolicyRegistrationForm from '@/components/policies/PolicyRegistrationForm.jsx';
import PoliciesTable from '@/components/policies/PoliciesTable.jsx';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PoliciesModule = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Directorio de Pólizas</h2>
          <p className="text-muted-foreground text-sm mt-1">Administre las pólizas de seguros y asegurados de su cartera.</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          variant={showForm ? "secondary" : "default"}
          className="shadow-sm"
        >
          {showForm ? (
            <><Minus className="h-4 w-4 mr-2" /> Ocultar Formulario</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" /> Registrar Póliza</>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              <ErrorBoundary fallbackMessage="Ocurrió un error al cargar el formulario de registro de póliza.">
                <PolicyRegistrationForm 
                  onSuccess={handleSuccess} 
                  onCancel={() => setShowForm(false)} 
                />
              </ErrorBoundary>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full">
        <ErrorBoundary fallbackMessage="Ocurrió un error inesperado al cargar la tabla de pólizas.">
          <PoliciesTable refreshTrigger={refreshTrigger} />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default PoliciesModule;