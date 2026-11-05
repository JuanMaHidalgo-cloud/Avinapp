import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const OperationsModule = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState({});

  const fetchPendingRequests = async () => {
    if (!currentUser?.broker_id) return;
    
    setLoading(true);
    try {
      const res = await pb.collection('reimbursement_requests').getList(1, 50, {
        filter: `broker_id="${currentUser.broker_id}"`,
        expand: 'user_id',
        sort: '-created',
        $autoCancel: false
      });

      const items = res.items;
      
      const enrichedRequests = await Promise.all(items.map(async (req) => {
        let policy = null;
        let documents = [];
        
        try {
          policy = await pb.collection('polizas').getOne(req.policy_id, { $autoCancel: false });
        } catch (e) {
          console.warn('Policy not found for request', req.id);
        }

        try {
          const docs = await pb.collection('reimbursement_documents').getList(1, 10, {
            filter: `request_id="${req.id}"`,
            $autoCancel: false
          });
          documents = docs.items;
        } catch (e) {
          console.warn('Docs not found for request', req.id);
        }

        let amount = req.monto || 'N/A';
        const amountMatch = req.description?.match(/Monto Solicitado: \$([\d.]+)/);
        if (amountMatch) amount = amountMatch[1];

        return {
          ...req,
          policyDetails: policy,
          documents,
          extractedAmount: amount
        };
      }));

      setRequests(enrichedRequests);
      
      // Inicializar el estado local de los selectores con el estado actual de cada solicitud
      const initialStatuses = {};
      enrichedRequests.forEach(req => {
        initialStatuses[req.id] = req.status || 'Pendiente';
      });
      setSelectedStatuses(initialStatuses);

    } catch (err) {
      console.error('Failed to fetch broker requests', err);
      toast.error('Error al cargar las solicitudes de reembolso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [currentUser]);

  const handleStatusSelectChange = (requestId, value) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [requestId]: value
    }));
  };

  const updateRequestStatus = async (requestId, userId) => {
    const newStatus = selectedStatuses[requestId] || 'Pendiente';
    setUpdatingId(requestId);

    try {
      await pb.collection('reimbursement_requests').update(requestId, {
        status: newStatus
      }, { $autoCancel: false });

      // Notificar al cliente asegurado
      await pb.collection('notifications').create({
        user_id: userId,
        type: 'status_change',
        title: 'Actualización de Reembolso',
        message: `El estado de tu solicitud de reembolso ha cambiado a: ${newStatus}.`,
        related_id: requestId,
        is_read: false
      }, { $autoCancel: false });

      toast.success(`Solicitud actualizada a "${newStatus}" exitosamente`);
      fetchPendingRequests();
    } catch (err) {
      console.error('Status update failed', err);
      toast.error('Error al actualizar la solicitud');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'warning';
      case 'En proceso': return 'secondary';
      case 'Devuelto': return 'outline';
      case 'Finalizado': return 'default';
      case 'Rechazado': return 'destructive';
      case 'Aprobado': return 'default';
      case 'Acreditado': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Módulo de Reembolsos</h2>
        <p className="text-muted-foreground mt-1">Revisa y gestiona las solicitudes de reembolso de tus clientes con los 7 estados operativos.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500/50 mb-4" />
            <h3 className="text-lg font-semibold">Todo al día</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              No hay solicitudes de reembolso registradas en el sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <Card key={req.id} className="border shadow-sm bg-card hover:shadow-md transition-all">
              <CardHeader className="pb-3 border-b bg-muted/10">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Solicitud: {req.expand?.user_id?.full_name || req.expand?.user_id?.email || 'Cliente'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Póliza: <span className="font-mono font-medium text-foreground">{req.policyDetails?.numero_poliza || 'Desconocida'}</span>
                      <span className="mx-2">•</span>
                      Recibido: {req.created ? format(parseISO(req.created), 'dd MMM yyyy, HH:mm') : 'N/A'}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(req.status)} className="w-fit">
                    {req.status || 'Pendiente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="bg-primary/5 p-3 rounded-lg flex-1 min-w-[200px]">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Monto Solicitado</p>
                    <p className="text-2xl font-bold text-primary">${req.extractedAmount}</p>
                  </div>
                  <div className="flex-2 min-w-[300px]">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Descripción / Detalles</p>
                    <p className="text-sm text-foreground line-clamp-2">{req.description}</p>
                  </div>
                </div>

                {req.documents?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Archivos Adjuntos ({req.documents.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {req.documents.map((doc, idx) => (
                        <a 
                          key={doc.id}
                          href={pb.files.getUrl(doc, doc.file)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-sm px-3 py-1.5 rounded-md transition-colors"
                        >
                          <FileText className="h-4 w-4 text-primary" />
                          Documento {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selector de los 7 estados y botón de actualización dedicado */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t">
                  <div className="w-full sm:w-auto">
                    <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1.5 block">
                      Actualizar Estado de la Solicitud
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedStatuses[req.id] || req.status || 'Pendiente'}
                        onChange={(e) => handleStatusSelectChange(req.id, e.target.value)}
                        className="text-sm p-2 border rounded-md bg-background w-full sm:w-52"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Devuelto">Devuelto</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Rechazado">Rechazado</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Acreditado">Acreditado</option>
                      </select>

                      <Button 
                        size="sm"
                        disabled={updatingId === req.id}
                        onClick={() => updateRequestStatus(req.id, req.user_id)}
                      >
                        {updatingId === req.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Actualizar Estado
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperationsModule;