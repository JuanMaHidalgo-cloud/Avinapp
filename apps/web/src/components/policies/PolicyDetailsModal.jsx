import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Shield, User, Building2, FileText, Calendar, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { isValidPolicyId, acquireFetchLock, releaseFetchLock } from '@/lib/policyValidation.js';

const PolicyDetailsModal = ({ policyId, isOpen, onClose, onEdit, onDelete, onInvalidPolicy }) => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPolicy = async () => {
      // 1. Initial Validation
      if (!policyId || !isValidPolicyId(policyId)) {
        if (isMounted) {
          setError('El identificador de la póliza no es válido.');
          setLoading(false);
          toast.error('Identificador de póliza inválido');
          if (onInvalidPolicy) onInvalidPolicy(policyId);
          onClose(); // Automatically close on invalid ID
        }
        return;
      }

      // 2. Fetch Deduplication Lock
      if (!acquireFetchLock(policyId)) {
        return; // Prevent duplicate concurrent fetch
      }

      setLoading(true);
      setError(null);

      try {
        const data = await pb.collection('polizas').getOne(policyId, { $autoCancel: false });
        if (isMounted) {
          setPolicy(data);
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error(`Failed to fetch policy ${policyId}:`, err);
        
        if (err.status === 404) {
          setError('La póliza no existe o ha sido eliminada.');
          toast.error('La póliza no existe o ha sido eliminada');
          if (onInvalidPolicy) onInvalidPolicy(policyId);
          onClose(); // Automatically close modal on 404
        } else if (err.status === 400) {
          setError('Error al cargar la póliza. Solicitud inválida.');
          toast.error('Error al cargar la póliza');
        } else {
          setError('No se pudo cargar la información de la póliza. Verifique su conexión.');
          toast.error('Error de conexión al cargar la póliza');
        }
      } finally {
        releaseFetchLock(policyId); // 3. Release Lock
        if (isMounted) setLoading(false);
      }
    };

    if (isOpen) {
      fetchPolicy();
    }

    // Cleanup function on unmount or when modal closes
    return () => {
      isMounted = false;
      setPolicy(null);
      setError(null);
      if (policyId) releaseFetchLock(policyId);
    };
  }, [isOpen, policyId, onClose, onInvalidPolicy]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-medium text-balance">{error}</p>
          <Button onClick={onClose} variant="outline" className="mt-6">Volver al listado</Button>
        </div>
      );
    }

    if (!policy) return null;

    const isExpired = policy.fecha_vencimiento && new Date(policy.fecha_vencimiento) <= new Date();
    const displayStatus = isExpired ? 'Vencida' : (policy.estado || 'Desconocido');

    const getStatusBadge = (status) => {
      switch (status?.toLowerCase()) {
        case 'activa': return <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20">Activa</Badge>;
        case 'vencida': return <Badge variant="destructive">Vencida</Badge>;
        case 'cancelada': return <Badge variant="secondary">Cancelada</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
              <User className="h-4 w-4" /> Asegurado
            </h4>
            <p className="font-medium text-foreground">{policy.nombre_asegurado || 'No especificado'}</p>
            <p className="text-sm text-muted-foreground">ID: {policy.numero_identificacion || 'N/A'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4" /> Aseguradora
            </h4>
            <p className="font-medium text-foreground">{policy.nombre_aseguradora || 'No especificada'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4" /> Tipo de Póliza
            </h4>
            <p className="font-medium text-foreground">{policy.tipo_poliza || 'No especificado'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4" /> Estado
            </h4>
            <div>{getStatusBadge(displayStatus)}</div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4" /> Prima
            </h4>
            <p className="font-medium text-foreground">${policy.monto_prima?.toLocaleString() || '0.00'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4" /> Vencimiento
            </h4>
            <p className="font-medium text-foreground">
              {policy.fecha_vencimiento ? format(new Date(policy.fecha_vencimiento), 'dd/MM/yyyy') : 'No especificado'}
            </p>
          </div>
        </div>

        {policy.tipo_poliza === 'Médica' && (
          <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-border/50">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Tipo de Cobertura</h4>
              <p className="font-medium text-foreground">{policy.tipo_cobertura_medica || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Beneficiarios de la Cobertura</h4>
              <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-xl border border-border/50">
                {policy.beneficiarios_cobertura || 'Ninguno especificado'}
              </p>
            </div>
          </div>
        )}

        {policy.tipo_poliza === 'Vida' && (
          <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-border/50">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Beneficiarios para la Indemnización</h4>
              <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-xl border border-border/50">
                {policy.beneficiarios_indemnizacion || 'Ninguno especificado'}
              </p>
            </div>
          </div>
        )}

        <div className="col-span-1 md:col-span-2 pt-4 border-t border-border/50 flex flex-wrap justify-between text-xs text-muted-foreground gap-2">
          <span>Creado: {policy.created ? format(new Date(policy.created), 'dd/MM/yyyy HH:mm') : 'N/A'}</span>
          <span>Actualizado: {policy.updated ? format(new Date(policy.updated), 'dd/MM/yyyy HH:mm') : 'N/A'}</span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Shield className="h-5 w-5 text-primary" />
            {policy ? `Detalles de la Póliza: ${policy.numero_poliza || 'Sin número'}` : 'Cargando Póliza...'}
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        {!error && !loading && policy && (
          <DialogFooter className="flex justify-between sm:justify-between items-center mt-6 gap-3">
            <Button variant="destructive" onClick={() => onDelete(policy)}>Eliminar Póliza</Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">Cerrar</Button>
              <Button onClick={() => onEdit(policy)} className="flex-1 sm:flex-none">Editar Póliza</Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDetailsModal;